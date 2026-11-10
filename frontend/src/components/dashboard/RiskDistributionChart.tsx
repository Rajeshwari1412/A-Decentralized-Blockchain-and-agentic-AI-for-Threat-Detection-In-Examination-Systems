import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Users } from 'lucide-react';

interface RiskDistributionChartProps {
  distribution: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
  };
}

export const RiskDistributionChart: React.FC<RiskDistributionChartProps> = ({ distribution }) => {
  const data = [
    { tier: 'LOW', count: distribution.LOW || 0, color: '#10b981' },
    { tier: 'MEDIUM', count: distribution.MEDIUM || 0, color: '#f59e0b' },
    { tier: 'HIGH', count: distribution.HIGH || 0, color: '#f97316' },
    { tier: 'CRITICAL', count: distribution.CRITICAL || 0, color: '#f43f5e' }
  ];

  return (
    <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md shadow-xl flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800/40">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">
              Exam System Risk Population Breakdown
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Users Stratified by Cumulative Threat Tier
            </p>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="tier" stroke="#64748b" fontSize={11} fontStyle="monospace" />
            <YAxis stroke="#64748b" fontSize={10} fontStyle="monospace" allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0b1120',
                borderColor: '#334155',
                borderRadius: '0.75rem',
                fontSize: '12px',
                fontFamily: 'monospace'
              }}
              formatter={(val: any) => [`${val} Users`, 'Total Accounts']}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
