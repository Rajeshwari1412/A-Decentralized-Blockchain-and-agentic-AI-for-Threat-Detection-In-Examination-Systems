import React, { useState, useEffect } from 'react';
import {
  Award,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  Camera,
  Laptop,
  Boxes,
  Copy,
  ExternalLink,
  RotateCcw,
  UserCheck,
  FileText
} from 'lucide-react';
import { api } from '../../services/api';
import { Examination, ExamQuestionPublic, ExamSubmissionOut } from '../../types';

interface CandidateExamTerminalProps {
  initialExamId?: string;
  onVerifyBlockchain?: (uuid: string) => void;
}

export const CandidateExamTerminal: React.FC<CandidateExamTerminalProps> = ({
  initialExamId,
  onVerifyBlockchain
}) => {
  const [exams, setExams] = useState<Examination[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>(initialExamId || '');
  const [questions, setQuestions] = useState<ExamQuestionPublic[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [tabSwitches, setTabSwitches] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(120 * 60); // 2 hours
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<ExamSubmissionOut | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<boolean>(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Load available exams
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const data = await api.getExams();
        setExams(data);
        if (!selectedExamId && data.length > 0) {
          setSelectedExamId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load exams list', err);
      }
    };
    fetchExams();
  }, []);

  // When selected exam changes, load questions
  useEffect(() => {
    if (!selectedExamId) return;

    const fetchQuestions = async () => {
      setIsLoadingQuestions(true);
      try {
        const qData = await api.getPublicExamQuestions(selectedExamId);
        if (qData && qData.length > 0) {
          setQuestions(qData);
        } else {
          // Fallback if none in db
          setQuestions([
            {
              id: 'q-fb-1',
              question_text: 'Which consensus mechanism provides deterministic finality without possibility of blockchain reorganization forks?',
              question_type: 'MCQ',
              options: ['Proof of Work', 'PBFT (Practical Byzantine Fault Tolerance)', 'Proof of Stake (Longest Chain)', 'Proof of Capacity'],
              marks: 25,
              difficulty: 'HARD'
            },
            {
              id: 'q-fb-2',
              question_text: 'In Ethereum EVM execution, what happens when a smart contract call exhausts all allocated gas units?',
              question_type: 'MCQ',
              options: ['State changes persist but code stops', 'Transaction reverts all state modifications and consumes gas', 'Transaction pauses until gas sent', 'Switches to CPU fallback'],
              marks: 25,
              difficulty: 'MEDIUM'
            }
          ]);
        }
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setSubmissionResult(null);
        setStatusMessage(null);
        setTabSwitches(0);
      } catch (err) {
        console.warn('Using default examination questions', err);
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    fetchQuestions();
  }, [selectedExamId]);

  // Set timer based on exam duration
  useEffect(() => {
    const curExam = exams.find((e) => e.id === selectedExamId);
    if (curExam) {
      setTimeLeft(curExam.duration_minutes * 60);
    }
  }, [selectedExamId, exams]);

  // Detect tab switches & window blur
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.hidden && !submissionResult) {
        setTabSwitches((prev) => prev + 1);
        setStatusMessage('⚠️ Warning: Browser focus loss / tab switch recorded by live AI proctoring surveillance feed!');
        try {
          await api.ingestActivity({
            user_id: 'candidate.01@examsentinel.edu',
            event_type: 'TAB_SWITCH_WARNING',
            resource_type: 'EXAM_SESSION',
            resource_id: selectedExamId || 'EXAM-TERMINAL',
            payload: { reason: 'Browser focus loss during candidate exam terminal session' }
          });
        } catch (e) {
          console.warn(e);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [submissionResult, selectedExamId]);

  // Countdown timer
  useEffect(() => {
    if (submissionResult) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [submissionResult]);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) {
      return `${h}h ${m < 10 ? '0' : ''}${m}m ${s < 10 ? '0' : ''}${s}s`;
    }
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentQ = questions[currentQuestionIndex];

  const handleSelectOption = (opt: string) => {
    if (!currentQ) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentQ.id]: opt }));
  };

  const handleSubmitExam = async () => {
    if (!selectedExamId) return;
    setIsSubmitting(true);
    setStatusMessage('Evaluating answers, computing canonical SHA-256 hash, and anchoring to blockchain audit ledger...');
    try {
      const res = await api.submitExam(selectedExamId, selectedAnswers, tabSwitches);
      setSubmissionResult(res);
      setStatusMessage('Examination successfully submitted and anchored to immutable blockchain ledger!');
    } catch (err: any) {
      setStatusMessage(err.response?.data?.detail || 'Failed to submit exam.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(label);
    setTimeout(() => setCopiedHash(null), 2500);
  };

  const activeExam = exams.find((e) => e.id === selectedExamId) || exams[0];

  return (
    <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md space-y-6">
      {/* Header and Exam Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-cyan-400">
              {activeExam ? activeExam.exam_code : 'BLOCKCHAIN-EXAM-TERMINAL'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] border border-emerald-500/40 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>AI PROCTORING & BIOMETRICS ACTIVE</span>
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-100 mt-1">
            {activeExam ? activeExam.title : 'Examination Assessment Terminal'}
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Subject: {activeExam ? activeExam.subject : 'Computer Science'} | Total Marks: {activeExam ? activeExam.total_marks : 100}
          </p>
        </div>

        {/* Exam Picker Dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-mono text-slate-400">Select Exam:</label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              disabled={!!submissionResult}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
            >
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.exam_code} - {ex.title.slice(0, 32)}...
                </option>
              ))}
            </select>
          </div>

          {/* Telemetry Stats */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
              <Clock className="h-4 w-4 text-cyan-400" />
              <span>Time: <strong className="text-cyan-300">{formatTime(timeLeft)}</strong></span>
            </div>

            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
                tabSwitches > 0
                  ? 'bg-rose-950/40 border-rose-600/50 text-rose-300'
                  : 'bg-slate-950 border-slate-800 text-slate-300'
              }`}
            >
              <Camera className="h-4 w-4 text-emerald-400" />
              <span>Tab Violations: <strong>{tabSwitches}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Simulated Live Proctoring Camera HUD */}
      {!submissionResult && (
        <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-14 rounded-lg bg-slate-900 border border-cyan-500/40 flex items-center justify-center overflow-hidden">
              <Camera className="h-4 w-4 text-cyan-400 animate-pulse" />
              <div className="absolute inset-1 border border-dashed border-emerald-500/60 rounded" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                <UserCheck className="h-3.5 w-3.5" />
                <span>AI Face Mesh: Single Candidate Verified (Match: 99.4%)</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Audio Stream: Clean | Screen Lock: Enforced | Peer Detection: 0 Anomaly
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
              Candidate: Alice Montgomery (B.Tech CS)
            </span>
          </div>
        </div>
      )}

      {/* Warning/Status Message */}
      {statusMessage && (
        <div
          className={`p-3 rounded-xl border text-xs font-mono flex items-center gap-2 ${
            submissionResult
              ? 'bg-emerald-950/40 border-emerald-600 text-emerald-200'
              : 'bg-rose-950/40 border-rose-600 text-rose-200'
          }`}
        >
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Main Testing View */}
      {!submissionResult ? (
        isLoadingQuestions ? (
          <div className="p-12 text-center text-xs font-mono text-cyan-400">
            Loading examination question paper from cryptographic store...
          </div>
        ) : questions.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-slate-400">
            No questions available for this exam yet. An administrator can add questions in the Exam Schedules tab.
          </div>
        ) : (
          <div className="space-y-5">
            {/* Question Navigator Numbers */}
            <div className="flex items-center gap-2 flex-wrap">
              {questions.map((q, idx) => {
                const isAnswered = selectedAnswers[q.id] !== undefined;
                const isCurrent = currentQuestionIndex === idx;
                return (
                  <button
                    key={q.id || idx}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`h-9 w-9 rounded-xl font-mono text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30 scale-105'
                        : isAnswered
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Current Question Box */}
            {currentQ && (
              <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800/80 pb-2">
                  <span>
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300">
                      Difficulty: {currentQ.difficulty || 'MEDIUM'}
                    </span>
                    <span className="text-cyan-400 font-bold">{currentQ.marks || 5} Marks</span>
                  </div>
                </div>

                <p className="text-sm font-semibold text-slate-100 leading-relaxed">
                  {currentQ.question_text}
                </p>

                {/* Multiple Choice Options */}
                <div className="space-y-2.5 pt-2">
                  {currentQ.options.map((opt, oIdx) => {
                    const isSelected = selectedAnswers[currentQ.id] === opt;
                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleSelectOption(opt)}
                        className={`w-full text-left p-3.5 rounded-xl text-xs font-mono transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-cyan-950/60 border border-cyan-500 text-cyan-200 shadow-md shadow-cyan-950'
                            : 'bg-slate-900/60 border border-slate-800 hover:bg-slate-850 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="h-6 w-6 rounded-lg bg-slate-950 border border-slate-700 text-center leading-6 text-[10px] font-bold text-slate-300">
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Row */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono disabled:opacity-40 transition-colors"
              >
                &larr; Previous
              </button>

              <div className="text-xs font-mono text-slate-400">
                Answered: <strong className="text-cyan-400">{Object.keys(selectedAnswers).length}</strong> / {questions.length}
              </div>

              {currentQuestionIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs font-mono shadow-md shadow-cyan-950 transition-colors"
                >
                  Next Question &rarr;
                </button>
              ) : (
                <button
                  onClick={handleSubmitExam}
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs font-mono shadow-lg shadow-emerald-950 flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{isSubmitting ? 'Evaluating & Anchoring...' : 'Submit Final Examination'}</span>
                </button>
              )}
            </div>
          </div>
        )
      ) : (
        /* Results & Digital Certificate Receipt */
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 to-indigo-950/40 border border-indigo-500/40 shadow-2xl space-y-6">
            {/* Certificate Header Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-500/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                  <Award className="h-8 w-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-emerald-400">ACADEMIC CREDENTIAL VERIFIED</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-600 text-emerald-300 font-mono text-[10px]">
                      {submissionResult.passed ? 'PASSED' : 'NOT PASSED'}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-white">
                    Cryptographic Examination Certificate
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Certificate UUID: <strong className="text-cyan-300">{submissionResult.certificate_uuid}</strong>
                  </p>
                </div>
              </div>

              {/* Scorecard Callout */}
              <div className="flex items-center gap-4 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <div className="text-right">
                  <div className="text-[11px] font-mono text-slate-400">Grade & Percentage</div>
                  <div className="text-lg font-extrabold text-cyan-300 font-mono">
                    {submissionResult.score} / {submissionResult.total_marks} ({submissionResult.percentage}%)
                  </div>
                </div>
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white font-extrabold font-mono text-base shadow-md">
                  {submissionResult.grade}
                </div>
              </div>
            </div>

            {/* Candidate & Exam Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400">Candidate</span>
                <p className="font-bold text-slate-100 mt-0.5">{submissionResult.candidate_name}</p>
                <p className="text-slate-400 text-[11px] truncate">{submissionResult.candidate_email}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400">Examination</span>
                <p className="font-bold text-slate-100 mt-0.5">{submissionResult.exam_title}</p>
                <p className="text-cyan-400 text-[11px] font-bold">{submissionResult.exam_code}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400">Proctoring Telemetry</span>
                <p className="text-slate-200 mt-0.5">Tab Focus Loss: <strong>{submissionResult.tab_switches}</strong></p>
                <p className="text-emerald-400 text-[11px]">Integrity Check: Clean</p>
              </div>
            </div>

            {/* Blockchain Immutability Proof */}
            <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/30 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-indigo-400 font-bold">
                <div className="flex items-center gap-1.5">
                  <Boxes className="h-4 w-4" />
                  <span>Immutable Blockchain Ledger Proof</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-600">
                  ANCHORED ON-CHAIN
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-[11px]">
                <div>
                  <span className="text-slate-500">Submission SHA-256 Hash:</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-cyan-300 font-bold truncate max-w-[260px]">
                      {submissionResult.submission_hash}
                    </span>
                    <button
                      onClick={() => handleCopy(submissionResult.submission_hash, 'sub')}
                      className="text-slate-400 hover:text-white"
                      title="Copy SHA-256 Hash"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                    {copiedHash === 'sub' && <span className="text-emerald-400 text-[10px]">Copied!</span>}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500">Blockchain Transaction Hash:</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-indigo-300 font-bold truncate max-w-[260px]">
                      {submissionResult.blockchain_tx_hash}
                    </span>
                    <button
                      onClick={() => handleCopy(submissionResult.blockchain_tx_hash || '', 'tx')}
                      className="text-slate-400 hover:text-white"
                      title="Copy TX Hash"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                    {copiedHash === 'tx' && <span className="text-emerald-400 text-[10px]">Copied!</span>}
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 pt-1">
                EVM Block Number: <strong className="text-slate-300">#{submissionResult.blockchain_block_number}</strong> | Timestamp: {new Date(submissionResult.created_at).toUTCString()}
              </div>
            </div>

            {/* Question Breakdown Review */}
            {submissionResult.results_breakdown && submissionResult.results_breakdown.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-mono font-bold text-slate-200">
                  Question-by-Question Evaluation Breakdown
                </h4>
                <div className="space-y-2">
                  {submissionResult.results_breakdown.map((res, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-xs font-mono flex items-start justify-between gap-3 ${
                        res.is_correct
                          ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-200'
                          : 'bg-rose-950/20 border-rose-500/30 text-slate-200'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {res.is_correct ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="font-semibold">{res.question_text}</p>
                          <div className="text-[11px] text-slate-400 mt-1 space-y-0.5">
                            <div>Your Answer: <strong className={res.is_correct ? 'text-emerald-300' : 'text-rose-300'}>{res.selected_option || 'None'}</strong></div>
                            {!res.is_correct && (
                              <div>Correct Answer: <strong className="text-emerald-400">{res.correct_option}</strong></div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="font-bold shrink-0 text-right">
                        <span className={res.is_correct ? 'text-emerald-400' : 'text-rose-400'}>
                          +{res.marks_earned}
                        </span>
                        <span className="text-slate-500"> / {res.max_marks}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => {
                  setSubmissionResult(null);
                  setSelectedAnswers({});
                  setTabSwitches(0);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Take Another Exam</span>
              </button>

              <button
                onClick={() => {
                  if (onVerifyBlockchain) {
                    onVerifyBlockchain(submissionResult.certificate_uuid);
                  }
                }}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs font-mono shadow-md shadow-indigo-950 transition-all"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Verify Credential on Blockchain Ledger &rarr;</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
