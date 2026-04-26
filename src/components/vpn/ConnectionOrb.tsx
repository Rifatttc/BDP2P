import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface ConnectionOrbProps {
  status: 'disconnected' | 'connecting' | 'connected';
}

export default function ConnectionOrb({ status }: ConnectionOrbProps) {
  const colors = {
    disconnected: "bg-white/10",
    connecting: "bg-yellow-500",
    connected: "bg-emerald-500"
  };

  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      {/* Animated Rings */}
      {(status === 'connecting' || status === 'connected') && (
        <>
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
            className={cn("absolute inset-0 rounded-full border-2", status === 'connected' ? 'border-emerald-500/20' : 'border-yellow-500/20')}
          />
          <motion.div
            animate={{ scale: [1, 1.8, 1], opacity: [0.2, 0.05, 0.2] }}
            transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
            className={cn("absolute inset-0 rounded-full border border-dashed", status === 'connected' ? 'border-emerald-500/10' : 'border-yellow-500/10')}
          />
        </>
      )}

      {/* Main Orb */}
      <motion.div
        animate={status === 'connecting' ? { scale: [0.95, 1, 0.95] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
        className={cn(
          "w-32 h-32 rounded-full flex items-center justify-center relative z-10 transition-all duration-700 shadow-2xl",
          status === 'connected' ? "bg-emerald-600 glow-emerald border-4 border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.3)]" : 
          status === 'connecting' ? "bg-yellow-500 shadow-yellow-500/50" : 
          "bg-white/5 border border-white/10 shadow-none"
        )}
      >
        <div className="w-20 h-20 rounded-full bg-emerald-950/40 backdrop-blur-sm flex items-center justify-center border border-white/5">
          <div className={cn("w-8 h-8 rounded-full transition-colors duration-700", status === 'connected' ? "text-emerald-400" : colors[status])}>
            {status === 'connected' && (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
            )}
            {status !== 'connected' && <div className={cn("w-full h-full rounded-full", colors[status])} />}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
