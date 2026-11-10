import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  switchDemoUser: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('examsentinel_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const u = await api.getCurrentUser();
          setUser(u);
        } catch (err) {
          console.warn('Session expired, logging in as default Security Analyst');
          await autoLoginDefault();
        }
      } else {
        await autoLoginDefault();
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const autoLoginDefault = async () => {
    try {
      const res = await api.login('analyst@examsentinel.edu', 'Sentinel@2026');
      localStorage.setItem('examsentinel_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
    } catch (err) {
      console.warn('Backend offline or not yet initialized');
    }
  };

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    localStorage.setItem('examsentinel_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
  };

  const switchDemoUser = async (email: string) => {
    await login(email, 'Sentinel@2026');
  };

  const logout = () => {
    localStorage.removeItem('examsentinel_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, switchDemoUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
