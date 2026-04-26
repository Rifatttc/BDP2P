import React, { useState, useEffect } from 'react';
import { Activity, ArrowDown, ArrowUp, Clock } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export default function ConnectionMetrics({ active }: { active: boolean }) {
  const [uptime, setUptime] = useState(0);
  const [ping, setPing] = useState(45);
  const [tx, setTx] = useState(0);
  const [rx, setRx] = useState(0);

  useEffect(() => {
    if (!active) {
      setUptime(0);
      setTx(0);
      setRx(0);
      return;
    }

    // Set initial realistic values for a new connection
    setPing(Math.floor(Math.random() * 30) + 20); // 20-50ms init
    setTx(Math.random() * 0.1);
    setRx(Math.random() * 0.2);

    const interval = setInterval(() => {
      setUptime(prev => prev + 1);
      
      // Fluctuate ping slightly but keep bounds
      setPing(prev => {
        const volatility = Math.floor(Math.random() * 15) - 7;
        const newPing = prev + volatility;
        return Math.max(12, Math.min(180, newPing));
      });
      
      // Simulate data transfer (fluctuating transfer rates)
      setTx(prev => prev + (Math.random() * 0.15)); // adding ~0.075 MB/s avg
      setRx(prev => prev + (Math.random() * 0.8));  // adding ~0.4 MB/s avg
    }, 1000);

    return () => clearInterval(interval);
  }, [active]);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatData = (mb: number) => {
    if (mb > 1024) return `${(mb / 1024).toFixed(2)} GB`;
    return `${mb.toFixed(1)} MB`;
  };

  if (!active) return null;

  return (
    <div className="grid grid-cols-2 gap-3 mt-4">
      <div className="bg-white/5 border border-white/10 p-3 rounded-2xl flex items-center gap-3">
        <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400">
          <Clock className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[8px] uppercase tracking-widest text-white/40 font-bold mb-0.5">Uptime</div>
          <div className="text-xs font-mono font-bold text-white/90">{formatTime(uptime)}</div>
        </div>
      </div>
      
      <div className="bg-white/5 border border-white/10 p-3 rounded-2xl flex items-center gap-3">
        <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400">
          <Activity className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[8px] uppercase tracking-widest text-white/40 font-bold mb-0.5">Ping</div>
          <div className="text-xs font-mono font-bold text-white/90">{ping} ms</div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 p-3 rounded-2xl flex items-center gap-3">
        <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400">
          <ArrowUp className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[8px] uppercase tracking-widest text-white/40 font-bold mb-0.5">Sent</div>
          <div className="text-xs font-mono font-bold text-white/90">{formatData(tx)}</div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 p-3 rounded-2xl flex items-center gap-3">
        <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400">
          <ArrowDown className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[8px] uppercase tracking-widest text-white/40 font-bold mb-0.5">Rcvd</div>
          <div className="text-xs font-mono font-bold text-white/90">{formatData(rx)}</div>
        </div>
      </div>
    </div>
  );
}
