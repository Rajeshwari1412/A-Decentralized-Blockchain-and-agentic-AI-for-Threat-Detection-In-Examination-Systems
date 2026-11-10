import React, { useState } from 'react';
import { Shield, UserX, Lock, CheckCircle2, X } from 'lucide-react';
import { api } from '../../services/api';

interface AnalystActionModalProps {
  incidentId: string;
  isOpen: boolean;
  onClose: () => void;
  onActionComplete: () => void;
}

export const AnalystActionModal: React.FC<AnalystActionModalProps> = ({
  incidentId,
  isOpen,
  onClose,
  onActionComplete
}) => {
  const [status, setStatus] = useState<string>('UNDER_INVESTIGATION');
  const [notes, setNotes] = useState<string>('');
  const [quarantineUser, setQuarantineUser] = useState<boolean>(false);
  const [lockVault, setLockVault] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.takeAnalystAction(incidentId, {
        status,
        analyst_notes: notes,
        quarantine_user: quarantineUser,
        lock_question_paper: lockVault
      });
      onActionComplete();
      onClose();
    } catch (err) {
      console.error('Failed to submit analyst action', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2 text-cyan-400">
            <Shield className="h-5 w-5" />
            <h3 className="font-bold text-base">Human-in-the-Loop Analyst Triage</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-slate-400 mb-1">Set Incident Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="OPEN">OPEN (Under Review)</option>
              <option value="UNDER_INVESTIGATION">UNDER_INVESTIGATION (Active Triage)</option>
              <option value="CONTAINED">CONTAINED (Mitigation Applied)</option>
              <option value="RESOLVED">RESOLVED (Closed Cleanly)</option>
              <option value="FALSE_POSITIVE">FALSE_POSITIVE (Benign Operational Overlap)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Analyst Case Notes & Triage Findings</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record forensic observations, user interview feedback, or investigation rationale..."
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <p className="text-slate-400 uppercase tracking-wider text-[11px] font-semibold">
              Emergency Containment Controls
            </p>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={quarantineUser}
                onChange={(e) => setQuarantineUser(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-rose-500 focus:ring-0"
              />
              <span className="text-slate-200">Quarantine Account (Suspend Session & Revoke Active Tokens)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={lockVault}
                onChange={(e) => setLockVault(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-rose-500 focus:ring-0"
              />
              <span className="text-slate-200">Emergency Lock Question Paper Vault (Block All Exits)</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-lg shadow-cyan-900/50"
            >
              {isSubmitting ? 'Applying...' : 'Commit Analyst Action'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
