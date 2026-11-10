# A Decentralized Blockchain and Agentic AI Framework for Proactive Insider Threat Detection in Examination Systems

> **Major Project — Batch 14 (Team 4)**  
> **Department of Computer Science & Engineering**  
> **Kommuri Pratap Reddy Institute of Technology (KPRIT)**  
> **Academic Year:** 2026 – 2027 | **Section:** IV-I CSE – B  
> **Project Guide:** Mrs. V. Sowjanya (Assistant Professor)

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_18_TypeScript-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![Solidity](https://img.shields.io/badge/Blockchain-Solidity_0.8.20-363636.svg?logo=solidity&logoColor=white)](https://soliditylang.org)
[![Scikit-Learn](https://img.shields.io/badge/ML-Isolation_Forest-F7931E.svg?logo=scikit-learn&logoColor=white)](https://scikit-learn.org)
[![WebSocket](https://img.shields.io/badge/Real--Time-WebSockets-010101.svg?logo=websocket&logoColor=white)](https://websockets.readthedocs.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 👥 Project Team & Responsibilities

| S.No. | Student Name | Roll Number | Role / Primary Responsibility |
|:---:|:---|:---:|:---|
| 1 | **K. Rajeshwari** | `23RA11A05A9` | **AI Developer** (Agentic AI ensemble, Isolation Forest ML models, anomaly detection engine) |
| 2 | **A. Ranadeep** | `23RA1A05B3` | **Backend Developer** (FastAPI core, WebSockets, REST APIs, database schemas, and simulator) |
| 3 | **B. Manikanta** | `23RA1A0575` | **Frontend Developer** (React 18, TypeScript, Vite, Tailwind SOC Dashboard & candidate exam terminal) |
| 4 | **V. Manodeesh** | `23RA1A0579` | **Testing & Security** (Hardhat contracts, cryptographic audit trails, test suites, threat validation) |

**Project Supervisor / Guide:** **Mrs. V. Sowjanya**, Assistant Professor, Department of CSE

---

## 📌 Executive Summary & Abstract

Examination systems in educational institutions face severe security risks from insider threats — including unauthorized access, question paper leakage, candidate impersonation, unauthorized grade/data tampering, and misuse of privileged accounts. Because malicious insiders possess legitimate authentication credentials, conventional security tools (firewalls, passwords, static RBAC) fail to identify subtle behavioral drifts.

This project introduces a **Decentralized Blockchain and Agentic AI Framework for Proactive Insider Threat Detection in Examination Systems** (codenamed **ExamSentinel AI**). 

The framework unites:
1. **7-Agent Autonomous AI Ensemble:** Operates synchronously and asynchronously to evaluate behavioral drift, statistical anomalies, MITRE ATT&CK patterns, and automated threat triage.
2. **Scikit-Learn Isolation Forest Machine Learning:** High-dimensional unsupervised anomaly detection identifying unusual access times, batch download bursts, and role deviations.
3. **Solidity EVM Blockchain Ledger:** Anchors immutable, cryptographically verifiable SHA-256 audit logs onto smart contracts to guarantee forensic non-repudiation.
4. **Real-Time Security Operations Center (SOC) & Exam Terminal:** Full-duplex WebSocket dashboard for administrators and isolated, monitored candidate test environment.

---

## 🏛️ System Architecture

```
                               ┌─────────────────────────────────────────┐
                               │       ExamSentinel AI SOC Frontend      │
                               │ React 18 + TypeScript + Vite + Tailwind │
                               └────────────────────▲────────────────────┘
                                                    │
                                       (REST API & WebSockets)
                                                    │
                               ┌────────────────────▼────────────────────┐
                               │        FastAPI Application Core         │
                               │  JWT Auth + RBAC + Event Ingestion Hub  │
                               └────────────────────┬────────────────────┘
                                                    │
                ┌───────────────────────────────────┴───────────────────────────────────┐
                │                                                                       │
┌───────────────▼───────────────┐                                       ┌───────────────▼───────────────┐
│     7-Agent AI Ensemble       │                                       │   EVM Smart Contract Ledger   │
├───────────────────────────────┤                                       ├───────────────────────────────┤
│ 1. Activity Monitoring Agent  │                                       │  Contract: AuditLedger.sol    │
│ 2. Behavioral Analysis Agent  │                                       │  Hashing: Canonical SHA-256   │
│ 3. Anomaly Detection Agent    │                                       │  Verification: Hash Match &   │
│ 4. Threat Assessment Agent    │                                       │  Tamper-Detection Engine      │
│ 5. Investigation Agent        │                                       └───────────────────────────────┘
│ 6. Alert & Response Agent     │
│ 7. Blockchain Audit Agent     │
└───────────────┬───────────────┘
                │
┌───────────────▼───────────────┐
│   ML Outlier Inference Core   │
├───────────────────────────────┤
│ • Scikit-Learn IsolationForest│
│ • 10-Dimensional Vector Space │
│ • Explainable Feature Impact  │
│ • Dynamic 0-100 Risk Scorer   │
└───────────────────────────────┘
```

---

## 🤖 7 Multi-Agent Cooperative Matrix

| # | Agent Name | Primary Responsibility | Technical Implementation |
|---|---|---|---|
| **01** | **Activity Monitoring Agent** | Stream ingestion, telemetry validation & rule checks | Boundary evaluation, working hours verification, IP/device novelty check |
| **02** | **Behavioral Analysis Agent** | Historical baseline comparison & habit deviation | Statistical profile comparator against 30-day baseline metrics |
| **03** | **Anomaly Detection Agent** | Unsupervised multi-dimensional outlier detection | Scikit-learn `IsolationForest` (150 trees) + SHAP-inspired feature attribution |
| **04** | **Threat Assessment Agent** | Composite 0–100 threat scoring & MITRE ATT&CK tagging | Multi-factor weighted risk engine categorizing exfiltration/privilege threats |
| **05** | **Investigation Agent** | Human-explainable narrative & root-cause hypotheses | Chronological timeline synthesis + actionable containment suggestions |
| **06** | **Alert & Response Agent** | Real-time WebSocket dissemination & automated containment | Push notification dispatch + auto session kill / role freeze |
| **07** | **Blockchain Audit Agent** | Cryptographic hashing & on-chain immutable sealing | Canonical JSON serialization, SHA-256 state hashing & Web3 transaction |

---

## 📊 Data Flow Diagrams

### Data Flow Diagram — Level 0 (Context Level)
```
  [ Candidate / Faculty / Admin ]
                 │
                 │ 1. Examination & System Operations
                 ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                                                                        │
 │    Decentralized Blockchain & Agentic AI Examination Security System   │
 │                                                                        │
 └──────────────────┬─────────────────────────────────┬───────────────────┘
                    │                                 │
     2. Suspicious Anomalies           3. Tamper-Proof Audit Seals
                    ▼                                 ▼
         [ Security SOC Team ]               [ Blockchain Ledger ]
```

### Data Flow Diagram — Level 1 (Operational Decomposition)
```
 [ User Activity ] ──► (1.0 Ingestion & Preprocessing) 
                                │
               ┌────────────────┴────────────────┐
               ▼                                 ▼
   (2.0 Behavioral Profiling)       (3.0 ML Isolation Forest)
               │                                 │
               └────────────────┬────────────────┘
                                ▼
                   (4.0 Agentic AI Threat Triage)
                                │
               ┌────────────────┴────────────────┐
               ▼                                 ▼
   (5.0 Real-time SOC Alerting)    (6.0 Smart Contract Audit Sealing)
```

---

## 📁 Repository Directory Structure

```
.
├── docs/                                    # Official Project Documents & PPTs
│   ├── CSE_Major_Project_Review_Enhanced.pptx  # Major Project Presentation
│   ├── 4. STAGE-1 FINAL DOCUMENT SAMPLE CSE.docx # Stage-1 Comprehensive Report
│   ├── STAGE_1_DOCUMENTATION.md             # Complete Academic Documentation
│   ├── SYSTEM_ARCHITECTURE.md               # Detailed Architecture Specification
│   └── AGENTIC_AI_SPECIFICATION.md          # 7-Agent Orchestrator & ML Specs
├── backend/                                 # FastAPI Backend Service
│   ├── app/
│   │   ├── agents/                          # 7-Agent AI Ensemble Implementation
│   │   ├── api/v1/                          # REST API & WebSocket Endpoints
│   │   ├── blockchain/                      # Web3 EVM Integration & Smart Contract ABI
│   │   ├── core/                            # Configuration, DB Session, Security
│   │   ├── ml/                              # Isolation Forest ML & Feature Extractor
│   │   ├── models/                          # SQLAlchemy ORM Models
│   │   ├── schemas/                         # Pydantic Request/Response Models
│   │   └── services/                        # Business Logic & Threat Simulators
│   ├── tests/                               # Comprehensive Pytest Suite
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                                # React 18 + Vite + TypeScript SOC App
│   ├── src/
│   │   ├── components/                      # SOC Widgets, Proctoring, Audit, Modals
│   │   ├── context/                         # Auth, WebSocket, and Theme State
│   │   ├── pages/                           # SOC Dashboard, Incidents, Exams, Simulator
│   │   └── services/                        # Axios REST API Client
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── blockchain/                              # Smart Contracts & Hardhat Environment
│   ├── contracts/
│   │   └── AuditLedger.sol                  # Solidity Audit Ledger Smart Contract
│   ├── scripts/                             # Contract Deployment Scripts
│   └── hardhat.config.ts
├── docker-compose.yml                       # Full-Stack Container Orchestration
├── start.bat                                # Quick Launch Script (Windows)
├── start.sh                                 # Quick Launch Script (Linux/macOS)
└── README.md
```

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Python:** 3.10 or higher
- **Node.js:** 18.x or higher
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/Rajeshwari1412/CSE_Major_Project_Review_Enhanced.git
cd CSE_Major_Project_Review_Enhanced
```

### 2. Launch with One Click (Windows)
Double-click `start.bat` or run:
```powershell
.\start.bat
```

### 3. Manual Step-by-Step Setup

#### Backend Setup:
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be accessible at: `http://localhost:8000/docs`

#### Frontend Setup:
```bash
cd frontend
npm install
npm run dev
```
Access the SOC Portal at: `http://localhost:5173`

---

## 🔑 Default Demonstration Accounts

| Role | Username | Password | Access Scope |
|---|---|---|---|
| **SOC Administrator** | `admin` | `Admin@123456` | Full SOC Dashboard, Threat Simulator, Smart Contract Audits |
| **Security Analyst** | `analyst` | `Analyst@123456` | Incident Triage, Forensic Export, Evidence Verification |
| **Exam Invigilator** | `invigilator`| `Proctor@123456` | Live Proctoring Grid, Candidate Credential Distribution |
| **Candidate** | `student01` | `Student@123456` | Candidate Exam Terminal, Real-Time Proctored Exam |

---

## 🧪 Testing and Verification

Run the full automated test suite verifying auth, agent orchestrations, ML anomaly detectors, and blockchain audit integrity:
```bash
cd backend
python -m pytest -v
```

Expected output:
```
======================== 9 passed in 2.50s ========================
```

---

## 📚 Academic References

1. *A Review of Recent Advances, Challenges, and Opportunities in Malicious Insider Threat Detection Using Machine Learning Methods.* IEEE Access, vol. 12, pp. 30907–30927, 2024.
2. *An Advanced and Secure Framework for Conducting Online Examination Using Blockchain Method.* Cyber Security and Applications, vol. 1, article 100005, 2023.
3. Software Engineering Institute, Carnegie Mellon University, *“Insider Threat Test Dataset”*, November 28, 2016.
4. Hyperledger Fabric Documentation, *“A Blockchain Platform for the Enterprise”*.
5. Scikit-learn Developers, *“Scikit-learn: Machine Learning in Python — User Guide”*.

---

## 📄 License
This major project is submitted for academic evaluation at Kommuri Pratap Reddy Institute of Technology (KPRIT) and is licensed under the [MIT License](LICENSE).
