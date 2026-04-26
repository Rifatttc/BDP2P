import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Users, Loader2, ArrowRight, Shield, Zap, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { db } from '@/src/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, limit } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import GlassCard from './GlassCard';

interface HostDiscoveryProps {
  currentUsername: string;
  onPair: (username: string) => void;
}

export default function HostDiscovery({ currentUsername, onPair }: HostDiscoveryProps) {
  const [hosts, setHosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pairingWith, setPairingWith] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchHosts = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'users'),
        where('mode', '==', 'host'),
        where('is_online', '==', true),
        where('is_public', '==', true),
        limit(10)
      );
      const snap = await getDocs(q);
      const hostList = snap.docs
        .map(doc => doc.data())
        .filter(h => h.username !== currentUsername);
      setHosts(hostList);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHosts();
  }, []);

  const handlePair = async (hostUsername: string) => {
    setPairingWith(hostUsername);
    try {
      const meRef = doc(db, 'users', currentUsername);
      const peerRef = doc(db, 'users', hostUsername);

      await updateDoc(meRef, { paired_with: hostUsername });
      await updateDoc(peerRef, { paired_with: currentUsername });

      toast.success(`Successfully connected to ${hostUsername}`);
      onPair(hostUsername);
    } catch (error) {
      toast.error("Failed to connect to this host");
    } finally {
      setPairingWith(null);
    }
  };

  const filteredHosts = hosts.filter(h => 
    h.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.country?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.my_city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-500" />
          <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/40">Available Clusters</h3>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={fetchHosts}
          className="h-7 text-[10px] text-white/30 hover:text-white uppercase font-bold"
        >
          Refresh
        </Button>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-emerald-500 transition-colors" />
        <Input 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by city, country or user..."
          className="bg-white/5 border-white/10 rounded-2xl pl-10 h-12 text-xs focus:ring-emerald-500/50"
        />
      </div>

      <div className="grid gap-3">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <div className="py-8 flex flex-col items-center gap-3">
              <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
              <span className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Scanning Nodes...</span>
            </div>
          ) : filteredHosts.length === 0 ? (
            <div className="py-8 text-center text-[10px] uppercase tracking-widest text-white/20 font-bold">
              No active hosts found matching criteria
            </div>
          ) : (
            filteredHosts.map((host) => (
              <motion.div
                key={host.username}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                layout
              >
                <GlassCard className="p-4 flex items-center justify-between group hover:border-emerald-500/30 transition-all cursor-pointer" onClick={() => handlePair(host.username)}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-white uppercase text-sm">
                      {host.username[0]}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{host.username}</span>
                        <Badge variant="outline" className="h-4 text-[8px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10 px-1 font-black">HOST</Badge>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-white/40">
                        <Zap className="w-3 h-3 text-emerald-500/50" />
                        <span>{host.my_city || host.country || 'Global'}</span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    size="sm"
                    disabled={pairingWith === host.username}
                    className="h-9 px-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase tracking-widest border-0"
                  >
                    {pairingWith === host.username ? <Loader2 className="w-3 h-3 animate-spin" /> : "Pair Now"}
                  </Button>
                </GlassCard>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
