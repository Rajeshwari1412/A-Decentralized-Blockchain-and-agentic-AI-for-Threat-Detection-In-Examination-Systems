import React from 'react';
import { ActivityEvent } from '../../types';
import { ShieldAlert, Boxes, CheckCircle, Clock, ExternalLink } from 'lucide-react';

interface RecentEventsTableProps {
  events: ActivityEvent[];
  onVerifyBlockchain: (eventUuid: string) => void;
}

export const RecentEventsTable: React.FC<RecentEventsTableProps> = ({ events, onVerifyBlockchain }) => {
  const getSeverityBadge = (sev: string) => {
    switch (sev?.toUpperCase()) {
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
    <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100">
            Real-Time Activity Telemetry Stream
          </h3>
          <p className="text-[11px] text-slate-400 font-mono">
            Continuous Exam Operation Ingestion & Anomaly Scoring
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
            <tr>
              <th className="pb-3 font-semibold">Timestamp</th>
              <th className="pb-3 font-semibold">User / Role</th>
              <th className="pb-3 font-semibold">Event Type</th>
              <th className="pb-3 font-semibold">Origin IP</th>
              <th className="pb-3 font-semibold">Severity</th>
              <th className="pb-3 font-semibold text-right">Blockchain Audit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {events.slice(0, 8).map((evt) => (
              <tr key={evt.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 text-slate-400">
                  {new Date(evt.timestamp).toLocaleTimeString()}
                </td>
                <td className="py-3 font-sans font-medium text-slate-200">
                  <div>{evt.user_name || evt.user_id}</div>
                  <div className="text-[10px] text-cyan-400 font-mono">{evt.user_role || 'Staff'}</div>
                </td>
                <td className="py-3">
                  <span className="font-semibold text-slate-200">{evt.event_type}</span>
                  {evt.is_after_hours && (
                    <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                      OFF-HOURS
                    </span>
                  )}
                </td>
                <td className="py-3 text-slate-400">{evt.ip_address}</td>
                <td className="py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] border ${getSeverityBadge(evt.severity)}`}>
                    {evt.severity}
                  </span>
                </td>
                <td className="py-3 text-right">
                  {evt.is_blockchain_anchored ? (
                    <button
                      onClick={() => onVerifyBlockchain(evt.event_uuid)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-700/50 text-[11px] transition-all hover:scale-105"
                    >
                      <Boxes className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Verify Proof</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  ) : (
                    <span className="text-slate-400 text-[11px]">Audit Log</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
