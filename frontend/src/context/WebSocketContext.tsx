import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { SecurityAlert, ActivityEvent } from '../types';

interface WebSocketContextType {
  isConnected: boolean;
  latestAlert: SecurityAlert | null;
  recentAlerts: SecurityAlert[];
  latestActivity: ActivityEvent | null;
  agentOrchestrations: any[];
  clearAlerts: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [latestAlert, setLatestAlert] = useState<SecurityAlert | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<SecurityAlert[]>([]);
  const [latestActivity, setLatestActivity] = useState<ActivityEvent | null>(null);
  const [agentOrchestrations, setAgentOrchestrations] = useState<any[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let reconnectTimeout: any;

    const connectWS = () => {
      try {
        const socket = new WebSocket('ws://localhost:8000/api/v1/ws');
        wsRef.current = socket;

        socket.onopen = () => {
          setIsConnected(true);
          console.log('[WebSocket] Connected to ExamSentinel AI Real-Time Feed');
        };

        socket.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            if (parsed.type === 'SECURITY_ALERT') {
              const alert = parsed.data;
              setLatestAlert(alert);
              setRecentAlerts((prev) => [alert, ...prev.slice(0, 19)]);
            } else if (parsed.type === 'ACTIVITY_EVENT') {
              setLatestActivity(parsed.data);
            } else if (parsed.type === 'AGENT_ORCHESTRATION_COMPLETED') {
              setAgentOrchestrations((prev) => [parsed.data, ...prev.slice(0, 14)]);
            }
          } catch (e) {
            console.error('Error parsing WS message', e);
          }
        };

        socket.onclose = () => {
          setIsConnected(false);
          reconnectTimeout = setTimeout(connectWS, 3000);
        };

        socket.onerror = (err) => {
          console.warn('[WebSocket] Warning:', err);
          socket.close();
        };
      } catch (err) {
        setIsConnected(false);
        reconnectTimeout = setTimeout(connectWS, 3000);
      }
    };

    connectWS();

    return () => {
      clearTimeout(reconnectTimeout);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const clearAlerts = () => {
    setLatestAlert(null);
    setRecentAlerts([]);
  };

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        latestAlert,
        recentAlerts,
        latestActivity,
        agentOrchestrations,
        clearAlerts,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) throw new Error('useWebSocket must be used within a WebSocketProvider');
  return context;
};
