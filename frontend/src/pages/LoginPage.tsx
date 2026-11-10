import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Lock, Mail, ArrowRight, UserCheck } from 'lucide-react';

export const LoginPage: React.FC<{ onLoginSuccess: () => void }> = ({ onLoginSuccess }) => {
  const { login, switchDemoUser } = useAuth();
  const [email, setEmail] = useState<string>('analyst@examsentinel.edu');
  const [password, setPassword] = useState<string>('Sentinel@2026');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid login credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogins = [
    { role: 'Security Analyst', email: 'analyst@examsentinel.edu' },
    { role: 'Question Paper Manager', email: 'qp.manager@examsentinel.edu' },
    { role: 'Super Admin', email: 'superadmin@examsentinel.edu' },
    { role: 'Invigilator', email: 'invigilator.alpha@examsentinel.edu' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#070b14] relative overflow-hidden">
      {/* Subtle Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30 text-white mb-2">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">ExamSentinel AI</h1>
          <p className="text-xs text-slate-400 font-mono">
            Decentralized Blockchain & Agentic Threat Detection SOC
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs font-mono text-rose-200 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-slate-400 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs font-mono flex items-center justify-center gap-2 shadow-lg shadow-cyan-950 transition-all hover:scale-[1.02]"
          >
            <span>{isLoading ? 'Authenticating...' : 'Sign In to Security SOC'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Quick Demo Logins */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          <p className="text-[11px] font-mono text-slate-500 text-center uppercase tracking-wider">
            Quick Demo 1-Click Access
          </p>
          <div className="grid grid-cols-2 gap-2">
            {quickLogins.map((q) => (
              <button
                key={q.email}
                onClick={async () => {
                  await switchDemoUser(q.email);
                  onLoginSuccess();
                }}
                className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 font-mono text-left transition-colors"
              >
                <div className="font-semibold text-cyan-400 truncate">{q.role}</div>
                <div className="text-[9px] text-slate-500 truncate">{q.email}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
