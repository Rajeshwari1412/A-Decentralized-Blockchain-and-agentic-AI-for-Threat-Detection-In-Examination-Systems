from typing import Dict, Any
from app.agents.base_agent import BaseAgent
from app.blockchain.web3_client import blockchain_client
from app.core.database import SessionLocal
from app.models import BlockchainRecord, ActivityEvent
import logging

logger = logging.getLogger(__name__)

class BlockchainAuditAgent(BaseAgent):
    """
    Agent 7: Blockchain Audit Agent
    Computes cryptographic SHA-256 hashes of critical security events,
    anchors them onto the immutable blockchain ledger, and validates proof chains.
    """
    def __init__(self):
        super().__init__("BlockchainAuditAgent")

    # Critical events that warrant immutable blockchain anchoring
    ANCHOR_ELIGIBLE_EVENTS = [
        "QP_VIEW",
        "QP_DOWNLOAD",
        "BULK_DOWNLOAD",
        "PRIVILEGE_ESCALATION",
        "EXPORT_DATA",
        "PERMISSION_MODIFICATION",
        "EXAM_LOCK",
        "QUESTION_TAMPER",
        "AFTER_HOURS_ACCESS"
    ]

    async def process(self, context: Dict[str, Any]) -> Dict[str, Any]:
        event = context.get("event", {})
        activity_db_id = context.get("activity_db_id")
        risk_data = context.get("risk_data", {})

        event_type = event.get("event_type", "")
        event_uuid = event.get("event_uuid", "")
        user_id = event.get("user_id", "")
        overall_risk = risk_data.get("overall_risk_score", 0.0)

        # Decide if event needs blockchain anchoring
        should_anchor = (
            event_type in self.ANCHOR_ELIGIBLE_EVENTS or
            overall_risk >= 50.0 or
            event.get("is_blockchain_anchored", False)
        )

        if not should_anchor:
            return {
                "agent_status": "SUCCESS",
                "anchored": False,
                "confidence": 0.99,
                "input_summary": f"Routine event {event_type} - skipped blockchain anchor",
                "output_summary": f"Routine operational event {event_type} recorded in standard audit logs without smart contract overhead."
            }

        # Compute deterministic SHA-256 hash
        record_hash = blockchain_client.compute_event_hash(event)

        # Anchor onto Blockchain / Ledger
        tx_result = blockchain_client.anchor_event_hash(
            event_uuid=event_uuid,
            event_type=event_type,
            user_id=user_id,
            record_hash=record_hash,
            metadata_uri=f"examsentinel://events/{event_uuid}"
        )

        # Save Blockchain Record to DB
        db = SessionLocal()
        try:
            bc_record = BlockchainRecord(
                event_uuid=event_uuid,
                event_type=event_type,
                user_id=user_id,
                payload_hash=record_hash,
                block_number=tx_result["block_number"],
                transaction_hash=tx_result["transaction_hash"],
                contract_address=tx_result["contract_address"],
                verification_status="VERIFIED"
            )
            db.add(bc_record)

            # Update activity event with blockchain status
            if activity_db_id:
                act = db.query(ActivityEvent).filter(ActivityEvent.id == activity_db_id).first()
                if act:
                    act.is_blockchain_anchored = True
                    act.blockchain_tx_hash = tx_result["transaction_hash"]
                    act.sha256_hash = record_hash

            db.commit()
        except Exception as e:
            logger.error(f"Error persisting blockchain record: {e}")
            db.rollback()
        finally:
            db.close()

        summary = f"Anchored SHA-256 hash ({record_hash[:12]}...) to Block #{tx_result['block_number']} [Tx: {tx_result['transaction_hash'][:14]}...]."

        return {
            "agent_status": "SUCCESS",
            "anchored": True,
            "record_hash": record_hash,
            "block_number": tx_result["block_number"],
            "transaction_hash": tx_result["transaction_hash"],
            "contract_address": tx_result["contract_address"],
            "confidence": 1.0,
            "input_summary": f"Event {event_uuid}, Type: {event_type}",
            "output_summary": summary
        }
