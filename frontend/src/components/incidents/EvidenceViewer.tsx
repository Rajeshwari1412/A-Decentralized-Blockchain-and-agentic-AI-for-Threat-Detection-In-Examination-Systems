import React from 'react';
import { SecurityIncident } from '../../types';
import { FileText, Lightbulb, Shield, ShieldCheck, Tag } from 'lucide-react';

interface EvidenceViewerProps {
  incident: SecurityIncident;
}

export const EvidenceViewer: React.FC<EvidenceViewerProps> = ({ incident }) => {
  return (
    <div className="space-y-4">
      {/* Evidence Summary Card */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs font-mono uppercase tracking-wider">
          <FileText className="h-4 w-4" />
          <span>Multi-Agent Synthesized Evidence Package</span>
        </div>
        <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-950/80 p-3 rounded-lg border border-slate-800/80">
          {incident.evidence_summary || 'No direct evidence compiled.'}
        </pre>
      </div>

      {/* Root Cause Hypothesis Card */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs font-mono uppercase tracking-wider">
          <Lightbulb className="h-4 w-4" />
          <span>Investigation Agent Root-Cause Hypothesis (Objective)</span>
        </div>
        <div className="text-xs text-slate-300 bg-amber-950/20 border border-amber-800/40 p-3 rounded-lg leading-relaxed">
          {incident.root_cause_hypothesis || 'Root cause hypothesis pending triage.'}
        </div>
      </div>

      {/* Recommended Analyst Containment Actions */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs font-mono uppercase tracking-wider">
          <ShieldCheck className="h-4 w-4" />
          <span>Suggested Containment & Investigation Steps</span>
        </div>
        <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed bg-emerald-950/20 border border-emerald-800/40 p-3 rounded-lg">
          {incident.suggested_action || '1. Review session telemetry logs.\n2. Contact user for authentication confirmation.'}
        </pre>
      </div>

      {/* MITRE ATT&CK Indicators */}
      {incident.mitre_tactics && incident.mitre_tactics.length > 0 && (
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs font-mono uppercase tracking-wider">
            <Tag className="h-4 w-4" />
            <span>MITRE ATT&CK Indicator Mapping</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {incident.mitre_tactics.map((tactic, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-lg bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 font-mono text-[11px]"
              >
                {tactic}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
