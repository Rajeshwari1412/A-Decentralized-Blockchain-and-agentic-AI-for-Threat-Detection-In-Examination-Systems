import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ActivityEvent } from '../types';
import { Activity, Search, Filter, Boxes, RefreshCw } from 'lucide-react';

interface ActivitiesPageProps {
  onVerifyBlockchain: (eventUuid: string) => void;
}

export const ActivitiesPage: React.FC<ActivitiesPageProps> = ({ onVerifyBlockchain }) => {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadActivities = async () => {
    setIsLoading(true);
    try {
      const data = await api.getActivities({
        severity: severityFilter === 'ALL' ? undefined : severityFilter,
        event_type: typeFilter === 'ALL' ? undefined : typeFilter,
        limit: 100
      });
      setEvents(data);
    } catch (err) {
      console.error('Error fetching activities', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [severityFilter, typeFilter]);

  const filteredEvents = events.filter((e) => {
    const q = searchTerm.toLowerCase();
    return (
      e.event_type.toLowerCase().includes(q) ||
      e.user_id.toLowerCase().includes(q) ||
      (e.user_name && e.user_name.toLowerCase().includes(q)) ||
      e.ip_address.toLowerCase().includes(q) ||
      e.event_uuid.toLowerCase().includes(q)
    );
  });

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-400" />
            <span>Comprehensive Exam Activity Telemetry Log</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Real-Time Audit Trail of All Logins, Vault Accesses, Downloads & Privileged Administrative Actions
          </p>
        </div>

        <button
          onClick={loadActivities}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by User, Event Type, IP, or Event UUID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
          />
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
        </div>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200"
        >
          <option value="ALL">All Severities</option>
          <option value="CRITICAL">CRITICAL</option>
          <option value="HIGH">HIGH</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="INFO">INFO / LOW</option>
        </select>
      </div>

      {/* Activities Table */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-2xl overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
            <tr>
              <th className="pb-3 font-semibold">Event UUID</th>
              <th className="pb-3 font-semibold">Timestamp</th>
              <th className="pb-3 font-semibold">User</th>
              <th className="pb-3 font-semibold">Event Type</th>
              <th className="pb-3 font-semibold">Source IP</th>
              <th className="pb-3 font-semibold">Device</th>
              <th className="pb-3 font-semibold">Severity</th>
              <th className="pb-3 font-semibold text-right">Blockchain Audit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filteredEvents.map((evt) => (
              <tr key={evt.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 text-cyan-400 font-bold">{evt.event_uuid}</td>
                <td className="py-3 text-slate-400">{new Date(evt.timestamp).toLocaleString()}</td>
                <td className="py-3 font-sans font-medium text-slate-200">
                  {evt.user_name || evt.user_id}
                </td>
                <td className="py-3">
                  <span className="font-semibold text-slate-200">{evt.event_type}</span>
                  {evt.is_after_hours && (
                    <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                      OFF-HOURS
                    </span>
                  )}
                </td>
                <td className="py-3 text-slate-300">{evt.ip_address}</td>
                <td className="py-3 text-slate-400 truncate max-w-[120px]" title={evt.device_fingerprint}>
                  {evt.device_fingerprint || 'Standard Workstation'}
                </td>
                <td className="py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] border ${getSeverityBadge(evt.severity)}`}>
                    {evt.severity}
                  </span>
                </td>
                <td className="py-3 text-right">
                  {evt.is_blockchain_anchored ? (
                    <button
                      onClick={() => onVerifyBlockchain(evt.event_uuid)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/50 text-indigo-300 text-[11px] transition-all"
                    >
                      <Boxes className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Verify Proof</span>
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
