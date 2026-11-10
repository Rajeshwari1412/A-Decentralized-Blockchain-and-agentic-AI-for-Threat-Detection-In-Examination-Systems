import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { SecurityIncident, SecurityAlert } from '../types';
import { AlertTriangle, ShieldAlert, ArrowRight, CheckCircle2, Clock, Filter, User, Zap, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';

interface IncidentsPageProps {
  onSelectIncident: (incidentId: string) => void;
}

export const IncidentsPage: React.FC<IncidentsPageProps> = ({ onSelectIncident }) => {
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [demoNote, setDemoNote] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [inc, alt] = await Promise.all([
        api.getIncidents({
          status: statusFilter === 'ALL' ? undefined : statusFilter,
          severity: severityFilter === 'ALL' ? undefined : severityFilter
        }),
        api.getAlerts()
      ]);
      setIncidents(inc);
      setAlerts(alt);
    } catch (err) {
      console.error('Failed to load incidents', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, severityFilter]);

  const handleSimulateAttack = async () => {
    setIsSimulating(true);
    setDemoNote('Simulating insider paper leak attempt (off-hours download & unapproved USB copy)...');
    try {
      await api.runScenarioStep(1);
      await new Promise((r) => setTimeout(r, 400));
      await api.runScenarioStep(2);
      await new Promise((r) => setTimeout(r, 400));
      await api.runScenarioStep(3);
      setDemoNote('Incident created! AI Isolation Forest flagged anomaly and generated case file.');
      await loadData();
    } catch (err: any) {
      setDemoNote(`Simulation error: ${err.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-rose-400" />
            <span>Security Incidents & Analyst Triage Queue</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Real-time forensic threat cases flagged across behavioral & machine learning AI agents
          </p>
        </div>

        {/* Actions & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSimulateAttack}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-md transition-all disabled:opacity-50"
          >
            {isSimulating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
            <span>{isSimulating ? 'Simulating...' : 'Simulate Attack Demo'}</span>
          </button>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-slate-200"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">OPEN</option>
            <option value="UNDER_INVESTIGATION">UNDER_INVESTIGATION</option>
            <option value="CONTAINED">CONTAINED</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-slate-200"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>
      </div>

      {demoNote && (
        <div className="p-3.5 rounded-xl bg-cyan-950/60 border border-cyan-600/50 text-xs font-mono text-cyan-200 flex items-center justify-between animate-fadeIn">
          <span>{demoNote}</span>
          <button
            onClick={() => setDemoNote(null)}
            className="text-cyan-400 font-bold hover:text-cyan-200 text-xs ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Incidents List */}
      {incidents.length === 0 ? (
        <div className="p-12 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-950/40">
            <ShieldCheck className="h-8 w-8" />
          </div>
          
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-base font-bold text-white">No Security Incidents Found</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              All examination operations are currently nominal. To test how ExamSentinel catches exam paper leaks and insider fraud, click below to simulate an attack.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleSimulateAttack}
              disabled={isSimulating}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-950 transition-all hover:scale-105 disabled:opacity-50"
            >
              {isSimulating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              <span>{isSimulating ? 'Simulating Threat...' : 'Simulate Paper Leak Attack (Demo)'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {incidents.map((inc) => (
            <div
              key={inc.id}
              onClick={() => onSelectIncident(inc.id)}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all shadow-xl hover:shadow-cyan-950/30 flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-bold text-cyan-400">{inc.incident_code}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${getSeverityBadge(inc.severity)}`}>
                    {inc.severity}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono border border-slate-700">
                    Status: {inc.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                  {inc.title}
                </h3>

                <p className="text-xs text-slate-300 line-clamp-2">
                  {inc.root_cause_hypothesis || inc.evidence_summary}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-1">
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-slate-500" />
                    <span>{inc.user_name} ({inc.user_role})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-500" />
                    <span>{new Date(inc.created_at).toLocaleString()}</span>
                  </div>
                  <div className="text-rose-400 font-bold">
                    Risk Score: {inc.risk_score}/100
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectIncident(inc.id);
                  }}
                  className="px-4 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
                >
                  <span>Investigate</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

