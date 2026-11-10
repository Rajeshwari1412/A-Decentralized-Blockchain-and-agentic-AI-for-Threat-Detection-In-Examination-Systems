import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Activity } from 'lucide-react';

interface AnomalyTrendChartProps {
  data: Array<{
    id: string;
    score: number;
    is_anomaly: boolean;
    time: string;
  }>;
}

export const AnomalyTrendChart: React.FC<AnomalyTrendChartProps> = ({ data }) => {
  const chartData = data && data.length > 0
    ? data
    : [
        { time: '10:00:00', score: 18, is_anomaly: false },
        { time: '10:15:00', score: 22, is_anomaly: false },
        { time: '10:30:00', score: 20, is_anomaly: false },
        { time: '10:45:00', score: 25, is_anomaly: false },
        { time: '11:00:00', score: 72, is_anomaly: true },
        { time: '11:15:00', score: 88, is_anomaly: true },
        { time: '11:30:00', score: 94, is_anomaly: true }
      ];

  return (
    <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md shadow-xl flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/40">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">
              Isolation Forest ML Anomaly Velocity
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Normalized Outlier Scores (0-100) vs Detection Threshold
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            <span className="text-slate-400">Score</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span className="text-rose-400">Threshold (&gt;65)</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" stroke="#64748b" fontSize={10} fontStyle="monospace" />
            <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} fontStyle="monospace" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0b1120',
                borderColor: '#334155',
                borderRadius: '0.75rem',
                fontSize: '12px',
                fontFamily: 'monospace'
              }}
              formatter={(val: any) => [`${val}/100 Risk Index`, 'Anomaly Score']}
            />
            <ReferenceLine y={65} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: 'CRITICAL THRESHOLD', fill: '#f43f5e', fontSize: 9, position: 'insideTopRight' }} />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#06b6d4"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#scoreGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
