import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import StatusIndicator from "@/src/components/vpn/StatusIndicator";
import { format } from "date-fns";

interface AdminUserTableProps {
  users: any[];
}

export default function AdminUserTable({ users }: AdminUserTableProps) {
  return (
    <div className="w-full overflow-hidden">
      <Table>
        <TableHeader className="bg-white/5 border-b border-white/5">
          <TableRow className="hover:bg-transparent border-white/5">
            <TableHead className="text-[10px] uppercase tracking-widest font-bold text-white/40">User</TableHead>
            <TableHead className="text-[10px] uppercase tracking-widest font-bold text-white/40">Phone</TableHead>
            <TableHead className="text-[10px] uppercase tracking-widest font-bold text-white/40">Country</TableHead>
            <TableHead className="text-[10px] uppercase tracking-widest font-bold text-white/40">Mode</TableHead>
            <TableHead className="text-[10px] uppercase tracking-widest font-bold text-white/40 text-right">Registered</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user, i) => (
            <motion.tr
              key={user.username}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group border-white/5 hover:bg-white/5 transition-colors"
            >
              <TableCell className="py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xs text-white/60">
                    {user.username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white group-hover:text-emerald-500 transition-colors">
                      {user.username}
                    </div>
                    <StatusIndicator status={user.is_online ? 'online' : 'offline'} />
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-white/60 font-mono text-xs">{user.phone}</TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-white/5 border-white/10 text-[10px] text-white/60 font-medium">
                  {user.country}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge 
                  className={
                    user.mode === 'host' ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/20" : 
                    user.mode === 'client' ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/20" : 
                    "bg-white/5 text-white/30 border-white/10"
                  }
                >
                  {user.mode || 'none'}
                </Badge>
              </TableCell>
              <TableCell className="text-right text-white/30 text-[10px] font-mono">
                {user.last_seen ? format(new Date(user.last_seen), 'MMM dd, yyyy') : 'N/A'}
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
