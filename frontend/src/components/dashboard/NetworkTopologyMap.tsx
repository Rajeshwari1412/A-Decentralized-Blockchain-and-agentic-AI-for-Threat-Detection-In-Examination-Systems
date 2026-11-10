import React, { useState } from 'react';
import { Network, Server, Shield, Laptop, Lock, Boxes, Bot, Radio, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useWebSocket } from '../../context/WebSocketContext';

export const NetworkTopologyMap: React.FC = () => {
  const { isConnected, latestAlert } = useWebSocket();
  const [selectedNode, setSelectedNode] = useState<string | null>('agent-matrix');

  const nodes = [
    {
      id: 'terminals',
      name: 'Candidate Terminals',
      sub: 'Lab 4 (192.168.1.100/24)',
      icon: Laptop,
      status: 'MONITORED',
      color: 'border-cyan-500/50 bg-cyan-950/40 text-cyan-300',
      activeCount: '48 Active Sessions',
      details: 'Strict client telemetry reporting active. Keypress dynamics, tab focus loss, and hardware signatures continuously streamed to Agent 01.'
    },
    {
      id: 'vault',
      name: 'Question Paper Vault',
      sub: 'Confidential Cell (AES-256-GCM)',
      icon: Lock,
      status: 'ENCRYPTED',
      color: 'border-indigo-500/50 bg-indigo-950/40 text-indigo-300',
      activeCount: '3 Master Packages',
      details: 'Dynamic forensic watermarking applied on every view. Max download threshold enforced. Access triggers automatic blockchain hash anchor.'
    },
    {
      id: 'agent-matrix',
      name: 'Agentic AI Ensemble Core',
      sub: '7 Cooperative Agents',
      icon: Bot,
      status: 'PROCESSING',
      color: 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300',
      activeCount: 'Isolation Forest (150 Trees)',
      details: 'Multi-agent cooperative inference pipeline. Synthesizes behavioral variance, statistical novelty, and multi-factor threat scores (0-100).'
    },
    {
      id: 'blockchain-ledger',
      name: 'EVM AuditLedger Contract',
      sub: 'Block #7548 (AuditLedger.sol)',
      icon: Boxes,
      status: 'IMMUTABLE',
      color: 'border-purple-500/50 bg-purple-950/40 text-purple-300',
      activeCount: 'SHA-256 Ledger',
      details: 'Cryptographic immutable proof storage. Publicly verifiable smart contract ensuring internal database logs cannot be altered or forged.'
    },
    {
      id: 'soc-console',
      name: 'SOC Analyst Console',
      sub: 'Tier-1/Tier-2 Cyber Defense',
      icon: Shield,
      status: 'ACTIVE_TRIAGE',
      color: 'border-amber-500/50 bg-amber-950/40 text-amber-300',
      activeCount: 'Human-in-the-Loop',
      details: 'Real-time WebSocket incident dispatch center. Allows instant quarantine, question paper vault freeze, and forensic report export.'
    }
  ];

  const activeNodeInfo = nodes.find((n) => n.id === selectedNode) || nodes[2];

  return (
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-2xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
          <Network className="h-5 w-5" />
          <h3>Interactive Examination Cyber Defense Topology</h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Real-Time Packet Correlation Active</span>
        </div>
      </div>

      {/* Nodes Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {nodes.map((node) => {
          const Icon = node.icon;
          const isSelected = selectedNode === node.id;
          return (
            <div
              key={node.id}
              onClick={() => setSelectedNode(node.id)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                isSelected
                  ? `${node.color} ring-2 ring-cyan-400/50 shadow-lg shadow-cyan-950 scale-[1.03]`
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                    {node.status}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-100">{node.name}</h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{node.sub}</p>
              </div>

              <div className="text-[10px] font-mono font-semibold text-cyan-400 pt-1 border-t border-slate-800/60">
                {node.activeCount}
              </div>
            </div>
          );
        })}
      </div>

      {/* Node Inspector Drawer */}
      <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800/90 font-mono text-xs space-y-2">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-cyan-300 font-bold uppercase">Node Telemetry Inspector: {activeNodeInfo.name}</span>
          <span className="text-[11px] text-slate-500">{activeNodeInfo.sub}</span>
        </div>
        <p className="text-slate-300 text-xs leading-relaxed font-sans">
          {activeNodeInfo.details}
        </p>
      </div>
    </div>
  );
};
