import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ScenarioStep } from '../types';
import { ScenarioRunner } from '../components/simulator/ScenarioRunner';
import { ThreatStepTimeline } from '../components/simulator/ThreatStepTimeline';
import { Zap, ShieldCheck, RefreshCw } from 'lucide-react';

interface ThreatSimulatorPageProps {
  onNavigateToIncidents: () => void;
}

export const ThreatSimulatorPage: React.FC<ThreatSimulatorPageProps> = ({ onNavigateToIncidents }) => {
  const [scenarios, setScenarios] = useState<ScenarioStep[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [scenarioResults, setScenarioResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const loadScenarios = async () => {
      try {
        const list = await api.getScenarioCatalog();
        setScenarios(list);
      } catch (err) {
        console.error('Failed to load scenarios', err);
      }
    };
    loadScenarios();
  }, []);

  const handleRunStep = async (stepNumber: number) => {
    setIsRunning(true);
    setNotification(`Executing Attack Step ${stepNumber}...`);
    try {
      const res = await api.runScenarioStep(stepNumber);
      setCurrentStep(stepNumber);
      setScenarioResults((prev) => {
        const filtered = prev.filter((r) => r.step_number !== stepNumber);
        return [...filtered, res].sort((a, b) => a.step_number - b.step_number);
      });
      setNotification(`Step ${stepNumber} evaluated! Risk: ${res.risk_score}/100 [${res.risk_tier}]. Multi-agent pipeline triggered.`);
    } catch (err: any) {
      setNotification(`Step Error: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunAll = async () => {
    setIsRunning(true);
    setNotification('Launching automated 7-step insider threat pipeline progression...');
    setScenarioResults([]);
    try {
      for (let s = 1; s <= scenarios.length; s++) {
        setNotification(`Executing Attack Step ${s} / ${scenarios.length}...`);
        const res = await api.runScenarioStep(s);
        setCurrentStep(s);
        setScenarioResults((prev) => [...prev, res]);
        // Realistic step delay for presentation effect
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
      setNotification('Progressive attack scenario completed! High-risk alerts broadcasted & security incident created.');
    } catch (err: any) {
      setNotification(`Execution error: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleResetSeed = async () => {
    setIsRunning(true);
    setNotification('Re-seeding synthetic examination database & baseline profiles...');
    try {
      await api.seedDataset();
      setCurrentStep(0);
      setScenarioResults([]);
      setNotification('Dataset baseline seeded successfully!');
    } catch (err: any) {
      setNotification(`Seed error: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <Zap className="h-5 w-5 text-cyan-400" />
            <span>Interactive Insider Threat Scenario Simulator</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Test and Validate Real-Time AI Detection, Multi-Agent Reasoning & Blockchain Audit Trails
          </p>
        </div>
      </div>
      <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
            <Zap className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <p className="font-bold text-white">How this simulator works:</p>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              This interactive sandbox simulates a real-life insider attack progression (e.g. an exam coordinator attempting off-hours paper downloads, large USB file transfers, and abnormal logins). Click <strong>"Run Full Scenario"</strong> to see each AI agent react and calculate live risk scores in real-time!
            </p>
          </div>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-cyan-950/60 border border-cyan-700/60 text-xs font-mono text-cyan-200 flex items-center justify-between">
          <span>{notification}</span>
          <button
            onClick={onNavigateToIncidents}
            className="underline font-bold hover:text-white ml-4 shrink-0"
          >
            View Generated Incidents &rarr;
          </button>
        </div>
      )}

      {/* Simulator Control Panel */}
      <ScenarioRunner
        scenarios={scenarios}
        currentStep={currentStep}
        isRunning={isRunning}
        onRunStep={handleRunStep}
        onRunAll={handleRunAll}
        onResetSeed={handleResetSeed}
      />

      {/* Progressive Step Forensic Trajectory */}
      <ThreatStepTimeline scenarioResults={scenarioResults} />
    </div>
  );
};
