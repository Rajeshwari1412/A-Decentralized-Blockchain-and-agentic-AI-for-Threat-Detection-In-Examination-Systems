import React from 'react';
import { ActivityEvent } from '../../types';
import { Clock, ShieldAlert, CheckCircle, Boxes, AlertTriangle, ArrowDown } from 'lucide-react';

interface IncidentTimelineProps {
  timeline: ActivityEvent[];
  onVerifyBlockchain: (eventUuid: string) => void;
}

export const IncidentTimeline: React.FC<IncidentTimelineProps> = ({ timeline, onVerifyBlockchain }) => {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 font-mono text-xs">
        No correlated timeline events available for this incident.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
        Correlated Event Progression (Chronological)
      </h4>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        {timeline.map((item, idx) => (
          <div key={item.id || idx} className="relative group">
            {/* Timeline Dot */}
            <div className="absolute -left-6 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 border border-cyan-500 text-cyan-400 shadow-md shadow-cyan-950">
              <span className="text-[10px] font-bold font-mono">{idx + 1}</span>
            </div>

            {/* Event Box */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-md">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-100">{item.event_type}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {item.resource_type}: {item.resource_id || 'GENERAL'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>{new Date(item.timestamp).toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono py-2 text-slate-400 border-y border-slate-800/60 my-2">
                <div>IP: <span className="text-slate-200">{item.ip_address}</span></div>
                <div>Device: <span className="text-slate-200 truncate">{item.device_fingerprint || 'Standard'}</span></div>
                <div>Location: <span className="text-slate-200">{item.location}</span></div>
                <div>Off-Hours: <span className={item.is_after_hours ? 'text-rose-400 font-bold' : 'text-emerald-400'}>{item.is_after_hours ? 'YES' : 'NO'}</span></div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="text-[11px] font-mono text-slate-400 truncate max-w-md">
                  SHA-256: <span className="text-indigo-400">{item.sha256_hash?.slice(0, 24)}...</span>
                </div>
                {item.is_blockchain_anchored && (
                  <button
                    onClick={() => onVerifyBlockchain(item.event_uuid)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-[11px] font-mono text-indigo-300 transition-all"
                  >
                    <Boxes className="h-3 w-3 text-indigo-400" />
                    <span>Verify Ledger Proof</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
