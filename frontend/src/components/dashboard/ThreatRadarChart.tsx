import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { ShieldCheck } from 'lucide-react';

interface ThreatRadarChartProps {
  data: Array<{
    dimension: string;
    value: number;
    benchmark: number;
  }>;
}

export const ThreatRadarChart: React.FC<ThreatRadarChartProps> = ({ data }) => {
  const radarData = data && data.length > 0
    ? data
    : [
        { dimension: 'Exfiltration', value: 78, benchmark: 20 },
        { dimension: 'Privilege Escalation', value: 65, benchmark: 15 },
        { dimension: 'Temporal Off-Hours', value: 72, benchmark: 15 },
        { dimension: 'Device Anomaly', value: 85, benchmark: 10 },
        { dimension: 'Velocity Spike', value: 60, benchmark: 22 },
        { dimension: 'Credential Novelty', value: 50, benchmark: 18 }
      ];

  return (
    <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md shadow-xl flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800/40">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">
              Multi-Dimensional Insider Threat Radar
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Live Posture vs Historical Baseline
            </p>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} outerRadius="75%">
            <PolarGrid stroke="#1e293b" />
            <PolarAngleAxis dataKey="dimension" stroke="#94a3b8" fontSize={10} fontStyle="monospace" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={8} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0b1120',
                borderColor: '#334155',
                borderRadius: '0.75rem',
                fontSize: '12px',
                fontFamily: 'monospace'
              }}
            />
            <Radar
              name="Historical Normal Baseline"
              dataKey="benchmark"
              stroke="#06b6d4"
              fill="#06b6d4"
              fillOpacity={0.2}
            />
            <Radar
              name="Active Threat Score"
              dataKey="value"
              stroke="#f43f5e"
              fill="#f43f5e"
              fillOpacity={0.4}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 pt-2 border-t border-slate-800/60 text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-cyan-400" />
          <span className="text-slate-400">Baseline (Expected)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-rose-500" />
          <span className="text-rose-400">Active Threat Observation</span>
        </div>
      </div>
    </div>
  );
};
