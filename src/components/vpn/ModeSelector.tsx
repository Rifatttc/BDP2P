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
          "p-6 rounded-[24px] flex flex-col items-center gap-3 transition-all border outline-none",
          selected === 'host' ? "border-[#ffb4ab]/50 bg-[#93000a]/20 shadow-sm" : "border-white/5 bg-[#1e2330] hover:bg-[#2a2a35]"
        )}
      >
        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center transition-colors", selected === 'host' ? "bg-[#ffb4ab]" : "bg-[#2a2a35]")}>
          <Server className={cn("w-6 h-6", selected === 'host' ? "text-[#690005]" : "text-[#8e919f]")} />
        </div>
        <div className="text-center">
          <div className="font-bold text-sm text-[#e2e2e9]">Host Mode</div>
          <div className="text-[10px] text-[#8e919f] uppercase tracking-wider">Gateway</div>
        </div>
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => onSelect('client')}
        className={cn(
          "p-6 rounded-[24px] flex flex-col items-center gap-3 transition-all border outline-none",
          selected === 'client' ? "border-[#a8c7fa]/50 bg-[#004a77]/20 shadow-sm" : "border-white/5 bg-[#1e2330] hover:bg-[#2a2a35]"
        )}
      >
        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center transition-colors", selected === 'client' ? "bg-[#a8c7fa]" : "bg-[#2a2a35]")}>
          <Smartphone className={cn("w-6 h-6", selected === 'client' ? "text-[#003355]" : "text-[#8e919f]")} />
        </div>
        <div className="text-center">
          <div className="font-bold text-sm text-[#e2e2e9]">Client Mode</div>
          <div className="text-[10px] text-[#8e919f] uppercase tracking-wider">Connect</div>
        </div>
      </motion.button>
    </div>
  );
}
