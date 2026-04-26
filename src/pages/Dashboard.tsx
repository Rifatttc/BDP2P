import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ChevronLeft, Shield, RefreshCw, Smartphone, Server, 
  MapPin, Globe, Cpu, Activity, LogOut, XCircle, User, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import VpnHeader from '@/src/components/vpn/VpnHeader';
import GlassCard from '@/src/components/vpn/GlassCard';
import StatusIndicator from '@/src/components/vpn/StatusIndicator';
import { getStoredUser, setStoredUser } from '@/src/lib/vpnAuth';
import { db } from '@/src/lib/firebase';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';

export default function Dashboard() {
  const user = getStoredUser();
  const navigate = useNavigate();
  
  const [uptime, setUptime] = useState(0);
  const [peerData, setPeerData] = useState<any>(null);
  const [myData, setMyData] = useState<any>(user);
  const [loading, setLoading] = useState(false);

  if (!user?.paired_with) return <Navigate to="/connect" replace />;

  useEffect(() => {
    const timer = setInterval(() => setUptime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync my data
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'users', user.username), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setMyData(data);
        if (data.paired_with === '') {
           setStoredUser({ ...user, paired_with: '' });
           navigate('/connect');
        }
      }
    });
    return () => unsub();
  }, [user.username, navigate]);

  // Sync peer data
  useEffect(() => {
    if (!myData?.paired_with) return;
    const unsub = onSnapshot(doc(db, 'users', myData.paired_with), (doc) => {
      if (doc.exists()) {
        setPeerData(doc.data());
      }
    });
    return () => unsub();
  }, [myData?.paired_with]);

  const formatUptime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDisconnect = () => {
    toast.info("Tunnel closed");
    navigate('/connect');
  };

  const handleUnpair = async () => {
    try {
      setLoading(true);
      const meRef = doc(db, 'users', user.username);
      const peerRef = doc(db, 'users', user.paired_with);
      
      await updateDoc(meRef, { paired_with: '' });
      await updateDoc(peerRef, { paired_with: '' });
      
      setStoredUser({ ...user, paired_with: '' });
      toast.success("Connection unpaired");
      navigate('/connect');
    } catch (error) {
      toast.error("Failed to unpair");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050B15] flex flex-col">
      <header className="sticky top-0 z-50 bg-[#050B15]/80 backdrop-blur-xl border-b border-white/5 h-16 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full text-white/70">
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">Tunnel Dashboard</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-500 uppercase tracking-widest font-bold">Encrypted Link</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
          <Activity className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-[10px] font-mono font-bold text-white/60">42ms</span>
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto px-4 pb-32 pt-6 max-w-lg mx-auto w-full space-y-4">
        {/* 1. Tunnel Banner */}
        <GlassCard glow="emerald" className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 overflow-hidden">
                <Shield className="w-7 h-7 text-emerald-500 z-10" />
                <div className="absolute inset-0 bg-emerald-500/5 blur-xl animate-pulse" />
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold text-emerald-500/60 uppercase tracking-widest">Active Runtime</h3>
              <div className="text-3xl font-mono font-black tracking-tight text-white">{formatUptime(uptime)}</div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant="outline" className={cn(
              "text-[10px] uppercase font-bold tracking-widest h-6",
              myData?.mode === 'host' ? "border-emerald-500/30 text-emerald-400" : "border-indigo-500/30 text-indigo-400"
            )}>
              {myData?.mode === 'host' ? "Gateway Mode" : "Client Mode"}
            </Badge>
          </div>
        </GlassCard>

        {/* 2. P2P Connection Visual - Simplified for Mobile */}
        <div className="bg-white/[0.03] border border-white/5 rounded-[32px] p-8">
          <div className="flex items-center justify-between relative px-2">
            <div className="flex flex-col items-center gap-3 z-10">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-2xl">
                <span className="text-2xl font-black text-white uppercase">{myData?.username?.[0] || '?'}</span>
              </div>
              <div className="text-center">
                <div className="text-xs font-bold text-white">{myData?.username}</div>
                <div className="text-[10px] text-white/30 uppercase tracking-tighter">Self</div>
              </div>
            </div>

            <div className="absolute left-1/2 top-8 -translate-x-1/2 w-[40%] flex items-center justify-center">
              <div className="w-full h-[2px] bg-gradient-to-r from-emerald-500/40 via-white/20 to-indigo-500/40 relative">
                <motion.div 
                  animate={{ left: ["0%", "100%", "0%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full blur-[1px]"
                />
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 z-10">
              <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-2xl">
                <span className="text-2xl font-black text-white uppercase">{myData?.paired_with?.[0] || '?'}</span>
              </div>
              <div className="text-center">
                <div className="text-xs font-bold text-white">{myData?.paired_with}</div>
                <div className="text-[10px] text-white/30 uppercase tracking-tighter">Peer</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. My Info */}
        <section className="bg-white/[0.03] border border-white/5 rounded-[32px] overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Local Node</span>
            <User className="w-3.5 h-3.5 text-emerald-500/40" />
          </div>
          <div className="p-6 grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <div className="text-[10px] text-white/30 uppercase tracking-widest font-semibold italic">Identity Address</div>
              <div className="text-xs font-mono text-white/90 break-all">{myData?.my_ip || '---.---.---.---'}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] text-white/30 uppercase tracking-widest font-semibold italic">ISP Network</div>
              <div className="text-xs text-white/70 font-medium truncate whitespace-nowrap overflow-hidden">{myData?.my_isp || 'N/A'}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] text-white/30 uppercase tracking-widest font-semibold italic">Physical Zone</div>
              <div className="text-xs text-white/70 font-medium">{myData?.my_city || 'Identifying...'}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] text-white/30 uppercase tracking-widest font-semibold italic">Gateway Cluster</div>
              <div className="flex items-center gap-2">
                <Globe className="w-3 h-3 text-emerald-500/40" />
                <span className="text-xs text-white/70 font-medium">{myData?.country || 'Global'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Peer Info */}
        <section className="bg-white/[0.03] border border-white/5 rounded-[32px] overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Remote Endpoint</span>
            <StatusIndicator status={peerData?.is_online ? 'online' : 'offline'} showLabel={false} />
          </div>
          <div className="p-6 grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <div className="text-[10px] text-white/30 uppercase tracking-widest font-semibold italic">Endpoint IP</div>
              <div className="text-xs font-mono text-white/90 break-all">{peerData?.my_ip || 'PENDING...'}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] text-white/30 uppercase tracking-widest font-semibold italic">Relay Operator</div>
              <div className="text-xs text-white/70 font-medium truncate overflow-hidden">{peerData?.my_isp || '---'}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] text-white/30 uppercase tracking-widest font-semibold italic">Relay Zone</div>
              <div className="text-xs text-white/70 font-medium">{peerData?.my_city || '---'}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] text-white/30 uppercase tracking-widest font-semibold italic">Encryption</div>
              <div className="text-[9px] font-bold text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full inline-block uppercase bg-emerald-500/5">
                ChaCha20-Poly1305
              </div>
            </div>
          </div>
        </section>

        {/* Action Buttons - Material Fixed Style */}
        <div className="flex flex-col gap-3 pt-6 pb-4">
          <Button 
            onClick={handleDisconnect}
            className="w-full h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold border border-white/5 uppercase tracking-[0.2em] text-xs shadow-lg"
          >
            <LogOut className="w-4 h-4 mr-2 text-white/40" />
            Suspend Tunnel
          </Button>
          <Button 
            onClick={handleUnpair}
            disabled={loading}
            variant="ghost"
            className="w-full h-12 rounded-2xl text-rose-500/60 hover:text-rose-500 hover:bg-rose-500/5 font-bold uppercase tracking-widest text-[10px]"
          >
            <XCircle className="w-3.5 h-3.5 mr-2" />
            Terminate Relationship
          </Button>
        </div>
      </main>
    </div>
  );
}
