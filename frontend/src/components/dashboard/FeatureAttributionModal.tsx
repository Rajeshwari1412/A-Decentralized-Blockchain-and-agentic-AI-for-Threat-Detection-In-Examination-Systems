import React from 'react';
import { Bot, Cpu, Sparkles, X, CheckCircle2, BarChart2, ShieldAlert } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface FeatureAttributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventData?: any;
}

export const FeatureAttributionModal: React.FC<FeatureAttributionModalProps> = ({
  isOpen,
  onClose,
  eventData
}) => {
  if (!isOpen) return null;

  const contributions = eventData?.contributions || {
    is_after_hours: 92.5,
    download_volume_ratio: 5.2,
    device_novelty: 1.8,
    ip_novelty: 0.5
  };

  const chartData = Object.entries(contributions).map(([k, v]) => ({
    feature: k,
    attribution: Number(v)
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
            <Cpu className="h-5 w-5" />
            <h3>Explainable AI (XAI) Isolation Forest Feature Attribution</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-500">Model Architecture:</span>
            <div className="text-slate-200 font-bold mt-0.5">Scikit-Learn IsolationForest (150 Trees)</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-500">Decision Function Score:</span>
            <div className="text-rose-400 font-bold mt-0.5">-0.248 (Anomalous Subspace)</div>
          </div>
        </div>

        {/* Feature Contribution Chart */}
        <div className="space-y-2">
          <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
            Feature Attribution Impact Breakdown (%)
          </h4>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 70, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={10} fontStyle="monospace" />
                <YAxis dataKey="feature" type="category" stroke="#94a3b8" fontSize={10} fontStyle="monospace" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0b1120',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                    fontFamily: 'monospace'
                  }}
                  formatter={(v: any) => [`+${v}% Attribution`, 'Threat Contribution']}
                />
                <Bar dataKey="attribution" fill="#06b6d4" radius={[0, 4, 4, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? '#f43f5e' : '#06b6d4'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed">
          <strong className="text-cyan-400">Forensic Interpretation:</strong> The dominant driver pushing this event into the outlier threshold is <code className="text-rose-300">is_after_hours</code> combined with <code className="text-amber-300">download_volume_ratio (15.0x baseline)</code>.
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
