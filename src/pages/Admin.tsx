import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Shield, Users, Globe, Download, Activity, RefreshCw, 
  ChevronLeft, BarChart3, PieChart, Database, Zap, Server
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import VpnHeader from '@/src/components/vpn/VpnHeader';
import GlassCard from '@/src/components/vpn/GlassCard';
import StatCard from '@/src/components/admin/StatCard';
import CountryChart from '@/src/components/admin/CountryChart';
import AdminUserTable from '@/src/components/admin/AdminUserTable';
import { db } from '@/src/lib/firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';

export default function Admin() {
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    onlineNow: 0,
    downloads: 0,
    countries: 0
  });
  const [countryData, setCountryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const userSnap = await getDocs(collection(db, 'users'));
      const userData = userSnap.docs.map(d => d.data());
      setUsers(userData);

      const statsSnap = await getDocs(collection(db, 'stats'));
      const totalDownloads = statsSnap.docs.find(d => d.id === 'total_downloads')?.data()?.stat_value || 0;

      // Calculate localized stats
      const onlineCount = userData.filter(u => u.is_online).length;
      const uniqueCountries = new Set(userData.map(u => u.country)).size;
      
      setStats({
        totalUsers: userData.length,
        onlineNow: onlineCount,
        downloads: totalDownloads,
        countries: uniqueCountries
      });

      // Prepare Chart Data
      const countryMap: Record<string, number> = {};
      userData.forEach(u => {
        const c = u.country || 'Unknown';
        countryMap[c] = (countryMap[c] || 0) + 1;
      });
      const topCountries = Object.entries(countryMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([country, count]) => ({ country, count }));
      
      setCountryData(topCountries);

    } catch (error) {
      console.error(error);
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col pb-12">
      <VpnHeader />
      
      <main className="flex-1 container mx-auto px-4 pt-6 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="glass rounded-full border-white/5">
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-emerald-500" />
              <h1 className="text-2xl font-bold text-white tracking-tight">Admin Dashboard</h1>
            </div>
          </div>
          <Button 
            onClick={fetchData} 
            disabled={loading}
            className="rounded-xl glass border-white/10 hover:bg-white/10 text-white gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Data</span>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} value={stats.totalUsers} label="Total Users" color="emerald" delay={0.1} />
          <StatCard icon={Activity} value={stats.onlineNow} label="Online Now" color="indigo" delay={0.2} />
          <StatCard icon={Download} value={stats.downloads} label="Downloads" color="yellow" delay={0.3} />
          <StatCard icon={Globe} value={stats.countries} label="Countries" color="red" delay={0.4} />
        </div>

        {/* Charts & Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlassCard className="lg:col-span-2 flex flex-col p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-bold text-white/80">User Distribution by Country</span>
              </div>
              <div className="text-[10px] uppercase font-mono text-white/30">Live Analytics</div>
            </div>
            <div className="p-6 h-[400px]">
              <CountryChart data={countryData} />
            </div>
          </GlassCard>

          <GlassCard className="flex flex-col p-0 overflow-hidden border-indigo-500/10">
            <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-bold text-white/80">Quick Health Check</span>
            </div>
            <div className="p-8 flex-1 flex flex-col justify-center space-y-6">
              {[
                { label: "Host Nodes", value: users.filter(u => u.mode === 'host').length, icon: Server, color: 'text-emerald-500' },
                { label: "Client Tunnels", value: users.filter(u => u.mode === 'client').length, icon: Zap, color: 'text-indigo-400' },
                { label: "IDLE Users", value: users.filter(u => !u.mode || u.mode === 'none').length, icon: Users, color: 'text-yellow-500' },
                { label: "DB Latency", value: "< 15ms", icon: Database, color: 'text-white/20' }
              ].map((item, i) => (
                <div key={item.label} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                    <span className="text-sm text-white/60">{item.label}</span>
                  </div>
                  <span className="text-lg font-mono font-bold text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* User Table */}
        <GlassCard className="p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-bold text-white/80">Registered Clients</span>
            </div>
            <Badge variant="outline" className="text-[10px]">{users.length} Total Users</Badge>
          </div>
          <AdminUserTable users={users} />
        </GlassCard>
      </main>
    </div>
  );
}
