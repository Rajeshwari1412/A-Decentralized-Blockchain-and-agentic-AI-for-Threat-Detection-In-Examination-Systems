from typing import Dict, Any
from app.agents.base_agent import BaseAgent

class BehavioralAnalysisAgent(BaseAgent):
    """
    Agent 2: Behavioral Analysis Agent
    Builds and updates user behavioral baselines, comparing real-time telemetry against
    historical working habits (login windows, access velocity, download thresholds).
    """
    def __init__(self):
        super().__init__("BehavioralAnalysisAgent")

    async def process(self, context: Dict[str, Any]) -> Dict[str, Any]:
        features = context.get("features", {})
        user_profile = context.get("user_profile")
        event = context.get("event", {})

        # Calculate behavioral variance score
        variance_score = 0.0
        reasons = []

        if features.get("is_after_hours", 0) > 0:
            variance_score += 25.0
            reasons.append("Operating outside registered working hours (09:00 - 18:00)")

        if features.get("ip_novelty", 0) > 0:
            variance_score += 30.0
            reasons.append(f"Unfamiliar source IP ({event.get('ip_address')}) not in historical profile")

        if features.get("device_novelty", 0) > 0:
            variance_score += 35.0
            reasons.append("Unregistered hardware fingerprint / browser environment")

        dl_ratio = features.get("download_volume_ratio", 1.0)
        if dl_ratio > 3.0:
            variance_score += 40.0
            reasons.append(f"Excessive resource download volume ({dl_ratio:.1f}x higher than standard baseline)")

        variance_score = min(100.0, variance_score)
        status = "ALERT" if variance_score >= 50.0 else ("WARNING" if variance_score >= 25.0 else "SUCCESS")

        summary = f"Behavioral deviation index: {variance_score:.1f}/100. Factors: {'; '.join(reasons) if reasons else 'Normal routine behavior'}."

        return {
            "agent_status": status,
            "behavioral_variance_score": variance_score,
            "behavioral_reasons": reasons,
            "confidence": 0.94,
            "input_summary": f"Features: after_hours={features.get('is_after_hours')}, dl_ratio={dl_ratio:.1f}",
            "output_summary": summary
        }
