from typing import Dict, Any, List
import logging
from app.agents.activity_monitoring_agent import ActivityMonitoringAgent
from app.agents.behavioral_analysis_agent import BehavioralAnalysisAgent
from app.agents.anomaly_detection_agent import AnomalyDetectionAgent
from app.agents.threat_assessment_agent import ThreatAssessmentAgent
from app.agents.investigation_agent import InvestigationAgent
from app.agents.alert_response_agent import AlertResponseAgent
from app.agents.blockchain_audit_agent import BlockchainAuditAgent
from app.core.websocket_manager import ws_manager

logger = logging.getLogger(__name__)

class AgentOrchestrator:
    """
    Coordinates execution of all 7 ExamSentinel AI agents sequentially or in parallel stages,
    exchanging context and broadcasting execution telemetry in real-time.
    """
    def __init__(self):
        self.monitoring_agent = ActivityMonitoringAgent()
        self.behavioral_agent = BehavioralAnalysisAgent()
        self.anomaly_agent = AnomalyDetectionAgent()
        self.threat_agent = ThreatAssessmentAgent()
        self.investigation_agent = InvestigationAgent()
        self.alert_agent = AlertResponseAgent()
        self.blockchain_agent = BlockchainAuditAgent()

    async def process_event_pipeline(
        self,
        event_dict: Dict[str, Any],
        user_profile: Any,
        recent_events: List[Dict[str, Any]],
        activity_db_id: str
    ) -> Dict[str, Any]:
        """
        Executes the cooperative multi-agent pipeline for an incoming activity event.
        """
        context: Dict[str, Any] = {
            "event": event_dict,
            "user_profile": user_profile,
            "recent_events": recent_events,
            "activity_db_id": activity_db_id
        }

        # Stage 1: Activity Monitoring
        monitoring_res = await self.monitoring_agent.execute(context)
        context["features"] = monitoring_res.get("features", {})
        context["monitoring_flags"] = monitoring_res.get("monitoring_flags", [])

        # Stage 2: Behavioral Analysis
        behavioral_res = await self.behavioral_agent.execute(context)
        context["behavioral_data"] = behavioral_res

        # Stage 3: ML Anomaly Detection (Isolation Forest)
        anomaly_res = await self.anomaly_agent.execute(context)
        context["anomaly_data"] = anomaly_res

        # Stage 4: Threat Assessment & Risk Scoring
        threat_res = await self.threat_agent.execute(context)
        context["risk_data"] = threat_res.get("risk_analysis", {})

        # Stage 5: Investigation & Evidence Synthesis
        investigation_res = await self.investigation_agent.execute(context)
        context["investigation_data"] = investigation_res

        # Stage 6: Alert & Real-Time Response
        alert_res = await self.alert_agent.execute(context)
        context["alert_data"] = alert_res

        # Stage 7: Cryptographic Blockchain Auditing
        blockchain_res = await self.blockchain_agent.execute(context)
        context["blockchain_data"] = blockchain_res

        # Broadcast consolidated agent execution telemetry to SOC Dashboard
        await ws_manager.broadcast("AGENT_ORCHESTRATION_COMPLETED", {
            "event_uuid": event_dict.get("event_uuid"),
            "event_type": event_dict.get("event_type"),
            "user_id": event_dict.get("user_id"),
            "risk_score": context["risk_data"].get("overall_risk_score", 0.0),
            "risk_tier": context["risk_data"].get("risk_tier", "LOW"),
            "is_anomaly": anomaly_res.get("is_anomaly", False),
            "blockchain_anchored": blockchain_res.get("anchored", False),
            "agent_summaries": {
                "ActivityMonitoringAgent": monitoring_res.get("output_summary"),
                "BehavioralAnalysisAgent": behavioral_res.get("output_summary"),
                "AnomalyDetectionAgent": anomaly_res.get("output_summary"),
                "ThreatAssessmentAgent": threat_res.get("output_summary"),
                "InvestigationAgent": investigation_res.get("output_summary"),
                "AlertResponseAgent": alert_res.get("output_summary"),
                "BlockchainAuditAgent": blockchain_res.get("output_summary")
            }
        })

        return context

agent_orchestrator = AgentOrchestrator()
