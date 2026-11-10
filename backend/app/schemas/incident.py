from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel
from app.schemas.activity import ActivityEventOut

class SecurityAlertOut(BaseModel):
    id: str
    alert_code: str
    incident_id: Optional[str]
    user_id: str
    title: str
    message: str
    severity: str
    status: str
    is_acknowledged: bool
    triggered_at: datetime
    user_name: Optional[str] = None

    class Config:
        from_attributes = True

class IncidentEventOut(BaseModel):
    id: str
    sequence_order: int
    correlation_reason: str
    event: ActivityEventOut

    class Config:
        from_attributes = True

class SecurityIncidentOut(BaseModel):
    id: str
    incident_code: str
    title: str
    severity: str
    status: str
    user_id: str
    risk_score: float
    threat_category: str
    mitre_tactics: List[str]
    root_cause_hypothesis: str
    evidence_summary: str
    suggested_action: str
    analyst_notes: str
    assigned_to_id: Optional[str]
    created_at: datetime
    updated_at: datetime
    user_name: Optional[str] = None
    user_role: Optional[str] = None
    user_department: Optional[str] = None
    events: Optional[List[IncidentEventOut]] = []
    alerts: Optional[List[SecurityAlertOut]] = []

    class Config:
        from_attributes = True

class IncidentActionRequest(BaseModel):
    status: Optional[str] = None # OPEN, UNDER_INVESTIGATION, CONTAINED, RESOLVED, FALSE_POSITIVE
    analyst_notes: Optional[str] = None
    assign_to_id: Optional[str] = None
    quarantine_user: Optional[bool] = False
    lock_question_paper: Optional[bool] = False
