import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWebSocket } from '../../context/WebSocketContext';
import { useTheme } from '../../context/ThemeContext';
import {
  ShieldAlert,
  Activity,
  Sun,
  Moon,
  UserCheck,
  Radio,
  Lock,
  ChevronDown,
  Sparkles,
  Zap,
  HelpCircle
} from 'lucide-react';
import { GuideModal } from './GuideModal';

interface NavbarProps {
  onNavigate: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const { user, switchDemoUser } = useAuth();
  const { isConnected } = useWebSocket();
  const { theme, toggleTheme } = useTheme();
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  const demoAccounts = [
    { name: 'Agent Sarah Connor (Security Analyst)', email: 'analyst@examsentinel.edu', role: 'Security Analyst' },
    { name: 'Dr. Robert Langdon (QP Manager)', email: 'qp.manager@examsentinel.edu', role: 'Question Paper Manager' },
    { name: 'Dr. Eleanor Vance (Super Admin)', email: 'superadmin@examsentinel.edu', role: 'Super Admin' },
    { name: 'Prof. Marcus Brody (Exam Admin)', email: 'examadmin@examsentinel.edu', role: 'Exam Admin' },
    { name: 'Prof. John Keating (Invigilator)', email: 'invigilator.alpha@examsentinel.edu', role: 'Invigilator' },
    { name: 'Alice Montgomery (Candidate)', email: 'candidate.01@examsentinel.edu', role: 'Candidate' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#070b14]/90 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-6">
          {/* Brand */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onNavigate('dashboard')}
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
              <ShieldAlert className="h-6 w-6 text-white" />
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 animate-ping" />
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-200 to-indigo-300">
                  ExamSentinel
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-700/50">
                  AI SOC
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono tracking-tight">
                Exam Paper Leak & Insider Threat Defense
              </p>
            </div>
          </div>

          {/* Center Live Telemetry Status */}
          <div className="hidden xl:flex items-center gap-4 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <span className="text-slate-300">Live Feed:</span>
              <span className={isConnected ? 'text-emerald-400 font-semibold' : 'text-rose-400'}>
                {isConnected ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-1 text-slate-400">
              <Radio className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
              <span>7 AI Agents Active</span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-1 text-slate-400">
              <Lock className="h-3.5 w-3.5 text-indigo-400" />
              <span>Blockchain: EVM Secured</span>
            </div>
          </div>

          {/* Actions & User Profile */}
          <div className="flex items-center gap-3">
            {/* How It Works Explainer Button */}
            <button
              onClick={() => setIsGuideOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-950 to-blue-950 hover:from-cyan-900 hover:to-blue-900 text-cyan-300 border border-cyan-700/60 text-xs font-semibold shadow-md transition-all hover:scale-105"
            >
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>How It Works?</span>
            </button>

            {/* Quick Demo Button */}
            <button
              onClick={() => onNavigate('simulator')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-md transition-all hover:scale-105"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Threat Simulator</span>
            </button>

            {/* Quick Role Switcher */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 text-xs text-slate-200 transition-colors">
                <UserCheck className="h-3.5 w-3.5 text-cyan-400" />
                <span className="max-w-[120px] truncate">{user?.role || 'Switch Role'}</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:rotate-180 transition-transform" />
              </button>
              <div className="absolute right-0 mt-1 w-64 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 hidden group-hover:block z-50">
                <p className="text-[11px] font-mono text-slate-400 px-2 py-1 uppercase tracking-wider">
                  Switch User Role
                </p>
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.email}
                    onClick={() => switchDemoUser(acc.email)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex flex-col transition-colors ${
                      user?.email === acc.email
                        ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/50'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <span className="font-semibold">{acc.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{acc.email}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-slate-300 hover:text-cyan-400 transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Current User Badge */}
            <div className="hidden lg:flex items-center gap-2.5 pl-2 border-l border-slate-800">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white uppercase shadow-inner">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="text-left leading-tight">
                <p className="text-xs font-semibold text-slate-200">{user?.full_name || 'Security Analyst'}</p>
                <p className="text-[10px] text-cyan-400 font-mono">{user?.role || 'SOC Analyst'}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Guide Modal */}
      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onNavigate={onNavigate}
      />
    </>
  );
};

