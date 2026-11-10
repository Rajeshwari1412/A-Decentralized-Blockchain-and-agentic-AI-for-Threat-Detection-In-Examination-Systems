import React from 'react';
import { BlockchainRecord } from '../../types';
import { Boxes, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface BlockExplorerTableProps {
  records: BlockchainRecord[];
  onSelectEvent: (eventUuid: string) => void;
}

export const BlockExplorerTable: React.FC<BlockExplorerTableProps> = ({ records, onSelectEvent }) => {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Boxes className="h-4 w-4 text-indigo-400" />
            <span>AuditLedger Smart Contract Explorer</span>
          </h3>
          <p className="text-[11px] text-slate-400 font-mono">
            Cryptographic SHA-256 Event Anchors on Blockchain (Total: {records.length})
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
            <tr>
              <th className="pb-3 font-semibold">Block #</th>
              <th className="pb-3 font-semibold">Event UUID</th>
              <th className="pb-3 font-semibold">Event Type</th>
              <th className="pb-3 font-semibold">SHA-256 Hash</th>
              <th className="pb-3 font-semibold">Tx Hash</th>
              <th className="pb-3 font-semibold text-right">Verification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {records.map((r) => (
              <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 text-cyan-400 font-bold">
                  #{r.block_number}
                </td>
                <td className="py-3 text-slate-200 font-semibold">
                  {r.event_uuid}
                </td>
                <td className="py-3">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                    {r.event_type}
                  </span>
                </td>
                <td className="py-3 text-indigo-300 max-w-[150px] truncate" title={r.payload_hash}>
                  {r.payload_hash.slice(0, 16)}...
                </td>
                <td className="py-3 text-slate-400 max-w-[120px] truncate" title={r.transaction_hash}>
                  {r.transaction_hash.slice(0, 14)}...
                </td>
                <td className="py-3 text-right">
                  <button
                    onClick={() => onSelectEvent(r.event_uuid)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/50 text-indigo-300 text-[11px] transition-all hover:scale-105"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Check Integrity</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
