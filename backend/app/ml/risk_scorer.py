from typing import Dict, Any, List, Tuple
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

class RiskScorer:
    """
    Computes explainable, multi-dimensional risk scores (0-100) and MITRE ATT&CK indicators.
    """

    @classmethod
    def calculate_composite_risk(
        cls,
        ml_anomaly_score: float,
        features: Dict[str, float],
        event_type: str,
        user_profile: Any = None
    ) -> Dict[str, Any]:
        """
        Calculates distinct risk sub-dimensions and weighted composite score.
        """
        # 1. Temporal Risk (0-100)
        temporal_score = 0.0
        if features.get("is_after_hours", 0) > 0:
            temporal_score += 45.0
            # Extra penalty for late night (1 AM - 5 AM)
            hour = features.get("hour_of_day", 12)
            if 0 <= hour <= 5:
                temporal_score += 35.0

        # 2. Velocity Risk (0-100)
        vel_5m = features.get("event_velocity_5m", 0)
        failed_logins = features.get("failed_login_burst", 0)
        qp_vel = features.get("qp_access_velocity_1h", 0)
        velocity_score = min(100.0, (vel_5m * 10.0) + (failed_logins * 25.0) + (qp_vel * 15.0))

        # 3. Privilege Risk (0-100)
        pw = features.get("privilege_weight", 1.0)
        privilege_score = min(100.0, (pw / 10.0) * 100.0)

        # 4. Exfiltration Risk (0-100)
        dl_ratio = features.get("download_volume_ratio", 1.0)
        exfiltration_score = 0.0
        if event_type in ["BULK_DOWNLOAD", "EXPORT_DATA"]:
            exfiltration_score = min(100.0, 50.0 + (dl_ratio * 20.0))
        elif event_type == "QP_DOWNLOAD":
            exfiltration_score = min(80.0, 30.0 + (dl_ratio * 15.0))
        elif dl_ratio > 3.0:
            exfiltration_score = min(90.0, 40.0 + (dl_ratio * 10.0))

        # 5. Behavioral Deviation Risk (0-100)
        ip_nov = features.get("ip_novelty", 0)
        dev_nov = features.get("device_novelty", 0)
        behavioral_score = min(100.0, (ip_nov * 40.0) + (dev_nov * 45.0) + (ml_anomaly_score * 0.35))

        # Composite Weighted Overall Risk Score
        # Weights: ML Anomaly (30%), Privilege (20%), Exfiltration (25%), Behavioral (15%), Temporal (10%)
        overall = (
            (ml_anomaly_score * 0.30) +
            (privilege_score * 0.20) +
            (exfiltration_score * 0.25) +
            (behavioral_score * 0.15) +
            (temporal_score * 0.10)
        )
        overall_risk_score = round(min(100.0, max(0.0, overall)), 1)

        # Determine Risk Tier
        if overall_risk_score >= settings.RISK_SCORE_THRESHOLD_HIGH:
            risk_tier = "CRITICAL" if overall_risk_score >= 85.0 else "HIGH"
        elif overall_risk_score >= settings.RISK_SCORE_THRESHOLD_MEDIUM:
            risk_tier = "MEDIUM"
        else:
            risk_tier = "LOW"

        # Threat Category & MITRE ATT&CK Mapping
        threat_category, mitre_tactics, risk_factors = cls._derive_threat_intel(
            overall_risk_score,
            event_type,
            features,
            temporal_score,
            exfiltration_score,
            privilege_score
        )

        return {
            "overall_risk_score": overall_risk_score,
            "velocity_score": round(velocity_score, 1),
            "privilege_score": round(privilege_score, 1),
            "exfiltration_score": round(exfiltration_score, 1),
            "temporal_score": round(temporal_score, 1),
            "behavioral_score": round(behavioral_score, 1),
            "risk_tier": risk_tier,
            "threat_category": threat_category,
            "mitre_tactics": mitre_tactics,
            "risk_factors": risk_factors
        }

    @classmethod
    def _derive_threat_intel(
        cls,
        risk_score: float,
        event_type: str,
        features: Dict[str, float],
        temporal_score: float,
        exfiltration_score: float,
        privilege_score: float
    ) -> Tuple[str, List[str], List[str]]:
        factors = []
        mitre = []
        category = "Routine Operations"

        if features.get("device_novelty", 0) > 0:
            factors.append("Unrecognized Device Fingerprint")
            mitre.append("Initial Access (T1078 - Valid Accounts)")
        
        if features.get("ip_novelty", 0) > 0:
            factors.append("Anomalous Geo-IP Location")
            mitre.append("Defense Evasion (T1562 - Impair Defenses)")

        if temporal_score > 30:
            factors.append("Off-Hours / Unscheduled Access")

        if exfiltration_score > 40 or event_type in ["BULK_DOWNLOAD", "EXPORT_DATA"]:
            factors.append(f"Bulk Question-Paper Exfiltration Attempt ({features.get('download_volume_ratio', 1):.1f}x baseline)")
            mitre.append("Exfiltration (T1567 - Exfiltration Over Web Service)")
            mitre.append("Collection (T1005 - Data from Local System)")
            category = "Question Paper Data Exfiltration"
        elif privilege_score > 60 or event_type in ["PRIVILEGE_ESCALATION", "PERMISSION_MODIFICATION"]:
            factors.append("Elevated Privileged Action / Schema Manipulation")
            mitre.append("Privilege Escalation (T1068 - Exploitation for Privilege Escalation)")
            category = "Privilege Escalation & Unauthorized Access"

        if features.get("failed_login_burst", 0) >= 3:
            factors.append("Rapid Consecutive Authentication Failures")
            mitre.append("Credential Access (T1110 - Brute Force)")
            if category == "Routine Operations":
                category = "Credential Stuffing / Brute Force"

        if risk_score >= 60 and category == "Routine Operations":
            category = "Multi-Vector Insider Threat Activity"

        # Deduplicate MITRE tags
        mitre = list(dict.fromkeys(mitre))
        if not factors:
            factors.append("Standard Operating Parameters")

        return category, mitre, factors
