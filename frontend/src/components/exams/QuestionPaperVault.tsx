import React, { useState } from 'react';
import { Lock, Eye, Download, ShieldCheck, ShieldAlert, Key, RefreshCw } from 'lucide-react';
import { QuestionPaper } from '../../types';
import { api } from '../../services/api';

interface QuestionPaperVaultProps {
  papers: QuestionPaper[];
  onPaperAccessed: () => void;
}

export const QuestionPaperVault: React.FC<QuestionPaperVaultProps> = ({ papers, onPaperAccessed }) => {
  const [accessingId, setAccessingId] = useState<string | null>(null);
  const [accessResult, setAccessResult] = useState<any>(null);

  const handleAccess = async (paperId: string, action: 'VIEW' | 'DOWNLOAD') => {
    setAccessingId(paperId);
    try {
      const res = await api.accessQuestionPaper(paperId, action);
      setAccessResult(res);
      onPaperAccessed();
    } catch (err: any) {
      setAccessResult({
        success: false,
        message: err.response?.data?.detail || 'Access blocked by security quarantine policy.'
      });
    } finally {
      setAccessingId(null);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-2xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-base">
            <Lock className="h-5 w-5" />
            <h2>Confidential Question Paper Cryptographic Vault</h2>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Encrypted examination packages with dynamic forensic watermarks & access auditing
          </p>
        </div>
      </div>

      {accessResult && (
        <div
          className={`p-4 rounded-xl border text-xs font-mono flex items-center justify-between ${
            accessResult.success
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {accessResult.success ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
            <span>{accessResult.message}</span>
          </div>
          {accessResult.watermark && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700">
              Watermark: {accessResult.watermark}
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {papers.map((qp) => {
          const isLocked = qp.status === 'COMPROMISED_LOCK';
          return (
            <div
              key={qp.id}
              className={`p-4 rounded-xl border flex flex-col justify-between space-y-4 transition-all ${
                isLocked
                  ? 'bg-rose-950/20 border-rose-800/60 shadow-lg shadow-rose-950/30'
                  : 'bg-slate-950/80 border-slate-800 hover:border-indigo-500/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-200 font-mono">{qp.paper_code}</span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      isLocked
                        ? 'bg-rose-950 text-rose-400 border-rose-800'
                        : 'bg-indigo-950 text-indigo-300 border-indigo-800'
                    }`}
                  >
                    {qp.status}
                  </span>
                </div>

                <div className="space-y-1 text-[11px] font-mono text-slate-400">
                  <div className="truncate">
                    Hash: <span className="text-indigo-400">{qp.encryption_hash?.slice(0, 16)}...</span>
                  </div>
                  <div>
                    Watermark: <span className="text-slate-300">{qp.watermark_tag}</span>
                  </div>
                  <div>
                    Downloads: <span className="text-cyan-400 font-bold">{qp.download_count}</span> / {qp.max_allowed_downloads} max
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
                <button
                  onClick={() => handleAccess(qp.id, 'VIEW')}
                  disabled={accessingId === qp.id || isLocked}
                  className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Eye className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Secure View</span>
                </button>
                <button
                  onClick={() => handleAccess(qp.id, 'DOWNLOAD')}
                  disabled={accessingId === qp.id || isLocked}
                  className="flex-1 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-indigo-950 disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Encrypted</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
