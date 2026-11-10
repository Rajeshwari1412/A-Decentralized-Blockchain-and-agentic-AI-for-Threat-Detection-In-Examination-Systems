import pytest
from app.agents.agent_orchestrator import agent_orchestrator
from app.blockchain.web3_client import blockchain_client

@pytest.mark.asyncio
async def test_agent_orchestrator_pipeline():
    event_dict = {
        "event_uuid": "EVT-TEST-9999",
        "user_id": "USR-TEST-001",
        "event_type": "BULK_DOWNLOAD",
        "resource_type": "QUESTION_PAPER",
        "resource_id": "QP-TEST-MATH",
        "ip_address": "198.51.100.22",
        "device_fingerprint": "DEV-TEST-UNKNOWN",
        "location": "Remote External",
        "payload_json": '{"download_count": 15}',
        "payload": {"download_count": 15},
        "timestamp": "2026-10-02T03:15:00Z"
    }

    result = await agent_orchestrator.process_event_pipeline(
        event_dict=event_dict,
        user_profile=None,
        recent_events=[],
        activity_db_id=""
    )

    assert "risk_data" in result
    assert "anomaly_data" in result
    assert "investigation_data" in result
    assert "blockchain_data" in result
    assert result["risk_data"]["overall_risk_score"] > 60.0
    assert result["blockchain_data"]["anchored"] is True

def test_blockchain_hash_and_tamper_detection():
    event_data = {
        "event_uuid": "EVT-BC-001",
        "event_type": "QP_DOWNLOAD",
        "user_id": "USR-42",
        "resource_id": "QP-MATH",
        "timestamp": "2026-10-02T10:00:00Z",
        "ip_address": "192.168.1.10",
        "payload_json": '{"status": "VALID"}'
    }

    original_hash = blockchain_client.compute_event_hash(event_data)
    assert len(original_hash) == 64

    # Verify matching hash
    verify_match = blockchain_client.verify_event_integrity(
        event_uuid="EVT-BC-001",
        current_computed_hash=original_hash,
        anchored_hash=original_hash
    )
    assert verify_match["is_valid"] is True
    assert verify_match["status"] == "VERIFIED_AUTHENTIC"

    # Verify tampered payload detects mismatch
    tampered_data = dict(event_data, payload_json='{"status": "TAMPERED_BY_MALICIOUS_ACTOR"}')
    tampered_hash = blockchain_client.compute_event_hash(tampered_data)
    
    verify_tamper = blockchain_client.verify_event_integrity(
        event_uuid="EVT-BC-001",
        current_computed_hash=tampered_hash,
        anchored_hash=original_hash
    )
    assert verify_tamper["is_valid"] is False
    assert verify_tamper["status"] == "TAMPER_DETECTED"
