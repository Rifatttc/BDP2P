import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Shield, Globe, Users, Info, Settings, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import VpnHeader from '@/src/components/vpn/VpnHeader';
import StatusIndicator from '@/src/components/vpn/StatusIndicator';
import ConnectionOrb from '@/src/components/vpn/ConnectionOrb';
import ConnectionMetrics from '@/src/components/vpn/ConnectionMetrics';
import ModeSelector from '@/src/components/vpn/ModeSelector';
import TokenGenerator from '@/src/components/vpn/TokenGenerator';
import TokenRedeemer from '@/src/components/vpn/TokenRedeemer';
import GlassCard from '@/src/components/vpn/GlassCard';
import HostDiscovery from '@/src/components/vpn/HostDiscovery';
import { getStoredUser, setStoredUser } from '@/src/lib/vpnAuth';
import { db } from '@/src/lib/firebase';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';

export default function Connect() {
  const user = getStoredUser();
  const navigate = useNavigate();
  
  const [mode, setMode] = useState<'host' | 'client' | 'none'>(user?.mode || 'none');
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [pairedWith, setPairedWith] = useState<string | null>(user?.paired_with || null);
  const [isUpdatingMode, setIsUpdatingMode] = useState(false);
  const [isPublic, setIsPublic] = useState(user?.is_public || false);
  const [myData, setMyData] = useState<any>(user);
  const [peerData, setPeerData] = useState<any>(null);

  // Sync my data
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, 'users', user.username), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setMyData(data);
        if (data.paired_with !== pairedWith) {
          setPairedWith(data.paired_with);
          const updatedUser = { ...user, paired_with: data.paired_with };
          setStoredUser(updatedUser);
        }
        if (data.mode !== mode) {
          setMode(data.mode);
        }
        if (data.is_public !== isPublic) {
          setIsPublic(!!data.is_public);
        }
      }
    });
    return () => unsub();
  }, [user?.username]);

  // Sync peer data
  useEffect(() => {
    if (!pairedWith) {
      setPeerData(null);
      return;
    }
    const unsub = onSnapshot(doc(db, 'users', pairedWith), (doc) => {
      if (doc.exists()) {
        setPeerData(doc.data());
      }
    });
    return () => unsub();
  }, [pairedWith]);

  // Fetch IP passively and store on profile
  useEffect(() => {
    if (!user) return;
    const updatePassiveIp = async () => {
      try {
        const ipRes = await fetch('https://ipwho.is/');
        const data = await ipRes.json();
        if (data && data.success) {
          await updateDoc(doc(db, 'users', user.username), {
            my_ip: data.ip || "Unknown IP",
            my_city: `${data.city || 'Unknown'}, ${data.country || 'Unknown'}`,
            my_isp: data.connection?.isp || data.org || "Unknown ISP",
            is_online: true,
            last_seen: new Date().toISOString()
          });
        }
      } catch (err) {
        console.warn("Passive IP fetch failed", err);
      }
    };
    updatePassiveIp();
  }, [user?.username]);



  const handlePublicToggle = async () => {
    const newVal = !isPublic;
    setIsPublic(newVal);
    try {
      await updateDoc(doc(db, 'users', user.username), { is_public: newVal });
      setStoredUser({ ...user, is_public: newVal });
      toast.success(newVal ? "Listed on Public Registry" : "Removed from Public Registry");
    } catch (error) {
      toast.error("Failed to update visibility");
      setIsPublic(!newVal);
    }
  };

  const handleModeSelect = async (newMode: 'host' | 'client') => {
    setMode(newMode);
    setIsUpdatingMode(true);
    try {
      await updateDoc(doc(db, 'users', user.username), { mode: newMode });
      setStoredUser({ ...user, mode: newMode });
    } catch (error) {
      toast.error("Failed to update mode");
    } finally {
      setIsUpdatingMode(false);
    }
  };

  const handleConnect = async () => {
    if (status === 'connected') {
      setStatus('disconnected');
      try {
        await updateDoc(doc(db, 'users', user.username), {
          is_online: false,
          last_seen: new Date().toISOString()
        });
      } catch (err) {}
      toast.info("Connection terminated");
      return;
    }

    if (!pairedWith) {
      toast.error("Please pair with a peer first");
      return;
    }
    
    setStatus('connecting');
    
    try {
      // Attempt to fetch real IP details
      let ipData = { ip: "192.168.1.100", city: "Unknown City", isp: "Unknown ISP" };
      try {
        const ipRes = await fetch('https://ipwho.is/');
        const data = await ipRes.json();
        if (data && data.success) {
          ipData = {
            ip: data.ip || "Unknown IP",
            city: `${data.city || 'Unknown'}, ${data.country || 'Unknown'}`,
            isp: data.connection?.isp || data.org || "Unknown ISP"
          };
        }
      } catch (err) {
        console.warn("Could not fetch real IP, using fallback", err);
      }
      
      await new Promise(r => setTimeout(r, 1000));
      
      await updateDoc(doc(db, 'users', user.username), {
        my_ip: ipData.ip,
        my_city: ipData.city,
        my_isp: ipData.isp,
        is_online: true,
        last_seen: new Date().toISOString()
      });
      
      setStatus('connected');
      toast.success("VPN Gateway established successfully!");
      
    } catch (error) {
      toast.error("Connection failed");
      setStatus('disconnected');
    }
  };

  return (
    <div className="min-h-screen bg-[#050B15] flex flex-col pt-safe">
      {/* Material Top App Bar */}
      <header className="sticky top-0 z-50 bg-[#050B15]/80 backdrop-blur-xl border-b border-white/5 h-16 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-white leading-tight">Secure Tunnel</h1>
            <span className="text-[10px] text-emerald-500 uppercase tracking-widest font-bold">Node: {user?.country || 'Global'}</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full text-white/70">
          <Info className="w-5 h-5" />
        </Button>
      </header>
      
      <main className="flex-1 overflow-y-auto px-4 pb-28">
        <div className="max-w-lg mx-auto pt-6 flex flex-col gap-6">
          
          {/* 1. Connection Details Banner */}
          <section className="bg-white/[0.03] border border-white/5 rounded-3xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {status === 'connected' ? <Shield className="w-5 h-5 text-emerald-500" /> : <Globe className="w-5 h-5 text-white/40" />}
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                  {status === 'connected' ? 'Secured Target' : 'Local Network'}
                </span>
              </div>
              <StatusIndicator status={status === 'connected' ? 'online' : status === 'connecting' ? 'connecting' : 'offline'} showLabel={false} />
            </div>
            
            <div className="grid grid-cols-2 gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
              <div>
                <div className="text-[10px] text-white/30 uppercase tracking-widest font-semibold italic mb-1">IP Address</div>
                <div className="text-sm font-mono font-bold text-white/90 truncate">
                  {status === 'connected' ? (peerData?.my_ip || 'Fetching...') : (myData?.my_ip || 'Fetching...')}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-white/30 uppercase tracking-widest font-semibold italic mb-1">Location</div>
                <div className="text-sm font-bold text-white/90 truncate">
                  {status === 'connected' ? (peerData?.my_city || 'Fetching...') : (myData?.my_city || 'Fetching...')}
                </div>
              </div>
            </div>
            
            {pairedWith && status === 'connected' && (
               <div className="mt-4 flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-2xl">
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Encrypted Link Active</span>
                 </div>
                 <span className="text-xs font-mono font-bold text-white/70">P2P::{pairedWith}</span>
               </div>
            )}
            <ConnectionMetrics active={status === 'connected'} />
            {pairedWith && status !== 'connected' && (
               <div className="mt-4 flex items-center justify-between bg-white/5 border border-white/10 px-4 py-3 rounded-2xl">
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-white/30" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Standby to Connect</span>
                 </div>
                 <span className="text-xs font-mono font-bold text-white/70">P2P::{pairedWith}</span>
               </div>
            )}
          </section>

          {/* 2. Pairing / Box */}
          <section className={cn(
            "space-y-4 transition-all duration-500",
            status === 'connected' && "opacity-30 pointer-events-none grayscale blur-[2px]"
          )}>
            <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-5 shadow-lg space-y-6">
              
              {!pairedWith ? (
                <>
                  <div className="flex flex-col items-center gap-4">
                    <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/40">Select App Mode</h3>
                    <ModeSelector selected={mode} onSelect={handleModeSelect} />
                  </div>
                  
                  {isUpdatingMode ? (
                     <div className="flex items-center justify-center p-4">
                       <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                     </div>
                  ) : mode === 'client' ? (
                     <div className="space-y-4 pt-4 border-t border-white/10 mt-6">
                       <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-emerald-500" />
                          <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-emerald-500/80">Join Network (Client)</h3>
                       </div>
                       <TokenRedeemer 
                         currentUsername={user.username} 
                         onSuccess={(p) => setPairedWith(p)} 
                       />
                     </div>
                  ) : mode === 'host' ? (
                     <div className="space-y-4 pt-4 border-t border-white/10 mt-6">
                       <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-indigo-500" />
                          <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-indigo-500/80">Host Network (Gateway)</h3>
                       </div>
                       <TokenGenerator username={user.username} />
                     </div>
                  ) : null}
                </>
              ) : (
                 <div className="flex flex-col items-center justify-center p-6 bg-white/[0.02] rounded-2xl border border-white/10 text-center gap-4">
                   <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                     <Shield className="w-8 h-8 text-emerald-500" />
                   </div>
                   <div>
                     <div className="text-sm font-bold text-white mb-1 tracking-wide">Ready to Establish Secure Tunnel</div>
                     <p className="text-xs text-white/40">You are paired with node: <span className="text-emerald-400 font-mono">{pairedWith}</span></p>
                   </div>
                   <Button 
                     variant="outline" 
                     size="sm" 
                     onClick={() => {
                        setPairedWith(null);
                        updateDoc(doc(db, 'users', user.username), { paired_with: null });
                     }}
                     className="mt-2 text-rose-400 border-rose-500/20 hover:bg-rose-500/10 uppercase tracking-widest text-[10px]"
                   >
                     Cancel Pairing
                   </Button>
                 </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Android FAB / Fixed Bottom Action */}
      <div className="fixed bottom-6 left-4 right-4 max-w-lg mx-auto">
        <Button
          onClick={handleConnect}
          disabled={status === 'connecting' || (!pairedWith && status !== 'connected')}
          className={cn(
            "w-full h-16 rounded-full text-lg font-bold transition-all duration-500 shadow-2xl uppercase tracking-widest",
            status === 'connected' 
              ? "bg-rose-500/20 text-rose-500 hover:bg-rose-500/30 shadow-none border border-rose-500/50" 
              : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20",
            (status === 'connecting' || (!pairedWith && status !== 'connected')) && "opacity-40 grayscale"
          )}
        >
          {status === 'connecting' ? (
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin" /> Negotiating Protocol...
            </div>
          ) : status === 'connected' ? "Disconnect" : "Connection"}
        </Button>
      </div>
    </div>
  );
}
