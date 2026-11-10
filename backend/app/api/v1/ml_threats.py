from typing import Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.ml.isolation_forest_detector import detector
from app.ml.risk_scorer import RiskScorer
from app.core.config import settings

router = APIRouter(prefix="/ml", tags=["ML Threat Detection"])

@router.get("/status")
def get_ml_status():
    return {
        "model_type": "Isolation Forest (Scikit-Learn)",
        "estimators": 150,
        "contamination": settings.ISOLATION_FOREST_CONTAMINATION,
        "features_tracked": 10,
        "status": "ACTIVE_ONLINE",
        "baseline_features": list(detector.baseline_means.keys())
    }

@router.post("/retrain")
def trigger_retrain():
    detector.train_baseline(num_samples=5000)
    return {
        "success": True,
        "message": "Isolation Forest re-trained on 5,000 synthetic baseline vectors successfully."
    }

@router.post("/predict")
def predict_threat_risk(features: Dict[str, float]):
    is_anomaly, raw, norm, contribs = detector.predict_anomaly(features)
    risk_data = RiskScorer.calculate_composite_risk(
        ml_anomaly_score=norm,
        features=features,
        event_type="GENERIC_EVAL"
    )
    return {
        "is_anomaly": is_anomaly,
        "raw_isolation_score": raw,
        "normalized_score": norm,
        "feature_contributions": contribs,
        "composite_risk": risk_data
    }
