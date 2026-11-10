import React from 'react';
import { Bot, CheckCircle2, ArrowRight, ShieldAlert, Cpu, Sparkles } from 'lucide-react';
import { useWebSocket } from '../../context/WebSocketContext';

export const AgentNetworkGraph: React.FC = () => {
  const { agentOrchestrations } = useWebSocket();
  const latestTrace = agentOrchestrations[0];

  const agents = [
    { id: 'ActivityMonitoringAgent', name: 'Monitoring Agent', num: '01', role: 'Telemetry Stream Ingestion' },
    { id: 'BehavioralAnalysisAgent', name: 'Behavioral Agent', num: '02', role: 'Historical Baseline Variance' },
    { id: 'AnomalyDetectionAgent', name: 'Anomaly Agent', num: '03', role: 'Isolation Forest (150 Trees)' },
    { id: 'ThreatAssessmentAgent', name: 'Threat Agent', num: '04', role: '0-100 Risk & MITRE Tactics' },
    { id: 'InvestigationAgent', name: 'Investigation Agent', num: '05', role: 'Evidence Narrative Synthesis' },
    { id: 'AlertResponseAgent', name: 'Alert Agent', num: '06', role: 'WebSocket & Incident Dispatch' },
    { id: 'BlockchainAuditAgent', name: 'Blockchain Agent', num: '07', role: 'SHA-256 Smart Contract Anchor' },
  ];

  return (
    <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/40">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>Agentic AI Ensemble Coordination Pipeline</span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-500/30">
                7 Cooperative Agents
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Live Event Correlation & Multi-Agent Reasoning Trace
            </p>
          </div>
        </div>
        {latestTrace && (
          <div className="flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
            <Cpu className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            <span>Last Processed: <span className="text-cyan-300 font-bold">{latestTrace.event_type}</span> ({latestTrace.risk_score}/100 Risk)</span>
          </div>
        )}
      </div>

      {/* Agents Flow Row */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        {agents.map((ag, i) => {
          const summary = latestTrace?.agent_summaries?.[ag.id];
          return (
            <div
              key={ag.id}
              className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between hover:border-cyan-500/40 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                  <span>AGENT {ag.num}</span>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <h4 className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                  {ag.name}
                </h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {ag.role}
                </p>
              </div>

              {summary && (
                <div className="mt-2 pt-2 border-t border-slate-800/60 text-[10px] text-slate-300 font-mono line-clamp-3 bg-slate-900/50 p-1.5 rounded">
                  {typeof summary === 'string' ? summary : JSON.stringify(summary)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
