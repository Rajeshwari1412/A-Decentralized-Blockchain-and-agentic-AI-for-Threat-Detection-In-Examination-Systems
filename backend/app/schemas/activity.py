from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel

class ActivityEventCreate(BaseModel):
    user_id: str
    event_type: str
    severity: Optional[str] = "INFO"
    resource_type: Optional[str] = "SYSTEM"
    resource_id: Optional[str] = ""
    ip_address: Optional[str] = "127.0.0.1"
    device_fingerprint: Optional[str] = ""
    user_agent: Optional[str] = "Mozilla/5.0"
    location: Optional[str] = "Main Campus"
    payload: Optional[Dict[str, Any]] = None

class ActivityEventOut(BaseModel):
    id: str
    event_uuid: str
    user_id: str
    event_type: str
    severity: str
    resource_type: str
    resource_id: str
    ip_address: str
    device_fingerprint: str
    location: str
    is_after_hours: bool
    payload_json: str
    sha256_hash: str
    is_blockchain_anchored: bool
    blockchain_tx_hash: Optional[str]
    timestamp: datetime
    user_name: Optional[str] = None
    user_role: Optional[str] = None

    class Config:
        from_attributes = True

class BehaviorProfileOut(BaseModel):
    user_id: str
    typical_login_start_hour: int
    typical_login_end_hour: int
    known_ips: List[str]
    known_devices: List[str]
    avg_daily_requests: float
    avg_downloads_per_session: float
    total_violations: int
    privilege_escalation_risk: float

class AnomalyResultOut(BaseModel):
    event_id: str
    user_id: str
    raw_isolation_forest_score: float
    normalized_anomaly_score: float
    is_anomaly: bool
    feature_contributions: Dict[str, float]
    created_at: datetime
