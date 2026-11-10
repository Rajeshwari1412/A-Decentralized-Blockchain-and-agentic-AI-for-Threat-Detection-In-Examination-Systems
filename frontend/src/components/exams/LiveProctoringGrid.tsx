import React, { useEffect, useState } from 'react';
import { Camera, AlertTriangle, ShieldCheck, ShieldAlert, Laptop, Eye, RefreshCw, UserCheck } from 'lucide-react';
import { api } from '../../services/api';

export const LiveProctoringGrid: React.FC = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const loadSessions = async () => {
    try {
      const data = await api.getLiveExamSessions();
      setSessions(data);
    } catch (err) {
      console.error('Failed to load sessions', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
    const interval = setInterval(loadSessions, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleProctorAction = async (sessionId: string, action: 'WARN' | 'TERMINATE' | 'CLEAR') => {
    try {
      const res = await api.takeProctorAction(sessionId, action);
      setActionFeedback(res.message);
      loadSessions();
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err: any) {
      setActionFeedback('Failed to execute proctor action');
    }
  };

  const getStatusBadge = (status: string) => {
    if (status.includes('FLAGGED')) {
      return 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse';
    }
    if (status.includes('WARNING')) {
      return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    }
    return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-base">
            <Camera className="h-5 w-5" />
            <h2>Live Invigilator Examination Room Grid (Lab 4)</h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Real-time biometric integrity, video proctor stream telemetry & suspicious behavior surveillance
          </p>
        </div>

        <button
          onClick={loadSessions}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Sync Room Roster</span>
        </button>
      </div>

      {actionFeedback && (
        <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-700 text-xs font-mono text-cyan-200">
          {actionFeedback}
        </div>
      )}

      {/* Grid of candidate proctoring cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sessions.map((sess) => (
          <div
            key={sess.session_id}
            className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
              sess.status.includes('FLAGGED')
                ? 'bg-rose-950/30 border-rose-500/50 shadow-lg shadow-rose-950/40'
                : sess.status.includes('WARNING')
                ? 'bg-amber-950/20 border-amber-500/40'
                : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-cyan-400">{sess.device_fingerprint}</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${getStatusBadge(sess.status)}`}>
                  {sess.status}
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-100">{sess.candidate_name}</h4>
              <p className="text-[11px] text-slate-400 font-mono">{sess.candidate_email}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-400 py-2 border-y border-slate-800/60">
              <div>IP: <span className="text-slate-200">{sess.ip_address}</span></div>
              <div>Tab Switches: <span className={sess.tab_switches > 0 ? 'text-rose-400 font-bold' : 'text-slate-200'}>{sess.tab_switches}</span></div>
              <div>Risk Score: <span className={sess.risk_score > 50 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>{sess.risk_score}/100</span></div>
              <div>Webcam: <span className="text-emerald-400 font-bold">ONLINE</span></div>
            </div>

            {/* Quick Invigilator Controls */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => handleProctorAction(sess.session_id, 'WARN')}
                className="flex-1 py-1 rounded-lg bg-amber-600/30 hover:bg-amber-600 text-amber-200 hover:text-white border border-amber-500/50 text-[11px] font-mono transition-colors"
              >
                Issue Warning
              </button>
              <button
                onClick={() => handleProctorAction(sess.session_id, 'TERMINATE')}
                className="flex-1 py-1 rounded-lg bg-rose-600/40 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-500/60 text-[11px] font-mono transition-colors"
              >
                Terminate Session
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
