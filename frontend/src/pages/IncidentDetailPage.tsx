import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { SecurityIncident } from '../types';
import { IncidentTimeline } from '../components/incidents/IncidentTimeline';
import { EvidenceViewer } from '../components/incidents/EvidenceViewer';
import { AnalystActionModal } from '../components/incidents/AnalystActionModal';
import { ForensicReportModal } from '../components/incidents/ForensicReportModal';
import {
  ArrowLeft,
  ShieldAlert,
  Flame,
  User,
  Clock,
  Boxes,
  ShieldCheck,
  Zap,
  Edit3,
  Printer,
  RefreshCw
} from 'lucide-react';

interface IncidentDetailPageProps {
  incidentId: string;
  onBack: () => void;
  onVerifyBlockchain: (eventUuid: string) => void;
}

export const IncidentDetailPage: React.FC<IncidentDetailPageProps> = ({
  incidentId,
  onBack,
  onVerifyBlockchain
}) => {
  const [incident, setIncident] = useState<SecurityIncident | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadDetail = async () => {
    try {
      const data = await api.getIncidentDetail(incidentId);
      setIncident(data);
    } catch (err) {
      console.error('Failed to load incident detail', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [incidentId]);

  if (isLoading || !incident) {
    return (
      <div className="flex h-96 items-center justify-center font-mono text-xs text-cyan-400">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Loading Deep Multi-Agent Forensic Dossier...</span>
      </div>
    );
  }

  const getTierBadge = (sev: string) => {
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
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Incidents Queue</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono transition-all"
          >
            <Printer className="h-4 w-4 text-indigo-400" />
            <span>Export Forensic Dossier</span>
          </button>
          <button
            onClick={() => setIsActionModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs font-mono shadow-lg shadow-cyan-950 transition-all hover:scale-105"
          >
            <Edit3 className="h-4 w-4" />
            <span>Execute Human Analyst Triage</span>
          </button>
        </div>
      </div>

      {/* Incident Hero Dossier */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-cyan-400">{incident.incident_code}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${getTierBadge(incident.severity)}`}>
                {incident.severity}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700">
                Status: {incident.status}
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-100">{incident.title}</h1>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-center">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Overall Risk Score</div>
            <div className="text-2xl font-extrabold text-rose-400">{incident.risk_score} / 100</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono text-slate-400">
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-500">Subject Account:</span>
            <div className="text-slate-200 font-sans font-semibold mt-0.5">{incident.user_name} ({incident.user_role})</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-500">Department:</span>
            <div className="text-slate-200 mt-0.5">{incident.user_department || 'Examination Division'}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <span className="text-slate-500">Detected Timestamp:</span>
            <div className="text-slate-200 mt-0.5">{new Date(incident.created_at).toLocaleString()}</div>
          </div>
        </div>

        {incident.analyst_notes && (
          <div className="p-3 rounded-lg bg-slate-950/80 border border-cyan-800/50 text-xs font-mono text-slate-200">
            <span className="font-bold text-cyan-400 uppercase">Analyst Triage Log:</span>
            <pre className="whitespace-pre-wrap mt-1 text-slate-300">{incident.analyst_notes}</pre>
          </div>
        )}
      </div>

      {/* Main Grid: Evidence Narrative & Chronological Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <EvidenceViewer incident={incident} />
        </div>
        <div>
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl">
            <IncidentTimeline
              timeline={incident.timeline || []}
              onVerifyBlockchain={onVerifyBlockchain}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnalystActionModal
        incidentId={incident.id}
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        onActionComplete={loadDetail}
      />

      <ForensicReportModal
        incident={incident}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
};
