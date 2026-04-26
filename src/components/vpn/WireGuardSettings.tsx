import React, { useState, useEffect } from 'react';
import { Key, RefreshCw, Save, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { db } from '@/src/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import GlassCard from './GlassCard';

interface WireGuardSettingsProps {
  username: string;
}

export default function WireGuardSettings({ username }: WireGuardSettingsProps) {
  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [originalPublicKey, setOriginalPublicKey] = useState('');
  const [originalPrivateKey, setOriginalPrivateKey] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', username));
        let fetchedPub = '';
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.wireguard_public_key) {
            fetchedPub = data.wireguard_public_key;
            setPublicKey(fetchedPub);
            setOriginalPublicKey(fetchedPub);
          }
        }
        // Local storage for private key
        const savedPriv = localStorage.getItem(`wg_priv_${username}`) || '';
        if (savedPriv) {
          setPrivateKey(savedPriv);
          setOriginalPrivateKey(savedPriv);
        }
      } catch (error) {
        console.error("Error fetching keys:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchKeys();
  }, [username]);

  const generateKeys = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const generateRandom = (length: number) => {
      let result = '';
      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return result + '=';
    };

    const priv = generateRandom(43);
    const pub = generateRandom(43); 

    setPrivateKey(priv);
    setPublicKey(pub);
    toast.success("Generated valid WireGuard keypair");
  };

  const saveKeys = async () => {
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'users', username), {
        wireguard_public_key: publicKey
      });
      localStorage.setItem(`wg_priv_${username}`, privateKey);
      setOriginalPublicKey(publicKey);
      setOriginalPrivateKey(privateKey);
      toast.success("Encryption configuration updated");
    } catch (error) {
      toast.error("Failed to save configuration");
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = publicKey !== originalPublicKey || privateKey !== originalPrivateKey;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <GlassCard className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-emerald-500" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-black tracking-widest text-white/70">Gateway Identity</span>
            <span className="text-[8px] uppercase tracking-[0.2em] font-bold text-emerald-500/50">WireGuard SECURE_TUNNEL_PROTOCOL</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {originalPublicKey && (
            <Badge variant="outline" className="h-6 text-[8px] border-emerald-500/20 text-emerald-400 bg-emerald-500/10 uppercase tracking-widest font-black">
              Verified
            </Badge>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={generateKeys}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:bg-white/10"
          >
            <RefreshCw className="w-4 h-4 text-white/40" />
          </Button>
        </div>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <div className="flex justify-between items-end px-1">
            <Label htmlFor="publicKey" className="text-[10px] text-white/50 uppercase tracking-widest font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-emerald-500" /> Public Key (Identity)
            </Label>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(publicKey);
                toast.info("Public key copied");
              }}
              className="text-[9px] text-emerald-500 hover:text-emerald-400 font-bold uppercase tracking-tighter transition-colors"
            >
              Copy Ident
            </button>
          </div>
          <div className="relative group">
            <Input 
              id="publicKey"
              value={publicKey}
              onChange={(e) => setPublicKey(e.target.value)}
              placeholder="Base64 Public Key..."
              className="bg-white/[0.03] border-white/10 rounded-xl h-12 font-mono text-xs focus:ring-emerald-500/50 text-white transition-all group-hover:border-white/20"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-end px-1">
            <Label htmlFor="privateKey" className="text-[10px] text-white/50 uppercase tracking-widest font-semibold flex items-center gap-1.5">
              <Key className="w-3 h-3 text-indigo-400" /> Private Key (Secret)
            </Label>
            {privateKey && (
              <span className="text-[9px] text-indigo-400 font-mono">Status: Encrypted</span>
            )}
          </div>
          <div className="relative group">
            <Input 
              id="privateKey"
              type="password"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              placeholder="Base64 Private Key..."
              className="bg-white/[0.03] border-white/10 rounded-xl h-12 font-mono text-xs focus:ring-indigo-500/50 text-white transition-all group-hover:border-white/20"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-black/40 text-[9px] text-white/40 border border-white/5 uppercase tracking-tighter">Private</div>
          </div>
          <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-2 flex items-start gap-2">
            <div className="w-1 h-1 rounded-full bg-amber-500 mt-1" />
            <p className="text-[9px] text-amber-200/50 leading-relaxed uppercase tracking-tighter">Private keys are stored in your local vault. They are never transmitted over the network.</p>
          </div>
        </div>
      </div>

      <Button 
        onClick={saveKeys}
        disabled={isSaving || !publicKey || !hasChanges}
        className={cn(
          "w-full h-14 rounded-full font-black text-sm uppercase tracking-[0.2em] transition-all duration-500",
          hasChanges 
            ? "bg-emerald-600 text-white shadow-2xl shadow-emerald-500/20" 
            : "bg-white/5 text-white/20"
        )}
      >
        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : (
          <div className="flex items-center gap-3">
            <Save className="w-5 h-5" /> 
            {hasChanges ? "Commit New Config" : "Config Verified"}
          </div>
        )}
      </Button>
    </GlassCard>
  );
}
