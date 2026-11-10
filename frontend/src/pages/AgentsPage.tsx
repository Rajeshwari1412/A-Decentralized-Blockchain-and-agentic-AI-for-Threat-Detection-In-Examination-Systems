import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { AgentMetadata, AgentRun } from '../types';
import { Bot, CheckCircle2, Clock, Cpu, RefreshCw, Activity } from 'lucide-react';

export const AgentsPage: React.FC = () => {
  const [agents, setAgents] = useState<AgentMetadata[]>([]);
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadAgentData = async () => {
    setIsLoading(true);
    try {
      const [ag, r] = await Promise.all([
        api.getAgentsStatus(),
        api.getAgentRuns()
      ]);
      setAgents(ag);
      setRuns(r);
    } catch (err) {
      console.error('Failed to load agent matrix', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAgentData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <Bot className="h-5 w-5 text-cyan-400" />
            <span>Agentic AI Ensemble Matrix & Operational Health</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            7 Cooperative Multi-Agent Framework Orchestrating Real-Time Behavioral Threat Defense
          </p>
        </div>

        <button
          onClick={loadAgentData}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh Agents</span>
        </button>
      </div>

      {/* Agents Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((ag) => (
          <div
            key={ag.id}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4 hover:border-cyan-500/40 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-cyan-400">{ag.role}</span>
                <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>{ag.status}</span>
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-100">{ag.name}</h3>
              <p className="text-xs text-slate-400 font-sans mt-2 leading-relaxed">{ag.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-500">
              <span>Engine:</span>
              <span className="text-slate-300 font-bold">{ag.model}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Agent Execution Run Log */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-2xl space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Activity className="h-4 w-4 text-cyan-400" />
          <span>Recent Multi-Agent Inference Execution Runs</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-slate-800 text-slate-400 text-[11px] uppercase">
              <tr>
                <th className="pb-3 font-semibold">Agent Name</th>
                <th className="pb-3 font-semibold">Trigger Event</th>
                <th className="pb-3 font-semibold">Output Synthesis Summary</th>
                <th className="pb-3 font-semibold">Latency</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {runs.slice(0, 15).map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 text-cyan-300 font-bold">{r.agent_name}</td>
                  <td className="py-3 text-slate-400">{r.trigger_event}</td>
                  <td className="py-3 text-slate-300 max-w-md truncate" title={r.output_summary}>
                    {r.output_summary}
                  </td>
                  <td className="py-3 text-slate-400">{r.execution_time_ms} ms</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] ${
                        r.status === 'ALERT'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
