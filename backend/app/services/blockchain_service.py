from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models import BlockchainRecord, ActivityEvent
from app.blockchain.web3_client import blockchain_client
import logging

logger = logging.getLogger(__name__)

class BlockchainService:
    @staticmethod
    def get_blockchain_records(db: Session, limit: int = 50) -> List[Dict[str, Any]]:
        records = db.query(BlockchainRecord).order_by(desc(BlockchainRecord.anchored_at)).limit(limit).all()
        return [
            {
                "id": r.id,
                "event_uuid": r.event_uuid,
                "event_type": r.event_type,
                "user_id": r.user_id,
                "payload_hash": r.payload_hash,
                "block_number": r.block_number,
                "transaction_hash": r.transaction_hash,
                "contract_address": r.contract_address,
                "verification_status": r.verification_status,
                "anchored_at": r.anchored_at
            }
            for r in records
        ]

    @staticmethod
    def verify_event_hash(
        db: Session,
        event_uuid: str,
        custom_claimed_hash: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Verifies event hash against the blockchain ledger.
        Demonstrates: PostgreSQL Event -> SHA-256 Hash -> Blockchain -> Cryptographic Verification.
        """
        record = db.query(BlockchainRecord).filter(BlockchainRecord.event_uuid == event_uuid).first()
        if not record:
            return {
                "event_uuid": event_uuid,
                "is_valid": False,
                "status": "NOT_ANCHORED",
                "ledger_hash": "",
                "current_computed_hash": "",
                "block_number": 0,
                "transaction_hash": "",
                "anchored_at": None,
                "discrepancy_details": "Event has not been anchored to the blockchain audit ledger."
            }

        act = db.query(ActivityEvent).filter(ActivityEvent.event_uuid == event_uuid).first()
        
        # Calculate current hash from actual active database record
        if custom_claimed_hash:
            current_hash = custom_claimed_hash
        elif act:
            current_hash = blockchain_client.compute_event_hash({
                "event_uuid": act.event_uuid,
                "event_type": act.event_type,
                "user_id": act.user_id,
                "resource_id": act.resource_id,
                "timestamp": act.timestamp.isoformat(),
                "ip_address": act.ip_address,
                "payload_json": act.payload_json
            })
        else:
            current_hash = record.payload_hash

        verification_result = blockchain_client.verify_event_integrity(
            event_uuid=event_uuid,
            current_computed_hash=current_hash,
            anchored_hash=record.payload_hash
        )

        return {
            **verification_result,
            "block_number": record.block_number,
            "transaction_hash": record.transaction_hash,
            "anchored_at": record.anchored_at
        }

    @staticmethod
    def simulate_database_tamper(db: Session, event_uuid: str) -> Dict[str, Any]:
        """
        Intentionally alters database row payload to demonstrate how Blockchain Audit Ledger
        immediately detects insider database tampering.
        """
        act = db.query(ActivityEvent).filter(ActivityEvent.event_uuid == event_uuid).first()
        if not act:
            raise ValueError(f"Event {event_uuid} not found")

        original_hash = act.sha256_hash
        # Mutate payload in PostgreSQL/SQLite
        act.payload_json = '{"tampered_by": "Rogue Database Admin", "action": "ERASE_AUDIT_LOG_ATTEMPT", "modified_status": "NORMAL_BYPASS"}'
        act.ip_address = "10.0.0.99"
        db.commit()

        # Re-verify against immutable blockchain ledger
        result = BlockchainService.verify_event_hash(db, event_uuid)
        return {
            "tamper_simulation_success": True,
            "event_uuid": event_uuid,
            "original_sha256_hash": original_hash,
            "verification_result": result
        }

    @staticmethod
    def anchor_generic_event(
        db: Session,
        event_uuid: str,
        event_type: str,
        user_id: str,
        record_hash: str,
        metadata_uri: str = ""
    ) -> BlockchainRecord:
        """
        Anchors any security or exam credential event to the blockchain ledger.
        """
        anchor_res = blockchain_client.anchor_event_hash(
            event_uuid=event_uuid,
            event_type=event_type,
            user_id=user_id,
            record_hash=record_hash,
            metadata_uri=metadata_uri
        )

        b_record = BlockchainRecord(
            event_uuid=event_uuid,
            event_type=event_type,
            user_id=user_id,
            payload_hash=record_hash,
            block_number=anchor_res["block_number"],
            transaction_hash=anchor_res["transaction_hash"],
            contract_address=anchor_res["contract_address"],
            verification_status="VERIFIED",
            anchored_at=anchor_res["anchored_at"]
        )
        db.add(b_record)
        db.commit()
        db.refresh(b_record)
        return b_record

    @staticmethod
    def compute_submission_hash(
        submission_uuid: str,
        candidate_email: str,
        exam_code: str,
        score: float,
        grade: str,
        answers_json: str
    ) -> str:
        import hashlib
        canonical = f"{submission_uuid}:{candidate_email}:{exam_code}:{score:.1f}:{grade}:{answers_json}"
        return hashlib.sha256(canonical.encode("utf-8")).hexdigest()

    @staticmethod
    def verify_submission_certificate(
        db: Session,
        certificate_or_submission_uuid: str
    ) -> Dict[str, Any]:
        """
        Cryptographically verifies an exam certificate or submission against the blockchain ledger.
        """
        from app.models import ExamSubmission, User, Examination
        sub = db.query(ExamSubmission).filter(
            (ExamSubmission.certificate_uuid == certificate_or_submission_uuid) |
            (ExamSubmission.submission_uuid == certificate_or_submission_uuid)
        ).first()

        if not sub:
            return {
                "certificate_uuid": certificate_or_submission_uuid,
                "is_valid": False,
                "status": "NOT_FOUND",
                "candidate_name": "Unknown",
                "candidate_email": "Unknown",
                "exam_title": "Unknown",
                "exam_code": "Unknown",
                "score": 0.0,
                "total_marks": 0.0,
                "percentage": 0.0,
                "grade": "N/A",
                "passed": False,
                "ledger_hash": "",
                "current_computed_hash": "",
                "transaction_hash": "",
                "block_number": 0,
                "anchored_at": None,
                "discrepancy_details": "No examination submission or certificate found matching this identifier."
            }

        candidate = db.query(User).filter(User.id == sub.candidate_id).first()
        exam = db.query(Examination).filter(Examination.id == sub.exam_id).first()

        candidate_email = candidate.email if candidate else "candidate@examsentinel.edu"
        candidate_name = candidate.full_name if candidate else "Candidate"
        exam_code = exam.exam_code if exam else "EXAM"
        exam_title = exam.title if exam else "Examination"

        # Lookup anchored record
        record = db.query(BlockchainRecord).filter(
            BlockchainRecord.event_uuid == sub.submission_uuid
        ).first()

        # Re-compute current hash from live database state
        current_hash = BlockchainService.compute_submission_hash(
            submission_uuid=sub.submission_uuid,
            candidate_email=candidate_email,
            exam_code=exam_code,
            score=sub.score,
            grade=sub.grade,
            answers_json=sub.answers_json
        )

        if not record:
            return {
                "certificate_uuid": sub.certificate_uuid,
                "is_valid": False,
                "status": "NOT_ANCHORED",
                "candidate_name": candidate_name,
                "candidate_email": candidate_email,
                "exam_title": exam_title,
                "exam_code": exam_code,
                "score": sub.score,
                "total_marks": sub.total_marks,
                "percentage": sub.percentage,
                "grade": sub.grade,
                "passed": sub.passed,
                "ledger_hash": "",
                "current_computed_hash": current_hash,
                "transaction_hash": "",
                "block_number": 0,
                "anchored_at": None,
                "discrepancy_details": "Certificate was generated but is not anchored to the blockchain audit ledger."
            }

        ledger_hash = record.payload_hash
        is_authentic = (current_hash.lower() == ledger_hash.lower())
        status = "VERIFIED_AUTHENTIC" if is_authentic else "TAMPER_DETECTED"
        discrepancy = None
        if not is_authentic:
            discrepancy = (
                f"Cryptographic Mismatch! Current Database Hash ({current_hash[:16]}...) "
                f"differs from Blockchain Ledger Anchor ({ledger_hash[:16]}...). "
                f"Database record for this candidate has been illicitly modified (e.g. score alteration)!"
            )

        return {
            "certificate_uuid": sub.certificate_uuid,
            "submission_uuid": sub.submission_uuid,
            "is_valid": is_authentic,
            "status": status,
            "candidate_name": candidate_name,
            "candidate_email": candidate_email,
            "exam_title": exam_title,
            "exam_code": exam_code,
            "score": sub.score,
            "total_marks": sub.total_marks,
            "percentage": sub.percentage,
            "grade": sub.grade,
            "passed": sub.passed,
            "ledger_hash": ledger_hash,
            "current_computed_hash": current_hash,
            "transaction_hash": record.transaction_hash,
            "block_number": record.block_number,
            "anchored_at": record.anchored_at,
            "discrepancy_details": discrepancy
        }

    @staticmethod
    def simulate_submission_tamper(db: Session, submission_uuid: str) -> Dict[str, Any]:
        """
        Simulates insider tampering by elevating candidate's score in the database.
        Immediately demonstrates that the blockchain ledger catches the fraudulent modification.
        """
        from app.models import ExamSubmission
        sub = db.query(ExamSubmission).filter(ExamSubmission.submission_uuid == submission_uuid).first()
        if not sub:
            raise ValueError(f"Submission {submission_uuid} not found")

        original_score = sub.score
        original_grade = sub.grade

        # Tamper: illegally elevate score to 100 (A+)
        sub.score = min(sub.total_marks, sub.total_marks)
        sub.percentage = 100.0
        sub.grade = "A+"
        sub.passed = True
        db.commit()

        # Verify immediately
        verification = BlockchainService.verify_submission_certificate(db, sub.certificate_uuid)
        return {
            "tamper_simulation_success": True,
            "submission_uuid": submission_uuid,
            "certificate_uuid": sub.certificate_uuid,
            "original_score": original_score,
            "original_grade": original_grade,
            "tampered_score": sub.score,
            "tampered_grade": sub.grade,
            "verification_result": verification
        }
