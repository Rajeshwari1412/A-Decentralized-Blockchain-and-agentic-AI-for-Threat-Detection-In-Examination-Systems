from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.core.database import get_db
from app.models import ActivityEvent, BehaviorProfile, User
from app.schemas.activity import ActivityEventCreate, ActivityEventOut, BehaviorProfileOut
from app.services.activity_service import ActivityService
from app.api.v1.auth import get_current_user
import json

router = APIRouter(prefix="/activities", tags=["Activity Monitoring"])

@router.get("/", response_model=List[ActivityEventOut])
def get_activities(
    user_id: Optional[str] = None,
    severity: Optional[str] = None,
    event_type: Optional[str] = None,
    limit: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db)
):
    query = db.query(ActivityEvent)
    if user_id:
        query = query.filter(ActivityEvent.user_id == user_id)
    if severity:
        query = query.filter(ActivityEvent.severity == severity)
    if event_type:
        query = query.filter(ActivityEvent.event_type == event_type)

    events = query.order_by(desc(ActivityEvent.timestamp)).limit(limit).all()
    
    out = []
    for e in events:
        user = db.query(User).filter(User.id == e.user_id).first()
        out.append(ActivityEventOut(
            id=e.id,
            event_uuid=e.event_uuid,
            user_id=e.user_id,
            event_type=e.event_type,
            severity=e.severity,
            resource_type=e.resource_type,
            resource_id=e.resource_id,
            ip_address=e.ip_address,
            device_fingerprint=e.device_fingerprint,
            location=e.location,
            is_after_hours=e.is_after_hours,
            payload_json=e.payload_json,
            sha256_hash=e.sha256_hash,
            is_blockchain_anchored=e.is_blockchain_anchored,
            blockchain_tx_hash=e.blockchain_tx_hash,
            timestamp=e.timestamp,
            user_name=user.full_name if user else "Unknown",
            user_role=user.role if user else "Unknown"
        ))
    return out

@router.post("/ingest")
async def ingest_activity_event(
    event_in: ActivityEventCreate,
    db: Session = Depends(get_db)
):
    res = await ActivityService.log_and_process_activity(
        db=db,
        user_id=event_in.user_id,
        event_type=event_in.event_type,
        resource_type=event_in.resource_type,
        resource_id=event_in.resource_id,
        ip_address=event_in.ip_address,
        device_fingerprint=event_in.device_fingerprint,
        user_agent=event_in.user_agent,
        location=event_in.location,
        payload=event_in.payload
    )
    return {
        "success": True,
        "event_uuid": res["activity_event"].event_uuid,
        "risk_score": res["orchestration_context"]["risk_data"].get("overall_risk_score"),
        "severity": res["activity_event"].severity,
        "is_blockchain_anchored": res["activity_event"].is_blockchain_anchored
    }

@router.get("/profile/{user_id}", response_model=BehaviorProfileOut)
def get_user_behavior_profile(user_id: str, db: Session = Depends(get_db)):
    profile = db.query(BehaviorProfile).filter(BehaviorProfile.user_id == user_id).first()
    if not profile:
        profile = BehaviorProfile(
            user_id=user_id,
            typical_login_start_hour=9,
            typical_login_end_hour=18,
            known_ips_json="[]",
            known_devices_json="[]"
        )
        db.add(profile)
        db.commit()

    known_ips = json.loads(profile.known_ips_json) if profile.known_ips_json else []
    known_devices = json.loads(profile.known_devices_json) if profile.known_devices_json else []

    return BehaviorProfileOut(
        user_id=profile.user_id,
        typical_login_start_hour=profile.typical_login_start_hour,
        typical_login_end_hour=profile.typical_login_end_hour,
        known_ips=known_ips,
        known_devices=known_devices,
        avg_daily_requests=profile.avg_daily_requests,
        avg_downloads_per_session=profile.avg_downloads_per_session,
        total_violations=profile.total_violations,
        privilege_escalation_risk=profile.privilege_escalation_risk
    )
