import React, { useState, useEffect } from 'react';
import {
  Award,
  ShieldCheck,
  ShieldAlert,
  Search,
  RefreshCw,
  ExternalLink,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Copy
} from 'lucide-react';
import { api } from '../../services/api';
import { ExamSubmissionOut, CertificateVerificationResponse } from '../../types';

interface CandidateCredentialsTableProps {
  onVerifyOnChain?: (uuid: string) => void;
}

export const CandidateCredentialsTable: React.FC<CandidateCredentialsTableProps> = ({ onVerifyOnChain }) => {
  const [submissions, setSubmissions] = useState<ExamSubmissionOut[]>([]);
  const [searchUuid, setSearchUuid] = useState<string>('');
  const [verificationResult, setVerificationResult] = useState<CertificateVerificationResponse | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tamperingId, setTamperingId] = useState<string | null>(null);
  const [tamperFeedback, setTamperFeedback] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadSubmissions = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAllSubmissions();
      setSubmissions(data);
    } catch (err) {
      console.error('Failed to load candidate submissions', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const handleVerify = async (uuidToVerify?: string) => {
    const target = (uuidToVerify || searchUuid).trim();
    if (!target) return;
    setIsVerifying(true);
    setTamperFeedback(null);
    try {
      const res = await api.verifyCertificate(target);
      setVerificationResult(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleTamperDemo = async (sub: ExamSubmissionOut) => {
    setTamperingId(sub.submission_uuid);
    setTamperFeedback('Deliberately altering candidate score to 100 in database to simulate insider grade alteration...');
    try {
      const res = await api.simulateSubmissionTamper(sub.submission_uuid);
      setVerificationResult(res.verification_result);
      setTamperFeedback('Database score altered! Blockchain verification immediately exposed the fraud (Hash Mismatch)!');
      await loadSubmissions();
    } catch (err: any) {
      setTamperFeedback('Tamper simulation failed.');
    } finally {
      setTamperingId(null);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-2xl space-y-6">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Award className="h-4 w-4 text-emerald-400" />
            <span>Academic Credentials & Blockchain Verification Roster</span>
          </h3>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
            Tamper-proof candidate exam results anchored to the decentralized ledger
          </p>
        </div>

        <button
          onClick={loadSubmissions}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Roster</span>
        </button>
      </div>

      {/* Verification Query Input */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
        <label className="block text-xs font-mono text-slate-300 font-bold">
          Public Certificate / Submission Verification Query
        </label>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchUuid}
              onChange={(e) => setSearchUuid(e.target.value)}
              placeholder="Paste Certificate UUID (e.g. CERT-2026-ALICE-CS401) or Submission UUID..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <button
            onClick={() => handleVerify()}
            disabled={isVerifying || !searchUuid.trim()}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs font-mono shadow-md shadow-indigo-950 transition-all flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>{isVerifying ? 'Verifying...' : 'Verify Authenticity'}</span>
          </button>
        </div>
      </div>

      {/* Verification Feedback Banner */}
      {verificationResult && (
        <div
          className={`p-4 rounded-xl border text-xs font-mono space-y-3 transition-all ${
            verificationResult.is_valid
              ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
              : 'bg-rose-950/40 border-rose-500/60 text-rose-200'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              {verificationResult.is_valid ? (
                <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
              ) : (
                <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0" />
              )}
              <span className="font-extrabold text-sm">
                STATUS: {verificationResult.status}
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-black/40 border border-white/10">
              Certificate: {verificationResult.certificate_uuid}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
            <div>
              Candidate: <strong className="text-white">{verificationResult.candidate_name}</strong>
              <div className="text-slate-400">{verificationResult.candidate_email}</div>
            </div>
            <div>
              Exam: <strong className="text-white">{verificationResult.exam_title}</strong>
              <div className="text-cyan-400 font-bold">{verificationResult.exam_code}</div>
            </div>
            <div>
              Score: <strong className="text-white">{verificationResult.score} / {verificationResult.total_marks}</strong> ({verificationResult.percentage}%)
              <div>Grade: <strong className="text-cyan-300 font-bold">{verificationResult.grade}</strong> ({verificationResult.passed ? 'PASSED' : 'FAILED'})</div>
            </div>
          </div>

          {/* Hash details */}
          <div className="pt-2 border-t border-white/10 space-y-1 text-[10px]">
            <div className="truncate">
              Ledger Anchor Hash: <span className="text-cyan-300 font-bold">{verificationResult.ledger_hash}</span>
            </div>
            <div className="truncate">
              Active Database Hash: <span className="text-slate-200 font-bold">{verificationResult.current_computed_hash}</span>
            </div>
            {verificationResult.discrepancy_details && (
              <div className="p-2 rounded bg-rose-950/80 border border-rose-600 text-rose-200 font-bold mt-2">
                ⚠️ {verificationResult.discrepancy_details}
              </div>
            )}
          </div>
        </div>
      )}

      {tamperFeedback && (
        <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-600/50 text-amber-200 text-xs font-mono flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{tamperFeedback}</span>
        </div>
      )}

      {/* Submissions Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs font-mono text-slate-300">
          <thead className="bg-slate-950 text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Certificate UUID</th>
              <th className="py-3 px-4">Candidate</th>
              <th className="py-3 px-4">Exam</th>
              <th className="py-3 px-4">Score & Grade</th>
              <th className="py-3 px-4">Blockchain Anchor</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  Loading credentials from database...
                </td>
              </tr>
            ) : submissions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  No exam submissions recorded yet. Take an exam in the Candidate Terminal tab!
                </td>
              </tr>
            ) : (
              submissions.map((sub) => (
                <tr key={sub.submission_uuid} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-cyan-400">
                    <div className="flex items-center gap-1.5">
                      <span>{sub.certificate_uuid}</span>
                      <button
                        onClick={() => handleCopy(sub.certificate_uuid, sub.certificate_uuid)}
                        className="text-slate-500 hover:text-white"
                        title="Copy Certificate UUID"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                      {copiedId === sub.certificate_uuid && (
                        <span className="text-emerald-400 text-[10px]">Copied</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-200">{sub.candidate_name}</div>
                    <div className="text-[10px] text-slate-500">{sub.candidate_email}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-200">{sub.exam_code}</div>
                    <div className="text-[10px] text-slate-500 truncate max-w-[140px]">{sub.exam_title}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="h-6 w-6 rounded bg-indigo-950 border border-indigo-700 text-indigo-300 font-bold flex items-center justify-center text-[10px]">
                        {sub.grade}
                      </span>
                      <span>
                        {sub.score} / {sub.total_marks} ({sub.percentage}%)
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[10px]">
                    <div className="text-slate-400">Block #{sub.blockchain_block_number || 1001}</div>
                    <div className="text-indigo-400 truncate max-w-[120px]">
                      {sub.blockchain_tx_hash || sub.submission_hash}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleVerify(sub.certificate_uuid)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-600/60 text-emerald-300 text-[11px] font-bold transition-all"
                        title="Verify against immutable blockchain ledger"
                      >
                        Verify
                      </button>
                      <button
                        onClick={() => handleTamperDemo(sub)}
                        disabled={tamperingId === sub.submission_uuid}
                        className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-600/60 text-rose-300 text-[11px] font-bold transition-all flex items-center gap-1"
                        title="Test insider tampering: Alter score in database and watch blockchain catch it!"
                      >
                        <Flame className="h-3 w-3" />
                        <span>Tamper Test</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
