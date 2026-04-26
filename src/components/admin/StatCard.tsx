import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  color: 'emerald' | 'indigo' | 'yellow' | 'red';
  delay?: number;
}

export default function StatCard({ icon: Icon, value, label, color, delay = 0 }: StatCardProps) {
  const colorMap = {
    emerald: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30",
    indigo: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    yellow: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
    red: "bg-red-500/20 text-red-500 border-red-500/30"
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      className="glass-card p-6 rounded-[24px] border-white/5 flex flex-col gap-4"
    >
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border", colorMap[color])}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <div className="text-3xl font-bold font-mono tracking-tighter text-white">{value}</div>
        <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30">{label}</div>
      </div>
    </motion.div>
  );
}
