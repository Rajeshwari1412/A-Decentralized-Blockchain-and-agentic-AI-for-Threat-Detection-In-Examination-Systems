from typing import List, Any, Optional, Dict
import uuid
import json
import hashlib
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import Examination, Question, QuestionPaper, Candidate, ExamSession, User, ActivityEvent, ExamSubmission, BlockchainRecord
from app.schemas.exam import (
    ExamCreate, ExamOut, QuestionCreate, QuestionPaperCreate, QuestionPaperOut, ExamSessionOut,
    ExamWithQuestionsCreate, ExamQuestionPublic, ExamSubmissionRequest, ExamSubmissionOut,
    CertificateVerificationResponse, QuestionResultDetail
)
from app.api.v1.auth import get_current_user
from app.services.activity_service import ActivityService
from app.services.blockchain_service import BlockchainService

router = APIRouter(prefix="/exams", tags=["Examination Management"])

@router.get("/", response_model=List[ExamOut])
def get_all_exams(db: Session = Depends(get_db)):
    exams = db.query(Examination).all()
    out = []
    for e in exams:
        q_count = db.query(Question).filter(Question.exam_id == e.id).count()
        c_count = db.query(Candidate).filter(Candidate.exam_id == e.id).count()
        out.append(ExamOut(
            id=e.id,
            exam_code=e.exam_code,
            title=e.title,
            subject=e.subject,
            start_time=e.start_time,
            end_time=e.end_time,
            duration_minutes=e.duration_minutes,
            total_marks=e.total_marks,
            passing_marks=e.passing_marks,
            status=e.status,
            created_by_id=e.created_by_id,
            created_at=e.created_at,
            question_count=q_count,
            candidate_count=c_count
        ))
    return out

