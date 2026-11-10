import math
from typing import Dict, Any, List
from datetime import datetime, timezone
import json

class FeatureExtractor:
    """
    Extracts multi-dimensional cybersecurity feature vectors for ML Anomaly Detection.
    """

    FEATURE_NAMES = [
        "hour_of_day",
        "is_after_hours",
        "ip_novelty",
        "device_novelty",
        "event_velocity_5m",
        "failed_login_burst",
        "qp_access_velocity_1h",
        "download_volume_ratio",
        "privilege_weight",
        "session_duration_ratio"
    ]

    PRIVILEGE_WEIGHT_MAP = {
        "LOGIN": 1.0,
        "LOGOUT": 1.0,
        "FAILED_LOGIN": 2.5,
        "IP_CHANGE": 2.0,
        "NEW_DEVICE": 2.5,
        "SESSION_START": 1.0,
        "QP_VIEW": 3.0,
        "QP_DOWNLOAD": 5.0,
        "BULK_DOWNLOAD": 8.5,
        "PRIVILEGE_ESCALATION": 9.5,
        "EXPORT_DATA": 7.0,
        "AFTER_HOURS_ACCESS": 4.0,
        "PERMISSION_MODIFICATION": 9.0,
        "EXAM_LOCK": 6.0,
        "QUESTION_TAMPER": 9.5
    }

    @classmethod
    def extract_features(
        cls,
        event_dict: Dict[str, Any],
        user_profile: Any = None,
        recent_events: List[Dict[str, Any]] = None
    ) -> Dict[str, float]:
        """
        Converts raw activity event + user profile into a normalized numerical dictionary.
        """
        if recent_events is None:
            recent_events = []

        # 1. Hour of day (0 to 23)
        event_time = event_dict.get("timestamp")
        if isinstance(event_time, str):
            try:
                event_time = datetime.fromisoformat(event_time.replace("Z", "+00:00"))
            except Exception:
                event_time = datetime.now(timezone.utc)
        elif not isinstance(event_time, datetime):
            event_time = datetime.now(timezone.utc)

        hour = event_time.hour

        # 2. After-hours check
        start_hour = getattr(user_profile, "typical_login_start_hour", 8) if user_profile else 8
        end_hour = getattr(user_profile, "typical_login_end_hour", 19) if user_profile else 19
        is_after_hours = 1.0 if (hour < start_hour or hour >= end_hour) else 0.0

        # 3. IP Novelty
        event_ip = event_dict.get("ip_address", "127.0.0.1")
        known_ips = []
        if user_profile and hasattr(user_profile, "known_ips_json") and user_profile.known_ips_json:
            try:
                known_ips = json.loads(user_profile.known_ips_json)
            except Exception:
                known_ips = []
        
        ip_novelty = 1.0 if (known_ips and event_ip not in known_ips) else 0.0

        # 4. Device Novelty
        event_device = event_dict.get("device_fingerprint", "")
        known_devices = []
        if user_profile and hasattr(user_profile, "known_devices_json") and user_profile.known_devices_json:
            try:
                known_devices = json.loads(user_profile.known_devices_json)
            except Exception:
                known_devices = []

        device_novelty = 1.0 if (known_devices and event_device not in known_devices) else 0.0

        # 5. Event Velocity in last 5 minutes
        event_velocity_5m = float(len(recent_events))

        # 6. Failed login burst
        failed_logins = sum(1 for e in recent_events if e.get("event_type") == "FAILED_LOGIN")
        if event_dict.get("event_type") == "FAILED_LOGIN":
            failed_logins += 1
        failed_login_burst = float(failed_logins)

        # 7. Question paper access count in window
        qp_accesses = sum(
            1 for e in recent_events 
            if e.get("event_type") in ["QP_VIEW", "QP_DOWNLOAD", "BULK_DOWNLOAD"]
        )
        if event_dict.get("event_type") in ["QP_VIEW", "QP_DOWNLOAD", "BULK_DOWNLOAD"]:
            qp_accesses += 1
        qp_access_velocity_1h = float(qp_accesses)

        # 8. Download volume ratio
        payload = event_dict.get("payload", {})
        if isinstance(payload, str):
            try:
                payload = json.loads(payload)
            except Exception:
                payload = {}

        download_count = float(payload.get("download_count", 0))
        if event_dict.get("event_type") == "BULK_DOWNLOAD":
            download_count = max(download_count, 15.0)
        elif event_dict.get("event_type") == "QP_DOWNLOAD":
            download_count = max(download_count, 1.0)
        
        avg_downloads = getattr(user_profile, "avg_downloads_per_session", 1.0) if user_profile else 1.0
        download_volume_ratio = download_count / max(avg_downloads, 1.0)

        # 9. Privilege weight
        event_type = event_dict.get("event_type", "LOGIN")
        privilege_weight = cls.PRIVILEGE_WEIGHT_MAP.get(event_type, 1.0)

        # 10. Session duration ratio (simulated metric)
        session_duration_ratio = 1.0
        if is_after_hours and privilege_weight > 5.0:
            session_duration_ratio = 3.5

        return {
            "hour_of_day": float(hour),
            "is_after_hours": is_after_hours,
            "ip_novelty": ip_novelty,
            "device_novelty": device_novelty,
            "event_velocity_5m": event_velocity_5m,
            "failed_login_burst": failed_login_burst,
            "qp_access_velocity_1h": qp_access_velocity_1h,
            "download_volume_ratio": float(download_volume_ratio),
            "privilege_weight": privilege_weight,
            "session_duration_ratio": session_duration_ratio
        }

    @classmethod
    def to_feature_vector(cls, feature_dict: Dict[str, float]) -> List[float]:
        return [feature_dict.get(name, 0.0) for name in cls.FEATURE_NAMES]
