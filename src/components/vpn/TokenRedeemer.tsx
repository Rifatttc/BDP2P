import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { db } from '@/src/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, Timestamp, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';

interface TokenRedeemerProps {
  currentUsername: string;
  onSuccess: (pairedWith: string) => void;
}

export default function TokenRedeemer({ currentUsername, onSuccess }: TokenRedeemerProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return toast.error("Enter a 6-digit code");

    setLoading(true);
    try {
      const q = query(
        collection(db, 'pairing_tokens'),
        where('token_code', '==', code),
        where('is_used', '==', false),
        where('expires_at', '>', Timestamp.now())
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        toast.error("Invalid or expired code");
        return;
      }

      const tokenDoc = snap.docs[0];
      const tokenData = tokenDoc.data();

      if (tokenData.owner_username === currentUsername) {
        toast.error("You cannot use your own code");
        return;
      }

      // Mark token as used
      await updateDoc(tokenDoc.ref, {
        is_used: true,
        used_by: currentUsername
      });

      // Update both users
      const peerUsername = tokenData.owner_username;
      
      const meRef = doc(db, 'users', currentUsername);
      const peerRef = doc(db, 'users', peerUsername);

      await updateDoc(meRef, { paired_with: peerUsername });
      await updateDoc(peerRef, { paired_with: currentUsername });

      toast.success(`Successfully paired with ${peerUsername}`);
      onSuccess(peerUsername);
      setCode("");

    } catch (error) {
      console.error(error);
      toast.error("Failed to redeem code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleRedeem} className="flex flex-col gap-3">
        <label className="text-[10px] uppercase tracking-[0.2em] text-white/30 ml-1 font-black">Input Host Invite Code</label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Shield className="h-5 w-5 text-white/20 group-focus-within:text-emerald-500 transition-colors" />
          </div>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000 000"
            className="h-16 bg-white/5 border-white/10 rounded-2xl pl-12 pr-16 text-2xl font-black font-mono tracking-[0.4em] text-white placeholder:text-white/10 focus:border-emerald-500/50 transition-all text-center"
          />
          <Button 
            type="submit" 
            disabled={loading || code.length !== 6}
            className="absolute right-2 top-2 bottom-2 aspect-square rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg p-0"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
          </Button>
        </div>
      </form>
    </div>
  );
}
