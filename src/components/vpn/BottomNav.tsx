import { NavLink } from 'react-router-dom';
import { Shield, LayoutDashboard, Settings, Share2, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStoredUser } from '@/src/lib/vpnAuth';

export default function BottomNav() {
  const user = getStoredUser();
  const isAdmin = user?.isAdmin;

  const items = [
    { icon: Share2, label: 'Connect', path: '/connect' },
    { icon: MessageSquare, label: 'Chat', path: '/chat', requiresPair: true },
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  ];

  if (isAdmin) {
    items.push({ icon: Settings, label: 'Admin', path: '/admin' } as any);
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#050B15]/95 backdrop-blur-3xl border-t border-white/5 pb-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex flex-col items-center gap-1 transition-all duration-300 px-4 py-2",
              isActive 
                ? "text-emerald-400" 
                : "text-white/30 hover:text-white/50"
            )}
          >
            {({ isActive }) => (
              <>
                <div className={cn(
                  "p-1.5 rounded-full transition-all duration-300",
                  isActive && "bg-emerald-500/10 scale-110 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                )}>
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
