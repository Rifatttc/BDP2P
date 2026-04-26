import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Shield, ChevronLeft, Phone, User, Loader2, Globe, Lock, Server, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { db } from '@/src/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { simpleHash, setStoredUser } from '@/src/lib/vpnAuth';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'client' as 'client' | 'host'
  });
  const [country, setCountry] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => setCountry(data.country_name))
      .catch(() => setCountry("Unknown"));
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.username.length < 3) return toast.error("Username too short");
    if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");
    if (formData.password !== formData.confirmPassword) return toast.error("Passwords do not match");

    setLoading(true);
    try {
      const userRef = doc(db, 'users', formData.username);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        toast.error("Username already taken");
        return;
      }

      const newUser = {
        username: formData.username,
        phone: formData.phone,
        password_hash: simpleHash(formData.password),
        country: country || 'Unknown',
        mode: formData.role,
        is_online: true,
        last_seen: new Date().toISOString(),
        device_model: navigator.userAgent.split(')')[0].split('(')[1] || 'Web Interface',
        device_os: navigator.userAgent.includes('Windows') ? 'Windows' : 'Mobile/Web',
        paired_with: '',
        my_ip: '',
        my_city: '',
        my_isp: '',
        wireguard_public_key: ''
      };

      await setDoc(userRef, newUser);
      
      const statsRef = doc(db, 'stats', 'total_downloads');
      await setDoc(statsRef, { stat_key: 'total_downloads', stat_value: increment(1) }, { merge: true });

      setStoredUser({ ...newUser, isAdmin: false });
      toast.success(`Account created as ${formData.role}!`);
      navigate('/connect');

    } catch (error) {
      console.error(error);
      toast.error("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050B15]">
      {/* App Bar Header */}
      <header className="h-16 px-4 flex items-center justify-between sticky top-0 z-50 bg-[#050B15]/80 backdrop-blur-xl">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="rounded-full text-white/50"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">Registration</span>
        <div className="w-10" />
      </header>

      <main className="flex-1 flex flex-col px-6 pb-12 pt-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="text-center mb-10">
            <div className="inline-flex w-20 h-20 bg-emerald-500/10 rounded-[32px] items-center justify-center mb-6 border border-emerald-500/20 relative shadow-2xl">
              <Shield className="w-10 h-10 text-emerald-500" />
              {country && (
                <div className="absolute -right-2 -bottom-2">
                  <Badge variant="outline" className="bg-emerald-500/20 border-emerald-500/30 text-[10px] text-emerald-400 py-1 px-2 rounded-full">
                    <Globe className="w-3 h-3 mr-1" /> {country}
                  </Badge>
                </div>
              )}
            </div>
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Create Account</h1>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest leading-loose">Secure P2P Protocol Join</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            {/* Role Selection - Android Chips Style */}
            <div className="space-y-4">
              <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-emerald-500/60 ml-1">Gateway Identity</Label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'client' })}
                  className={cn(
                    "flex-1 h-20 rounded-[28px] border transition-all duration-300 flex flex-col items-center justify-center gap-2",
                    formData.role === 'client' 
                      ? "bg-emerald-500 border-emerald-400 text-white shadow-xl shadow-emerald-500/20" 
                      : "bg-white/[0.03] border-white/5 text-white/40 hover:bg-white/5 hover:border-white/10"
                  )}
                >
                  <Smartphone className={cn("w-6 h-6", formData.role === 'client' ? "text-white" : "text-white/20")} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Client</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'host' })}
                  className={cn(
                    "flex-1 h-20 rounded-[28px] border transition-all duration-300 flex flex-col items-center justify-center gap-2",
                    formData.role === 'host' 
                      ? "bg-indigo-500 border-indigo-400 text-white shadow-xl shadow-indigo-500/20" 
                      : "bg-white/[0.03] border-white/5 text-white/40 hover:bg-white/5 hover:border-white/10"
                  )}
                >
                  <Server className={cn("w-6 h-6", formData.role === 'host' ? "text-white" : "text-white/20")} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Host</span>
                </button>
              </div>
            </div>

            <div className="space-y-6 bg-white/[0.02] border border-white/5 p-6 rounded-[32px]">
              <div className="space-y-4">
                <div className="relative group">
                  <Input
                    id="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="bg-transparent border-0 border-b border-white/10 rounded-none h-14 pl-10 text-white focus:ring-0 focus:border-emerald-500 transition-all placeholder:text-white/20"
                    required
                  />
                  <User className="absolute left-1 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                
                <div className="relative group">
                  <Input
                    id="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="bg-transparent border-0 border-b border-white/10 rounded-none h-14 pl-10 text-white focus:ring-0 focus:border-emerald-500 transition-all placeholder:text-white/20"
                    required
                  />
                  <Phone className="absolute left-1 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-emerald-500 transition-colors" />
                </div>

                <div className="relative group">
                  <Input
                    id="password"
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="bg-transparent border-0 border-b border-white/10 rounded-none h-14 pl-10 text-white focus:ring-0 focus:border-emerald-500 transition-all placeholder:text-white/20"
                    required
                  />
                  <Lock className="absolute left-1 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-emerald-500 transition-colors" />
                </div>

                <div className="relative group">
                  <Input
                    id="confirm"
                    type="password"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="bg-transparent border-0 border-b border-white/10 rounded-none h-14 pl-10 text-white focus:ring-0 focus:border-emerald-500 transition-all placeholder:text-white/20"
                    required
                  />
                  <Lock className="absolute left-1 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-emerald-500 transition-colors" />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-16 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-black text-lg shadow-2xl shadow-emerald-500/20 transition-all active:scale-95"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Sign Up Now"}
            </Button>
          </form>

          <p className="mt-10 text-center text-xs font-bold text-white/30 uppercase tracking-[0.25em]">
            Already recorded?{' '}
            <Link to="/login" className="text-emerald-500 hover:text-emerald-400 underline underline-offset-8">
              Sign In
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
