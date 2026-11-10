from typing import Dict, Any, List, Optional
import uuid
import json
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models import ActivityEvent, BehaviorProfile, AnomalyResult, RiskScore, User
from app.agents.agent_orchestrator import agent_orchestrator
from app.blockchain.web3_client import blockchain_client
from app.core.websocket_manager import ws_manager
import logging

logger = logging.getLogger(__name__)

class ActivityService:
    @staticmethod
    async def log_and_process_activity(
        db: Session,
        user_id: str,
        event_type: str,
        resource_type: str = "SYSTEM",
        resource_id: str = "",
        ip_address: str = "127.0.0.1",
        device_fingerprint: str = "",
        user_agent: str = "Mozilla/5.0",
        location: str = "Main Campus",
        payload: Optional[Dict[str, Any]] = None,
        custom_timestamp: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Ingests activity event, stores it, runs 7-agent pipeline, and updates ML & Risk scores.
        """
        payload_dict = payload or {}
        payload_json = json.dumps(payload_dict)
        event_uuid = f"EVT-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"
        timestamp = custom_timestamp or datetime.now(timezone.utc)

        # Build initial dict
        event_dict = {
            "event_uuid": event_uuid,
            "user_id": user_id,
            "event_type": event_type,
            "resource_type": resource_type,
            "resource_id": resource_id,
            "ip_address": ip_address,
            "device_fingerprint": device_fingerprint,
            "user_agent": user_agent,
            "location": location,
            "payload_json": payload_json,
            "payload": payload_dict,
            "timestamp": timestamp.isoformat()
        }

        # Compute SHA-256 hash
        sha_hash = blockchain_client.compute_event_hash(event_dict)

        # Check after-hours
        user_profile = db.query(BehaviorProfile).filter(BehaviorProfile.user_id == user_id).first()
        start_h = user_profile.typical_login_start_hour if user_profile else 9
        end_h = user_profile.typical_login_end_hour if user_profile else 18
        is_after_hours = (timestamp.hour < start_h or timestamp.hour >= end_h)

        # Save activity event to DB
        activity_event = ActivityEvent(
            event_uuid=event_uuid,
            user_id=user_id,
            event_type=event_type,
            severity="INFO",
            resource_type=resource_type,
            resource_id=resource_id,
            ip_address=ip_address,
            device_fingerprint=device_fingerprint,
            user_agent=user_agent,
            location=location,
            is_after_hours=is_after_hours,
            payload_json=payload_json,
            sha256_hash=sha_hash,
            timestamp=timestamp
        )
        db.add(activity_event)
        db.flush()

        # Query recent events for velocity analysis
        recent_records = (
            db.query(ActivityEvent)
            .filter(ActivityEvent.user_id == user_id)
            .order_by(ActivityEvent.timestamp.desc())
            .limit(10)
            .all()
        )
        recent_events_data = [
            {
                "event_type": r.event_type,
                "timestamp": r.timestamp.isoformat(),
                "ip_address": r.ip_address,
                "device_fingerprint": r.device_fingerprint
            }
            for r in recent_records
        ]

        # Execute 7 Multi-Agent Framework
        orchestration_context = await agent_orchestrator.process_event_pipeline(
            event_dict=event_dict,
            user_profile=user_profile,
            recent_events=recent_events_data,
            activity_db_id=activity_event.id
        )

        risk_data = orchestration_context.get("risk_data", {})
        anomaly_data = orchestration_context.get("anomaly_data", {})
        blockchain_data = orchestration_context.get("blockchain_data", {})

        # Update activity severity & hash status
        activity_event.severity = risk_data.get("risk_tier", "INFO")
        activity_event.is_blockchain_anchored = blockchain_data.get("anchored", False)
        if blockchain_data.get("transaction_hash"):
            activity_event.blockchain_tx_hash = blockchain_data.get("transaction_hash")

        # Save Anomaly Result
        anomaly_record = AnomalyResult(
            event_id=activity_event.id,
            user_id=user_id,
            raw_isolation_forest_score=anomaly_data.get("raw_score", 0.0),
            normalized_anomaly_score=anomaly_data.get("normalized_score", 0.0),
            is_anomaly=anomaly_data.get("is_anomaly", False),
            feature_contributions_json=json.dumps(anomaly_data.get("feature_contributions", {}))
        )
        db.add(anomaly_record)

        # Save or Update Risk Score
        risk_record = RiskScore(
            user_id=user_id,
            overall_risk_score=risk_data.get("overall_risk_score", 0.0),
            velocity_score=risk_data.get("velocity_score", 0.0),
            privilege_score=risk_data.get("privilege_score", 0.0),
            exfiltration_score=risk_data.get("exfiltration_score", 0.0),
            temporal_score=risk_data.get("temporal_score", 0.0),
            behavioral_score=risk_data.get("behavioral_score", 0.0),
            risk_tier=risk_data.get("risk_tier", "LOW"),
            risk_factors_json=json.dumps(risk_data.get("risk_factors", []))
        )
        db.add(risk_record)

        # Update User Risk Tier
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.risk_tier = risk_data.get("risk_tier", "LOW")

        db.commit()
        db.refresh(activity_event)

        # Broadcast live telemetry event
        await ws_manager.broadcast("ACTIVITY_EVENT", {
            "id": activity_event.id,
            "event_uuid": activity_event.event_uuid,
            "user_id": user_id,
            "user_name": user.full_name if user else "Unknown User",
            "event_type": event_type,
            "severity": activity_event.severity,
            "risk_score": risk_data.get("overall_risk_score", 0.0),
            "ip_address": ip_address,
            "location": location,
            "is_blockchain_anchored": activity_event.is_blockchain_anchored,
            "timestamp": activity_event.timestamp.isoformat()
        })

        return {
            "activity_event": activity_event,
            "orchestration_context": orchestration_context
        }
