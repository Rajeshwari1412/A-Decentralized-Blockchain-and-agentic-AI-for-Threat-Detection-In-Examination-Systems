import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Boxes, CheckCircle2, XCircle, Search, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { BlockchainVerificationResult } from '../../types';

interface BlockchainVerifierProps {
  initialEventUuid?: string;
}

export const BlockchainVerifier: React.FC<BlockchainVerifierProps> = ({ initialEventUuid = '' }) => {
  const [eventUuid, setEventUuid] = useState<string>(initialEventUuid);
  const [result, setResult] = useState<BlockchainVerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventUuid.trim()) return;
    setIsVerifying(true);
    try {
      const res = await api.verifyEventHash(eventUuid.trim());
      setResult(res);
    } catch (err) {
      console.error('Verification error', err);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-2xl space-y-6">
      <div>
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm mb-1">
          <Boxes className="h-5 w-5" />
          <h3>Cryptographic Blockchain Audit Verifier</h3>
        </div>
        <p className="text-xs text-slate-400 font-mono">
          Demonstrates: PostgreSQL Event Payload → SHA-256 Hash → Smart Contract Ledger → Cryptographic Verification
        </p>
      </div>

      <form onSubmit={handleVerify} className="flex gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={eventUuid}
            onChange={(e) => setEventUuid(e.target.value)}
            placeholder="Enter Event UUID (e.g. EVT-20261002-XXXXXX)..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
          />
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
        </div>
        <button
          type="submit"
          disabled={isVerifying || !eventUuid.trim()}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs font-mono flex items-center gap-2 shadow-lg shadow-indigo-900/40"
        >
          {isVerifying ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
          <span>Verify Proof</span>
        </button>
      </form>

      {result && (
        <div
          className={`p-5 rounded-xl border font-mono text-xs space-y-4 animate-fade-in ${
            result.is_valid
              ? 'bg-emerald-950/30 border-emerald-500/50'
              : 'bg-rose-950/40 border-rose-500/60 shadow-lg shadow-rose-950/50'
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              {result.is_valid ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              ) : (
                <ShieldAlert className="h-5 w-5 text-rose-500 animate-pulse" />
              )}
              <span className={`font-bold text-sm ${result.is_valid ? 'text-emerald-300' : 'text-rose-400'}`}>
                {result.status === 'VERIFIED_AUTHENTIC'
                  ? 'CRYPTOGRAPHICALLY VERIFIED & AUTHENTIC'
                  : 'TAMPER DETECTED: CRYPTOGRAPHIC HASH MISMATCH'}
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
              Block #{result.block_number}
            </span>
          </div>

          <div className="space-y-2 text-slate-300">
            <div>
              <span className="text-slate-400">On-Chain Smart Contract Hash:</span>
              <div className="p-2 rounded bg-slate-950 border border-slate-800 text-indigo-300 break-all select-all mt-1">
                {result.ledger_hash || 'None'}
              </div>
            </div>

            <div>
              <span className="text-slate-400">Current Computed Database Payload Hash:</span>
              <div className="p-2 rounded bg-slate-950 border border-slate-800 text-cyan-300 break-all select-all mt-1">
                {result.current_computed_hash || 'None'}
              </div>
            </div>

            <div>
              <span className="text-slate-400">Blockchain Transaction:</span>
              <div className="text-[11px] text-slate-400 truncate mt-0.5">
                Tx: {result.transaction_hash}
              </div>
            </div>

            {result.discrepancy_details && (
              <div className="p-3 rounded-lg bg-rose-900/30 border border-rose-700/60 text-rose-200 mt-2">
                <span className="font-bold">FORENSIC DISCREPANCY:</span> {result.discrepancy_details}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
