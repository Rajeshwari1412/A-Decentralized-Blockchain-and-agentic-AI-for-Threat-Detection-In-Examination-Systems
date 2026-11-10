import React, { useState } from 'react';
import { AlertTriangle, Flame, ShieldAlert, CheckCircle2, RotateCcw } from 'lucide-react';
import { api } from '../../services/api';
import { BlockchainRecord } from '../../types';

interface TamperDemoCardProps {
  records: BlockchainRecord[];
  onTampered: (eventUuid: string) => void;
}

export const TamperDemoCard: React.FC<TamperDemoCardProps> = ({ records, onTampered }) => {
  const [selectedUuid, setSelectedUuid] = useState<string>('');
  const [tamperResponse, setTamperResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSimulateTamper = async () => {
    const uuidToTamper = selectedUuid || records[0]?.event_uuid;
    if (!uuidToTamper) return;
    setIsLoading(true);
    try {
      const res = await api.simulateDatabaseTamper(uuidToTamper);
      setTamperResponse(res);
      onTampered(uuidToTamper);
    } catch (err) {
      console.error('Failed to simulate tamper', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-950/40 via-slate-900 to-amber-950/30 border border-rose-800/40 backdrop-blur-md shadow-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
          <AlertTriangle className="h-5 w-5" />
          <h3>Insider Threat Database Tamper Testbench</h3>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono text-[10px] border border-rose-500/40">
          VULNERABILITY LAB
        </span>
      </div>

      <p className="text-xs text-slate-300">
        Simulate an insider (e.g. a rogue database admin) maliciously altering an audit log entry directly in the PostgreSQL database.
        The smart contract audit ledger will mathematically detect the discrepancy and flag it immediately.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={selectedUuid}
          onChange={(e) => setSelectedUuid(e.target.value)}
          className="flex-1 p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 font-mono text-xs focus:outline-none focus:border-rose-500"
        >
          <option value="">-- Select Anchored Event UUID to Tamper --</option>
          {records.map((r) => (
            <option key={r.id} value={r.event_uuid}>
              {r.event_uuid} ({r.event_type}) - Block #{r.block_number}
            </option>
          ))}
        </select>

        <button
          onClick={handleSimulateTamper}
          disabled={isLoading || records.length === 0}
          className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-mono flex items-center justify-center gap-2 shadow-lg shadow-rose-950"
        >
          <Flame className="h-4 w-4" />
          <span>{isLoading ? 'Injecting Tamper...' : 'Simulate Database Tamper'}</span>
        </button>
      </div>

      {tamperResponse && (
        <div className="p-4 rounded-xl bg-slate-950/90 border border-rose-600/70 font-mono text-xs space-y-2">
          <div className="flex items-center gap-2 text-rose-400 font-bold">
            <ShieldAlert className="h-4 w-4" />
            <span>Tamper Injected & Proven by Smart Contract</span>
          </div>
          <p className="text-slate-300 text-[11px]">
            The row payload in database was altered to rogue admin values. Blockchain verification immediately caught:
          </p>
          <div className="p-2.5 rounded bg-rose-950/40 border border-rose-800 text-rose-200 text-[11px] break-all">
            {tamperResponse.verification_result?.discrepancy_details}
          </div>
        </div>
      )}
    </div>
  );
};
