import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'emerald' | 'indigo' | 'none';
  delay?: number;
  onClick?: () => void;
}

export default function GlassCard({ children, className, glow = 'none', delay = 0, onClick }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      onClick={onClick}
      className={cn(
        "glass-card p-6 rounded-[32px] border-white/5",
        onClick && "cursor-pointer active:scale-[0.98] transition-transform",
        glow === 'emerald' && "glow-emerald border-emerald-500/20 shadow-emerald-900/10",
        glow === 'indigo' && "glow-indigo border-indigo-500/20 shadow-indigo-900/10",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
