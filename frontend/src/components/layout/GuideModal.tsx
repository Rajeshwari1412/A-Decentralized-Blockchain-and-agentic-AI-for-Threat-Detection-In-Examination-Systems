import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Zap, 
  Boxes, 
  Bot, 
  AlertTriangle, 
  Lock, 
  FileSpreadsheet, 
  Eye, 
  CheckCircle2, 
  X, 
  ArrowRight,
  Sparkles,
  HelpCircle,
  Database
} from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'steps' | 'agents' | 'quickstart'>('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl shadow-cyan-950/80 text-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-cyan-950/50 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                ExamSentinel AI Guide
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/50">
                  Easy Explainer
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Understand how Blockchain & 7 AI Agents protect exam question papers from leaks and insider fraud
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 text-xs font-mono font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="h-4 w-4" />
            <span>1. What is ExamSentinel?</span>
          </button>
          <button
            onClick={() => setActiveTab('steps')}
            className={`px-4 py-3 text-xs font-mono font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'steps'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="h-4 w-4" />
            <span>2. The 4-Step Protection</span>
          </button>
          <button
            onClick={() => setActiveTab('agents')}
            className={`px-4 py-3 text-xs font-mono font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'agents'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="h-4 w-4" />
            <span>3. The 7 AI Agents</span>
          </button>
          <button
            onClick={() => setActiveTab('quickstart')}
            className={`px-4 py-3 text-xs font-mono font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'quickstart'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="h-4 w-4 text-amber-400" />
            <span>4. Quick 1-Minute Demo</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-300">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-700/40">
                <h3 className="font-bold text-white text-base mb-1">🎯 The Problem & Why This Exists</h3>
                <p className="text-slate-300 text-xs leading-relaxed">
                  In university and competitive examinations, question papers are vulnerable to <strong>insider leaks</strong> (corrupt administrators, coordinators, or staff copying papers onto USB drives, printing unauthorized copies, or downloading them at 2 AM before exams).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Traditional Exam Vulnerabilities</span>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                    <li>Logs can be deleted or altered by root administrators.</li>
                    <li>No real-time behavioral anomaly detection for staff.</li>
                    <li>Paper leaks are only discovered AFTER the exam is spoiled.</li>
                    <li>Lack of cryptographic proof for forensic auditing.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                    <ShieldCheck className="h-4 w-4" />
                    <span>The ExamSentinel Solution</span>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                    <li><strong>7 AI Multi-Agents</strong> monitor downloads, device usage, and work hours.</li>
                    <li><strong>Isolation Forest Machine Learning</strong> spots unusual user anomalies.</li>
                    <li><strong>Blockchain Ledger</strong> permanently locks all access logs so no one can erase proof.</li>
                    <li><strong>Proactive Triage Queue</strong> alerts security before leaks reach the public.</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-700/40 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-xs">Ready to see it in action?</h4>
                  <p className="text-[11px] text-indigo-200">You can simulate an insider trying to leak a paper with 1 click.</p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onNavigate('simulator');
                  }}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg transition-all"
                >
                  <span>Open Threat Simulator</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'steps' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Here is the complete lifecycle of how an exam paper is protected from creation to exam day:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-800/70 border border-cyan-500/30 space-y-2 relative">
                  <div className="absolute top-3 right-3 text-xs font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-700">
                    Step 1
                  </div>
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                    <FileSpreadsheet className="h-5 w-5" />
                    <span>Question Paper Vault</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    The paper is encrypted with AES-256 and stored in a secure digital vault. A cryptographic SHA-256 checksum is computed and anchored on the blockchain.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/70 border border-amber-500/30 space-y-2 relative">
                  <div className="absolute top-3 right-3 text-xs font-mono font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded-full border border-amber-700">
                    Step 2
                  </div>
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <Eye className="h-5 w-5" />
                    <span>Continuous User Monitoring</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Every action (login, paper preview, print command, USB insertion, download) generates telemetry events sent to our backend via real-time WebSockets.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/70 border border-rose-500/30 space-y-2 relative">
                  <div className="absolute top-3 right-3 text-xs font-mono font-bold text-rose-400 bg-rose-950 px-2 py-0.5 rounded-full border border-rose-700">
                    Step 3
                  </div>
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                    <Bot className="h-5 w-5" />
                    <span>Multi-Agent Threat Scoring</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    7 AI agents compute a dynamic <strong>Risk Score (0-100)</strong>. If a user downloads an exam at 2:30 AM or onto an unapproved device, an urgent security incident is automatically created.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/70 border border-indigo-500/30 space-y-2 relative">
                  <div className="absolute top-3 right-3 text-xs font-mono font-bold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded-full border border-indigo-700">
                    Step 4
                  </div>
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                    <Boxes className="h-5 w-5" />
                    <span>Immutable Blockchain Proof</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    The evidence, timestamp, and incident hashes are etched onto an Ethereum/EVM smart contract. Even a rogue super-admin cannot wipe the audit record.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'agents' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                ExamSentinel uses a specialized multi-agent AI architecture where each agent monitors a specific security domain:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { name: '1. Access Controller Agent', role: 'Role & Permission Verification', desc: 'Checks if the user has legitimate clearance to view this specific exam.' },
                  { name: '2. Behavioral Analysis Agent', role: 'Time & Habit Baseline', desc: 'Detects access outside normal office hours (e.g. 2:00 AM) or from unusual locations.' },
                  { name: '3. Data Integrity & Vault Agent', role: 'Cryptographic Hash Check', desc: 'Ensures the question paper file has not been modified or tampered with.' },
                  { name: '4. Anomaly Detection Agent', role: 'Isolation Forest ML', desc: 'Uses unsupervised machine learning to detect statistical outliers in user behavior.' },
                  { name: '5. Risk Scoring & Correlation Agent', role: 'Risk Aggregator (0-100)', desc: 'Combines findings from all agents into an actionable threat score.' },
                  { name: '6. Incident & Notification Agent', role: 'Automated SOC Alerts', desc: 'Dispatches instant WebSocket alert banners and opens forensic case files.' },
                  { name: '7. Blockchain Audit Agent', role: 'Smart Contract Ledger', desc: 'Anchors audit hashes to the immutable blockchain ledger for tamper proofing.' }
                ].map((agent, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-cyan-300">{agent.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-700">
                        Active
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-indigo-300">{agent.role}</p>
                    <p className="text-xs text-slate-300">{agent.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'quickstart' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Zap className="h-5 w-5" />
                  <span>How to test this system in 3 simple clicks:</span>
                </div>
                <p className="text-xs text-slate-300">
                  Follow this quick walkthrough to experience the end-to-end insider threat defense pipeline:
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700">
                  <span className="h-6 w-6 rounded-full bg-cyan-500/20 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">1</span>
                  <div className="text-xs">
                    <p className="font-bold text-white">Go to the "Threat Simulator" page</p>
                    <p className="text-slate-400">Click the <strong>Threat Simulator</strong> tab in the sidebar (or button below).</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700">
                  <span className="h-6 w-6 rounded-full bg-cyan-500/20 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">2</span>
                  <div className="text-xs">
                    <p className="font-bold text-white">Click "Run Full Attack Scenario" (or Step-by-Step)</p>
                    <p className="text-slate-400">Watch an insider attempt abnormal downloads, off-hours access, and USB copy. The AI flags each step in real time.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700">
                  <span className="h-6 w-6 rounded-full bg-cyan-500/20 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">3</span>
                  <div className="text-xs">
                    <p className="font-bold text-white">Inspect "Incidents & Triage" and "Blockchain Audit"</p>
                    <p className="text-slate-400">See the generated incident report with AI root-cause hypothesis, risk score (96/100), and verify the immutable blockchain cryptographic hash.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    onClose();
                    onNavigate('simulator');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-950 transition-all"
                >
                  <Zap className="h-4 w-4" />
                  <span>Launch Threat Simulator Now</span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onNavigate('dashboard');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Decentralized Blockchain & Agentic AI SOC</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
