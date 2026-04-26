import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'connecting';
  showLabel?: boolean;
}

export default function StatusIndicator({ status, showLabel = true }: StatusIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex items-center justify-center">
        {status === 'online' && (
          <motion.span 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute h-full w-full rounded-full bg-emerald-500/50"
          />
        )}
        <div className={cn(
          "w-2 h-2 rounded-full z-10",
          status === 'online' ? "pulse-green" :
          status === 'connecting' ? "bg-yellow-500 animate-pulse" :
          "bg-white/20"
        )} />
      </div>
      {showLabel && (
        <span className={cn(
          "text-[10px] uppercase tracking-widest font-semibold",
          status === 'online' ? "text-emerald-500" :
          status === 'connecting' ? "text-yellow-500" :
          "text-white/30"
        )}>
          {status}
        </span>
      )}
    </div>
  );
}
