import React from 'react';
import {
  LayoutDashboard,
  Zap,
  AlertTriangle,
  Activity,
  Boxes,
  Bot,
  FileSpreadsheet,
  Terminal,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  activeAlertsCount?: number;
  openIncidentsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  activeAlertsCount = 0,
  openIncidentsCount = 0
}) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'SOC Dashboard',
      desc: 'System health & live metrics',
      icon: LayoutDashboard,
      badge: null,
      color: 'text-cyan-400'
    },
    {
      id: 'simulator',
      label: 'Threat Simulator',
      desc: '1-click leak test & AI demo',
      icon: Zap,
      badge: 'DEMO',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      color: 'text-amber-400'
    },
    {
      id: 'incidents',
      label: 'Incidents & Triage',
      desc: 'AI threat cases & alerts',
      icon: AlertTriangle,
      badge: openIncidentsCount > 0 ? `${openIncidentsCount}` : null,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      color: 'text-rose-400'
    },
    {
      id: 'activities',
      label: 'Activity Stream',
      desc: 'Real-time telemetry logs',
      icon: Activity,
      badge: null,
      color: 'text-emerald-400'
    },
    {
      id: 'blockchain',
      label: 'Blockchain Audit',
      desc: 'Tamper-proof ledger proofs',
      icon: Boxes,
      badge: 'EVM',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      color: 'text-indigo-400'
    },
    {
      id: 'agents',
      label: 'Agentic AI Matrix',
      desc: '7 autonomous defense bots',
      icon: Bot,
      badge: '7 Active',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      color: 'text-cyan-400'
    },
    {
      id: 'exams',
      label: 'Exam & Vault Cell',
      desc: 'Question papers & integrity',
      icon: FileSpreadsheet,
      badge: null,
      color: 'text-blue-400'
    }
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-[#070b14]/95 flex flex-col justify-between p-4 shrink-0">
      <div className="space-y-4">
        <div>
          <p className="px-3 text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 font-semibold flex items-center justify-between">
            <span>Navigation</span>
            <span className="text-[10px] text-cyan-400 font-normal">7 Modules</span>
          </p>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/40 text-cyan-300 border border-cyan-700/50 shadow-lg shadow-cyan-950/50'
                      : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-cyan-400' : item.color} transition-colors`} />
                    <div className="truncate">
                      <div className="text-xs font-semibold leading-snug">{item.label}</div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">{item.desc}</div>
                    </div>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full border shrink-0 ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Security Framework Specs */}
        <div className="rounded-xl p-3 bg-slate-900/60 border border-slate-800/80 font-mono text-[11px] space-y-1.5">
          <div className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800 pb-1 flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-cyan-400" />
            <span>AI & Security Core</span>
          </div>
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span>Anomaly ML:</span>
            <span className="text-emerald-400 font-bold">ONLINE (0.08 Contam)</span>
          </div>
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span>Threat Threshold:</span>
            <span className="text-cyan-400 font-bold">&gt;65 Trigger</span>
          </div>
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span>Ledger Proof:</span>
            <span className="text-indigo-400 font-bold">SHA-256 / EVM</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-slate-400 text-[11px] font-mono">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
          <span>ExamSentinel AI</span>
        </div>
        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-cyan-400">v1.0</span>
      </div>
    </aside>
  );
};

