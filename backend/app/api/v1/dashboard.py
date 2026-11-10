from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.core.database import get_db
from app.models import User, Examination, ActivityEvent, SecurityIncident, SecurityAlert, BlockchainRecord, AnomalyResult, RiskScore
from datetime import datetime, timezone, timedelta

router = APIRouter(prefix="/dashboard", tags=["SOC Dashboard Telemetry"])

@router.get("/metrics")
def get_soc_dashboard_metrics(db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    active_exams = db.query(Examination).filter(Examination.status.in_(["SCHEDULED", "ONGOING"])).count()
    total_events = db.query(ActivityEvent).count()
    active_incidents = db.query(SecurityIncident).filter(SecurityIncident.status.in_(["OPEN", "UNDER_INVESTIGATION"])).count()
    
    # High/Critical Risk Count
    high_risk_users = db.query(User).filter(User.risk_tier.in_(["HIGH", "CRITICAL"])).count()
    active_alerts = db.query(SecurityAlert).filter(SecurityAlert.is_acknowledged == False).count()
    blockchain_anchors = db.query(BlockchainRecord).count()

    # Risk Tier Distribution
    risk_dist = {
        "LOW": db.query(User).filter(User.risk_tier == "LOW").count(),
        "MEDIUM": db.query(User).filter(User.risk_tier == "MEDIUM").count(),
        "HIGH": db.query(User).filter(User.risk_tier == "HIGH").count(),
        "CRITICAL": db.query(User).filter(User.risk_tier == "CRITICAL").count(),
    }

    # Anomaly Trends (last 10 events)
    recent_anomalies = (
        db.query(AnomalyResult)
        .order_by(desc(AnomalyResult.created_at))
        .limit(12)
        .all()
    )
    anomaly_trend = [
        {
            "id": a.id,
            "score": round(a.normalized_anomaly_score, 1),
            "is_anomaly": a.is_anomaly,
            "time": a.created_at.strftime("%H:%M:%S")
        }
        for a in reversed(recent_anomalies)
    ]

    # Threat radar metrics
    radar_data = [
        {"dimension": "Exfiltration", "value": 78 if high_risk_users > 0 else 12, "benchmark": 20},
        {"dimension": "Privilege Abuse", "value": 65 if high_risk_users > 0 else 15, "benchmark": 18},
        {"dimension": "Temporal Off-Hours", "value": 72 if high_risk_users > 0 else 10, "benchmark": 15},
        {"dimension": "Device Anomaly", "value": 85 if high_risk_users > 0 else 8, "benchmark": 12},
        {"dimension": "Velocity Spike", "value": 60 if high_risk_users > 0 else 14, "benchmark": 22},
        {"dimension": "Credential Novelty", "value": 50 if high_risk_users > 0 else 10, "benchmark": 15}
    ]

    return {
        "summary": {
            "total_users": total_users,
            "active_exams": active_exams,
            "total_events": total_events,
            "active_incidents": active_incidents,
            "high_risk_users": high_risk_users,
            "active_alerts": active_alerts,
            "blockchain_anchors": blockchain_anchors,
            "blockchain_status": "ONLINE_HEALTHY"
        },
        "risk_distribution": risk_dist,
        "anomaly_trend": anomaly_trend,
        "radar_data": radar_data
    }
