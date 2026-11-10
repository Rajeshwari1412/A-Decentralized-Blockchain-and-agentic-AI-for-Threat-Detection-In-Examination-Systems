import React, { useState } from 'react';
import { Play, PlayCircle, RotateCcw, Database, ShieldAlert, Cpu, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { ScenarioStep } from '../../types';

interface ScenarioRunnerProps {
  scenarios: ScenarioStep[];
  currentStep: number;
  isRunning: boolean;
  onRunStep: (stepNumber: number) => Promise<void>;
  onRunAll: () => Promise<void>;
  onResetSeed: () => Promise<void>;
}

export const ScenarioRunner: React.FC<ScenarioRunnerProps> = ({
  scenarios,
  currentStep,
  isRunning,
  onRunStep,
  onRunAll,
  onResetSeed
}) => {
  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/30 border border-slate-800 backdrop-blur-md shadow-2xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-base">
            <Sparkles className="h-5 w-5" />
            <h2>Proactive Insider Threat Demonstration Engine</h2>
          </div>
          <p className="text-xs text-slate-300 font-mono mt-0.5">
            Simulate the full progression: Normal login → Rogue hardware → Proxy IP → After-hours vault → Bulk exfiltration → ML scoring → Multi-agent triage → Blockchain audit
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onResetSeed}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 transition-all"
            title="Reset dataset"
          >
            <Database className="h-3.5 w-3.5" />
            <span>Seed Baseline</span>
          </button>

          <button
            onClick={onRunAll}
            disabled={isRunning}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs font-mono shadow-lg shadow-cyan-950 transition-all hover:scale-105"
          >
            <PlayCircle className="h-4 w-4" />
            <span>{isRunning ? 'Executing Scenario Pipeline...' : 'Run Complete 7-Step Attack Scenario'}</span>
          </button>
        </div>
      </div>

      {/* Step Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2 pt-2">
        {scenarios.map((sc) => {
          const isDone = currentStep >= sc.step;
          const isCurrent = currentStep === sc.step;
          return (
            <button
              key={sc.step}
              onClick={() => onRunStep(sc.step)}
              disabled={isRunning}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isCurrent
                  ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200 shadow-md shadow-cyan-950 scale-105'
                  : isDone
                  ? 'bg-slate-900/90 border-slate-700 text-slate-300'
                  : 'bg-slate-950/60 border-slate-800/80 text-slate-500 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                <span>STEP {sc.step}</span>
                {isDone && <span className="h-2 w-2 rounded-full bg-emerald-400" />}
              </div>
              <div className="text-xs font-bold truncate">{sc.title}</div>
              <div className="text-[10px] font-mono text-cyan-400 mt-1">{sc.expected_risk}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
