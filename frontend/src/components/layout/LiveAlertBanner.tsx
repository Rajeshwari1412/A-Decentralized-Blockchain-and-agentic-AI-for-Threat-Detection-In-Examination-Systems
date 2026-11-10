import React from 'react';
import { useWebSocket } from '../../context/WebSocketContext';
import { AlertCircle, ArrowRight, X, ShieldAlert } from 'lucide-react';

interface LiveAlertBannerProps {
  onInvestigate: (incidentId?: string) => void;
}

export const LiveAlertBanner: React.FC<LiveAlertBannerProps> = ({ onInvestigate }) => {
  const { latestAlert, clearAlerts } = useWebSocket();

  if (!latestAlert) return null;

  return (
    <div className="w-full bg-gradient-to-r from-rose-950 via-rose-900 to-amber-950 border-b border-rose-600/60 px-6 py-2.5 shadow-2xl flex items-center justify-between text-slate-100 animate-pulse-slow">
      <div className="flex items-center gap-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-600/40 border border-rose-500 text-rose-300">
          <ShieldAlert className="h-4 w-4" />
        </div>
        <div className="text-xs">
          <span className="font-extrabold text-rose-300 font-mono tracking-wide mr-2">
            [{latestAlert.severity} ALERT {latestAlert.alert_code}]
          </span>
          <span className="font-medium text-slate-200">{latestAlert.title}:</span>{' '}
          <span className="text-rose-100 font-mono">{latestAlert.message}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => onInvestigate(latestAlert.incident_id)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-lg shadow-rose-900/50 transition-all"
        >
          <span>Triage Incident</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={clearAlerts}
          className="p-1 text-slate-300 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
