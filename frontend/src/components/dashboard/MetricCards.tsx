import React from 'react';
import { Users, FileSpreadsheet, Activity, AlertOctagon, Flame, Bell, Boxes, ShieldCheck, ArrowUpRight, TrendingUp } from 'lucide-react';
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
      badge: 'Live Monitored',
      badgeColor: 'text-cyan-400 bg-cyan-950/60 border-cyan-800/50',
      icon: Users,
      color: 'from-blue-500/10 via-cyan-500/10 to-transparent text-cyan-400 border-cyan-500/30 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]'
    },
    {
      title: 'Active Examinations',
      value: metrics.active_exams || 0,
      sub: 'Scheduled & In-Progress',
      badge: 'Proctored',
      badgeColor: 'text-indigo-400 bg-indigo-950/60 border-indigo-800/50',
      icon: FileSpreadsheet,
      color: 'from-indigo-500/10 via-purple-500/10 to-transparent text-indigo-400 border-indigo-500/30 hover:border-indigo-400/60 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]'
    },
    {
      title: 'Telemetry Events',
      value: metrics.total_events || 0,
      sub: 'Processed by 7 Agents',
      badge: '< 200ms Feed',
      badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/50',
      icon: Activity,
      color: 'from-emerald-500/10 via-teal-500/10 to-transparent text-emerald-400 border-emerald-500/30 hover:border-emerald-400/60 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]'
    },
    {
      title: 'Active Incidents',
      value: metrics.active_incidents || 0,
      sub: metrics.active_incidents > 0 ? 'Requires Analyst Review' : 'Nominal Baseline',
      badge: metrics.active_incidents > 0 ? 'Attention' : 'Guarded',
      badgeColor: metrics.active_incidents > 0 ? 'text-rose-400 bg-rose-950/80 border-rose-700/60 animate-pulse' : 'text-slate-400 bg-slate-800 border-slate-700',
      icon: AlertOctagon,
      color: metrics.active_incidents > 0 
        ? 'from-rose-500/25 via-red-500/15 to-transparent text-rose-400 border-rose-500/60 shadow-[0_0_25px_rgba(244,63,94,0.3)] animate-pulse'
        : 'from-slate-800/60 to-slate-900/60 text-slate-300 border-slate-700/60'
    },
    {
      title: 'High-Risk Users',
      value: metrics.high_risk_users || 0,
      sub: 'Risk Score >= 65/100',
      badge: 'Threshold: 65',
      badgeColor: 'text-amber-400 bg-amber-950/60 border-amber-800/50',
      icon: Flame,
      color: metrics.high_risk_users > 0
        ? 'from-amber-500/20 via-orange-500/15 to-transparent text-amber-400 border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
        : 'from-slate-800/60 to-slate-900/60 text-slate-300 border-slate-700/60'
    },
    {
      title: 'Active Alerts',
      value: metrics.active_alerts || 0,
      sub: 'WebSocket Dispatched',
      badge: 'Live Socket',
      badgeColor: 'text-rose-400 bg-rose-950/60 border-rose-800/50',
      icon: Bell,
      color: metrics.active_alerts > 0
        ? 'from-rose-500/20 via-amber-500/10 to-transparent text-rose-300 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.2)]'
        : 'from-slate-800/60 to-slate-900/60 text-slate-300 border-slate-700/60'
    },
    {
      title: 'Blockchain Anchors',
      value: metrics.blockchain_anchors || 0,
      sub: 'SHA-256 Hashes on Ledger',
      badge: 'EVM Validated',
      badgeColor: 'text-indigo-400 bg-indigo-950/60 border-indigo-800/50',
      icon: Boxes,
      color: 'from-indigo-500/15 via-blue-500/10 to-transparent text-indigo-300 border-indigo-500/40 hover:border-indigo-400/70 hover:shadow-[0_0_20px_rgba(99,102,241,0.25)]'
    },
    {
      title: 'Blockchain Ledger',
      value: 'IMMUTABLE',
      sub: 'Tamper-Evident Audit Proof',
      badge: 'AuditLedger.sol',
      badgeColor: 'text-emerald-400 bg-emerald-950/70 border-emerald-700/60',
      icon: ShieldCheck,
      color: 'from-emerald-500/15 via-cyan-500/10 to-transparent text-emerald-400 border-emerald-500/40 hover:border-emerald-400/70 hover:shadow-[0_0_20px_rgba(16,185,129,0.25)]'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className={`relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br ${c.color} border backdrop-blur-xl shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-default`}
          >
            {/* Ambient top light */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
                {c.title}
              </span>
              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-700/50 shadow-inner">
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <div className="flex items-baseline justify-between mb-1">
              <div className="text-2xl font-extrabold font-mono tracking-tight text-white">
                {c.value}
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${c.badgeColor} font-semibold flex items-center gap-1`}>
                {c.badge}
              </span>
            </div>

            <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>{c.sub}</span>
              <ArrowUpRight className="h-3 w-3 text-slate-500" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
