from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class ExamBase(BaseModel):
    exam_code: str
    title: str
    subject: str
    start_time: datetime
    end_time: datetime
    duration_minutes: int = 180
    total_marks: int = 100
    passing_marks: int = 40
    status: str = "SCHEDULED"

class ExamCreate(ExamBase):
    pass

class ExamOut(ExamBase):
    id: str
    created_by_id: Optional[str]
    created_at: datetime
    question_count: Optional[int] = 0
    candidate_count: Optional[int] = 0

    class Config:
        from_attributes = True

class QuestionCreate(BaseModel):
    exam_id: str
    question_text: str
    question_type: str = "MCQ"
    options_json: str = "[]"
    correct_answer: Optional[str] = None
    marks: int = 5
    difficulty: str = "MEDIUM"

class QuestionPaperCreate(BaseModel):
    exam_id: str
    paper_code: str
    watermark_tag: str
    max_allowed_downloads: int = 3
    file_uri: Optional[str] = ""

class QuestionPaperOut(BaseModel):
    id: str
    exam_id: str
    paper_code: str
    encryption_hash: str
    watermark_tag: str
    download_count: int
    max_allowed_downloads: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class CandidateCreate(BaseModel):
    user_id: str
    enrollment_no: str
    exam_id: str
    seat_number: Optional[str] = ""

class ExamSessionOut(BaseModel):
    id: str
    exam_id: str
    user_id: str
    start_time: datetime
    end_time: Optional[datetime]
    ip_address: str
    status: str
    anomaly_flag: bool

    class Config:
        from_attributes = True

class QuestionItemInput(BaseModel):
    question_text: str
    question_type: str = "MCQ"
    options: List[str] = []
    correct_answer: str
    marks: int = 5
    difficulty: str = "MEDIUM"

class ExamWithQuestionsCreate(BaseModel):
    exam_code: str
    title: str
    subject: str
    duration_minutes: int = 180
    total_marks: int = 100
    passing_marks: int = 40
    questions: List[QuestionItemInput] = []

class ExamQuestionPublic(BaseModel):
    id: str
    question_text: str
    question_type: str
    options: List[str]
    marks: int
    difficulty: str

class ExamSubmissionRequest(BaseModel):
    exam_id: str
    answers: Dict[str, str] = {}
    tab_switches: int = 0

class QuestionResultDetail(BaseModel):
    question_id: str
    question_text: str
    selected_option: Optional[str]
    correct_option: str
    is_correct: bool
    marks_earned: int
    max_marks: int

class ExamSubmissionOut(BaseModel):
    submission_uuid: str
    certificate_uuid: str
    exam_id: str
    exam_code: str
    exam_title: str
    candidate_id: str
    candidate_name: str
    candidate_email: str
    score: float
    total_marks: float
    percentage: float
    grade: str
    passed: bool
    tab_switches: int
    submission_hash: str
    is_blockchain_anchored: bool
    blockchain_tx_hash: Optional[str] = None
    blockchain_block_number: Optional[int] = None
    created_at: datetime
    results_breakdown: Optional[List[QuestionResultDetail]] = None

class CertificateVerificationResponse(BaseModel):
    certificate_uuid: str
    is_valid: bool
    status: str
    candidate_name: str
    candidate_email: str
    exam_title: str
    exam_code: str
    score: float
    total_marks: float
    percentage: float
    grade: str
    passed: bool
    ledger_hash: str
    current_computed_hash: str
    transaction_hash: str
    block_number: int
    anchored_at: Optional[datetime] = None
    discrepancy_details: Optional[str] = None
