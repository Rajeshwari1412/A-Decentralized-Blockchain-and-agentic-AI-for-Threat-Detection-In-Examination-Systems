from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

class BlockchainRecordOut(BaseModel):
    id: str
    event_uuid: str
    event_type: str
    user_id: str
    payload_hash: str
    block_number: int
    transaction_hash: str
    contract_address: str
    verification_status: str
    anchored_at: datetime

    class Config:
        from_attributes = True

class BlockchainVerificationRequest(BaseModel):
    event_uuid: str
    claimed_hash: Optional[str] = None # If None, will recalculate from DB record payload

class BlockchainVerificationResponse(BaseModel):
    event_uuid: str
    is_valid: bool
    status: str # "VERIFIED_AUTHENTIC", "TAMPER_DETECTED", "NOT_ANCHORED"
    ledger_hash: str
    current_computed_hash: str
    block_number: int
    transaction_hash: str
    anchored_at: Optional[datetime]
    discrepancy_details: Optional[str] = None

class AgentRunOut(BaseModel):
    id: str
    agent_name: str
    status: str
    trigger_event: str
    input_summary: str
    output_summary: str
    confidence_score: float
    execution_time_ms: float
    created_at: datetime

    class Config:
        from_attributes = True
