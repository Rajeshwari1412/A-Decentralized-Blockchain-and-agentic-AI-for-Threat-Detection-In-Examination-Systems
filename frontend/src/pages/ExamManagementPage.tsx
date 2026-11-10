import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Examination, QuestionPaper } from '../types';
import { ExamList } from '../components/exams/ExamList';
import { QuestionPaperVault } from '../components/exams/QuestionPaperVault';
import { CandidateExamTerminal } from '../components/exams/CandidateExamTerminal';
import { LiveProctoringGrid } from '../components/exams/LiveProctoringGrid';
import { CandidateCredentialsTable } from '../components/exams/CandidateCredentialsTable';
import { FileSpreadsheet, Lock, Laptop, Camera, Award, RefreshCw } from 'lucide-react';

interface ExamManagementPageProps {
  onVerifyBlockchain?: (uuid: string) => void;
}

export const ExamManagementPage: React.FC<ExamManagementPageProps> = ({ onVerifyBlockchain }) => {
  const [activeTab, setActiveTab] = useState<'vault' | 'exams' | 'terminal' | 'credentials' | 'proctor'>('vault');
  const [exams, setExams] = useState<Examination[]>([]);
  const [papers, setPapers] = useState<QuestionPaper[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadExamData = async () => {
    setIsLoading(true);
    try {
      const [e, p] = await Promise.all([
        api.getExams(),
        api.getQuestionPaperVault()
      ]);
      setExams(e);
      setPapers(p);
      if (e.length > 0 && !selectedExamId) {
        setSelectedExamId(e[0].id);
      }
    } catch (err) {
      console.error('Failed to load exams', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExamData();
  }, []);

  const handleLaunchTerminal = (examId: string) => {
    setSelectedExamId(examId);
    setActiveTab('terminal');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-blue-400" />
            <span>Examination Operations & Blockchain Integrity Suite</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Decentralized Question Paper Vault, Candidate Terminals, Verifiable Credential Ledgers & AI Proctoring
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('vault')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'vault' ? 'bg-indigo-600 text-white font-bold shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Paper Vault</span>
          </button>

          <button
            onClick={() => setActiveTab('exams')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'exams' ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Schedules & Creator</span>
          </button>

          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'terminal' ? 'bg-cyan-600 text-white font-bold shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Laptop className="h-3.5 w-3.5" />
            <span>Candidate Terminal</span>
          </button>

          <button
            onClick={() => setActiveTab('credentials')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'credentials' ? 'bg-emerald-600 text-white font-bold shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            <span>Result Ledger & Verifier</span>
          </button>

          <button
            onClick={() => setActiveTab('proctor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'proctor' ? 'bg-rose-600 text-white font-bold shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="h-3.5 w-3.5" />
            <span>Live Proctor Room</span>
          </button>
        </div>
      </div>

      {/* Dynamic Tab Views */}
      {activeTab === 'vault' && (
        <QuestionPaperVault papers={papers} onPaperAccessed={loadExamData} />
      )}

      {activeTab === 'exams' && (
        <ExamList exams={exams} onTakeExam={handleLaunchTerminal} onRefresh={loadExamData} />
      )}

      {activeTab === 'terminal' && (
        <CandidateExamTerminal
          initialExamId={selectedExamId}
          onVerifyBlockchain={onVerifyBlockchain}
        />
      )}

      {activeTab === 'credentials' && (
        <CandidateCredentialsTable onVerifyOnChain={onVerifyBlockchain} />
      )}

      {activeTab === 'proctor' && (
        <LiveProctoringGrid />
      )}
    </div>
  );
};

