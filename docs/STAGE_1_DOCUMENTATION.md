# Stage-1 Comprehensive Project Documentation

## A Decentralized Blockchain and Agentic AI Framework for Proactive Insider Threat Detection in Examination Systems

- **Academic Year:** 2026 – 2027
- **Institution:** Kommuri Pratap Reddy Institute of Technology (KPRIT)
- **Department:** Department of Computer Science & Engineering
- **Program:** IV B.Tech — CSE (Section B) | Batch 14 (Team 4)
- **Project Guide:** Mrs. V. Sowjanya, Assistant Professor

---

## 1. Introduction

### 1.1 Introduction
Digital examination systems have revolutionized how educational institutions conduct assessments, offering paperless workflows, instant grading, and automated records management. However, these systems face severe security challenges—particularly insider threats from authenticated users such as faculty members, proctors, and administrators. Because insiders hold valid credentials, traditional access control fails to identify malicious actions, creating an urgent need for an intelligent, proactive behavioral monitoring system backed by tamper-resistant audit trails.

### 1.2 Background of the Project
Online examination platforms handle critical assets including question paper repositories, student credentials, examination schedules, and grading rubrics. Centralized architectures create high-value targets where unauthorized tampering or illicit question exfiltration can go undetected. This project introduces **ExamSentinel AI**, a multi-tiered platform marrying autonomous Agentic AI with an Ethereum Virtual Machine (EVM) blockchain ledger.

### 1.3 Need for the Project
- **Credential Legitimacy Exploitation:** Malicious insiders bypass standard login barriers.
- **Single Point of Failure:** Centralized databases permit retrospective audit log alteration.
- **Manual Log Fatigue:** Traditional security teams cannot triage high-volume user telemetries in real time.
- **Proactive vs Reactive Defenses:** The need to interrupt attacks *before* question paper compromise or grade publication occurs.

### 1.4 Role of Artificial Intelligence
Autonomous Agentic AI models observe telemetry streams (login timestamps, keystroke cadence, batch query bursts, IP novelty) and compute behavioral drift vectors against baseline profiles using unsupervised Machine Learning (Isolation Forest with 150 orthogonal estimators).

### 1.5 Role of Blockchain Technology
Solidity smart contracts (`AuditLedger.sol`) accept SHA-256 state digests of critical system events. Once minted into the ledger, audit proofs cannot be altered or purged by any system administrator, providing undeniable non-repudiation and forensic integrity.

---

## 2. Literature Survey & Research Gap

| Paper / Framework | Year | Approach / Contribution | Identified Limitation / Gap |
|---|---|---|---|
| **Deltrux** | 2024 | Machine learning behavior analysis on enterprise endpoints. | Ignores exam-specific threat vectors; lacks immutable audit proof. |
| **DTITD** | 2023 | Digital Twin & Transformer-based insider threat detection. | High architectural complexity; focused exclusively on corporate enterprises. |
| **Online Exam Blockchain** | 2023 | Blockchain encryption for online exam question delivery. | Static data protection without proactive AI behavioral threat detection. |
| **ExamGuard** | 2025 | Smart contracts & computer vision proctoring for online testing. | Focuses on candidate webcam monitoring, overlooking administrative insider attacks. |

**Identified Research Gap:**  
Prior research addresses either administrative blockchain logging or proctoring webcam AI in isolation. **ExamSentinel AI** is the first unified framework integrating an autonomous 7-Agent AI threat pipeline directly with an EVM-compatible tamper-proof blockchain audit ledger.

---

## 3. Existing System vs Proposed System

### 3.1 Existing System Limitations
1. **Centralized Single Point of Truth:** Database records and audit logs are vulnerable to administrative manipulation.
2. **Post-Mortem Detection:** Breaches are detected weeks or months after question paper leaks have occurred.
3. **Coarse Role-Based Access:** All administrators possess blanket privileges without real-time behavioral scrutiny.
4. **Delayed Notification:** Alerts require batch log parsing scripts rather than live WebSocket socket feeds.

### 3.2 Proposed System Capabilities
1. **Proactive 7-Agent AI Ensemble:** Instantaneous triage of high-risk actions.
2. **Immutable On-Chain Verification:** Any log discrepancy is instantly highlighted by hash comparison.
3. **Automated Incident Containment:** Dynamic user session freezing and rate limiting when risk scores breach the threshold (≥ 70/100).
4. **Full-Duplex SOC Dashboard:** Visual live graphs, threat simulator, proctoring grid, and MITRE ATT&CK mapping.

---

## 4. Multi-Tier Architecture & System Modules

### 4.1 System Modules

#### Module 1: Secure Authentication & Activity Monitoring
- JWT (JSON Web Tokens) with Argon2/PBKDF2 password hashing.
- Granular Role-Based Access Control (Admin, Security Analyst, Invigilator, Candidate).
- Structured telemetry interceptor collecting timestamps, endpoints, payload sizes, and user context.

#### Module 2: Agentic AI Behavioral Analytics & Threat Prediction
- **Activity Monitoring Agent:** Validates stream structure and working hours conformity.
- **Behavioral Analysis Agent:** Measures deviation against a 30-day baseline vector.
- **Anomaly Detection Agent:** Executes Isolation Forest scoring across 10 normalized features.
- **Threat Assessment Agent:** Computes composite 0–100 threat score and tags threat categories.
- **Investigation Agent:** Produces explainable natural language forensic summaries.

#### Module 3: Decentralized Blockchain Logging & Smart Contracts
- Solidity `AuditLedger.sol` contract deployed on Ethereum/Polygon/Hardhat EVM.
- Functions: `recordAuditEvent(bytes32 logHash, string eventType, string actorId)`, `verifyLogHash(uint256 eventId, bytes32 expectedHash)`.
- Client-side and server-side verification flags identifying tampering attempts.

#### Module 4: Real-Time Alerts & Incident Containment
- WebSocket broadcasting engine pushing telemetry updates to SOC consoles in < 200ms.
- Analyst remediation tools: Instant session termination, credential lockout, automated forensic report generation.

---

## 5. Technical Specifications

### Hardware Requirements
- **Processor:** Dual-core 2.0 GHz or higher (Intel Core i5 / AMD Ryzen 5 recommended)
- **RAM:** Minimum 8 GB (16 GB recommended)
- **Disk Storage:** Minimum 10 GB free storage (SSD recommended)
- **Network:** Broadband connection with minimum 5 Mbps bandwidth

### Software Requirements
- **Operating System:** Windows 10/11, Ubuntu 22.04 LTS, or macOS 13+
- **Backend Runtime:** Python 3.10 – 3.12
- **Frontend Runtime:** Node.js 18.x or higher, npm 9+
- **Smart Contract Suite:** Solidity 0.8.20, Hardhat, Web3.py / Ethers.js
- **Machine Learning:** Scikit-Learn 1.4+, NumPy, Pandas
- **Database:** SQLite (development) / PostgreSQL (production)
