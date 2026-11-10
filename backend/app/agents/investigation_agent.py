from typing import Dict, Any, List
from app.agents.base_agent import BaseAgent

class InvestigationAgent(BaseAgent):
    """
    Agent 5: Investigation Agent
    Correlates chronological security events, formulates root-cause hypotheses,
    compiles explainable evidence packages, and generates specific containment recommendations
    for SOC analysts while adhering to human-in-the-loop principles.
    """
    def __init__(self):
        super().__init__("InvestigationAgent")

    async def process(self, context: Dict[str, Any]) -> Dict[str, Any]:
        event = context.get("event", {})
        recent_events = context.get("recent_events", [])
        risk_data = context.get("risk_data", {})
        anomaly_data = context.get("anomaly_data", {})
        user_profile = context.get("user_profile")
        monitoring_flags = context.get("monitoring_flags", [])

        overall_score = risk_data.get("overall_risk_score", 0.0)
        risk_tier = risk_data.get("risk_tier", "LOW")
        threat_category = risk_data.get("threat_category", "Routine Activity")
        risk_factors = risk_data.get("risk_factors", [])

        # Build chronological evidence narrative
        evidence_lines = []
        evidence_lines.append(f"1. Trigger Event: {event.get('event_type')} at {event.get('timestamp')}")
        evidence_lines.append(f"2. Network Origin: IP {event.get('ip_address')} ({event.get('location', 'Unknown Location')})")
        
        if monitoring_flags:
            evidence_lines.append(f"3. Policy Violations: {', '.join(monitoring_flags)}")

        contribs = anomaly_data.get("feature_contributions", {})
        if contribs:
            top_factors = [f"{k} ({v}%)" for k, v in sorted(contribs.items(), key=lambda x: x[1], reverse=True)[:3]]
            evidence_lines.append(f"4. Isolation Forest Key Deviations: {', '.join(top_factors)}")

        if len(recent_events) > 1:
            evidence_lines.append(f"5. Sequence Velocity: {len(recent_events)} correlated operations detected within active observation window.")

        evidence_summary = "\n".join(evidence_lines)

        # Formulate root cause hypothesis (objective, non-judgmental)
        if "Exfiltration" in threat_category or "Bulk" in str(risk_factors):
            root_cause = (
                f"Observed pattern indicates potential unauthorized bulk data retrieval of examination assets "
                f"from an abnormal network context (IP: {event.get('ip_address')}). "
                f"Could represent compromised staff credentials or intentional insider policy violation."
            )
            suggested_action = (
                "1. Temporarily restrict question-paper download permissions for this user account.\n"
                "2. Verify integrity of question paper hash on the Blockchain Audit Ledger.\n"
                "3. Contact user via out-of-band channel to verify session legitimacy.\n"
                "4. Review session screen recordings or exam server access logs."
            )
        elif "Privilege" in threat_category:
            root_cause = (
                f"Elevated administrative actions attempted outside normal operational schedule. "
                f"High potential for privilege abuse or session hijacking."
            )
            suggested_action = (
                "1. Require Step-up MFA verification for this administrative session.\n"
                "2. Rollback recent permission modifications if unauthorized.\n"
                "3. Review audit ledger for unauthorized user role modifications."
            )
        elif overall_score >= 60.0:
            root_cause = (
                f"Multiple anomalous behavioral indicators detected concurrently (risk score: {overall_score}/100). "
                f"Unusual temporal and device signature deviates significantly from user's historical baseline."
            )
            suggested_action = (
                "1. Escalate to Tier-2 Security Analyst for interactive triage.\n"
                "2. Monitor candidate or staff session in real time via SOC telemetry stream.\n"
                "3. Inspect blockchain audit trail for cryptographic consistency."
            )
        else:
            root_cause = "Activity matches routine parameters with negligible risk indicators."
            suggested_action = "No intervention required. Retain in standard audit log stream."

        summary = f"Investigation synthesized: Hypothesis formulated for {threat_category}. Risk Level: {risk_tier} ({overall_score}/100)."

        return {
            "agent_status": "ALERT" if overall_score >= 60.0 else "SUCCESS",
            "evidence_summary": evidence_summary,
            "root_cause_hypothesis": root_cause,
            "suggested_action": suggested_action,
            "confidence": 0.92,
            "input_summary": f"User: {event.get('user_id')}, Risk: {overall_score}, Events correlated: {len(recent_events)}",
            "output_summary": summary
        }
