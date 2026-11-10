from datetime import datetime, timezone
import uuid
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

def gen_uuid():
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="Candidate") # Super Admin, Exam Admin, Security Analyst, Question Paper Manager, Invigilator, Candidate
    department = Column(String(100), default="Examination Division")
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_suspended = Column(Boolean, default=False)
    risk_tier = Column(String(20), default="LOW") # LOW, MEDIUM, HIGH, CRITICAL
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    # Relationships
    activities = relationship("ActivityEvent", back_populates="user", cascade="all, delete-orphan")
    profile = relationship("BehaviorProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    incidents = relationship("SecurityIncident", back_populates="user", foreign_keys="SecurityIncident.user_id")
    risk_scores = relationship("RiskScore", back_populates="user", cascade="all, delete-orphan")
    devices = relationship("Device", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    submissions = relationship("ExamSubmission", back_populates="candidate", cascade="all, delete-orphan")

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(String(255))
    permissions_json = Column(Text, default="[]")

class Examination(Base):
    __tablename__ = "examinations"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    exam_code = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    subject = Column(String(100), nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    duration_minutes = Column(Integer, default=180)
    total_marks = Column(Integer, default=100)
    passing_marks = Column(Integer, default=40)
    status = Column(String(30), default="SCHEDULED") # DRAFT, SCHEDULED, ONGOING, COMPLETED, CANCELLED, LOCKED
    created_by_id = Column(String(36), ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), default=utc_now)

    questions = relationship("Question", back_populates="examination", cascade="all, delete-orphan")
    question_papers = relationship("QuestionPaper", back_populates="examination", cascade="all, delete-orphan")
    candidates = relationship("Candidate", back_populates="examination", cascade="all, delete-orphan")
    exam_sessions = relationship("ExamSession", back_populates="examination", cascade="all, delete-orphan")
    submissions = relationship("ExamSubmission", back_populates="examination", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    exam_id = Column(String(36), ForeignKey("examinations.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(String(30), default="MCQ") # MCQ, SUBJECTIVE, CODING
    options_json = Column(Text, default="[]")
    correct_answer = Column(Text, nullable=True)
    marks = Column(Integer, default=5)
    difficulty = Column(String(20), default="MEDIUM") # EASY, MEDIUM, HARD
    created_at = Column(DateTime(timezone=True), default=utc_now)

    examination = relationship("Examination", back_populates="questions")

class QuestionPaper(Base):
    __tablename__ = "question_papers"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    exam_id = Column(String(36), ForeignKey("examinations.id"), nullable=False)
    paper_code = Column(String(50), unique=True, nullable=False)
    encryption_hash = Column(String(64), nullable=False)
    watermark_tag = Column(String(100), nullable=False)
    download_count = Column(Integer, default=0)
    max_allowed_downloads = Column(Integer, default=3)
    status = Column(String(30), default="ENCRYPTED") # DRAFT, ENCRYPTED, RELEASED, ARCHIVED, COMPROMISED_LOCK
    file_uri = Column(String(255), default="")
    created_by_id = Column(String(36), ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), default=utc_now)

    examination = relationship("Examination", back_populates="question_papers")

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    enrollment_no = Column(String(50), unique=True, nullable=False)
    exam_id = Column(String(36), ForeignKey("examinations.id"), nullable=False)
    seat_number = Column(String(30), default="")
    status = Column(String(30), default="REGISTERED") # REGISTERED, SEATED, SUBMITTED, DISQUALIFIED
    registered_at = Column(DateTime(timezone=True), default=utc_now)

    examination = relationship("Examination", back_populates="candidates")

class ExamSession(Base):
    __tablename__ = "exam_sessions"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    exam_id = Column(String(36), ForeignKey("examinations.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    start_time = Column(DateTime(timezone=True), default=utc_now)
    end_time = Column(DateTime(timezone=True), nullable=True)
    ip_address = Column(String(45), default="127.0.0.1")
    device_fingerprint = Column(String(64), default="")
    status = Column(String(30), default="ACTIVE") # ACTIVE, COMPLETED, TERMINATED, FLAGGED
    anomaly_flag = Column(Boolean, default=False)

    examination = relationship("Examination", back_populates="exam_sessions")

class ExamSubmission(Base):
    __tablename__ = "exam_submissions"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    submission_uuid = Column(String(64), unique=True, index=True, nullable=False)
    exam_id = Column(String(36), ForeignKey("examinations.id"), nullable=False)
    candidate_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    answers_json = Column(Text, default="{}") # {question_id: answer_text}
    score = Column(Float, default=0.0)
    total_marks = Column(Float, default=100.0)
    percentage = Column(Float, default=0.0)
    grade = Column(String(10), default="P")
    passed = Column(Boolean, default=True)
    tab_switches = Column(Integer, default=0)
    submission_hash = Column(String(64), nullable=False)
    is_blockchain_anchored = Column(Boolean, default=False)
    blockchain_tx_hash = Column(String(66), nullable=True)
    blockchain_block_number = Column(Integer, nullable=True)
    certificate_uuid = Column(String(64), unique=True, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    examination = relationship("Examination", back_populates="submissions")
    candidate = relationship("User", back_populates="submissions")

class ActivityEvent(Base):
    __tablename__ = "activity_events"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    event_uuid = Column(String(64), unique=True, index=True, nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    event_type = Column(String(60), nullable=False, index=True) 
    # LOGIN, FAILED_LOGIN, LOGOUT, IP_CHANGE, NEW_DEVICE, QP_VIEW, QP_DOWNLOAD, BULK_DOWNLOAD, 
    # PRIVILEGE_ESCALATION, EXPORT_DATA, AFTER_HOURS_ACCESS, PERMISSION_MODIFICATION
    severity = Column(String(20), default="INFO") # INFO, LOW, MEDIUM, HIGH, CRITICAL
    resource_type = Column(String(50), default="SYSTEM") # EXAM, QUESTION_PAPER, USER, SYSTEM
    resource_id = Column(String(100), default="")
    ip_address = Column(String(45), nullable=False, default="127.0.0.1")
    device_fingerprint = Column(String(64), default="")
    user_agent = Column(String(255), default="")
    location = Column(String(100), default="Main Campus")
    is_after_hours = Column(Boolean, default=False)
    payload_json = Column(Text, default="{}")
    sha256_hash = Column(String(64), nullable=False)
    is_blockchain_anchored = Column(Boolean, default=False)
    blockchain_tx_hash = Column(String(66), nullable=True)
    timestamp = Column(DateTime(timezone=True), default=utc_now, index=True)

    user = relationship("User", back_populates="activities")
    anomaly_result = relationship("AnomalyResult", back_populates="event", uselist=False)

class BehaviorProfile(Base):
    __tablename__ = "behavior_profiles"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    typical_login_start_hour = Column(Integer, default=9) # 9 AM
    typical_login_end_hour = Column(Integer, default=18)  # 6 PM
    known_ips_json = Column(Text, default="[]")
    known_devices_json = Column(Text, default="[]")
    avg_daily_requests = Column(Float, default=45.0)
    avg_downloads_per_session = Column(Float, default=1.0)
    total_violations = Column(Integer, default=0)
    privilege_escalation_risk = Column(Float, default=0.0)
    baseline_variance = Column(Float, default=0.1)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="profile")

class AnomalyResult(Base):
    __tablename__ = "anomaly_results"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    event_id = Column(String(36), ForeignKey("activity_events.id"), unique=True, nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    raw_isolation_forest_score = Column(Float, default=0.0)
    normalized_anomaly_score = Column(Float, default=0.0) # 0 to 100
    is_anomaly = Column(Boolean, default=False)
    feature_contributions_json = Column(Text, default="{}")
    model_version = Column(String(50), default="IsolationForest-v1.4")
    created_at = Column(DateTime(timezone=True), default=utc_now)

    event = relationship("ActivityEvent", back_populates="anomaly_result")

class RiskScore(Base):
    __tablename__ = "risk_scores"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    overall_risk_score = Column(Float, default=0.0) # 0 to 100
    velocity_score = Column(Float, default=0.0)
    privilege_score = Column(Float, default=0.0)
    exfiltration_score = Column(Float, default=0.0)
    temporal_score = Column(Float, default=0.0)
    behavioral_score = Column(Float, default=0.0)
    risk_tier = Column(String(20), default="LOW") # LOW (0-30), MEDIUM (31-60), HIGH (61-80), CRITICAL (81-100)
    risk_factors_json = Column(Text, default="[]")
    calculated_at = Column(DateTime(timezone=True), default=utc_now)

    user = relationship("User", back_populates="risk_scores")

class SecurityIncident(Base):
    __tablename__ = "security_incidents"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    incident_code = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    severity = Column(String(20), default="MEDIUM") # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String(30), default="OPEN") # OPEN, UNDER_INVESTIGATION, CONTAINED, RESOLVED, FALSE_POSITIVE
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    risk_score = Column(Float, default=0.0)
    threat_category = Column(String(100), default="Potential Insider Threat") 
    # Data Exfiltration, Privilege Escalation, Credential Compromise, Unauthorized QP Access
    mitre_tactics_json = Column(Text, default="[]") # e.g. ["Initial Access (T1078)", "Exfiltration (T1567)"]
    root_cause_hypothesis = Column(Text, default="")
    evidence_summary = Column(Text, default="")
    suggested_action = Column(Text, default="")
    analyst_notes = Column(Text, default="")
    assigned_to_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    user = relationship("User", foreign_keys=[user_id], back_populates="incidents")
    assigned_to = relationship("User", foreign_keys=[assigned_to_id])
    incident_events = relationship("IncidentEvent", back_populates="incident", cascade="all, delete-orphan")
    alerts = relationship("SecurityAlert", back_populates="incident", cascade="all, delete-orphan")

class IncidentEvent(Base):
    __tablename__ = "incident_events"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    incident_id = Column(String(36), ForeignKey("security_incidents.id"), nullable=False)
    event_id = Column(String(36), ForeignKey("activity_events.id"), nullable=False)
    sequence_order = Column(Integer, default=1)
    correlation_reason = Column(String(255), default="")

    incident = relationship("SecurityIncident", back_populates="incident_events")
    event = relationship("ActivityEvent")

class SecurityAlert(Base):
    __tablename__ = "security_alerts"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    alert_code = Column(String(50), unique=True, index=True, nullable=False)
    incident_id = Column(String(36), ForeignKey("security_incidents.id"), nullable=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String(20), default="HIGH") # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String(30), default="NEW") # NEW, ACKNOWLEDGED, DISMISSED
    is_acknowledged = Column(Boolean, default=False)
    triggered_at = Column(DateTime(timezone=True), default=utc_now)

    incident = relationship("SecurityIncident", back_populates="alerts")
    user = relationship("User")

class AgentRun(Base):
    __tablename__ = "agent_runs"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    agent_name = Column(String(100), nullable=False) # ActivityMonitoringAgent, BehavioralAnalysisAgent, etc.
    status = Column(String(30), default="SUCCESS") # SUCCESS, WARNING, ALERT, FAILED
    trigger_event = Column(String(100), default="STREAM_EVENT")
    input_summary = Column(Text, default="")
    output_summary = Column(Text, default="")
    confidence_score = Column(Float, default=0.95)
    execution_time_ms = Column(Float, default=15.0)
    created_at = Column(DateTime(timezone=True), default=utc_now)

class BlockchainRecord(Base):
    __tablename__ = "blockchain_records"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    event_uuid = Column(String(64), unique=True, index=True, nullable=False)
    event_type = Column(String(60), nullable=False)
    user_id = Column(String(36), nullable=False)
    payload_hash = Column(String(64), nullable=False)
    block_number = Column(Integer, default=1001)
    transaction_hash = Column(String(66), nullable=False)
    contract_address = Column(String(42), nullable=False)
    verification_status = Column(String(30), default="VERIFIED") # VERIFIED, MISMATCH_DETECTED, PENDING
    anchored_at = Column(DateTime(timezone=True), default=utc_now)

class Device(Base):
    __tablename__ = "devices"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    device_fingerprint = Column(String(64), nullable=False)
    os = Column(String(50), default="Windows 11")
    browser = Column(String(50), default="Chrome")
    last_ip = Column(String(45), default="127.0.0.1")
    is_trusted = Column(Boolean, default=True)
    first_seen = Column(DateTime(timezone=True), default=utc_now)
    last_seen = Column(DateTime(timezone=True), default=utc_now)

    user = relationship("User", back_populates="devices")

class Session(Base):
    __tablename__ = "sessions"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    session_token = Column(String(255), unique=True, nullable=False)
    ip_address = Column(String(45), default="127.0.0.1")
    device_fingerprint = Column(String(64), default="")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    expires_at = Column(DateTime(timezone=True), nullable=False)

    user = relationship("User", back_populates="sessions")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    actor_id = Column(String(36), nullable=False)
    action = Column(String(100), nullable=False)
    target_resource = Column(String(100), nullable=False)
    details_json = Column(Text, default="{}")
    timestamp = Column(DateTime(timezone=True), default=utc_now)
