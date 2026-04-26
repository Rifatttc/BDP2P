import { useState, useEffect } from 'react';
import { Shield, Globe, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import StatusIndicator from '@/src/components/vpn/StatusIndicator';
import ModeSelector from '@/src/components/vpn/ModeSelector';
import TokenGenerator from '@/src/components/vpn/TokenGenerator';
import TokenRedeemer from '@/src/components/vpn/TokenRedeemer';
import { getStoredUser, setStoredUser } from '@/src/lib/vpnAuth';
import { db } from '@/src/lib/firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';

export default function Connect() {
  const user = getStoredUser();
  const [mode, setMode] = useState<'host' | 'client' | 'none'>(user?.mode || 'none');
  const [pairedWith, setPairedWith] = useState<string | null>(user?.paired_with || null);
  const [isUpdatingMode, setIsUpdatingMode] = useState(false);
  const [myData, setMyData] = useState<any>(user);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, 'users', user.username), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setMyData(data);
        if (data.paired_with !== pairedWith) {
          setPairedWith(data.paired_with);
          setStoredUser({ ...user, paired_with: data.paired_with });
        }
        if (data.mode !== mode) {
          setMode(data.mode);
        }
      }
    });
    return () => unsub();
  }, [user?.username]);

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

  return (
    <div className="min-h-screen bg-[#030712] p-6 text-[#e2e2e9]">
        <header className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Web Pairing Portal</h1>
            <p className="text-[#a8c7fa]">Generate or redeem tokens to pair devices.</p>
        </header>

        <section className="bg-[#121622] rounded-[24px] p-6 border border-white/5 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-white/40" />
                    <span className="text-xs font-bold uppercase tracking-widest text-[#c4c6d0]">Node</span>
                </div>
                <StatusIndicator status={myData?.is_online ? 'online' : 'offline'} showLabel={!myData?.is_online} />
            </div>

            {!pairedWith ? (
                <>
                  <div className="flex flex-col items-center gap-4">
                    <h3 className="text-sm font-bold tracking-widest text-[#8e919f]">Select Role</h3>
                    <ModeSelector selected={mode} onSelect={handleModeSelect} />
                  </div>
                  
                  {isUpdatingMode ? (
                     <div className="flex items-center justify-center p-4">
                       <Loader2 className="w-5 h-5 animate-spin text-[#a8c7fa]" />
                     </div>
                  ) : mode === 'client' ? (
                     <TokenRedeemer currentUsername={user.username} onSuccess={(p) => setPairedWith(p)} />
                  ) : mode === 'host' ? (
                     <TokenGenerator username={user.username} />
                  ) : null}
                </>
              ) : (
                 <div className="flex flex-col items-center justify-center p-6 bg-[#1e2330] rounded-[20px] text-center gap-4">
                   <div className="w-16 h-16 rounded-full bg-[#004a77]/20 flex items-center justify-center">
                     <Shield className="w-8 h-8 text-[#a8c7fa]" />
                   </div>
                   <div>
                     <div className="text-base font-bold text-[#e2e2e9] mb-1">Pairing Active</div>
                     <p className="text-sm text-[#8e919f]">Paired with node: <span className="text-[#a8c7fa] font-mono">{pairedWith}</span></p>
                     <p className="text-xs text-[#c4c6d0] mt-3">Open the Android app to activate the tunnel.</p>
                   </div>
                 </div>
              )}
        </section>
    </div>
  );
}
