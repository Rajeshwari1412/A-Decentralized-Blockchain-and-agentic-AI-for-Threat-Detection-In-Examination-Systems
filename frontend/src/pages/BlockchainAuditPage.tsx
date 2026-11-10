import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { BlockchainRecord } from '../types';
import { BlockchainVerifier } from '../components/blockchain/BlockchainVerifier';
import { BlockExplorerTable } from '../components/blockchain/BlockExplorerTable';
import { TamperDemoCard } from '../components/blockchain/TamperDemoCard';
import { CandidateCredentialsTable } from '../components/exams/CandidateCredentialsTable';
import { Boxes, ShieldCheck, RefreshCw, Award, Activity } from 'lucide-react';

interface BlockchainAuditPageProps {
  initialEventUuid?: string;
}

export const BlockchainAuditPage: React.FC<BlockchainAuditPageProps> = ({ initialEventUuid = '' }) => {
  const [activeLedgerView, setActiveLedgerView] = useState<'security' | 'credentials'>('security');
  const [records, setRecords] = useState<BlockchainRecord[]>([]);
  const [selectedUuid, setSelectedUuid] = useState<string>(initialEventUuid);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadRecords = async () => {
    setIsLoading(true);
    try {
      const data = await api.getBlockchainRecords();
      setRecords(data);
    } catch (err) {
      console.error('Error fetching blockchain records', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <Boxes className="h-5 w-5 text-indigo-400" />
            <span>Decentralized Blockchain Audit Ledger & Tamper Proofs</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Cryptographic SHA-256 Event Anchoring on EVM Smart Contract (AuditLedger.sol)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setActiveLedgerView('security')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeLedgerView === 'security'
                  ? 'bg-indigo-600 text-white font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              <span>Security Events</span>
            </button>
            <button
              onClick={() => setActiveLedgerView('credentials')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeLedgerView === 'credentials'
                  ? 'bg-emerald-600 text-white font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Award className="h-3.5 w-3.5" />
              <span>Exam Credentials</span>
            </button>
          </div>

          <button
            onClick={loadRecords}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <p className="font-bold text-white">Why is Blockchain used here?</p>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Standard server logs and exam grades can be altered by rogue administrators to hide leaked papers or inflate marks. In ExamSentinel, every critical access, question paper seal, and candidate submission is cryptographically hashed with <strong>SHA-256</strong> and stored on an <strong>immutable blockchain ledger</strong>. Try the <em>Tampering Simulation Sandbox</em> below to see how any database alteration is immediately exposed!
            </p>
          </div>
        </div>
      </div>

      {activeLedgerView === 'security' ? (
        <>
          {/* Verification Tool */}
          <BlockchainVerifier initialEventUuid={selectedUuid} />

          {/* Database Tampering Simulation Sandbox */}
          <TamperDemoCard records={records} onTampered={(uuid) => setSelectedUuid(uuid)} />

          {/* On-Chain Explorer Table */}
          <BlockExplorerTable records={records} onSelectEvent={(uuid) => setSelectedUuid(uuid)} />
        </>
      ) : (
        <CandidateCredentialsTable onVerifyOnChain={(uuid) => setSelectedUuid(uuid)} />
      )}
    </div>
  );
};
