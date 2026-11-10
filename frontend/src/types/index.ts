export type RoleType = 
  | 'Super Admin'
  | 'Exam Admin'
  | 'Security Analyst'
  | 'Question Paper Manager'
  | 'Invigilator'
  | 'Candidate';

export type RiskTier = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: RoleType;
  department: string;
  is_active: boolean;
  is_suspended: boolean;
  risk_tier: RiskTier;
  created_at: string;
}

export interface ActivityEvent {
  id: string;
  event_uuid: string;
  user_id: string;
  user_name?: string;
  user_role?: string;
  event_type: string;
  severity: string;
  resource_type: string;
  resource_id: string;
  ip_address: string;
  device_fingerprint: string;
  location: string;
  is_after_hours: boolean;
  payload_json: string;
  sha256_hash: string;
  is_blockchain_anchored: boolean;
  blockchain_tx_hash?: string;
  timestamp: string;
}

export interface IncidentEvent {
  id: string;
  sequence_order: number;
  correlation_reason: string;
  event: ActivityEvent;
}

export interface SecurityAlert {
  id: string;
  alert_code: string;
  incident_id?: string;
  user_id: string;
  user_name?: string;
  title: string;
  message: string;
  severity: string;
  status: string;
  is_acknowledged: boolean;
  triggered_at: string;
}

export interface SecurityIncident {
  id: string;
  incident_code: string;
  title: string;
  severity: string;
  status: 'OPEN' | 'UNDER_INVESTIGATION' | 'CONTAINED' | 'RESOLVED' | 'FALSE_POSITIVE';
  user_id: string;
  user_name?: string;
  user_role?: string;
  user_department?: string;
  risk_score: number;
  threat_category: string;
  mitre_tactics: string[];
  root_cause_hypothesis: string;
  evidence_summary: string;
  suggested_action: string;
  analyst_notes: string;
  created_at: string;
  updated_at: string;
  timeline?: ActivityEvent[];
  alerts?: SecurityAlert[];
}

export interface BlockchainRecord {
  id: string;
  event_uuid: string;
  event_type: string;
  user_id: string;
  payload_hash: string;
  block_number: number;
  transaction_hash: string;
  contract_address: string;
  verification_status: string;
  anchored_at: string;
}

export interface BlockchainVerificationResult {
  event_uuid: string;
  is_valid: boolean;
  status: 'VERIFIED_AUTHENTIC' | 'TAMPER_DETECTED' | 'NOT_ANCHORED';
  ledger_hash: string;
  current_computed_hash: string;
  block_number: number;
  transaction_hash: string;
  anchored_at?: string;
  discrepancy_details?: string;
}

export interface AgentMetadata {
  id: string;
  name: string;
  role: string;
  description: string;
  status: 'OPERATIONAL' | 'DEGRADED' | 'OFFLINE';
  model: string;
}

export interface AgentRun {
  id: string;
  agent_name: string;
  status: string;
  trigger_event: string;
  input_summary: string;
  output_summary: string;
  confidence_score: number;
  execution_time_ms: number;
  created_at: string;
}

export interface Examination {
  id: string;
  exam_code: string;
  title: string;
  subject: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  total_marks: number;
  passing_marks: number;
  status: string;
  question_count?: number;
  candidate_count?: number;
}

export interface QuestionPaper {
  id: string;
  exam_id: string;
  paper_code: string;
  encryption_hash: string;
  watermark_tag: string;
  download_count: number;
  max_allowed_downloads: number;
  status: string;
  created_at: string;
}

export interface ExamQuestionPublic {
  id: string;
  question_text: string;
  question_type: string;
  options: string[];
  marks: number;
  difficulty: string;
}

export interface QuestionResultDetail {
  question_id: string;
  question_text: string;
  selected_option: string | null;
  correct_option: string;
  is_correct: boolean;
  marks_earned: number;
  max_marks: number;
}

export interface ExamSubmissionOut {
  submission_uuid: string;
  certificate_uuid: string;
  exam_id: string;
  exam_code: string;
  exam_title: string;
  candidate_id: string;
  candidate_name: string;
  candidate_email: string;
  score: number;
  total_marks: number;
  percentage: number;
  grade: string;
  passed: boolean;
  tab_switches: number;
  submission_hash: string;
  is_blockchain_anchored: boolean;
  blockchain_tx_hash?: string;
  blockchain_block_number?: number;
  created_at: string;
  results_breakdown?: QuestionResultDetail[];
}

export interface CertificateVerificationResponse {
  certificate_uuid: string;
  submission_uuid?: string;
  is_valid: boolean;
  status: 'VERIFIED_AUTHENTIC' | 'TAMPER_DETECTED' | 'NOT_ANCHORED' | 'NOT_FOUND';
  candidate_name: string;
  candidate_email: string;
  exam_title: string;
  exam_code: string;
  score: number;
  total_marks: number;
  percentage: number;
  grade: string;
  passed: boolean;
  ledger_hash: string;
  current_computed_hash: string;
  transaction_hash: string;
  block_number: number;
  anchored_at?: string;
  discrepancy_details?: string;
}

export interface CreateExamQuestionInput {
  question_text: string;
  question_type: string;
  options: string[];
  correct_answer: string;
  marks: number;
  difficulty: string;
}

export interface CreateExamInput {
  exam_code: string;
  title: string;
  subject: string;
  duration_minutes: number;
  total_marks: number;
  passing_marks: number;
  questions: CreateExamQuestionInput[];
}

export interface ScenarioStep {
  step: number;
  title: string;
  event_type: string;
  description: string;
  is_anomaly_expected: boolean;
  expected_risk: string;
}

export interface DashboardMetrics {
  summary: {
    total_users: number;
    active_exams: number;
    total_events: number;
    active_incidents: number;
    high_risk_users: number;
    active_alerts: number;
    blockchain_anchors: number;
    blockchain_status: string;
  };
  risk_distribution: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
  };
  anomaly_trend: Array<{
    id: string;
    score: number;
    is_anomaly: boolean;
    time: string;
  }>;
  radar_data: Array<{
    dimension: string;
    value: number;
    benchmark: number;
  }>;
}
