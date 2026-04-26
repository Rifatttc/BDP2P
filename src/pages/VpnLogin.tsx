import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Shield, Eye, EyeOff, ChevronLeft, Phone, User, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { db } from '@/src/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { isAdminLogin, simpleHash, setStoredUser, getAdminUsernameFromLogin } from '@/src/lib/vpnAuth';

export default function VpnLogin() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isAdminLogin(identifier, password)) {
        const adminData = { 
          username: getAdminUsernameFromLogin(identifier), 
          isAdmin: true,
          is_online: true 
        };
        setStoredUser(adminData);
        toast.success(`Welcome back, ${adminData.username}`);
        navigate('/admin');
        return;
      }

      const userRef = doc(db, 'users', identifier);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        toast.error("User not found");
        return;
      }

      const userData = userSnap.data();
      const hashedPassed = simpleHash(password);

      if (userData.password_hash !== hashedPassed) {
        toast.error("Incorrect password");
        return;
      }

      setStoredUser({ ...userData, isAdmin: false });
      toast.success(`Connected as ${userData.username}`);
      navigate('/connect');

    } catch (error) {
      console.error(error);
      toast.error("An error occurred during login");
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
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">Secure Access</span>
        <div className="w-10" />
      </header>

      <main className="flex-1 flex flex-col px-6 pb-12 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="text-center mb-12">
            <div className="inline-flex w-20 h-20 bg-emerald-500/10 rounded-[32px] items-center justify-center mb-6 border border-emerald-500/20 shadow-2xl relative">
              <Shield className="w-10 h-10 text-emerald-500" />
              <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full -z-10" />
            </div>
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Access Gateway</h1>
            <p className="text-white/40 text-[10px] uppercase font-bold tracking-[0.3em] leading-loose">Credential Validation Required</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-4 bg-white/[0.02] border border-white/5 p-8 rounded-[32px]">
              <div className="relative group">
                <Input
                  id="identifier"
                  placeholder="Username or Phone"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="bg-transparent border-0 border-b border-white/10 rounded-none h-14 pl-10 text-white focus:ring-0 focus:border-emerald-500 transition-all placeholder:text-white/20"
                  required
                />
                <User className="absolute left-1 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-emerald-500 transition-colors" />
              </div>

              <div className="relative group">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent border-0 border-b border-white/10 rounded-none h-14 pl-10 text-white focus:ring-0 focus:border-emerald-500 transition-all placeholder:text-white/20"
                  required
                />
                <Lock className="absolute left-1 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-emerald-500 transition-colors" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-16 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-black text-lg shadow-2xl shadow-emerald-500/20 transition-all active:scale-95"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Access Now"}
            </Button>
          </form>

          <p className="mt-12 text-center text-xs font-bold text-white/30 uppercase tracking-[0.25em]">
            New operative?{' '}
            <Link to="/register" className="text-emerald-500 hover:text-emerald-400 underline underline-offset-8">
              Open Account
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
