import pytest
from app.ml.feature_extractor import FeatureExtractor
from app.ml.isolation_forest_detector import detector
from app.ml.risk_scorer import RiskScorer

def test_feature_extractor():
    event = {
        "event_type": "BULK_DOWNLOAD",
        "timestamp": "2026-10-02T02:30:00Z",
        "ip_address": "198.51.100.99",
        "device_fingerprint": "DEV-ROGUE-01",
        "payload": {"download_count": 25}
    }
    features = FeatureExtractor.extract_features(event)
    assert features["hour_of_day"] == 2.0
    assert features["is_after_hours"] == 1.0
    assert features["privilege_weight"] == 8.5
    assert features["download_volume_ratio"] >= 15.0

def test_isolation_forest_prediction():
    # Normal activity features
    normal_features = {
        "hour_of_day": 14.0,
        "is_after_hours": 0.0,
        "ip_novelty": 0.0,
        "device_novelty": 0.0,
        "event_velocity_5m": 2.0,
        "failed_login_burst": 0.0,
        "qp_access_velocity_1h": 1.0,
        "download_volume_ratio": 1.0,
        "privilege_weight": 1.0,
        "session_duration_ratio": 1.0
    }
    is_anomaly, raw, norm_score, contribs = detector.predict_anomaly(normal_features)
    assert norm_score < 50.0

    # Anomalous threat vector features
    anomalous_features = {
        "hour_of_day": 3.0,
        "is_after_hours": 1.0,
        "ip_novelty": 1.0,
        "device_novelty": 1.0,
        "event_velocity_5m": 8.0,
        "failed_login_burst": 3.0,
        "qp_access_velocity_1h": 6.0,
        "download_volume_ratio": 20.0,
        "privilege_weight": 9.5,
        "session_duration_ratio": 3.5
    }
    is_anom, raw_a, norm_score_a, contribs_a = detector.predict_anomaly(anomalous_features)
    assert norm_score_a > 60.0
    assert is_anom is True
    assert len(contribs_a) > 0

def test_risk_scorer_and_mitre_mapping():
    features = {
        "is_after_hours": 1.0,
        "hour_of_day": 2.0,
        "ip_novelty": 1.0,
        "device_novelty": 1.0,
        "event_velocity_5m": 6.0,
        "download_volume_ratio": 15.0,
        "privilege_weight": 8.5
    }
    risk = RiskScorer.calculate_composite_risk(
        ml_anomaly_score=85.0,
        features=features,
        event_type="BULK_DOWNLOAD"
    )
    assert risk["overall_risk_score"] >= 70.0
    assert risk["risk_tier"] in ["HIGH", "CRITICAL"]
    assert "Exfiltration" in risk["threat_category"]
    assert any("T1567" in t for t in risk["mitre_tactics"])
