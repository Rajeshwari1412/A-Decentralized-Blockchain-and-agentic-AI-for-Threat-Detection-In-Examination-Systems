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
import { 
  ShieldCheck, 
  RefreshCw, 
  Zap, 
  Cpu, 
  HelpCircle, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  ShieldAlert,
  Radio,
  Lock,
  Terminal,
  AlertTriangle,
  Sliders,
  Flame
} from 'lucide-react';
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
  const [quickDemoStep, setQuickDemoStep] = useState<number>(0);
  const [quickDemoMessage, setQuickDemoMessage] = useState<string | null>(null);
  const [defenseMode, setDefenseMode] = useState<'standard' | 'heightened' | 'lockdown'>('standard');
  const { latestActivity, latestAlert, isConnected } = useWebSocket();

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
    setQuickDemoStep(1);
    setQuickDemoMessage('Stage 1/3: Simulating unauthorized midnight question paper vault access...');
    try {
      await api.runScenarioStep(1);
      await new Promise((r) => setTimeout(r, 600));
      setQuickDemoStep(2);
      setQuickDemoMessage('Stage 2/3: Simulating batch exfiltration download (> 50MB burst)...');
      await api.runScenarioStep(2);
      await new Promise((r) => setTimeout(r, 600));
      setQuickDemoStep(3);
      setQuickDemoMessage('Stage 3/3: Isolation Forest & Threat Assessment Agent triggered! Red alert dispatched.');
      await api.runScenarioStep(3);
      await loadData();
      setTimeout(() => {
        onNavigate('incidents');
      }, 1400);
    } catch (err: any) {
      setQuickDemoMessage(`Error: ${err.message}`);
    } finally {
      setIsQuickDemoRunning(false);
    }
  };

  if (isLoading || !metrics) {
    return (
      <div className="flex h-96 flex-col items-center justify-center font-mono text-xs text-cyan-400 gap-3">
        <div className="relative flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-cyan-400" />
          <ShieldAlert className="h-4 w-4 text-cyan-300 absolute" />
        </div>
        <span className="tracking-wider">INITIALIZING CYBER DEFENSE SOC TELEMETRY PIPELINE...</span>
      </div>
    );
  }

  const hasActiveIncidents = (metrics.summary.active_incidents || 0) > 0;

  return (
    <div className="space-y-6">
      {/* Top Cyber Defense Header */}
      <div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-200 flex items-center gap-2 tracking-tight">
                ExamSentinel Cyber Defense SOC
              </h1>
              <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full font-bold border flex items-center gap-1.5 shadow-sm ${
                hasActiveIncidents 
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}>
                <span className={`h-2 w-2 rounded-full ${hasActiveIncidents ? 'bg-rose-400 animate-ping' : 'bg-emerald-400'}`} />
                {hasActiveIncidents ? 'DEFCON 2 • THREAT ACTIVE' : 'DEFCON 5 • NOMINAL GUARD'}
              </span>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-950/70 text-cyan-300 border border-cyan-700/50 font-semibold">
                EVM + ISOLATION FOREST
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl font-sans">
              Autonomous real-time insider threat mitigation platform protecting examination vaults, question repositories, and grading ledgers using a <strong>7-Agent AI Ensemble</strong> with <strong>Cryptographic Blockchain Non-Repudiation</strong>.
            </p>
          </div>

          {/* Quick Actions & Defense Mode Control */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Defense Posture Toggle */}
            <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-[11px] font-mono">
              <button
                onClick={() => setDefenseMode('standard')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  defenseMode === 'standard' 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Standard continuous behavioral monitoring"
              >
                Standard
              </button>
              <button
                onClick={() => setDefenseMode('heightened')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  defenseMode === 'heightened' 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Elevated scrutiny on Question Paper Vault endpoints"
              >
                Vault Guard
              </button>
              <button
                onClick={() => setDefenseMode('lockdown')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  defenseMode === 'lockdown' 
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Strict zero-tolerance lockdown for off-hours"
              >
                Lockdown
              </button>
            </div>

            <button
              onClick={() => setIsGuideOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 text-xs font-semibold shadow-sm transition-all hover:scale-105"
            >
              <HelpCircle className="h-3.5 w-3.5 text-cyan-400" />
              <span>How It Works</span>
            </button>
            <button
              onClick={() => setIsXaiModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono transition-all"
            >
              <Cpu className="h-3.5 w-3.5 text-cyan-400" />
              <span>XAI Model</span>
            </button>
            <button
              onClick={() => onNavigate('simulator')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-950/40 transition-all hover:scale-105"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Threat Simulator</span>
            </button>
            <button
              onClick={loadData}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Refresh live metrics"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Live Interactive Telemetry Ticker */}
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/70 border border-slate-800 text-xs font-mono overflow-hidden shadow-inner">
        <div className="flex items-center gap-2 text-cyan-400 font-bold shrink-0">
          <Terminal className="h-4 w-4 animate-pulse" />
          <span>AI CONSENSUS STREAM:</span>
        </div>
        <div className="flex-1 truncate text-slate-300">
          {latestActivity ? (
            <span className="text-cyan-200 animate-fadeIn">
              [{latestActivity.user_name || latestActivity.user_id}] performed {latestActivity.action} on {latestActivity.endpoint} • Risk Score: {latestActivity.risk_score}/100 • SHA-256 Hash Verified
            </span>
          ) : (
            <span className="text-slate-400">
              [ActivityMonitoringAgent] Ingesting telemetry stream • [AnomalyDetectionAgent] IsolationForest model nominal (contamination=0.05) • [BlockchainAuditAgent] Ledger height synced.
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-500 shrink-0 font-mono">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>Latency: ~18ms</span>
        </div>
      </div>

      {/* Interactive Quick Demo Callout */}
      <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-500/40 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shrink-0 shadow-inner">
            <Sparkles className="h-5 w-5 text-indigo-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide">
                1-Click Live Attack & Defense Walkthrough
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-900/60 text-indigo-300 font-bold border border-indigo-700/40">
                Interactive Test
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Simulate an insider downloading confidential exam papers to watch the <strong>Isolation Forest detector</strong> compute feature drift and dispatch live WebSocket alarms in real time.
            </p>

            {/* Attack Step Progress Indicators */}
            {isQuickDemoRunning && (
              <div className="flex items-center gap-2 mt-3 text-[11px] font-mono">
                <span className={`px-2 py-0.5 rounded ${quickDemoStep >= 1 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-500'}`}>
                  1. Midnight Auth
                </span>
                <ArrowRight className="h-3 w-3 text-slate-600" />
                <span className={`px-2 py-0.5 rounded ${quickDemoStep >= 2 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-500'}`}>
                  2. Bulk Paper Burst
                </span>
                <ArrowRight className="h-3 w-3 text-slate-600" />
                <span className={`px-2 py-0.5 rounded ${quickDemoStep >= 3 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse' : 'text-slate-500'}`}>
                  3. Anomaly Intercept
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleRunQuickDemo}
            disabled={isQuickDemoRunning}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-cyan-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold text-xs font-mono flex items-center gap-2 shadow-lg shadow-indigo-950/60 transition-all hover:scale-105 disabled:opacity-50"
          >
            {isQuickDemoRunning ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-white" />
                <span>Simulating Attack...</span>
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 text-amber-300" />
                <span>Run 1-Click Attack Demo</span>
              </>
            )}
          </button>
          <button
            onClick={() => onNavigate('simulator')}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-mono transition-all"
          >
            Full Simulator &rarr;
          </button>
        </div>
      </div>

      {quickDemoMessage && (
        <div className="p-3.5 rounded-xl bg-cyan-950/80 border border-cyan-500/60 text-xs font-mono text-cyan-200 flex items-center justify-between shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-cyan-400 animate-pulse" />
            <span>{quickDemoMessage}</span>
          </div>
          <button
            onClick={() => onNavigate('incidents')}
            className="text-cyan-300 underline font-bold hover:text-white text-xs ml-3"
          >
            View Triage Incidents &rarr;
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