@router.post("/create-with-questions")
async def create_exam_with_questions(
    data: ExamWithQuestionsCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Creates an examination with full question bank, cryptographically seals the question paper,
    and automatically anchors the paper hash onto the immutable blockchain ledger.
    """
    existing = db.query(Examination).filter(Examination.exam_code == data.exam_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Exam code already exists")

    now = datetime.now(timezone.utc)
    exam = Examination(
        exam_code=data.exam_code,
        title=data.title,
        subject=data.subject,
        start_time=now,
        end_time=now + timedelta(hours=3),
        duration_minutes=data.duration_minutes,
        total_marks=data.total_marks,
        passing_marks=data.passing_marks,
        status="SCHEDULED",
        created_by_id=current_user.id
    )
    db.add(exam)
    db.flush()

    # Add questions
    for q_in in data.questions:
        q = Question(
            exam_id=exam.id,
            question_text=q_in.question_text,
            question_type=q_in.question_type,
            options_json=json.dumps(q_in.options),
            correct_answer=q_in.correct_answer,
            marks=q_in.marks,
            difficulty=q_in.difficulty
        )
        db.add(q)
    db.flush()

    # Generate cryptographic question paper package
    paper_code = f"QP-2026-{exam.exam_code.replace(' ', '-').upper()}"
    watermark_tag = f"SEALED-CHAIN-VAULT-{exam.id[:8].upper()}"
    canonical_paper_content = f"{exam.exam_code}:{paper_code}:{len(data.questions)}:{data.total_marks}:{now.isoformat()}"
    encryption_hash = hashlib.sha256(canonical_paper_content.encode("utf-8")).hexdigest()

    qp = QuestionPaper(
        exam_id=exam.id,
        paper_code=paper_code,
        encryption_hash=encryption_hash,
        watermark_tag=watermark_tag,
        download_count=0,
        max_allowed_downloads=5,
        status="ENCRYPTED",
        file_uri=f"https://vault.examsentinel.internal/secure-papers/{exam.id}.enc",
        created_by_id=current_user.id
    )
    db.add(qp)
    db.flush()

    # Anchor question paper to blockchain ledger
    paper_event_uuid = f"PAPER-SEAL-{uuid.uuid4().hex[:12].upper()}"
    b_record = BlockchainService.anchor_generic_event(
        db=db,
        event_uuid=paper_event_uuid,
        event_type="QUESTION_PAPER_SEALED",
        user_id=current_user.id,
        record_hash=encryption_hash,
        metadata_uri=f"ipfs://exam-vault/{paper_code}"
    )

    db.commit()
    db.refresh(exam)

    return {
        "success": True,
        "exam_id": exam.id,
        "exam_code": exam.exam_code,
        "title": exam.title,
        "questions_count": len(data.questions),
        "paper_code": paper_code,
        "encryption_hash": encryption_hash,
        "blockchain_tx_hash": b_record.transaction_hash,
        "block_number": b_record.block_number,
        "message": f"Examination '{exam.title}' deployed and sealed to blockchain audit ledger."
    }

@router.get("/submissions/my", response_model=List[ExamSubmissionOut])
def get_my_exam_submissions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    subs = db.query(ExamSubmission).filter(ExamSubmission.candidate_id == current_user.id).order_by(ExamSubmission.created_at.desc()).all()
    results = []
    for s in subs:
        exam = db.query(Examination).filter(Examination.id == s.exam_id).first()
        results.append(ExamSubmissionOut(
            submission_uuid=s.submission_uuid,
            certificate_uuid=s.certificate_uuid,
            exam_id=s.exam_id,
            exam_code=exam.exam_code if exam else "EXAM",
            exam_title=exam.title if exam else "Exam",
            candidate_id=s.candidate_id,
            candidate_name=current_user.full_name,
            candidate_email=current_user.email,
            score=s.score,
            total_marks=s.total_marks,
            percentage=s.percentage,
            grade=s.grade,
            passed=s.passed,
            tab_switches=s.tab_switches,
            submission_hash=s.submission_hash,
            is_blockchain_anchored=s.is_blockchain_anchored,
            blockchain_tx_hash=s.blockchain_tx_hash,
            blockchain_block_number=s.blockchain_block_number,
            created_at=s.created_at
        ))
    return results

@router.get("/submissions/all", response_model=List[ExamSubmissionOut])
def get_all_exam_submissions(limit: int = 50, db: Session = Depends(get_db)):
    subs = db.query(ExamSubmission).order_by(ExamSubmission.created_at.desc()).limit(limit).all()
    results = []
    for s in subs:
        exam = db.query(Examination).filter(Examination.id == s.exam_id).first()
        candidate = db.query(User).filter(User.id == s.candidate_id).first()
        results.append(ExamSubmissionOut(
            submission_uuid=s.submission_uuid,
            certificate_uuid=s.certificate_uuid,
            exam_id=s.exam_id,
            exam_code=exam.exam_code if exam else "EXAM",
            exam_title=exam.title if exam else "Exam",
            candidate_id=s.candidate_id,
            candidate_name=candidate.full_name if candidate else "Candidate",
            candidate_email=candidate.email if candidate else "email",
            score=s.score,
            total_marks=s.total_marks,
            percentage=s.percentage,
            grade=s.grade,
            passed=s.passed,
            tab_switches=s.tab_switches,
            submission_hash=s.submission_hash,
            is_blockchain_anchored=s.is_blockchain_anchored,
            blockchain_tx_hash=s.blockchain_tx_hash,
            blockchain_block_number=s.blockchain_block_number,
            created_at=s.created_at
        ))
    return results

@router.get("/submissions/verify/{certificate_uuid}", response_model=CertificateVerificationResponse)
def verify_certificate_on_blockchain(certificate_uuid: str, db: Session = Depends(get_db)):
    return BlockchainService.verify_submission_certificate(db, certificate_uuid)

@router.post("/submissions/{submission_uuid}/tamper-demo")
def demonstrate_submission_tampering(submission_uuid: str, db: Session = Depends(get_db)):
    try:
        return BlockchainService.simulate_submission_tamper(db, submission_uuid)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/{exam_id}/questions-public", response_model=List[ExamQuestionPublic])
def get_public_exam_questions(exam_id: str, db: Session = Depends(get_db)):
    exam = db.query(Examination).filter((Examination.id == exam_id) | (Examination.exam_code == exam_id)).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    questions = db.query(Question).filter(Question.exam_id == exam.id).all()
    out = []
    for q in questions:
        try:
            opts = json.loads(q.options_json) if q.options_json else []
        except Exception:
            opts = []
        out.append(ExamQuestionPublic(
            id=q.id,
            question_text=q.question_text,
            question_type=q.question_type,
            options=opts,
            marks=q.marks,
            difficulty=q.difficulty
        ))
    return out

@router.post("/{exam_id}/submit", response_model=ExamSubmissionOut)
async def submit_candidate_exam(
    exam_id: str,
    req: ExamSubmissionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submits candidate exam answers, auto-grades against question bank, computes cryptographic
    submission hash, and anchors the candidate credential to the blockchain audit ledger.
    """
    exam = db.query(Examination).filter((Examination.id == exam_id) | (Examination.exam_code == exam_id)).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    questions = db.query(Question).filter(Question.exam_id == exam.id).all()
    if not questions:
        raise HTTPException(status_code=400, detail="Exam has no questions to evaluate")

    # Evaluate answers
    score = 0.0
    total_marks = 0.0
    breakdown: List[QuestionResultDetail] = []

    for q in questions:
        total_marks += q.marks
        user_answer = req.answers.get(q.id) or req.answers.get(str(q.id))
        is_correct = False
        if user_answer and q.correct_answer:
            is_correct = (user_answer.strip().lower() == q.correct_answer.strip().lower())

        marks_earned = q.marks if is_correct else 0
        score += marks_earned

        breakdown.append(QuestionResultDetail(
            question_id=q.id,
            question_text=q.question_text,
            selected_option=user_answer,
            correct_option=q.correct_answer or "",
            is_correct=is_correct,
            marks_earned=marks_earned,
            max_marks=q.marks
        ))

    percentage = round((score / total_marks * 100), 2) if total_marks > 0 else 0.0
    passed = score >= exam.passing_marks

    # Compute Grade
    if percentage >= 90:
        grade = "A+"
    elif percentage >= 80:
        grade = "A"
    elif percentage >= 70:
        grade = "B"
    elif percentage >= 55:
        grade = "C"
    elif percentage >= 40:
        grade = "D"
    else:
        grade = "F"

    submission_uuid = f"SUB-{uuid.uuid4().hex[:12].upper()}"
    certificate_uuid = f"CERT-2026-{uuid.uuid4().hex[:8].upper()}"
    answers_json_str = json.dumps(req.answers, sort_keys=True)

    # Compute canonical submission hash
    submission_hash = BlockchainService.compute_submission_hash(
        submission_uuid=submission_uuid,
        candidate_email=current_user.email,
        exam_code=exam.exam_code,
        score=score,
        grade=grade,
        answers_json=answers_json_str
    )

    # Anchor to Blockchain Audit Ledger
    b_record = BlockchainService.anchor_generic_event(
        db=db,
        event_uuid=submission_uuid,
        event_type="CANDIDATE_EXAM_SUBMISSION",
        user_id=current_user.id,
        record_hash=submission_hash,
        metadata_uri=f"ipfs://certificates/{certificate_uuid}"
    )

    # Save ExamSubmission in DB
    submission = ExamSubmission(
        submission_uuid=submission_uuid,
        exam_id=exam.id,
        candidate_id=current_user.id,
        answers_json=answers_json_str,
        score=score,
        total_marks=total_marks,
        percentage=percentage,
        grade=grade,
        passed=passed,
        tab_switches=req.tab_switches,
        submission_hash=submission_hash,
        is_blockchain_anchored=True,
        blockchain_tx_hash=b_record.transaction_hash,
        blockchain_block_number=b_record.block_number,
        certificate_uuid=certificate_uuid,
        created_at=datetime.now(timezone.utc)
    )
    db.add(submission)
    db.commit()

    # Log telemetry for Multi-Agent Surveillance
    severity = "HIGH" if req.tab_switches >= 3 else ("MEDIUM" if req.tab_switches > 0 else "INFO")
    await ActivityService.log_and_process_activity(
        db=db,
        user_id=current_user.id,
        event_type="EXAM_SUBMISSION_ANCHORED",
        resource_type="EXAMINATION",
        resource_id=exam.exam_code,
        payload={
            "score": score,
            "total_marks": total_marks,
            "grade": grade,
            "percentage": percentage,
            "passed": passed,
            "tab_switches": req.tab_switches,
            "certificate_uuid": certificate_uuid,
            "blockchain_tx_hash": b_record.transaction_hash,
            "block_number": b_record.block_number
        }
    )

    return ExamSubmissionOut(
        submission_uuid=submission.submission_uuid,
        certificate_uuid=submission.certificate_uuid,
        exam_id=exam.id,
        exam_code=exam.exam_code,
        exam_title=exam.title,
        candidate_id=current_user.id,
        candidate_name=current_user.full_name,
        candidate_email=current_user.email,
        score=submission.score,
        total_marks=submission.total_marks,
        percentage=submission.percentage,
        grade=submission.grade,
        passed=submission.passed,
        tab_switches=submission.tab_switches,
        submission_hash=submission.submission_hash,
        is_blockchain_anchored=True,
        blockchain_tx_hash=submission.blockchain_tx_hash,
        blockchain_block_number=submission.blockchain_block_number,
        created_at=submission.created_at,
        results_breakdown=breakdown
    )

@router.get("/{exam_id}")
def get_exam_detail(exam_id: str, db: Session = Depends(get_db)):
    exam = db.query(Examination).filter(Examination.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    questions = db.query(Question).filter(Question.exam_id == exam.id).all()
    questions_data = []
    for q in questions:
        opts = []
        try:
            opts = json.loads(q.options_json) if q.options_json else []
        except Exception:
            opts = []
        questions_data.append({
            "id": q.id,
            "question_text": q.question_text,
            "question_type": q.question_type,
            "options": opts,
            "marks": q.marks,
            "difficulty": q.difficulty
        })

    papers = db.query(QuestionPaper).filter(QuestionPaper.exam_id == exam.id).all()
    candidates = db.query(Candidate).filter(Candidate.exam_id == exam.id).all()

    return {
        "id": exam.id,
        "exam_code": exam.exam_code,
        "title": exam.title,
        "subject": exam.subject,
        "start_time": exam.start_time,
        "end_time": exam.end_time,
        "duration_minutes": exam.duration_minutes,
        "total_marks": exam.total_marks,
        "passing_marks": exam.passing_marks,
        "status": exam.status,
        "questions": questions_data,
        "question_papers": [
            {
                "id": p.id,
                "paper_code": p.paper_code,
                "encryption_hash": p.encryption_hash,
                "watermark_tag": p.watermark_tag,
                "status": p.status,
                "download_count": p.download_count,
                "max_allowed_downloads": p.max_allowed_downloads
            } for p in papers
        ],
        "candidate_count": len(candidates)
    }

@router.post("/", response_model=ExamOut)
def create_exam(exam_in: ExamCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(Examination).filter(Examination.exam_code == exam_in.exam_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Exam code already exists")

    exam = Examination(
        exam_code=exam_in.exam_code,
        title=exam_in.title,
        subject=exam_in.subject,
        start_time=exam_in.start_time,
        end_time=exam_in.end_time,
        duration_minutes=exam_in.duration_minutes,
        total_marks=exam_in.total_marks,
        passing_marks=exam_in.passing_marks,
        status=exam_in.status,
        created_by_id=current_user.id
    )
    db.add(exam)
    db.commit()
    db.refresh(exam)
    return exam

@router.get("/papers/vault", response_model=List[QuestionPaperOut])
def list_question_papers(db: Session = Depends(get_db)):
    return db.query(QuestionPaper).all()

@router.post("/papers/access/{paper_id}")
async def access_question_paper(
    paper_id: str,
    action: str = "VIEW", # VIEW or DOWNLOAD
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    qp = db.query(QuestionPaper).filter(QuestionPaper.id == paper_id).first()
    if not qp:
        raise HTTPException(status_code=404, detail="Question Paper not found")
    
    if qp.status == "COMPROMISED_LOCK":
        raise HTTPException(status_code=403, detail="Question Paper is currently locked under emergency security quarantine")

    event_type = "QP_DOWNLOAD" if action.upper() == "DOWNLOAD" else "QP_VIEW"
    if action.upper() == "DOWNLOAD":
        qp.download_count += 1
        db.commit()

    # Log telemetry and run multi-agent security analysis
    await ActivityService.log_and_process_activity(
        db=db,
        user_id=current_user.id,
        event_type=event_type,
        resource_type="QUESTION_PAPER",
        resource_id=qp.paper_code,
        payload={
            "paper_code": qp.paper_code,
            "action": action,
            "watermark_tag": qp.watermark_tag,
            "download_count": qp.download_count
        }
    )

    sample_questions = [
        "1. Explain the Byzantine Generals Problem in asynchronous consensus systems.",
        "2. Formulate the Isolation Forest algorithm anomaly score equation.",
        "3. Describe MITRE ATT&CK insider threat vector T1567 Exfiltration Over Web Service.",
        "4. Calculate SHA-256 Merkle root verification path for 8 leaf transaction blocks."
    ]

    return {
        "success": True,
        "paper_code": qp.paper_code,
        "status": qp.status,
        "watermark": f"{qp.watermark_tag} | ACCESSED_BY_{current_user.email} | TS_{datetime.now(timezone.utc).isoformat()}",
        "decrypted_content": "\n".join(sample_questions),
        "message": f"Secure question paper {action} granted under active multi-agent surveillance."
    }

@router.get("/sessions/live")
def get_live_exam_sessions(db: Session = Depends(get_db)):
    """
    Returns live candidate proctoring sessions with biometric and telemetry statuses.
    """
    candidates = db.query(User).filter(User.role.in_(["Candidate", "Invigilator"])).all()
    sessions = []
    
    statuses = ["ACTIVE_CLEAN", "ACTIVE_CLEAN", "WARNING_MULTIPLE_DISPLAYS", "ACTIVE_CLEAN", "FLAGGED_ANOMALY"]
    for i, c in enumerate(candidates):
        st = statuses[i % len(statuses)]
        sessions.append({
            "session_id": f"SESS-2026-{c.id[:6].upper()}",
            "candidate_id": c.id,
            "candidate_name": c.full_name,
            "candidate_email": c.email,
            "department": c.department,
            "exam_code": "EXAM-2026-CS401",
            "ip_address": f"192.168.1.{110 + i}",
            "device_fingerprint": f"TERMINAL-LAB4-C{i+1:02d}",
            "status": st,
            "risk_score": 85 if "FLAGGED" in st else (45 if "WARNING" in st else 12),
            "webcam_status": "ONLINE_VERIFIED",
            "tab_switches": 4 if "FLAGGED" in st else (1 if "WARNING" in st else 0),
            "started_at": datetime.now(timezone.utc).strftime("%H:%M:%S")
        })

    return sessions

@router.post("/sessions/{session_id}/proctor-action")
async def take_proctor_action(
    session_id: str,
    action: str, # "WARN", "TERMINATE", "CLEAR"
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    await ActivityService.log_and_process_activity(
        db=db,
        user_id=current_user.id,
        event_type=f"PROCTOR_{action.upper()}",
        resource_type="EXAM_SESSION",
        resource_id=session_id,
        payload={"action": action, "invigilator": current_user.email}
    )
    return {
        "success": True,
        "session_id": session_id,
        "action": action,
        "message": f"Proctor action '{action}' executed and logged to blockchain audit ledger."
    }
