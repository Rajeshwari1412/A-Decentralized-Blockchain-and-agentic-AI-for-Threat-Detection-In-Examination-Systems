import React, { useState } from 'react';
import { Examination } from '../../types';
import { FileSpreadsheet, Clock, Award, Plus, Laptop, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { CreateExamModal } from './CreateExamModal';

interface ExamListProps {
  exams: Examination[];
  onTakeExam?: (examId: string) => void;
  onRefresh?: () => void;
}

export const ExamList: React.FC<ExamListProps> = ({ exams, onTakeExam, onRefresh }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-2xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-blue-400" />
            <span>Active Examination Schedules & Blockchain Seals</span>
          </h3>
          <p className="text-[11px] text-slate-400 font-mono">
            Cryptographically Anchored Under Immutable Smart Contract Auditing
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs font-mono shadow-md shadow-indigo-950 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Create Blockchain-Secured Exam</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-cyan-400 font-mono">{exam.exam_code}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-400" />
                  <span>{exam.status}</span>
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-100 leading-snug">{exam.title}</h4>
              <p className="text-xs text-slate-400 font-medium mt-1">{exam.subject}</p>
            </div>

            <div className="pt-3 border-t border-slate-800/60 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  <span>{exam.duration_minutes} min</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-slate-500" />
                  <span>{exam.total_marks} Marks</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Passing: <strong className="text-slate-200">{exam.passing_marks}</strong>
                </div>
                <div className="text-[11px] text-slate-400">
                  Questions: <strong className="text-cyan-400">{exam.question_count || 4}</strong>
                </div>
              </div>

              {onTakeExam && (
                <button
                  onClick={() => onTakeExam(exam.id)}
                  className="w-full py-2 px-3 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Laptop className="h-3.5 w-3.5" />
                  <span>Launch Candidate Terminal</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <CreateExamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onExamCreated={() => {
          if (onRefresh) onRefresh();
        }}
      />
    </div>
  );
};
