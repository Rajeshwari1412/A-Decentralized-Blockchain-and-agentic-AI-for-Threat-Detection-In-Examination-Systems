from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models import SecurityIncident, IncidentEvent, SecurityAlert, User, QuestionPaper, ActivityEvent
import json

class IncidentService:
    @staticmethod
    def get_incidents(
        db: Session,
        status: Optional[str] = None,
        severity: Optional[str] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        query = db.query(SecurityIncident)
        if status:
            query = query.filter(SecurityIncident.status == status)
        if severity:
            query = query.filter(SecurityIncident.severity == severity)
        
        incidents = query.order_by(desc(SecurityIncident.created_at)).limit(limit).all()
        result = []
        for inc in incidents:
            user = db.query(User).filter(User.id == inc.user_id).first()
            mitre_tactics = []
            try:
                mitre_tactics = json.loads(inc.mitre_tactics_json) if inc.mitre_tactics_json else []
            except Exception:
                mitre_tactics = []

            result.append({
                "id": inc.id,
                "incident_code": inc.incident_code,
                "title": inc.title,
                "severity": inc.severity,
                "status": inc.status,
                "user_id": inc.user_id,
                "user_name": user.full_name if user else "Unknown",
                "user_role": user.role if user else "Unknown",
                "user_department": user.department if user else "Examination Division",
                "risk_score": inc.risk_score,
                "threat_category": inc.threat_category,
                "mitre_tactics": mitre_tactics,
                "root_cause_hypothesis": inc.root_cause_hypothesis,
                "evidence_summary": inc.evidence_summary,
                "suggested_action": inc.suggested_action,
                "analyst_notes": inc.analyst_notes,
                "created_at": inc.created_at,
                "updated_at": inc.updated_at
            })
        return result

    @staticmethod
    def get_incident_detail(db: Session, incident_id: str) -> Optional[Dict[str, Any]]:
        inc = db.query(SecurityIncident).filter(SecurityIncident.id == incident_id).first()
        if not inc:
            return None

        user = db.query(User).filter(User.id == inc.user_id).first()
        
        # Get correlated timeline events
        inc_events = (
            db.query(IncidentEvent)
            .filter(IncidentEvent.incident_id == inc.id)
            .order_by(IncidentEvent.sequence_order.asc())
            .all()
        )
        
        timeline = []
        for ie in inc_events:
            act = db.query(ActivityEvent).filter(ActivityEvent.id == ie.event_id).first()
            if act:
                timeline.append({
                    "id": act.id,
                    "event_uuid": act.event_uuid,
                    "event_type": act.event_type,
                    "severity": act.severity,
                    "resource_type": act.resource_type,
                    "resource_id": act.resource_id,
                    "ip_address": act.ip_address,
                    "device_fingerprint": act.device_fingerprint,
                    "location": act.location,
                    "is_after_hours": act.is_after_hours,
                    "payload_json": act.payload_json,
                    "sha256_hash": act.sha256_hash,
                    "is_blockchain_anchored": act.is_blockchain_anchored,
                    "blockchain_tx_hash": act.blockchain_tx_hash,
                    "timestamp": act.timestamp,
                    "correlation_reason": ie.correlation_reason,
                    "sequence_order": ie.sequence_order
                })

        # Get alerts
        alerts = db.query(SecurityAlert).filter(SecurityAlert.incident_id == inc.id).all()
        alerts_data = [
            {
                "id": a.id,
                "alert_code": a.alert_code,
                "title": a.title,
                "message": a.message,
                "severity": a.severity,
                "status": a.status,
                "is_acknowledged": a.is_acknowledged,
                "triggered_at": a.triggered_at
            }
            for a in alerts
        ]

        mitre_tactics = []
        try:
            mitre_tactics = json.loads(inc.mitre_tactics_json) if inc.mitre_tactics_json else []
        except Exception:
            mitre_tactics = []

        return {
            "id": inc.id,
            "incident_code": inc.incident_code,
            "title": inc.title,
            "severity": inc.severity,
            "status": inc.status,
            "user_id": inc.user_id,
            "user_name": user.full_name if user else "Unknown",
            "user_role": user.role if user else "Unknown",
            "user_department": user.department if user else "Examination Division",
            "risk_score": inc.risk_score,
            "threat_category": inc.threat_category,
            "mitre_tactics": mitre_tactics,
            "root_cause_hypothesis": inc.root_cause_hypothesis,
            "evidence_summary": inc.evidence_summary,
            "suggested_action": inc.suggested_action,
            "analyst_notes": inc.analyst_notes,
            "created_at": inc.created_at,
            "updated_at": inc.updated_at,
            "timeline": timeline,
            "alerts": alerts_data
        }

    @staticmethod
    def execute_analyst_action(
        db: Session,
        incident_id: str,
        analyst_id: str,
        status: Optional[str] = None,
        analyst_notes: Optional[str] = None,
        quarantine_user: bool = False,
        lock_question_paper: bool = False
    ) -> Dict[str, Any]:
        inc = db.query(SecurityIncident).filter(SecurityIncident.id == incident_id).first()
        if not inc:
            raise ValueError("Incident not found")

        actions_taken = []

        if status:
            inc.status = status
            actions_taken.append(f"Status updated to '{status}'")

        if analyst_notes:
            inc.analyst_notes = f"{inc.analyst_notes}\n[Analyst Note]: {analyst_notes}".strip()
            actions_taken.append("Analyst notes appended")

        inc.assigned_to_id = analyst_id

        if quarantine_user:
            user = db.query(User).filter(User.id == inc.user_id).first()
            if user:
                user.is_suspended = True
                actions_taken.append(f"Account for '{user.full_name}' suspended and quarantined.")

        if lock_question_paper:
            # Lock papers for security
            papers = db.query(QuestionPaper).all()
            for p in papers:
                p.status = "COMPROMISED_LOCK"
            actions_taken.append(f"Question Paper vault set to emergency security lock.")

        db.commit()
        db.refresh(inc)

        return {
            "success": True,
            "incident_id": inc.id,
            "incident_status": inc.status,
            "actions_taken": actions_taken
        }
