import asyncio
import json
import uuid
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models import User, BehaviorProfile, Examination, QuestionPaper, ActivityEvent, SecurityIncident, Question, ExamSubmission
from app.services.activity_service import ActivityService
from app.services.blockchain_service import BlockchainService
from app.blockchain.web3_client import blockchain_client
from app.core.security import get_password_hash
import logging

logger = logging.getLogger(__name__)

class SimulatorService:
    """
    Orchestrates the complete Insider Threat Demonstration Scenario:
    Normal login -> New device -> New IP -> After-hours access -> Multiple restricted QP accesses
    -> Bulk downloads -> Privileged operation -> ML anomaly detection -> Agent correlation
    -> Risk score -> Security alert -> Human investigation -> Blockchain verification
    """

    SCENARIO_STEPS = [
        {
            "step": 1,
            "title": "Normal Baseline Login",
            "event_type": "LOGIN",
            "description": "Question Paper Manager logs in during standard office hours from trusted registered campus device.",
            "is_anomaly_expected": False,
            "expected_risk": "LOW (10-25)"
        },
        {
            "step": 2,
            "title": "New Unrecognized Device",
            "event_type": "NEW_DEVICE",
            "description": "Session established from an unrecognized hardware fingerprint (e.g. unknown laptop / altered user-agent).",
            "is_anomaly_expected": True,
            "expected_risk": "MEDIUM (35-50)"
        },
        {
            "step": 3,
            "title": "Anomalous Geo-IP Switch",
            "event_type": "IP_CHANGE",
            "description": "Connection origin suddenly switches to external off-campus IP (VPN/Proxy node).",
            "is_anomaly_expected": True,
            "expected_risk": "MEDIUM (45-60)"
        },
        {
            "step": 4,
            "title": "After-Hours Examination Vault Access",
            "event_type": "AFTER_HOURS_ACCESS",
            "description": "User requests access to secure examination database at 02:45 AM (outside authorized 09:00-18:00 window).",
            "is_anomaly_expected": True,
            "expected_risk": "HIGH (65-75)"
        },
        {
            "step": 5,
            "title": "Restricted Question Paper View",
            "event_type": "QP_VIEW",
            "description": "Attempting unapproved decryption view of Master Mathematics Final Question Paper (Paper Code: QP-2026-MATH-01).",
            "is_anomaly_expected": True,
            "expected_risk": "HIGH (70-80)"
        },
        {
            "step": 6,
            "title": "Bulk Question Paper Download",
            "event_type": "BULK_DOWNLOAD",
            "description": "Batch exfiltration triggered: 18 confidential encrypted exam packages downloaded concurrently (18x standard baseline).",
            "is_anomaly_expected": True,
            "expected_risk": "CRITICAL (85-95)"
        },
        {
            "step": 7,
            "title": "Privileged Schema & Permission Modification",
            "event_type": "PERMISSION_MODIFICATION",
            "description": "Attempting to grant administrative role bypass and alter invigilator roster privileges.",
            "is_anomaly_expected": True,
            "expected_risk": "CRITICAL (90-98)"
        }
    ]

    @classmethod
    async def run_scenario_step(
        cls,
        db: Session,
        step_number: int,
        target_user_email: str = "qp.manager@examsentinel.edu"
    ) -> Dict[str, Any]:
        """
        Executes a single step of the live threat scenario and returns multi-agent telemetry.
        """
        user = db.query(User).filter(User.email == target_user_email).first()
        if not user:
            raise ValueError(f"Target test user {target_user_email} not found. Please seed dataset first.")

        step_idx = step_number - 1
        if step_idx < 0 or step_idx >= len(cls.SCENARIO_STEPS):
            raise ValueError(f"Invalid step number {step_number}. Must be between 1 and {len(cls.SCENARIO_STEPS)}.")

        step_info = cls.SCENARIO_STEPS[step_idx]
        event_type = step_info["event_type"]

        # Configure realistic parameters per step
        if step_number == 1:
            ip = "192.168.1.105"
            device = "DEV-TRUSTED-CAMPUS-01"
            after_hours = False
            ts = datetime.now(timezone.utc).replace(hour=10, minute=15)
            payload = {"action": "Standard SSO Authentication", "session_id": f"sess_{uuid.uuid4().hex[:6]}"}
            resource_type = "AUTH"
            resource_id = "PORTAL-LOGIN"
        elif step_number == 2:
            ip = "192.168.1.105"
            device = f"DEV-ROGUE-LAPTOP-{uuid.uuid4().hex[:4].upper()}"
            after_hours = False
            ts = datetime.now(timezone.utc).replace(hour=11, minute=30)
            payload = {"action": "Device Fingerprint Mismatch", "os": "Kali Linux 2026.1", "browser": "HeadlessChrome"}
            resource_type = "DEVICE"
            resource_id = device
        elif step_number == 3:
            ip = "198.51.100.42"
            device = f"DEV-ROGUE-LAPTOP"
            after_hours = False
            ts = datetime.now(timezone.utc).replace(hour=14, minute=5)
            payload = {"action": "Geo-IP Anomaly", "proxy_detected": True, "country": "External Tor Exit"}
            resource_type = "NETWORK"
            resource_id = ip
        elif step_number == 4:
            ip = "198.51.100.42"
            device = f"DEV-ROGUE-LAPTOP"
            after_hours = True
            ts = datetime.now(timezone.utc).replace(hour=2, minute=45)
            payload = {"action": "Vault Access Request", "time": "02:45 AM UTC", "authorized_window": "09:00-18:00"}
            resource_type = "EXAM_VAULT"
            resource_id = "VAULT-SEC-01"
        elif step_number == 5:
            ip = "198.51.100.42"
            device = f"DEV-ROGUE-LAPTOP"
            after_hours = True
            ts = datetime.now(timezone.utc).replace(hour=2, minute=50)
            payload = {"action": "Decryption Stream View", "paper_code": "QP-2026-MATH-01", "watermark": "SEC-AUDIT-W4"}
            resource_type = "QUESTION_PAPER"
            resource_id = "QP-2026-MATH-01"
        elif step_number == 6:
            ip = "198.51.100.42"
            device = f"DEV-ROGUE-LAPTOP"
            after_hours = True
            ts = datetime.now(timezone.utc).replace(hour=2, minute=55)
            payload = {
                "action": "Mass Batch Download",
                "download_count": 18,
                "file_size_mb": 420.5,
                "targets": ["QP-MATH-01", "QP-PHYS-02", "QP-CS-03", "QP-CHEM-04"]
            }
            resource_type = "QUESTION_PAPER"
            resource_id = "BULK-EXFIL-001"
        else: # step 7
            ip = "198.51.100.42"
            device = f"DEV-ROGUE-LAPTOP"
            after_hours = True
            ts = datetime.now(timezone.utc).replace(hour=3, minute=10)
            payload = {
                "action": "Privileged Role Elevation",
                "modified_role": "Super Admin",
                "target_permission": "ALLOW_UNRESTRICTED_EXPORT"
            }
            resource_type = "RBAC"
            resource_id = "ROLE-PERM-BYPASS"

        # Execute Activity Service
        result = await ActivityService.log_and_process_activity(
            db=db,
            user_id=user.id,
            event_type=event_type,
            resource_type=resource_type,
            resource_id=resource_id,
            ip_address=ip,
            device_fingerprint=device,
            user_agent="Mozilla/5.0 (Security Simulation Suite v2.0)",
            location="Remote IP / Unknown" if step_number > 2 else "Main Campus",
            payload=payload,
            custom_timestamp=ts
        )

        activity_event = result["activity_event"]
        ctx = result["orchestration_context"]

        return {
            "step_number": step_number,
            "step_info": step_info,
            "event_id": activity_event.id,
            "event_uuid": activity_event.event_uuid,
            "event_type": activity_event.event_type,
            "risk_score": ctx["risk_data"].get("overall_risk_score", 0.0),
            "risk_tier": ctx["risk_data"].get("risk_tier", "LOW"),
            "threat_category": ctx["risk_data"].get("threat_category", "Routine"),
            "mitre_tactics": ctx["risk_data"].get("mitre_tactics", []),
            "is_anomaly": ctx["anomaly_data"].get("is_anomaly", False),
            "anomaly_score": ctx["anomaly_data"].get("normalized_score", 0.0),
            "is_blockchain_anchored": activity_event.is_blockchain_anchored,
            "blockchain_tx_hash": activity_event.blockchain_tx_hash,
            "evidence_summary": ctx["investigation_data"].get("evidence_summary", ""),
            "suggested_action": ctx["investigation_data"].get("suggested_action", ""),
            "agent_summaries": {
                "ActivityMonitoringAgent": ctx.get("monitoring_flags", []),
                "BehavioralAnalysisAgent": ctx["behavioral_data"].get("output_summary"),
                "AnomalyDetectionAgent": ctx["anomaly_data"].get("output_summary"),
                "ThreatAssessmentAgent": ctx["risk_data"].get("threat_category"),
                "InvestigationAgent": ctx["investigation_data"].get("root_cause_hypothesis"),
                "AlertResponseAgent": ctx["alert_data"].get("output_summary"),
                "BlockchainAuditAgent": ctx["blockchain_data"].get("output_summary")
            }
        }

    @classmethod
    def seed_synthetic_dataset(cls, db: Session) -> Dict[str, Any]:
        """
        Populates realistic examination database with Users, Exams, Question Papers,
        and 30-day baseline behavioral profiles.
        """
        # 1. Seed Roles & Users
        users_data = [
            {"email": "superadmin@examsentinel.edu", "name": "Dr. Eleanor Vance", "role": "Super Admin", "dept": "Executive Security"},
            {"email": "examadmin@examsentinel.edu", "name": "Prof. Marcus Brody", "role": "Exam Admin", "dept": "Controller of Examinations"},
            {"email": "analyst@examsentinel.edu", "name": "Agent Sarah Connor", "role": "Security Analyst", "dept": "SOC Cyber Defense"},
            {"email": "qp.manager@examsentinel.edu", "name": "Dr. Robert Langdon", "role": "Question Paper Manager", "dept": "Academic Confidential Cell"},
            {"email": "invigilator.alpha@examsentinel.edu", "name": "Prof. John Keating", "role": "Invigilator", "dept": "Computer Science Dept"},
            {"email": "candidate.01@examsentinel.edu", "name": "Alice Montgomery", "role": "Candidate", "dept": "B.Tech Computer Science"},
            {"email": "candidate.02@examsentinel.edu", "name": "Bob Henderson", "role": "Candidate", "dept": "B.Tech Information Technology"}
        ]

        created_users = []
        for u in users_data:
            existing = db.query(User).filter(User.email == u["email"]).first()
            if not existing:
                user = User(
                    email=u["email"],
                    full_name=u["name"],
                    role=u["role"],
                    department=u["dept"],
                    hashed_password=get_password_hash("Sentinel@2026"),
                    is_active=True,
                    is_suspended=False,
                    risk_tier="LOW"
                )
                db.add(user)
                db.flush()

                # Add Behavior Profile
                profile = BehaviorProfile(
                    user_id=user.id,
                    typical_login_start_hour=9,
                    typical_login_end_hour=18,
                    known_ips_json=json.dumps(["192.168.1.105", "192.168.1.106", "10.0.4.22"]),
                    known_devices_json=json.dumps(["DEV-TRUSTED-CAMPUS-01", "DEV-WORKSTATION-SEC-04"]),
                    avg_daily_requests=48.0,
                    avg_downloads_per_session=1.2,
                    total_violations=0,
                    privilege_escalation_risk=0.0
                )
                db.add(profile)
                created_users.append(user)

        # 2. Seed Examinations
        exams_data = [
            {
                "code": "EXAM-2026-CS401",
                "title": "Advanced Distributed Systems & Blockchain Protocols",
                "subject": "Computer Science & Engineering",
                "duration": 180,
                "marks": 100,
                "status": "SCHEDULED"
            },
            {
                "code": "EXAM-2026-CY502",
                "title": "Applied Cryptography and Network Security",
                "subject": "Cybersecurity & Information Assurance",
                "duration": 180,
                "marks": 100,
                "status": "ONGOING"
            },
            {
                "code": "EXAM-2026-AI301",
                "title": "Machine Learning and Neural Systems",
                "subject": "Artificial Intelligence",
                "duration": 120,
                "marks": 80,
                "status": "SCHEDULED"
            }
        ]

        created_exams = []
        admin_user = db.query(User).filter(User.role == "Exam Admin").first()
        admin_id = admin_user.id if admin_user else None

        for ed in exams_data:
            existing = db.query(Examination).filter(Examination.exam_code == ed["code"]).first()
            if not existing:
                start = datetime.now(timezone.utc) + timedelta(days=1)
                end = start + timedelta(hours=3)
                exam = Examination(
                    exam_code=ed["code"],
                    title=ed["title"],
                    subject=ed["subject"],
                    start_time=start,
                    end_time=end,
                    duration_minutes=ed["duration"],
                    total_marks=ed["marks"],
                    passing_marks=int(ed["marks"] * 0.4),
                    status=ed["status"],
                    created_by_id=admin_id
                )
                db.add(exam)
                db.flush()

                # Add Question Paper Vault Item
                qp = QuestionPaper(
                    exam_id=exam.id,
                    paper_code=f"QP-2026-{ed['code'].split('-')[-1]}",
                    encryption_hash=uuid.uuid4().hex + uuid.uuid4().hex,
                    watermark_tag=f"CONFIDENTIAL-EXAM-ID-{exam.id[:8]}",
                    download_count=1,
                    max_allowed_downloads=3,
                    status="ENCRYPTED",
                    file_uri=f"https://vault.examsentinel.internal/secure-papers/{exam.id}.enc",
                    created_by_id=admin_id
                )
                db.add(qp)
                created_exams.append(exam)

        db.commit()

        # 3. Seed Questions for Examinations if empty
        questions_dataset = {
            "EXAM-2026-CS401": [
                {
                    "text": "Which consensus mechanism provides deterministic finality without the possibility of blockchain reorganization forks?",
                    "options": [
                        "Proof of Work (Nakamoto Consensus)",
                        "PBFT (Practical Byzantine Fault Tolerance)",
                        "Proof of Stake (Nakamoto Fork Choice)",
                        "Proof of Capacity"
                    ],
                    "correct": "PBFT (Practical Byzantine Fault Tolerance)",
                    "marks": 25,
                    "difficulty": "HARD"
                },
                {
                    "text": "In Ethereum EVM execution, what happens when a smart contract call exhausts all allocated gas units?",
                    "options": [
                        "State changes persist but code stops",
                        "Transaction reverts all state modifications and consumes gas",
                        "Transaction pauses until more gas is sent",
                        "Code switches to CPU fallback mode"
                    ],
                    "correct": "Transaction reverts all state modifications and consumes gas",
                    "marks": 25,
                    "difficulty": "MEDIUM"
                },
                {
                    "text": "What cryptographic data structure enables efficient, logarithmic proof of inclusion for transactions in a block header?",
                    "options": [
                        "Merkle Tree (Merkle Patricia Trie)",
                        "Skip List",
                        "Bloom Filter",
                        "B+ Tree"
                    ],
                    "correct": "Merkle Tree (Merkle Patricia Trie)",
                    "marks": 25,
                    "difficulty": "MEDIUM"
                },
                {
                    "text": "What cryptographic property ensures that modifying a single bit in an examination paper completely alters its SHA-256 hash?",
                    "options": [
                        "Avalanche Effect (Strict Avalanche Criterion)",
                        "Diffie-Hellman Key Exchange",
                        "Homomorphic Encryption",
                        "Shamir Secret Sharing"
                    ],
                    "correct": "Avalanche Effect (Strict Avalanche Criterion)",
                    "marks": 25,
                    "difficulty": "EASY"
                }
            ],
            "EXAM-2026-CY502": [
                {
                    "text": "Under the MITRE ATT&CK enterprise matrix, which technique identifier specifies 'Exfiltration Over Web Service'?",
                    "options": [
                        "T1078 (Valid Accounts)",
                        "T1567 (Exfiltration Over Web Service)",
                        "T1068 (Privilege Escalation)",
                        "T1110 (Brute Force)"
                    ],
                    "correct": "T1567 (Exfiltration Over Web Service)",
                    "marks": 25,
                    "difficulty": "MEDIUM"
                },
                {
                    "text": "Which symmetric encryption mode provides both confidentiality and built-in cryptographic authentication tag verification?",
                    "options": [
                        "AES-ECB",
                        "AES-CBC",
                        "AES-GCM (Galois/Counter Mode)",
                        "Triple DES"
                    ],
                    "correct": "AES-GCM (Galois/Counter Mode)",
                    "marks": 25,
                    "difficulty": "HARD"
                },
                {
                    "text": "In zero-knowledge proofs, what property ensures that an honest verifier is convinced if the statement is true?",
                    "options": [
                        "Completeness",
                        "Soundness",
                        "Non-malleability",
                        "Zero-Knowledge Privacy"
                    ],
                    "correct": "Completeness",
                    "marks": 25,
                    "difficulty": "HARD"
                },
                {
                    "text": "What is the primary mitigation against Timing Attack side-channels in cryptographic hash signature comparisons?",
                    "options": [
                        "Multi-threading",
                        "Constant-Time Comparison functions",
                        "Dynamic Salting",
                        "Cache Invalidation"
                    ],
                    "correct": "Constant-Time Comparison functions",
                    "marks": 25,
                    "difficulty": "MEDIUM"
                }
            ],
            "EXAM-2026-AI301": [
                {
                    "text": "In the Isolation Forest algorithm, why are anomalous data points isolated closer to the root of randomized decision trees?",
                    "options": [
                        "Anomalies have high cluster density",
                        "Anomalies require fewer random attribute splits due to sparse distribution",
                        "Anomalies share identical covariance matrices",
                        "Anomalies always have higher gradient vectors"
                    ],
                    "correct": "Anomalies require fewer random attribute splits due to sparse distribution",
                    "marks": 20,
                    "difficulty": "MEDIUM"
                },
                {
                    "text": "Which loss function is specifically tailored for classification with extreme class imbalance by down-weighting easy examples?",
                    "options": [
                        "Focal Loss",
                        "Mean Squared Error",
                        "Categorical Cross-Entropy",
                        "Huber Loss"
                    ],
                    "correct": "Focal Loss",
                    "marks": 20,
                    "difficulty": "HARD"
                },
                {
                    "text": "In Transformer neural architectures, what computational complexity does standard scaled dot-product attention exhibit with sequence length N?",
                    "options": [
                        "O(N)",
                        "O(N log N)",
                        "O(N^2)",
                        "O(1)"
                    ],
                    "correct": "O(N^2)",
                    "marks": 20,
                    "difficulty": "MEDIUM"
                },
                {
                    "text": "What regularization technique prevents neural networks from co-adapting features by randomly zeroing activations during training?",
                    "options": [
                        "Dropout",
                        "Batch Normalization",
                        "Gradient Clipping",
                        "L2 Weight Decay"
                    ],
                    "correct": "Dropout",
                    "marks": 20,
                    "difficulty": "EASY"
                }
            ]
        }

        for exam_code, q_list in questions_dataset.items():
            exam_obj = db.query(Examination).filter(Examination.exam_code == exam_code).first()
            if exam_obj:
                existing_q_count = db.query(Question).filter(Question.exam_id == exam_obj.id).count()
                if existing_q_count == 0:
                    for item in q_list:
                        db.add(Question(
                            exam_id=exam_obj.id,
                            question_text=item["text"],
                            question_type="MCQ",
                            options_json=json.dumps(item["options"]),
                            correct_answer=item["correct"],
                            marks=item["marks"],
                            difficulty=item["difficulty"]
                        ))
                    db.flush()

        # 4. Seed an initial verified candidate submission if none exist
        sub_count = db.query(ExamSubmission).count()
        if sub_count == 0:
            cs_exam = db.query(Examination).filter(Examination.exam_code == "EXAM-2026-CS401").first()
            alice = db.query(User).filter(User.email == "candidate.01@examsentinel.edu").first()
            if cs_exam and alice:
                sub_uuid = f"SUB-{uuid.uuid4().hex[:12].upper()}"
                cert_uuid = f"CERT-2026-ALICE-CS401"
                answers = {
                    "q1": "PBFT (Practical Byzantine Fault Tolerance)",
                    "q2": "Transaction reverts all state modifications and consumes gas",
                    "q3": "Merkle Tree (Merkle Patricia Trie)",
                    "q4": "Avalanche Effect (Strict Avalanche Criterion)"
                }
                answers_json = json.dumps(answers, sort_keys=True)
                sub_hash = BlockchainService.compute_submission_hash(
                    submission_uuid=sub_uuid,
                    candidate_email=alice.email,
                    exam_code=cs_exam.exam_code,
                    score=100.0,
                    grade="A+",
                    answers_json=answers_json
                )
                b_rec = BlockchainService.anchor_generic_event(
                    db=db,
                    event_uuid=sub_uuid,
                    event_type="CANDIDATE_EXAM_SUBMISSION",
                    user_id=alice.id,
                    record_hash=sub_hash,
                    metadata_uri=f"ipfs://certificates/{cert_uuid}"
                )
                submission = ExamSubmission(
                    submission_uuid=sub_uuid,
                    exam_id=cs_exam.id,
                    candidate_id=alice.id,
                    answers_json=answers_json,
                    score=100.0,
                    total_marks=100.0,
                    percentage=100.0,
                    grade="A+",
                    passed=True,
                    tab_switches=0,
                    submission_hash=sub_hash,
                    is_blockchain_anchored=True,
                    blockchain_tx_hash=b_rec.transaction_hash,
                    blockchain_block_number=b_rec.block_number,
                    certificate_uuid=cert_uuid,
                    created_at=datetime.now(timezone.utc)
                )
                db.add(submission)
                db.flush()

        db.commit()

        return {
            "users_seeded": len(created_users),
            "exams_seeded": len(created_exams),
            "status": "Synthetic examination baseline initialized successfully."
        }
