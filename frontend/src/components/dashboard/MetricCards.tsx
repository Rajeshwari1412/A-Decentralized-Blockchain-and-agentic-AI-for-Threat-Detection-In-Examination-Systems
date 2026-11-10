import React from 'react';
import { Users, FileSpreadsheet, Activity, AlertOctagon, Flame, Bell, Boxes, ShieldCheck } from 'lucide-react';
import { DashboardMetrics } from '../../types';

interface MetricCardsProps {
  metrics: DashboardMetrics['summary'];
}

export const MetricCards: React.FC<MetricCardsProps> = ({ metrics }) => {
  const cards = [
    {
      title: 'Monitored Users',
      value: metrics.total_users || 0,
      sub: '6 RBAC Roles Active',
      icon: Users,
      color: 'from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30'
    },
    {
      title: 'Active Examinations',
      value: metrics.active_exams || 0,
      sub: 'Scheduled & In-Progress',
      icon: FileSpreadsheet,
      color: 'from-indigo-500/20 to-purple-500/20 text-indigo-400 border-indigo-500/30'
    },
    {
      title: 'Telemetry Events',
      value: metrics.total_events || 0,
      sub: 'Processed by 7 Agents',
      icon: Activity,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30'
    },
    {
      title: 'Active Incidents',
      value: metrics.active_incidents || 0,
      sub: metrics.active_incidents > 0 ? 'Requires Analyst Review' : 'Nominal Baseline',
      icon: AlertOctagon,
      color: metrics.active_incidents > 0 
        ? 'from-rose-500/30 to-red-500/30 text-rose-400 border-rose-500/50 animate-pulse'
        : 'from-slate-800 to-slate-900 text-slate-300 border-slate-700'
    },
    {
      title: 'High-Risk Users',
      value: metrics.high_risk_users || 0,
      sub: 'Risk Score >= 65/100',
      icon: Flame,
      color: metrics.high_risk_users > 0
        ? 'from-amber-500/30 to-orange-500/30 text-amber-400 border-amber-500/50'
        : 'from-slate-800 to-slate-900 text-slate-300 border-slate-700'
    },
    {
      title: 'Active Alerts',
      value: metrics.active_alerts || 0,
      sub: 'WebSocket Dispatched',
      icon: Bell,
      color: metrics.active_alerts > 0
        ? 'from-rose-500/20 to-amber-500/20 text-rose-300 border-rose-500/40'
        : 'from-slate-800 to-slate-900 text-slate-300 border-slate-700'
    },
    {
      title: 'Blockchain Anchors',
      value: metrics.blockchain_anchors || 0,
      sub: 'SHA-256 Hashes on Ledger',
      icon: Boxes,
      color: 'from-indigo-500/20 to-cyan-500/20 text-indigo-300 border-indigo-500/30'
    },
    {
      title: 'Blockchain Ledger',
      value: 'IMMUTABLE',
      sub: 'Tamper-Evident Audit Proof',
      icon: ShieldCheck,
      color: 'from-emerald-500/20 to-cyan-500/20 text-emerald-400 border-emerald-500/30'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className={`p-4 rounded-2xl bg-gradient-to-br ${c.color} border backdrop-blur-md shadow-lg transition-all hover:scale-[1.02]`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
                {c.title}
              </span>
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-700/40">
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold font-mono tracking-tight text-white mb-1">
              {c.value}
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              {c.sub}
            </div>
          </div>
        );
      })}
    </div>
  );
};
