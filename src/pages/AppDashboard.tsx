import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { Loader2, Power, RefreshCw, MessageCircle, LogOut, Server, SatelliteDish, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStoredUser } from '@/src/lib/vpnAuth';
import { VpnPlugin } from '@/src/lib/vpnPlugin';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

export default function AppDashboard() {
  const user = getStoredUser();
  const [activeRole, setActiveRole] = useState<'host' | 'client' | null>(null);
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [tokenUsage, setTokenUsage] = useState(0);
  const [tokenExpiry, setTokenExpiry] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState('00:00:00');

  useEffect(() => {
      if (status === 'connected' && tokenExpiry) {
          const interval = setInterval(() => {
              const now = Date.now();
              const remaining = tokenExpiry - now;
              
              if (remaining <= 0) {
                  setTimeLeft('00:00:00');
                  setStatus('disconnected');
                  setTokenExpiry(null);
                  toast.error("Token expired!");
                  clearInterval(interval);
              } else {
                  const hours = Math.floor(remaining / 3600000);
                  const minutes = Math.floor((remaining % 3600000) / 60000);
                  const seconds = Math.floor((remaining % 60000) / 1000);
                  setTimeLeft(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
              }
          }, 1000);
          return () => clearInterval(interval);
      } else {
          setTimeLeft('00:00:00');
      }
  }, [status, tokenExpiry]);

  const handleConnect = async () => {
    if (status === 'connected') {
      setStatus('disconnected');
      setTokenExpiry(null);
      if (Capacitor.isNativePlatform()) {
        try { await VpnPlugin.stopVpn(); } catch(err) {}
      }
      toast.info("Connection terminated");
      return;
    }
    
    if (activeRole === 'client' && (!token || token !== localStorage.getItem('validToken'))) {
        console.error("Token validation failed:", { token, valid: localStorage.getItem('validToken') });
        toast.error("Invalid or empty token");
        return;
    }

    setStatus('connecting');
    try {
        if (Capacitor.isNativePlatform()) {
           await VpnPlugin.startVpn({ mode: activeRole, peerId: token });
        }
        setStatus('connected');
        setTokenUsage(prev => prev + 1);
        setTokenExpiry(Date.now() + 60 * 60 * 1000);
        toast.success("VPN Gateway established");
    } catch(e) {
        toast.error("Failed to start VPN");
        setStatus('disconnected');
    }
  };

  const handleExit = async () => {
      if (status === 'connected') {
          if (Capacitor.isNativePlatform()) {
              try { await VpnPlugin.stopVpn(); } catch(err) {}
          }
          setStatus('disconnected');
      }
      window.close();
  };

  return (
    <div className="flex flex-col h-full bg-[#f8f9fb] p-6 text-[#333] font-sans">
      <header className="relative w-full overflow-hidden rounded-3xl p-8 shadow-xl mb-8">
        {/* Animated Gradient Background */}
        <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900"
            animate={{
                backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
                duration: 15,
                repeat: Infinity,
                repeatType: 'reverse',
            }}
            style={{ backgroundSize: '200% 200%' }}
        />
        {/* Foreground content */}
        <div className="relative z-10 flex flex-col items-center justify-center gap-2">
            <h1 className="text-4xl font-extrabold tracking-tighter text-white uppercase drop-shadow-lg">BDP2P <span className='text-purple-300'>Tunnel</span></h1>
        </div>
      </header>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6 transition-all duration-300">
        <div className="text-center mb-4">
          <div className={cn(
            "inline-block px-4 py-1 rounded-full text-sm font-bold tracking-wider",
            status === 'connected' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
          )}>
            {status === 'connected' ? 'CONNECTED' : 'DISCONNECTED'}
          </div>
        </div>
        <div className="flex justify-between items-center mb-2">
            <span className="text-gray-500 text-sm font-semibold">0 KB/s</span>
        </div>
        <div className="flex justify-between text-[10px] text-gray-500 font-mono mt-2">
          <span>Config: {tokenUsage}</span>
          <span>IP: {status === 'connected' ? (activeRole === 'host' ? '192.168.1.5' : '10.83.135.67') : '---'}</span>
          <span>Time: {timeLeft}</span>
        </div>
      </div>
      
      <div className="space-y-4 mb-8">
        {!activeRole ? (
            <>
                <button onClick={() => setActiveRole('host')} className="w-56 mx-auto py-2 rounded-full bg-green-600 text-white font-bold flex items-center justify-center gap-3 text-sm shadow-lg shadow-green-200">
                    <Server className="w-4 h-4"/> Start as a Host
                </button>
                <button onClick={() => setActiveRole('client')} className="w-56 mx-auto py-2 rounded-full bg-red-500 text-white font-bold flex items-center justify-center gap-3 text-sm shadow-lg shadow-red-200">
                    <SatelliteDish className="w-4 h-4"/> Join as a Client
                </button>
            </>
        ) : activeRole === 'host' ? (
             <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    const lastGenerated = localStorage.getItem('lastTokenGenerated');
                    if (lastGenerated && (Date.now() - parseInt(lastGenerated) < 3600000)) {
                        toast.error("You can only generate one token per hour.");
                        return;
                    }
                    const newToken = Math.random().toString(36).substring(2, 12).toUpperCase();
                    setToken(newToken);
                    localStorage.setItem('validToken', newToken);
                    localStorage.setItem('lastTokenGenerated', Date.now().toString());
                  }}
                  className="w-56 mx-auto py-2 rounded-full bg-purple-600 text-white font-bold text-sm"
                >
                    Generate Token
                </button>
                {token && (
                    <div className="flex items-center justify-center gap-2 text-center text-sm font-mono bg-gray-100 p-2 rounded-lg">
                        <span className="break-all">{token}</span>
                        <button onClick={() => {
                            navigator.clipboard.writeText(token);
                            toast.success("Token copied!");
                        }} className="text-gray-500 hover:text-purple-600">
                            <Copy className="w-4 h-4" />
                        </button>
                    </div>
                )}
                <button onClick={() => { setActiveRole(null); setToken(''); }} className="text-gray-500 text-xs">Cancel</button>
             </div>
        ) : (
             <div className="flex flex-col gap-3">
                <input 
                    type="text" 
                    value={token} 
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Enter Token"
                    className="w-full p-3 rounded-xl border border-gray-200"
                />
                <button onClick={handleConnect} className="w-56 mx-auto py-2 rounded-full bg-green-600 text-white font-bold text-sm">
                    Start Connection
                </button>
                <button onClick={() => setActiveRole(null)} className="text-gray-500 text-xs">Cancel</button>
             </div>
        )}
      </div>
    
      {(!activeRole || activeRole === 'host') && (
      <div className="flex flex-col items-center justify-center my-8">
        <motion.button
          onClick={handleConnect}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "relative w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all duration-300 p-1",
            status === 'connected' ? "bg-green-500" : "bg-gradient-to-tr from-purple-500 via-pink-500 to-blue-500"
          )}
        >
          <div className={cn(
                  "w-full h-full rounded-full flex flex-col items-center justify-center transition-colors duration-300",
                  status === 'connected' ? "bg-green-50" : "bg-white"
                )}>
              {status === 'connecting' ? 
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" /> : 
                <Power className={cn("w-8 h-8", status === 'connected' ? "text-green-500" : "text-gray-400")} />
              }
              <span className={cn("font-bold text-sm", status === 'connected' ? "text-green-600" : "text-gray-700")}>START</span>
          </div>
        </motion.button>
      </div>
      )}
      
      <div className="grid grid-cols-3 gap-2">
        <button className="flex flex-col items-center justify-center py-3 rounded-xl border border-green-200 text-sm font-semibold text-green-600 bg-green-50 shadow-sm">
            <RefreshCw className="w-5 h-5 mb-1 text-green-500"/> Update
        </button>
        <button className="flex flex-col items-center justify-center py-3 rounded-xl border border-blue-200 text-sm font-semibold text-blue-500 bg-blue-50 shadow-sm">
            <MessageCircle className="w-5 h-5 mb-1 text-blue-500"/> Telegram
        </button>
        <button onClick={handleExit} className="flex flex-col items-center justify-center py-3 rounded-xl border border-red-200 text-sm font-semibold text-red-500 bg-red-50 shadow-sm">
            <LogOut className="w-5 h-5 mb-1"/> Exit
        </button>
      </div>
    </div>
  );
}

