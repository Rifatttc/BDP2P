import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Check, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { db } from '@/src/lib/firebase';
import { collection, addDoc, query, where, getDocs, Timestamp, doc, setDoc } from 'firebase/firestore';
import { generatePairingCode } from '@/src/lib/vpnAuth';
import { toast } from 'sonner';

interface TokenGeneratorProps {
  username: string;
}

export default function TokenGenerator({ username }: TokenGeneratorProps) {
  const [token, setToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchExistingToken = async () => {
    const q = query(
      collection(db, 'pairing_tokens'),
      where('owner_username', '==', username),
      where('is_used', '==', false),
      where('expires_at', '>', Timestamp.now())
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const data = snap.docs[0].data();
      setToken(data.token_code);
      setExpiresAt(data.expires_at.toMillis());
    }
  };

  useEffect(() => {
    fetchExistingToken();
  }, [username]);

  useEffect(() => {
    if (!expiresAt) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = expiresAt - now;
      if (diff <= 0) {
        setToken(null);
        setExpiresAt(null);
        clearInterval(interval);
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const generateToken = async () => {
    setLoading(true);
    try {
      const code = generatePairingCode();
      const expiry = new Date();
      expiry.setHours(expiry.getHours() + 1);

      await addDoc(collection(db, 'pairing_tokens'), {
        token_code: code,
        owner_username: username,
        expires_at: Timestamp.fromDate(expiry),
        is_used: false,
        used_by: ''
      });

      setToken(code);
      setExpiresAt(expiry.getTime());
      toast.success("New pairing code generated");
    } catch (error) {
      toast.error("Failed to generate code");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.info("Copied to clipboard");
  };

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <AnimatePresence mode="wait">
        {!token ? (
          <motion.div
            key="generate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <Button 
              onClick={generateToken} 
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black uppercase tracking-widest text-xs"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Create Invite Code"}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="display"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full glass-card p-6 rounded-3xl border-emerald-500/20 text-center flex flex-col items-center gap-4"
          >
            <div className="text-[10px] uppercase tracking-[0.3em] text-emerald-500 font-black">Your Invite Code</div>
            <div className="text-5xl font-black font-mono tracking-[0.15em] text-white pl-[0.15em]">{token}</div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={copyToClipboard}
                variant="outline"
                className="h-10 px-4 rounded-xl border-white/10 bg-white/5 hover:bg-white/10"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <div className="flex items-center gap-2 text-white/40 text-xs px-3 h-10 rounded-xl bg-white/5 border border-white/10">
                <Clock className="w-3.5 h-3.5" />
                <span>Expires in {timeLeft}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
