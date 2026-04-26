import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface CountryChartProps {
  data: { country: string; count: number }[];
}

const COLORS = ['#10b981', '#6366f1', '#a855f7', '#eab308', '#f97316', '#06b6d4', '#ec4899', '#8b5cf6'];

export default function CountryChart({ data }: CountryChartProps) {
  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
          <XAxis 
            dataKey="country" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#ffffff40', fontSize: 10, fontWeight: 600 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#ffffff40', fontSize: 10 }}
          />
          <Tooltip 
            cursor={{ fill: '#ffffff08' }}
            contentStyle={{ 
              backgroundColor: '#0f172a', 
              border: '1px solid #ffffff10', 
              borderRadius: '12px',
              fontSize: '12px',
              color: '#fff'
            }}
            itemStyle={{ color: '#10b981' }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={24}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
