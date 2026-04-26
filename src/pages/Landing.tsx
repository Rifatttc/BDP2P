import { motion } from 'motion/react';
import { Shield, Zap, Globe, Lock, CheckCircle2, Users, Cpu, ArrowRight, ShieldCheck, Smartphone } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const features = [
  { icon: Lock, title: "Encrypted", desc: "Military-grade ChaCha20 encryption for all tunnels." },
  { icon: Zap, title: "Fast P2P", desc: "Direct peer-to-peer connection with bare-metal speed." },
  { icon: Globe, title: "BD Gateway", desc: "Bypass restrictions using local Bangladesh IP nodes." },
  { icon: ShieldCheck, title: "Secure", desc: "Zero-log policy with open-source WireGuard protocol." }
];

const stats = [
  { label: "Active Users", value: "2.5K+", icon: Users },
  { label: "Global Nodes", value: "45+", icon: Globe },
  { label: "Server Uptime", value: "99.9%", icon: CheckCircle2 }
];

export default function Landing() {
  return (
    <div className="flex flex-col min-h-screen bg-[#050B15]">
      <main className="flex-1 flex flex-col items-center justify-center">
        {/* Animated Background Orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Hero Section */}
        <section className="w-full max-w-lg px-6 pt-12 pb-24 text-center z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", duration: 1 }}
            className="relative inline-block mb-12"
          >
            <div className="absolute inset-0 bg-emerald-500/30 blur-[60px] rounded-full animate-pulse" />
            <div className="w-28 h-28 rounded-[40px] bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.3)] relative border border-white/20">
              <Shield className="w-14 h-14 text-white drop-shadow-lg" />
              <motion.div 
                animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 border-2 border-white/40 rounded-[40px]"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-6xl font-black text-white tracking-tighter mb-2">
              BD·<span className="text-emerald-500">VPN</span>
            </h1>
            <p className="text-[10px] uppercase tracking-[0.6em] font-bold text-white/40 mb-12">
              Secure P2P Gateway
            </p>
          </motion.div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-full"
              >
                <f.icon className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{f.title}</span>
              </motion.div>
            ))}
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-4 w-full"
          >
            <Link 
              to="/register" 
              className={cn(
                buttonVariants({ size: "lg" }), 
                "w-full h-16 text-lg font-black bg-emerald-600 hover:bg-emerald-500 text-white rounded-[24px] shadow-[0_10px_25px_-5px_rgba(16,185,129,0.3)] transition-all active:scale-95"
              )}
            >
              নতুন Account খুলুন
            </Link>
            <Link 
              to="/login" 
              className={cn(
                buttonVariants({ variant: "ghost", size: "lg" }), 
                "w-full h-16 text-lg font-bold text-white/60 hover:text-white hover:bg-white/5 rounded-[24px] transition-all"
              )}
            >
              Sign In
            </Link>
          </motion.div>
        </section>

        {/* Stats Section */}
        <section className="w-full max-w-lg px-6 pb-12 z-10">
          <div className="grid grid-cols-3 gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 + (i * 0.1) }}
                className="text-center"
              >
                <div className="text-xl font-black text-white mb-1 tracking-tight">{s.value}</div>
                <div className="text-[8px] uppercase tracking-widest font-bold text-white/30">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
