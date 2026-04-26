import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, ChevronLeft, MessageSquare, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { getStoredUser } from '@/src/lib/vpnAuth';
import { db } from '@/src/lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  doc,
  getDoc
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  from_username: string;
  to_username: string;
  message: string;
  message_type: 'text' | 'ip_share' | 'pairing_code';
  created_at: any;
}

export default function Chat() {
  const user = getStoredUser();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [pairedWith, setPairedWith] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Fetch paired user status
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, 'users', user.username), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setPairedWith(data.paired_with || null);
        setLoading(false);
      }
    });
    return () => unsub();
  }, [user?.username]);

  // 2. Fetch messages in real-time
  useEffect(() => {
    if (!user || !pairedWith) return;

    // We fetch messages where user is sender OR receiver
    // Firestore limited queries: we fetch all and filter in memory for simplicity 
    // or use a combined key (room_id)
    const q = query(
      collection(db, 'chat_messages'),
      orderBy('created_at', 'asc')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Message))
        .filter(m => 
          (m.from_username === user.username && m.to_username === pairedWith) ||
          (m.from_username === pairedWith && m.to_username === user.username)
        );
      setMessages(msgs);
      setTimeout(scrollToBottom, 100);
    });

    return () => unsub();
  }, [user?.username, pairedWith]);

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !pairedWith) return;

    const msgData = {
      from_username: user.username,
      to_username: pairedWith,
      message: newMessage.trim(),
      message_type: 'text',
      created_at: serverTimestamp()
    };

    setNewMessage('');
    try {
      await addDoc(collection(db, 'chat_messages'), msgData);
    } catch (error) {
      toast.error("Message failed to send");
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-100px)] bg-transparent flex items-center justify-center">
        <Shield className="w-10 h-10 text-[#a8c7fa] animate-pulse" />
      </div>
    );
  }

  if (!pairedWith) {
    return (
      <div className="h-[calc(100vh-100px)] bg-transparent flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="w-24 h-24 rounded-[32px] bg-[#121622] border border-white/5 flex items-center justify-center mb-4">
          <MessageSquare className="w-10 h-10 text-white/20" />
        </div>
        <h2 className="text-xl font-bold text-[#e2e2e9] tracking-tight">Pairing Required</h2>
        <p className="text-[#c4c6d0] text-sm max-w-xs leading-relaxed">
          You must establish a handshake connection with another user before initiating real-time communications.
        </p>
        <Button 
          onClick={() => navigate('/connect')}
          className="bg-[#a8c7fa] hover:bg-[#82b1ff] text-[#003355] rounded-[24px] px-8 h-12 font-bold tracking-wide mt-4"
        >
          Go to Connect
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Messaging Header */}
      <header className="h-[72px] px-4 flex items-center justify-between sticky top-0 z-50 bg-[#030712]/90 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="rounded-full text-[#c4c6d0] hover:bg-white/5"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#004a77] flex items-center justify-center">
              <User className="w-5 h-5 text-[#a8c7fa]" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-medium text-[#e2e2e9] leading-tight">{pairedWith}</span>
              <span className="text-xs text-[#a8c7fa] font-medium tracking-wide">Active Tunnel</span>
            </div>
          </div>
        </div>
        <div className="hidden sm:block">
          <Badge variant="outline" className="text-[10px] border-[#004a77] text-[#a8c7fa] tracking-widest bg-[#004a77]/20 py-1 px-3 rounded-full">Encrypted</Badge>
        </div>
      </header>

      {/* Messages List */}
      <main className="flex-1 overflow-y-auto px-4 py-8 space-y-6">
        <div className="max-w-lg mx-auto flex flex-col space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => {
              const isMine = msg.from_username === user.username;
              return (
                <motion.div
                  key={msg.id || i}
                  initial={{ opacity: 0, scale: 0.9, x: isMine ? 20 : -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  className={cn(
                    "flex flex-col max-w-[80%] space-y-1.5",
                    isMine ? "self-end items-end" : "self-start items-start"
                  )}
                >
                  <div className={cn(
                    "px-4 py-3 rounded-[24px] text-sm font-medium leading-relaxed shadow-sm",
                    isMine 
                      ? "bg-[#004a77] text-[#e2e2e9] rounded-br-[4px]" 
                      : "bg-[#1e2330] text-[#e2e2e9] rounded-bl-[4px]"
                  )}>
                    {msg.message}
                  </div>
                  <div className="flex items-center gap-1.5 px-1 py-0.5">
                    <span className="text-[10px] font-medium text-[#8e919f]">
                      {msg.created_at?.toDate ? msg.created_at.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending'}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={scrollRef} />
        </div>
      </main>

      {/* Input Area */}
      <div className="max-w-lg w-full mx-auto p-4 mb-2">
        <form 
          onSubmit={handleSendMessage}
          className="relative flex items-center bg-[#121622] rounded-full p-1.5 shadow-md focus-within:ring-2 focus-within:ring-[#004a77]"
        >
          <Input 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Secure message..."
            className="flex-1 bg-transparent border-none text-white text-sm h-12 pl-4 focus-visible:ring-0 placeholder:text-[#8e919f]"
          />
          <Button 
            type="submit"
            disabled={!newMessage.trim()}
            size="icon"
            className={cn(
              "w-12 h-12 rounded-full transition-all duration-300 active:scale-95",
              newMessage.trim() ? "bg-[#a8c7fa] text-[#003355]" : "bg-[#1e2330] text-[#8e919f]"
            )}
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
