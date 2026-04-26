import { Link, useNavigate } from 'react-router-dom';
import { Shield, LayoutDashboard, Settings, LogOut } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getStoredUser, clearStoredUser } from '@/src/lib/vpnAuth';

export default function VpnHeader() {
  const user = getStoredUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearStoredUser();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-white/5">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30 group-hover:bg-primary/30 transition-all">
            <Shield className="w-6 h-6 text-emerald-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white leading-none">BD-VPN</span>
            <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-emerald-500/80 leading-none mt-1">Gateway</span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-emerald-500/20">
                <div className="w-2 h-2 rounded-full pulse-green" />
                <span className="text-xs font-semibold text-white/90">{user.username || user.phone}</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate(user.isAdmin ? '/admin' : '/connect')}
                className="hover:bg-white/5 text-white/70 hover:text-white"
              >
                {user.isAdmin ? <Settings className="w-5 h-5" /> : <LayoutDashboard className="w-5 h-5" />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout}
                className="hover:bg-red-500/10 text-white/70 hover:text-red-500"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className={cn(
                  buttonVariants({ variant: "ghost" }), 
                  "hidden sm:inline-flex text-white/80 hover:text-white hover:bg-white/5"
                )}
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className={cn(
                  buttonVariants({ variant: "default" }), 
                  "bg-emerald-600 hover:bg-emerald-500 text-white border-0 glow-emerald"
                )}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
