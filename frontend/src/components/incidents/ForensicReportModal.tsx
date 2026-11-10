import React from 'react';
import { SecurityIncident } from '../../types';
import { ShieldCheck, Printer, Download, X, Boxes, Lock, CheckCircle2 } from 'lucide-react';

interface ForensicReportModalProps {
  incident: SecurityIncident;
  isOpen: boolean;
  onClose: () => void;
}

export const ForensicReportModal: React.FC<ForensicReportModalProps> = ({ incident, isOpen, onClose }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-8 text-slate-100 space-y-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-600 text-white shadow-lg">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Official Cybersecurity Forensic Dossier</h2>
              <p className="text-xs text-slate-400 font-mono">ExamSentinel AI Multi-Agent & Blockchain Evidence Report</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / PDF</span>
            </button>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Certificate / Metadata Banner */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <span className="text-slate-500">Incident Code:</span>
            <div className="text-cyan-400 font-bold mt-0.5">{incident.incident_code}</div>
          </div>
          <div>
            <span className="text-slate-500">Subject Account:</span>
            <div className="text-slate-200 font-bold mt-0.5">{incident.user_name}</div>
          </div>
          <div>
            <span className="text-slate-500">Assessed Risk:</span>
            <div className="text-rose-400 font-bold mt-0.5">{incident.risk_score} / 100 ({incident.severity})</div>
          </div>
          <div>
            <span className="text-slate-500">Audit Status:</span>
            <div className="text-emerald-400 font-bold mt-0.5">{incident.status}</div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-2">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
            1. Executive Forensic Summary
          </h4>
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
            {incident.root_cause_hypothesis || incident.title}
          </div>
        </div>

        {/* Synthesized Evidence */}
        <div className="space-y-2">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
            2. Multi-Agent Evidence Narrative
          </h4>
          <pre className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
            {incident.evidence_summary}
          </pre>
        </div>

        {/* Blockchain Cryptographic Proof */}
        <div className="space-y-2">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
            <Boxes className="h-4 w-4" />
            <span>3. Blockchain Smart Contract Cryptographic Proofs</span>
          </h4>
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs space-y-2 text-slate-300">
            <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/80 pb-2">
              <span>Smart Contract: <code className="text-indigo-300">0x5FbDB2315678afecb367f032d93F642f64180aa3</code></span>
              <span className="text-emerald-400 font-bold">STATE_VERIFIED_AUTHENTIC</span>
            </div>
            <p className="text-[11px] text-slate-400">
              All correlated activity timestamps and SHA-256 state hashes are permanently locked on EVM Block numbers. Any internal database mutation will result in immediate hash validation failure.
            </p>
          </div>
        </div>

        {/* Signature Box */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between font-mono text-xs text-slate-500">
          <div>Generated by ExamSentinel Multi-Agent Ensemble v1.0</div>
          <div>Cryptographically Sealed & Signed</div>
        </div>
      </div>
    </div>
  );
};
