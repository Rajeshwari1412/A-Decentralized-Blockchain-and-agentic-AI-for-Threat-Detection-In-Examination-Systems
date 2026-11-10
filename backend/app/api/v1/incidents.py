from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.incident import SecurityIncidentOut, IncidentActionRequest, SecurityAlertOut
from app.services.incident_service import IncidentService
from app.api.v1.auth import get_current_user
from app.models import User, SecurityAlert
from sqlalchemy import desc

router = APIRouter(prefix="/incidents", tags=["Incident Management"])

@router.get("/", response_model=List[SecurityIncidentOut])
def list_incidents(
    status: Optional[str] = None,
    severity: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    return IncidentService.get_incidents(db, status=status, severity=severity, limit=limit)

@router.get("/alerts", response_model=List[SecurityAlertOut])
def list_alerts(limit: int = 50, db: Session = Depends(get_db)):
    alerts = db.query(SecurityAlert).order_by(desc(SecurityAlert.triggered_at)).limit(limit).all()
    out = []
    for a in alerts:
        user = db.query(User).filter(User.id == a.user_id).first()
        out.append(SecurityAlertOut(
            id=a.id,
            alert_code=a.alert_code,
            incident_id=a.incident_id,
            user_id=a.user_id,
            title=a.title,
            message=a.message,
            severity=a.severity,
            status=a.status,
            is_acknowledged=a.is_acknowledged,
            triggered_at=a.triggered_at,
            user_name=user.full_name if user else "Unknown"
        ))
    return out

@router.get("/{incident_id}")
def get_incident_detail(incident_id: str, db: Session = Depends(get_db)):
    inc = IncidentService.get_incident_detail(db, incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return inc

@router.post("/{incident_id}/action")
def take_analyst_action(
    incident_id: str,
    action_req: IncidentActionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        res = IncidentService.execute_analyst_action(
            db=db,
            incident_id=incident_id,
            analyst_id=current_user.id,
            status=action_req.status,
            analyst_notes=action_req.analyst_notes,
            quarantine_user=action_req.quarantine_user or False,
            lock_question_paper=action_req.lock_question_paper or False
        )
        return res
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
