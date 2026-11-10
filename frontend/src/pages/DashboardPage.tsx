import React, { useEffect, useState } from 'react';
import { MetricCards } from '../components/dashboard/MetricCards';
import { AnomalyTrendChart } from '../components/dashboard/AnomalyTrendChart';
import { ThreatRadarChart } from '../components/dashboard/ThreatRadarChart';
import { RiskDistributionChart } from '../components/dashboard/RiskDistributionChart';
import { AgentNetworkGraph } from '../components/dashboard/AgentNetworkGraph';
import { RecentEventsTable } from '../components/dashboard/RecentEventsTable';
import { NetworkTopologyMap } from '../components/dashboard/NetworkTopologyMap';
import { FeatureAttributionModal } from '../components/dashboard/FeatureAttributionModal';
import { GuideModal } from '../components/layout/GuideModal';
import { api } from '../services/api';
import { DashboardMetrics, ActivityEvent } from '../types';
import { ShieldCheck, RefreshCw, Zap, Cpu, HelpCircle, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { useWebSocket } from '../context/WebSocketContext';

interface DashboardPageProps {
  onNavigate: (page: string, param?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [isXaiModalOpen, setIsXaiModalOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [selectedEventData, setSelectedEventData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isQuickDemoRunning, setIsQuickDemoRunning] = useState<boolean>(false);
  const [quickDemoMessage, setQuickDemoMessage] = useState<string | null>(null);
  const { latestActivity, latestAlert } = useWebSocket();

  const loadData = async () => {
    try {
      const [m, evts] = await Promise.all([
        api.getDashboardMetrics(),
        api.getActivities({ limit: 12 })
      ]);
      setMetrics(m);
      setEvents(evts);
    } catch (err) {
      console.error('Error fetching dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (latestActivity) {
      setEvents((prev) => [latestActivity, ...prev.slice(0, 11)]);
      loadData();
    }
  }, [latestActivity, latestAlert]);

  const handleRunQuickDemo = async () => {
    setIsQuickDemoRunning(true);
    setQuickDemoMessage('Simulating unauthorized late-night question paper download...');
    try {
      await api.runScenarioStep(1);
      await new Promise((r) => setTimeout(r, 400));
      setQuickDemoMessage('Simulating off-hours USB copy attempt (Threat Escalation)...');
      await api.runScenarioStep(2);
      await new Promise((r) => setTimeout(r, 400));
      await api.runScenarioStep(3);
      setQuickDemoMessage('Attack simulated! AI detected anomalies & created security incident.');
      await loadData();
      setTimeout(() => {
        onNavigate('incidents');
      }, 1200);
    } catch (err: any) {
      setQuickDemoMessage(`Error: ${err.message}`);
    } finally {
      setIsQuickDemoRunning(false);
    }
  };

  if (isLoading || !metrics) {
    return (
      <div className="flex h-96 items-center justify-center font-mono text-xs text-cyan-400">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Initializing Security Operations Center Telemetry Stream...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
              ExamSentinel Cyber Defense SOC
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
              EVM + ISOLATION FOREST ONLINE
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
            Real-time proactive defense system protecting examination question papers from insider leaks, unauthorized downloads, and staff tampering using <strong>7 AI Agents</strong> and an <strong>Immutable Blockchain Ledger</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setIsGuideOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 text-xs font-semibold transition-all hover:scale-105"
          >
            <HelpCircle className="h-4 w-4 text-cyan-400" />
            <span>How It Works?</span>
          </button>
          <button
            onClick={() => setIsXaiModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono transition-all"
          >
            <Cpu className="h-4 w-4 text-cyan-400" />
            <span>Explainable AI (XAI)</span>
          </button>
          <button
            onClick={() => onNavigate('simulator')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-950 transition-all hover:scale-105"
          >
            <Zap className="h-4 w-4" />
            <span>Threat Simulator</span>
          </button>
          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Refresh metrics"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Quick Interactive Demo Callout */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white flex items-center gap-2">
              <span>Quick Test & Demonstration Walkthrough</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-900/60 text-indigo-300">
                1-Click Test
              </span>
            </h2>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Simulate an insider attempting to leak an exam paper to see live AI threat alerts, anomaly scoring, and blockchain verification in action.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleRunQuickDemo}
            disabled={isQuickDemoRunning}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs font-mono flex items-center gap-2 shadow-lg transition-all hover:scale-105 disabled:opacity-50"
          >
            {isQuickDemoRunning ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Simulating...</span>
              </>
            ) : (
              <>
                <Zap className="h-3.5 w-3.5 text-amber-300" />
                <span>Run 1-Click Attack Demo</span>
              </>
            )}
          </button>
          <button
            onClick={() => onNavigate('simulator')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-mono"
          >
            Full Simulator &rarr;
          </button>
        </div>
      </div>

      {quickDemoMessage && (
        <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-600/50 text-xs font-mono text-cyan-200 flex items-center justify-between animate-fadeIn">
          <span>{quickDemoMessage}</span>
          <button
            onClick={() => onNavigate('incidents')}
            className="text-cyan-400 underline font-bold hover:text-cyan-200 text-xs ml-3"
          >
            View Incidents &rarr;
          </button>
        </div>
      )}

      {/* Metric Cards Row */}
      <MetricCards metrics={metrics.summary} />

      {/* Visual Network Defense Topology */}
      <NetworkTopologyMap />

      {/* Agent Coordination Pipeline */}
      <AgentNetworkGraph />

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ThreatRadarChart data={metrics.radar_data} />
        </div>
        <div className="lg:col-span-1">
          <AnomalyTrendChart data={metrics.anomaly_trend} />
        </div>
        <div className="lg:col-span-1">
          <RiskDistributionChart distribution={metrics.risk_distribution} />
        </div>
      </div>

      {/* Real-Time Events Telemetry Table */}
      <RecentEventsTable
        events={events}
        onVerifyBlockchain={(uuid) => onNavigate('blockchain', uuid)}
      />

      {/* Feature Attribution XAI Modal */}
      <FeatureAttributionModal
        isOpen={isXaiModalOpen}
        onClose={() => setIsXaiModalOpen(false)}
        eventData={selectedEventData}
      />

      {/* Guide Modal */}
      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onNavigate={onNavigate}
      />
    </div>
  );
};

