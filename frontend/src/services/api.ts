import axios from 'axios';
import {
  User,
  ActivityEvent,
  SecurityIncident,
  SecurityAlert,
  BlockchainRecord,
  BlockchainVerificationResult,
  AgentMetadata,
  AgentRun,
  Examination,
  QuestionPaper,
  ScenarioStep,
  DashboardMetrics,
  ExamQuestionPublic,
  ExamSubmissionOut,
  CertificateVerificationResponse,
  CreateExamInput
} from '../types';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('examsentinel_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data;
  },
  getCurrentUser: async (): Promise<User> => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },
  getUsers: async (): Promise<User[]> => {
    const res = await apiClient.get('/auth/users');
    return res.data;
  },

  // Dashboard Telemetry
  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    const res = await apiClient.get('/dashboard/metrics');
    return res.data;
  },

  // Activities & Monitoring
  getActivities: async (params?: { user_id?: string; severity?: string; event_type?: string; limit?: number }): Promise<ActivityEvent[]> => {
    const res = await apiClient.get('/activities', { params });
    return res.data;
  },
  ingestActivity: async (data: any) => {
    const res = await apiClient.post('/activities/ingest', data);
    return res.data;
  },
  getUserProfile: async (userId: string) => {
    const res = await apiClient.get(`/activities/profile/${userId}`);
    return res.data;
  },

  // Incidents & Alerts
  getIncidents: async (params?: { status?: string; severity?: string }): Promise<SecurityIncident[]> => {
    const res = await apiClient.get('/incidents', { params });
    return res.data;
  },
  getIncidentDetail: async (incidentId: string): Promise<SecurityIncident> => {
    const res = await apiClient.get(`/incidents/${incidentId}`);
    return res.data;
  },
  takeAnalystAction: async (incidentId: string, action: { status?: string; analyst_notes?: string; quarantine_user?: boolean; lock_question_paper?: boolean }) => {
    const res = await apiClient.post(`/incidents/${incidentId}/action`, action);
    return res.data;
  },
  getAlerts: async (): Promise<SecurityAlert[]> => {
    const res = await apiClient.get('/incidents/alerts');
    return res.data;
  },

  // Blockchain Audit Ledger
  getBlockchainRecords: async (): Promise<BlockchainRecord[]> => {
    const res = await apiClient.get('/blockchain/records');
    return res.data;
  },
  verifyEventHash: async (eventUuid: string, claimedHash?: string): Promise<BlockchainVerificationResult> => {
    const res = await apiClient.post('/blockchain/verify', { event_uuid: eventUuid, claimed_hash: claimedHash });
    return res.data;
  },
  simulateDatabaseTamper: async (eventUuid: string) => {
    const res = await apiClient.post(`/blockchain/tamper-demo/${eventUuid}`);
    return res.data;
  },

  // Agents
  getAgentsStatus: async (): Promise<AgentMetadata[]> => {
    const res = await apiClient.get('/agents/status');
    return res.data;
  },
  getAgentRuns: async (): Promise<AgentRun[]> => {
    const res = await apiClient.get('/agents/runs');
    return res.data;
  },

  // Exams & Question Papers
  getExams: async (): Promise<Examination[]> => {
    const res = await apiClient.get('/exams');
    return res.data;
  },
  getExamDetail: async (examId: string) => {
    const res = await apiClient.get(`/exams/${examId}`);
    return res.data;
  },
  getPublicExamQuestions: async (examId: string): Promise<ExamQuestionPublic[]> => {
    const res = await apiClient.get(`/exams/${examId}/questions-public`);
    return res.data;
  },
  submitExam: async (examId: string, answers: Record<string, string>, tabSwitches: number = 0): Promise<ExamSubmissionOut> => {
    const res = await apiClient.post(`/exams/${examId}/submit`, {
      exam_id: examId,
      answers,
      tab_switches: tabSwitches
    });
    return res.data;
  },
  createExamWithQuestions: async (data: CreateExamInput) => {
    const res = await apiClient.post('/exams/create-with-questions', data);
    return res.data;
  },
  getMySubmissions: async (): Promise<ExamSubmissionOut[]> => {
    const res = await apiClient.get('/exams/submissions/my');
    return res.data;
  },
  getAllSubmissions: async (): Promise<ExamSubmissionOut[]> => {
    const res = await apiClient.get('/exams/submissions/all');
    return res.data;
  },
  verifyCertificate: async (certificateUuid: string): Promise<CertificateVerificationResponse> => {
    const res = await apiClient.get(`/exams/submissions/verify/${certificateUuid}`);
    return res.data;
  },
  simulateSubmissionTamper: async (submissionUuid: string) => {
    const res = await apiClient.post(`/exams/submissions/${submissionUuid}/tamper-demo`);
    return res.data;
  },
  getQuestionPaperVault: async (): Promise<QuestionPaper[]> => {
    const res = await apiClient.get('/exams/papers/vault');
    return res.data;
  },
  accessQuestionPaper: async (paperId: string, action: 'VIEW' | 'DOWNLOAD') => {
    const res = await apiClient.post(`/exams/papers/access/${paperId}?action=${action}`);
    return res.data;
  },
  getLiveExamSessions: async () => {
    const res = await apiClient.get('/exams/sessions/live');
    return res.data;
  },
  takeProctorAction: async (sessionId: string, action: 'WARN' | 'TERMINATE' | 'CLEAR') => {
    const res = await apiClient.post(`/exams/sessions/${sessionId}/proctor-action?action=${action}`);
    return res.data;
  },

  // Threat Simulator
  getScenarioCatalog: async (): Promise<ScenarioStep[]> => {
    const res = await apiClient.get('/simulation/scenarios');
    return res.data;
  },
  seedDataset: async () => {
    const res = await apiClient.post('/simulation/seed');
    return res.data;
  },
  runScenarioStep: async (stepNumber: number) => {
    const res = await apiClient.post(`/simulation/step/${stepNumber}`);
    return res.data;
  },
  runAllScenarioSteps: async () => {
    const res = await apiClient.post('/simulation/run-all');
    return res.data;
  },
};
