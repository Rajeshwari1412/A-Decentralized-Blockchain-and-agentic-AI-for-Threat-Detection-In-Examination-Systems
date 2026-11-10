from typing import Dict, Any
from app.agents.base_agent import BaseAgent
from app.ml.isolation_forest_detector import detector

class AnomalyDetectionAgent(BaseAgent):
    """
    Agent 3: Anomaly Detection Agent
    Applies Scikit-learn Isolation Forest unsupervised ML to detect multidimensional outliers
    and extracts explainable feature attribution contributions.
    """
    def __init__(self):
        super().__init__("AnomalyDetectionAgent")

    async def process(self, context: Dict[str, Any]) -> Dict[str, Any]:
        features = context.get("features", {})
        
        is_anomaly, raw_score, normalized_score, contributions = detector.predict_anomaly(features)

        status = "ALERT" if is_anomaly else "SUCCESS"
        top_contribs = [f"{k} ({v}%)" for k, v in sorted(contributions.items(), key=lambda x: x[1], reverse=True)[:3]]

        summary = f"Isolation Forest Anomaly: {is_anomaly} (Score: {normalized_score}/100, Raw: {raw_score:.3f}). Key drivers: {', '.join(top_contribs)}."

        return {
            "agent_status": status,
            "is_anomaly": is_anomaly,
            "raw_score": raw_score,
            "normalized_score": normalized_score,
            "feature_contributions": contributions,
            "confidence": 0.96,
            "input_summary": f"Feature vector evaluated across 10 dimensions",
            "output_summary": summary
        }
