import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useWebSocket } from './context/WebSocketContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LiveAlertBanner } from './components/layout/LiveAlertBanner';
import { DashboardPage } from './pages/DashboardPage';
import { ThreatSimulatorPage } from './pages/ThreatSimulatorPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { IncidentDetailPage } from './pages/IncidentDetailPage';
import { ActivitiesPage } from './pages/ActivitiesPage';
import { BlockchainAuditPage } from './pages/BlockchainAuditPage';
import { AgentsPage } from './pages/AgentsPage';
import { ExamManagementPage } from './pages/ExamManagementPage';
import { LoginPage } from './pages/LoginPage';
import { RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { recentAlerts } = useWebSocket();
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [selectedBlockchainEventUuid, setSelectedBlockchainEventUuid] = useState<string>('');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center font-mono text-xs text-cyan-400">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Initializing ExamSentinel AI SOC Systems...</span>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLoginSuccess={() => setCurrentPage('dashboard')} />;
  }

  const handleNavigate = (page: string, param?: string) => {
    if (page === 'blockchain' && param) {
      setSelectedBlockchainEventUuid(param);
    }
    if (page === 'incident-detail' && param) {
      setSelectedIncidentId(param);
    }
    setCurrentPage(page);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigate} />;
      case 'simulator':
        return <ThreatSimulatorPage onNavigateToIncidents={() => setCurrentPage('incidents')} />;
      case 'incidents':
        return (
          <IncidentsPage
            onSelectIncident={(id) => {
              setSelectedIncidentId(id);
              setCurrentPage('incident-detail');
            }}
          />
        );
      case 'incident-detail':
        return selectedIncidentId ? (
          <IncidentDetailPage
            incidentId={selectedIncidentId}
            onBack={() => setCurrentPage('incidents')}
            onVerifyBlockchain={(uuid) => handleNavigate('blockchain', uuid)}
          />
        ) : (
          <IncidentsPage onSelectIncident={(id) => { setSelectedIncidentId(id); setCurrentPage('incident-detail'); }} />
        );
      case 'activities':
        return <ActivitiesPage onVerifyBlockchain={(uuid) => handleNavigate('blockchain', uuid)} />;
      case 'blockchain':
        return <BlockchainAuditPage initialEventUuid={selectedBlockchainEventUuid} />;
      case 'agents':
        return <AgentsPage />;
      case 'exams':
        return <ExamManagementPage onVerifyBlockchain={(uuid) => handleNavigate('blockchain', uuid)} />;
      default:
        return <DashboardPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070b14] text-slate-100 font-sans">
      {/* Top Navbar */}
      <Navbar onNavigate={(p) => handleNavigate(p)} />

      {/* Real-time Flashing Security Alert Banner */}
      <LiveAlertBanner
        onInvestigate={(incidentId) => {
          if (incidentId) {
            setSelectedIncidentId(incidentId);
            setCurrentPage('incident-detail');
          } else {
            setCurrentPage('incidents');
          }
        }}
      />

      {/* Main Layout Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentPage={currentPage}
          onNavigate={(p) => handleNavigate(p)}
          activeAlertsCount={recentAlerts.length}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {renderCurrentPage()}
          </div>
        </main>
      </div>
    </div>
  );
};
export default App;
