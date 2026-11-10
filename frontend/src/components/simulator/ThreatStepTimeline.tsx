import React from 'react';
import { CheckCircle2, Flame, ShieldAlert, Boxes, Bot, ArrowRight, UserCheck } from 'lucide-react';

interface ThreatStepTimelineProps {
  scenarioResults: any[];
}

export const ThreatStepTimeline: React.FC<ThreatStepTimelineProps> = ({ scenarioResults }) => {
  if (!scenarioResults || scenarioResults.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center font-mono text-xs text-slate-400">
        Click "Run Complete 7-Step Attack Scenario" or trigger individual steps above to watch real-time multi-agent threat correlation.
      </div>
    );
  }

  const getTierBadge = (tier: string) => {
    switch (tier?.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'MEDIUM':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
        Active Simulation Forensic Trajectory ({scenarioResults.length} Steps Processed)
      </h3>

      <div className="space-y-4">
        {scenarioResults.map((res, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3 transition-all hover:border-slate-700"
          >
            {/* Step Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-950 border border-cyan-700 text-cyan-400 font-bold font-mono text-xs">
                  {res.step_number}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-100">{res.step_info?.title}</h4>
                  <p className="text-[11px] text-slate-400 font-mono">{res.step_info?.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${getTierBadge(res.risk_tier)}`}>
                  Risk: {res.risk_score}/100 [{res.risk_tier}]
                </span>
                {res.is_blockchain_anchored && (
                  <span className="px-2 py-1 rounded-lg bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 text-[10px] font-mono flex items-center gap-1">
                    <Boxes className="h-3 w-3 text-indigo-400" />
                    <span>Blockchain Anchored</span>
                  </span>
                )}
              </div>
            </div>

            {/* Agent Synthesis Findings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                <div className="text-cyan-400 font-semibold flex items-center gap-1.5 text-[11px]">
                  <Bot className="h-3.5 w-3.5" />
                  <span>Isolation Forest ML & Behavioral Attribution:</span>
                </div>
                <div className="text-slate-300 text-[11px] leading-relaxed">
                  {res.agent_summaries?.AnomalyDetectionAgent}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                <div className="text-amber-400 font-semibold flex items-center gap-1.5 text-[11px]">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span>Investigation Root Cause Hypothesis:</span>
                </div>
                <div className="text-slate-300 text-[11px] leading-relaxed">
                  {res.agent_summaries?.InvestigationAgent}
                </div>
              </div>
            </div>

            {/* Suggested Action */}
            {res.suggested_action && (
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-xs font-mono text-emerald-200">
                <span className="font-bold">Analyst Suggested Action:</span> {res.suggested_action.split('\n')[0]}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
