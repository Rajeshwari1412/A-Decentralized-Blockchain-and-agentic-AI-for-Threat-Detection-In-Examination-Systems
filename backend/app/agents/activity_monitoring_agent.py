from typing import Dict, Any
from app.agents.base_agent import BaseAgent
from app.ml.feature_extractor import FeatureExtractor

class ActivityMonitoringAgent(BaseAgent):
    """
    Agent 1: Activity Monitoring Agent
    Monitors raw activity events, ingests telemetry stream, extracts feature attributes,
    and performs immediate rule-based boundary checks.
    """
    def __init__(self):
        super().__init__("ActivityMonitoringAgent")

    async def process(self, context: Dict[str, Any]) -> Dict[str, Any]:
        event = context.get("event", {})
        user_profile = context.get("user_profile")
        recent_events = context.get("recent_events", [])

        # Extract features
        features = FeatureExtractor.extract_features(
            event_dict=event,
            user_profile=user_profile,
            recent_events=recent_events
        )

        flags = []
        if features.get("is_after_hours", 0) > 0:
            flags.append("AFTER_HOURS_ACCESS")
        if features.get("device_novelty", 0) > 0:
            flags.append("UNRECOGNIZED_DEVICE")
        if features.get("ip_novelty", 0) > 0:
            flags.append("UNRECOGNIZED_IP")
        if features.get("privilege_weight", 1.0) >= 8.0:
            flags.append("HIGH_PRIVILEGE_OPERATION")

        summary = f"Monitored {event.get('event_type')}. Extracted 10 telemetry features. Found {len(flags)} baseline flags: {', '.join(flags) if flags else 'None'}."

        return {
            "agent_status": "ALERT" if flags else "SUCCESS",
            "features": features,
            "monitoring_flags": flags,
            "confidence": 0.98,
            "input_summary": f"Event: {event.get('event_type')}, User: {event.get('user_id')}, IP: {event.get('ip_address')}",
            "output_summary": summary
        }
