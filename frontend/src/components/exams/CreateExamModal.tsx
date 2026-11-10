import React, { useState } from 'react';
import { X, Plus, Trash2, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { CreateExamQuestionInput } from '../../types';

interface CreateExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExamCreated: () => void;
}

export const CreateExamModal: React.FC<CreateExamModalProps> = ({ isOpen, onClose, onExamCreated }) => {
  const [examCode, setExamCode] = useState('EXAM-2026-BC');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [duration, setDuration] = useState(120);
  const [passingMarks, setPassingMarks] = useState(40);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [questions, setQuestions] = useState<CreateExamQuestionInput[]>([
    {
      question_text: 'What consensus protocol is used to achieve deterministic finality in permissioned enterprise blockchains?',
      question_type: 'MCQ',
      options: ['Raft / PBFT', 'Proof of Work (SHA-256)', 'Proof of Capacity', 'Nakamoto Longest Chain'],
      correct_answer: 'Raft / PBFT',
      marks: 25,
      difficulty: 'MEDIUM'
    },
    {
      question_text: 'Which cryptographic primitive prevents replay attacks in state-transition verification?',
      question_type: 'MCQ',
      options: ['Account Nonce', 'Block Gas Limit', 'Bloom Filter', 'Zero-Knowledge Circuit'],
      correct_answer: 'Account Nonce',
      marks: 25,
      difficulty: 'HARD'
    }
  ]);

  if (!isOpen) return null;

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: '',
        question_type: 'MCQ',
        options: ['', '', '', ''],
        correct_answer: '',
        marks: 25,
        difficulty: 'MEDIUM'
      }
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleQuestionTextChange = (idx: number, text: string) => {
    const updated = [...questions];
    updated[idx].question_text = text;
    setQuestions(updated);
  };

  const handleOptionChange = (qIdx: number, optIdx: number, val: string) => {
    const updated = [...questions];
    updated[qIdx].options[optIdx] = val;
    setQuestions(updated);
  };

  const handleSelectCorrect = (qIdx: number, val: string) => {
    const updated = [...questions];
    updated[qIdx].correct_answer = val;
    setQuestions(updated);
  };

  const handleMarksChange = (qIdx: number, val: number) => {
    const updated = [...questions];
    updated[qIdx].marks = val;
    setQuestions(updated);
  };

  const totalCalculatedMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !examCode.trim() || !subject.trim()) {
      setErrorMessage('Please fill in exam code, title, and subject.');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question_text.trim()) {
        setErrorMessage(`Question ${i + 1} text cannot be empty.`);
        return;
      }
      if (!q.correct_answer.trim()) {
        setErrorMessage(`Please select the correct answer for Question ${i + 1}.`);
        return;
      }
      const filledOptions = q.options.filter((o) => o.trim().length > 0);
      if (filledOptions.length < 2) {
        setErrorMessage(`Question ${i + 1} must have at least 2 options.`);
        return;
      }
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await api.createExamWithQuestions({
        exam_code: examCode.trim().toUpperCase(),
        title: title.trim(),
        subject: subject.trim(),
        duration_minutes: duration,
        total_marks: totalCalculatedMarks,
        passing_marks: passingMarks,
        questions: questions
      });
      onExamCreated();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || 'Failed to create and anchor examination to blockchain.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/40">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <h2 className="text-lg font-bold text-white">Create Blockchain-Secured Examination</h2>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Author question paper, generate forensic watermark & automatically anchor cryptographic paper hash to AuditLedger.sol
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-600/50 text-rose-200 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Exam Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Exam Code</label>
              <input
                type="text"
                value={examCode}
                onChange={(e) => setExamCode(e.target.value)}
                placeholder="e.g. EXAM-2026-DS01"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-mono text-slate-400 mb-1">Exam Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Decentralized Consensus & Zero Knowledge Architectures"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Subject / Discipline</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Computer Science & Cryptography"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Duration (Minutes)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min={15}
                max={360}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Passing Marks</label>
              <input
                type="number"
                value={passingMarks}
                onChange={(e) => setPassingMarks(Number(e.target.value))}
                min={1}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Question Bank Builder */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-200">Question Bank ({questions.length} Questions)</h3>
                <p className="text-xs text-slate-400 font-mono">Total Exam Marks: <strong className="text-cyan-400">{totalCalculatedMarks}</strong></p>
              </div>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-300 text-xs font-mono transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            <div className="space-y-4">
              {questions.map((q, qIdx) => (
                <div key={qIdx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-cyan-400">Question #{qIdx + 1}</span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-slate-400">
                        <span>Marks:</span>
                        <input
                          type="number"
                          value={q.marks}
                          onChange={(e) => handleMarksChange(qIdx, Number(e.target.value))}
                          className="w-14 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-center text-xs text-white"
                        />
                      </div>
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(qIdx)}
                          className="text-slate-500 hover:text-rose-400 transition-colors"
                          title="Remove question"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <textarea
                    value={q.question_text}
                    onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                    placeholder="Enter question text..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
                    required
                  />

                  {/* Options */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono text-slate-400">Options & Answer Key (Click radio to select correct option):</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {q.options.map((opt, oIdx) => {
                        const isCorrect = q.correct_answer === opt && opt.trim() !== '';
                        return (
                          <div
                            key={oIdx}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
                              isCorrect
                                ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                                : 'bg-slate-900/60 border-slate-800 text-slate-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`correct_${qIdx}`}
                              checked={isCorrect}
                              onChange={() => handleSelectCorrect(qIdx, opt)}
                              className="text-emerald-500 focus:ring-0 cursor-pointer"
                              title="Mark as correct answer"
                            />
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                handleOptionChange(qIdx, oIdx, e.target.value);
                                if (isCorrect) {
                                  handleSelectCorrect(qIdx, e.target.value);
                                }
                              }}
                              placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                              className="w-full bg-transparent text-xs font-mono focus:outline-none text-slate-200"
                              required
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Blockchain Sealing Notice */}
          <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs font-mono text-slate-300 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-400 shrink-0" />
            <span>
              On submission, ExamSentinel generates a SHA-256 canonical hash of the questions, assigns a unique watermark tag, and anchors the seal to the blockchain smart contract ledger.
            </span>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs font-mono shadow-lg shadow-indigo-950 transition-all disabled:opacity-50"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>{isSubmitting ? 'Sealing & Anchoring to Blockchain...' : 'Deploy & Seal to Blockchain'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
