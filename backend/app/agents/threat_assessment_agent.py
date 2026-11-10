from typing import Dict, Any
from app.agents.base_agent import BaseAgent
from app.ml.risk_scorer import RiskScorer

class ThreatAssessmentAgent(BaseAgent):
    """
    Agent 4: Threat Assessment Agent
    Synthesizes signals from Monitoring, Behavioral, and Anomaly agents.
    Computes 0-100 composite risk score, assigns risk tier, tags MITRE ATT&CK tactics,
    and categorizes insider threat vectors.
    """
    def __init__(self):
        super().__init__("ThreatAssessmentAgent")

    async def process(self, context: Dict[str, Any]) -> Dict[str, Any]:
        features = context.get("features", {})
        anomaly_data = context.get("anomaly_data", {})
        event = context.get("event", {})
        user_profile = context.get("user_profile")

        ml_score = anomaly_data.get("normalized_score", 15.0)
        event_type = event.get("event_type", "LOGIN")

        risk_analysis = RiskScorer.calculate_composite_risk(
            ml_anomaly_score=ml_score,
            features=features,
            event_type=event_type,
            user_profile=user_profile
        )

        overall = risk_analysis["overall_risk_score"]
        tier = risk_analysis["risk_tier"]
        category = risk_analysis["threat_category"]

        status = "ALERT" if overall >= 65.0 else ("WARNING" if overall >= 35.0 else "SUCCESS")
        summary = f"Risk Score: {overall}/100 [{tier}]. Threat Vector: {category}. MITRE: {', '.join(risk_analysis['mitre_tactics'])}."

        return {
            "agent_status": status,
            "risk_analysis": risk_analysis,
            "confidence": 0.95,
            "input_summary": f"ML Anomaly Score: {ml_score}, Event: {event_type}",
            "output_summary": summary
        }
