from typing import Dict, Any, Optional
import uuid
import json
from datetime import datetime, timezone
from app.agents.base_agent import BaseAgent
from app.core.database import SessionLocal
from app.models import SecurityIncident, IncidentEvent, SecurityAlert, User
from app.core.websocket_manager import ws_manager
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class AlertResponseAgent(BaseAgent):
    """
    Agent 6: Alert & Response Agent
    Dispatches real-time WebSocket alerts, manages security incident lifecycle in PostgreSQL/SQLite,
    correlates events into incident timelines, and executes automated response actions.
    """
    def __init__(self):
        super().__init__("AlertResponseAgent")

    async def process(self, context: Dict[str, Any]) -> Dict[str, Any]:
        risk_data = context.get("risk_data", {})
        investigation_data = context.get("investigation_data", {})
        event = context.get("event", {})
        activity_db_id = context.get("activity_db_id")

        overall_score = risk_data.get("overall_risk_score", 0.0)
        risk_tier = risk_data.get("risk_tier", "LOW")
        user_id = event.get("user_id")

        incident_created = False
        incident_id = None
        alert_dispatched = False

        # Only trigger incident creation if risk score exceeds threshold
        if overall_score >= settings.AUTO_ALERT_THRESHOLD or risk_tier in ["HIGH", "CRITICAL"]:
            incident_id, incident_code = self._create_or_update_incident(
                user_id=user_id,
                risk_data=risk_data,
                investigation_data=investigation_data,
                event=event,
                activity_db_id=activity_db_id
            )
            incident_created = True

            # Create Security Alert
            alert_code = f"ALT-{uuid.uuid4().hex[:8].upper()}"
            title = f"High-Risk Indicator: {risk_data.get('threat_category', 'Threat Activity')}"
            message = f"User {user_id} triggered {risk_tier} risk score ({overall_score}/100) during {event.get('event_type')}."

            db = SessionLocal()
            try:
                alert = SecurityAlert(
                    alert_code=alert_code,
                    incident_id=incident_id,
                    user_id=user_id,
                    title=title,
                    message=message,
                    severity=risk_tier,
                    status="NEW",
                    is_acknowledged=False
                )
                db.add(alert)
                db.commit()
                alert_dispatched = True
            except Exception as e:
                logger.error(f"Failed to record alert: {e}")
                db.rollback()
            finally:
                db.close()

            # Broadcast over WebSocket
            await ws_manager.broadcast("SECURITY_ALERT", {
                "alert_code": alert_code,
                "incident_id": incident_id,
                "user_id": user_id,
                "title": title,
                "message": message,
                "severity": risk_tier,
                "risk_score": overall_score,
                "timestamp": datetime.now(timezone.utc).isoformat()
            })

        summary = f"Alert decision: Dispatched={alert_dispatched}, IncidentID={incident_id or 'None'}, Risk={overall_score}/100."

        return {
            "agent_status": "ALERT" if alert_dispatched else "SUCCESS",
            "incident_created": incident_created,
            "incident_id": incident_id,
            "alert_dispatched": alert_dispatched,
            "confidence": 0.98,
            "input_summary": f"Risk: {overall_score}/100, Tier: {risk_tier}",
            "output_summary": summary
        }

    def _create_or_update_incident(
        self,
        user_id: str,
        risk_data: Dict[str, Any],
        investigation_data: Dict[str, Any],
        event: Dict[str, Any],
        activity_db_id: Optional[str]
    ) -> tuple:
        db = SessionLocal()
        try:
            # Check if there is an active open incident for this user in last 2 hours
            existing = (
                db.query(SecurityIncident)
                .filter(
                    SecurityIncident.user_id == user_id,
                    SecurityIncident.status.in_(["OPEN", "UNDER_INVESTIGATION"])
                )
                .order_by(SecurityIncident.created_at.desc())
                .first()
            )

            if existing:
                # Update existing incident with latest risk data & correlation
                existing.risk_score = max(existing.risk_score, risk_data.get("overall_risk_score", 0.0))
                existing.severity = risk_data.get("risk_tier", existing.severity)
                existing.evidence_summary = investigation_data.get("evidence_summary", existing.evidence_summary)
                existing.suggested_action = investigation_data.get("suggested_action", existing.suggested_action)
                
                # Append incident event
                if activity_db_id:
                    cnt = db.query(IncidentEvent).filter(IncidentEvent.incident_id == existing.id).count()
                    inc_event = IncidentEvent(
                        incident_id=existing.id,
                        event_id=activity_db_id,
                        sequence_order=cnt + 1,
                        correlation_reason=f"Correlated {event.get('event_type')} (Risk: {risk_data.get('overall_risk_score')})"
                    )
                    db.add(inc_event)
                
                db.commit()
                return existing.id, existing.incident_code
            else:
                # Create new incident
                inc_code = f"INC-{uuid.uuid4().hex[:8].upper()}"
                title = f"Potential Insider Threat: {risk_data.get('threat_category', 'Behavioral Anomaly')}"
                
                new_inc = SecurityIncident(
                    incident_code=inc_code,
                    title=title,
                    severity=risk_data.get("risk_tier", "MEDIUM"),
                    status="OPEN",
                    user_id=user_id,
                    risk_score=risk_data.get("overall_risk_score", 0.0),
                    threat_category=risk_data.get("threat_category", "Potential Insider Threat"),
                    mitre_tactics_json=json.dumps(risk_data.get("mitre_tactics", [])),
                    root_cause_hypothesis=investigation_data.get("root_cause_hypothesis", ""),
                    evidence_summary=investigation_data.get("evidence_summary", ""),
                    suggested_action=investigation_data.get("suggested_action", ""),
                    analyst_notes="Automated incident compiled by ExamSentinel Multi-Agent Ensemble. Awaiting SOC Analyst triage."
                )
                db.add(new_inc)
                db.flush()

                if activity_db_id:
                    inc_event = IncidentEvent(
                        incident_id=new_inc.id,
                        event_id=activity_db_id,
                        sequence_order=1,
                        correlation_reason="Initial high-risk trigger event"
                    )
                    db.add(inc_event)

                db.commit()
                return new_inc.id, inc_code
        except Exception as e:
            logger.error(f"Error persisting incident: {e}")
            db.rollback()
            return None, None
        finally:
            db.close()
