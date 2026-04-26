import { motion } from 'motion/react';
import { Server, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModeSelectorProps {
  selected: 'host' | 'client' | 'none';
  onSelect: (mode: 'host' | 'client') => void;
}

export default function ModeSelector({ selected, onSelect }: ModeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => onSelect('host')}
        className={cn(
          "glass-card p-6 rounded-[32px] flex flex-col items-center gap-3 transition-all border-white/5",
          selected === 'host' ? "border-emerald-500/40 glow-emerald bg-emerald-500/5" : "hover:bg-white/5"
        )}
      >
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-colors", selected === 'host' ? "bg-emerald-500" : "bg-white/10")}>
          <Server className={cn("w-6 h-6", selected === 'host' ? "text-white" : "text-white/40")} />
        </div>
        <div className="text-center">
          <div className="font-bold text-sm text-white">Host Mode</div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider">BD Server</div>
        </div>
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => onSelect('client')}
        className={cn(
          "glass-card p-6 rounded-[32px] flex flex-col items-center gap-3 transition-all border-white/5",
          selected === 'client' ? "border-indigo-500/40 glow-indigo bg-indigo-500/5" : "hover:bg-white/5"
        )}
      >
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-colors", selected === 'client' ? "bg-indigo-500" : "bg-white/10")}>
          <Smartphone className={cn("w-6 h-6", selected === 'client' ? "text-white" : "text-white/40")} />
        </div>
        <div className="text-center">
          <div className="font-bold text-sm text-white">Client Mode</div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider">Connect Abroad</div>
        </div>
      </motion.button>
    </div>
  );
}
