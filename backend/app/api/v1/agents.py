from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.core.database import get_db
from app.models import AgentRun
from app.schemas.blockchain import AgentRunOut

router = APIRouter(prefix="/agents", tags=["Agentic AI Framework"])

AGENTS_METADATA = [
    {
        "id": "ActivityMonitoringAgent",
        "name": "Activity Monitoring Agent",
        "role": "Stream Ingestion & Rule Verification",
        "description": "Monitors raw activity stream, ingests telemetry, validates working-hour boundaries, and flags device/IP changes.",
        "status": "OPERATIONAL",
        "model": "Deterministic Rule Engine + Real-time Ingestion"
    },
    {
        "id": "BehavioralAnalysisAgent",
        "name": "Behavioral Analysis Agent",
        "role": "Historical Baseline Comparison",
        "description": "Calculates user behavioral variance index against 30-day historical login habits, access frequency, and normal resource downloads.",
        "status": "OPERATIONAL",
        "model": "Statistical Profiling Engine"
    },
    {
        "id": "AnomalyDetectionAgent",
        "name": "Anomaly Detection Agent",
        "role": "Unsupervised ML Outlier Inference",
        "description": "Applies Scikit-learn Isolation Forest across 10 dimensions, calculating anomaly probabilities and SHAP feature contributions.",
        "status": "OPERATIONAL",
        "model": "Isolation Forest (150 Trees)"
    },
    {
        "id": "ThreatAssessmentAgent",
        "name": "Threat Assessment Agent",
        "role": "Composite Threat Scoring & MITRE Mapping",
        "description": "Fuses ML scores and behavioral indicators into explainable 0-100 risk score and maps activity to MITRE ATT&CK insider tactics.",
        "status": "OPERATIONAL",
        "model": "Multi-Factor Weighted Risk Engine"
    },
    {
        "id": "InvestigationAgent",
        "name": "Investigation Agent",
        "role": "Evidence Synthesis & Root-Cause Hypotheses",
        "description": "Correlates chronological events, synthesizes narrative evidence, and constructs actionable recommendations for SOC analysts.",
        "status": "OPERATIONAL",
        "model": "Cooperative Reasoning Ensemble"
    },
    {
        "id": "AlertResponseAgent",
        "name": "Alert & Response Agent",
        "role": "WebSocket Dispatch & Incident Lifecycle",
        "description": "Broadcasts real-time security alerts to SOC, manages incident lifecycle, and prevents alert fatigue through event grouping.",
        "status": "OPERATIONAL",
        "model": "Dynamic Event Correlator"
    },
    {
        "id": "BlockchainAuditAgent",
        "name": "Blockchain Audit Agent",
        "role": "Cryptographic Anchoring & Verification",
        "description": "Computes canonical SHA-256 hashes of critical security events and anchors immutable cryptographic records onto smart contract ledger.",
        "status": "OPERATIONAL",
        "model": "EVM Smart Contract / Cryptographic Ledger"
    }
]

@router.get("/status")
def get_agents_status():
    return AGENTS_METADATA

@router.get("/runs", response_model=List[AgentRunOut])
def get_recent_agent_runs(limit: int = 50, db: Session = Depends(get_db)):
    return db.query(AgentRun).order_by(desc(AgentRun.created_at)).limit(limit).all()
