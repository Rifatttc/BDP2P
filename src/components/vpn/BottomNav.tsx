import { NavLink } from 'react-router-dom';
import { Shield, Settings, Share2, MessageSquare, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStoredUser } from '@/src/lib/vpnAuth';

export default function BottomNav() {
  const user = getStoredUser();
  const isAdmin = user?.isAdmin;

  const items = [
    { icon: Share2, label: 'Connect', path: '/' },
    { icon: MessageSquare, label: 'Chat', path: '/chat', requiresPair: true },
    { icon: Download, label: 'Apps', path: '/apps' }
  ];

  if (isAdmin) {
    items.push({ icon: Settings, label: 'Admin', path: '/admin' } as any);
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#121622] text-[#e2e2e9] border-t border-white/5 pb-safe rounded-t-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-around h-[80px] max-w-lg mx-auto px-2">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex flex-col items-center justify-center gap-1 transition-all duration-300 w-16 h-16 rounded-xl",
              isActive 
                ? "text-[#a8c7fa]" 
                : "text-[#c4c6d0] hover:bg-white/5 active:bg-white/10"
            )}
          >
            {({ isActive }) => (
              <>
                <div className={cn(
                  "flex items-center justify-center w-14 h-8 rounded-full transition-all duration-300",
                  isActive && "bg-[#004a77]"
                )}>
                  <item.icon className={cn("w-6 h-6", isActive ? "fill-[#a8c7fa]" : "")} />
                </div>
                <span className={cn("text-[11px] font-medium tracking-wide", isActive ? "font-semibold" : "")}>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
