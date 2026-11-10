import pytest
import json
import uuid
from datetime import datetime, timezone, timedelta
from app.core.database import SessionLocal, Base, engine
from app.models import Examination, Question, User, ExamSubmission, BlockchainRecord
from app.services.blockchain_service import BlockchainService
from app.services.simulator_service import SimulatorService

@pytest.fixture(scope="module")
def db():
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    SimulatorService.seed_synthetic_dataset(session)
    yield session
    session.close()

def test_seeded_questions_and_exams(db):
    exam = db.query(Examination).filter(Examination.exam_code == "EXAM-2026-CS401").first()
    assert exam is not None
    questions = db.query(Question).filter(Question.exam_id == exam.id).all()
    assert len(questions) >= 4
    assert any("consensus" in q.question_text.lower() for q in questions)

def test_submission_anchoring_and_verification(db):
    exam = db.query(Examination).filter(Examination.exam_code == "EXAM-2026-CS401").first()
    candidate = db.query(User).filter(User.email == "candidate.01@examsentinel.edu").first()
    assert exam is not None and candidate is not None

    sub_uuid = f"SUB-TEST-{uuid.uuid4().hex[:8].upper()}"
    cert_uuid = f"CERT-TEST-{uuid.uuid4().hex[:8].upper()}"
    answers_json = json.dumps({"q1": "PBFT", "q2": "Revert", "q3": "Merkle Tree", "q4": "Avalanche"})

    sub_hash = BlockchainService.compute_submission_hash(
        submission_uuid=sub_uuid,
        candidate_email=candidate.email,
        exam_code=exam.exam_code,
        score=95.0,
        grade="A+",
        answers_json=answers_json
    )

    b_record = BlockchainService.anchor_generic_event(
        db=db,
        event_uuid=sub_uuid,
        event_type="CANDIDATE_EXAM_SUBMISSION",
        user_id=candidate.id,
        record_hash=sub_hash,
        metadata_uri=f"ipfs://test-certs/{cert_uuid}"
    )

    submission = ExamSubmission(
        submission_uuid=sub_uuid,
        exam_id=exam.id,
        candidate_id=candidate.id,
        answers_json=answers_json,
        score=95.0,
        total_marks=100.0,
        percentage=95.0,
        grade="A+",
        passed=True,
        tab_switches=0,
        submission_hash=sub_hash,
        is_blockchain_anchored=True,
        blockchain_tx_hash=b_record.transaction_hash,
        blockchain_block_number=b_record.block_number,
        certificate_uuid=cert_uuid,
        created_at=datetime.now(timezone.utc)
    )
    db.add(submission)
    db.commit()

    # Verify authentic
    verify_res = BlockchainService.verify_submission_certificate(db, cert_uuid)
    assert verify_res["is_valid"] is True
    assert verify_res["status"] == "VERIFIED_AUTHENTIC"
    assert verify_res["score"] == 95.0
    assert verify_res["grade"] == "A+"

    # Tamper with submission score in database
    tamper_res = BlockchainService.simulate_submission_tamper(db, sub_uuid)
    assert tamper_res["tamper_simulation_success"] is True
    assert tamper_res["verification_result"]["is_valid"] is False
    assert tamper_res["verification_result"]["status"] == "TAMPER_DETECTED"
    assert "Cryptographic Mismatch" in tamper_res["verification_result"]["discrepancy_details"]
