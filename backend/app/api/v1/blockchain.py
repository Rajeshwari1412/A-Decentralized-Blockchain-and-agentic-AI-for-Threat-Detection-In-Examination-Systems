from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.blockchain import BlockchainRecordOut, BlockchainVerificationRequest, BlockchainVerificationResponse
from app.services.blockchain_service import BlockchainService

router = APIRouter(prefix="/blockchain", tags=["Blockchain Audit Ledger"])

@router.get("/records", response_model=List[BlockchainRecordOut])
def get_anchored_blockchain_records(limit: int = 50, db: Session = Depends(get_db)):
    return BlockchainService.get_blockchain_records(db, limit=limit)

@router.post("/verify", response_model=BlockchainVerificationResponse)
def verify_event_cryptographic_integrity(
    req: BlockchainVerificationRequest,
    db: Session = Depends(get_db)
):
    return BlockchainService.verify_event_hash(
        db=db,
        event_uuid=req.event_uuid,
        custom_claimed_hash=req.claimed_hash
    )

@router.post("/tamper-demo/{event_uuid}")
def demonstrate_database_tampering(event_uuid: str, db: Session = Depends(get_db)):
    """
    Demonstration tool: Deliberately alters PostgreSQL/SQLite row payload to prove
    that the Blockchain Audit Ledger immediately catches unauthorized tampering.
    """
    try:
        return BlockchainService.simulate_database_tamper(db, event_uuid)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
