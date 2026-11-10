# ExamSentinel AI — System Architecture Specification

## Architectural Overview

ExamSentinel AI implements a layered, zero-trust cybersecurity architecture designed for examination integrity. The architecture consists of four distinct operational layers:

```
+-------------------------------------------------------------------------+
|                        TIER 1: CLIENT PRESENTATION                      |
|                                                                         |
|  +-----------------------------+     +-------------------------------+  |
|  |   SOC Security Dashboard    |     |   Candidate Exam Terminal     |  |
|  |  (React 18 + Tailwind CSS)  |     |  (Full-Screen Proctored Exam) |  |
|  +-----------------------------+     +-------------------------------+  |
+------------------------------------▲------------------------------------+
                                     │ (REST APIs & Full-Duplex WebSockets)
+------------------------------------▼------------------------------------+
|                   TIER 2: APPLICATION & INGESTION CORE                  |
|                                                                         |
|  +-----------------------------+     +-------------------------------+  |
|  |     FastAPI REST Gateway    |     |   WebSocket Broadcast Hub     |  |
|  |   JWT Auth & RBAC Security  |     |  Real-Time Telemetry Stream   |  |
|  +-----------------------------+     +-------------------------------+  |
+------------------------------------▲------------------------------------+
                                     │ (Event Pipeline & State Ingestion)
+------------------------------------▼------------------------------------+
|                  TIER 3: AGENTIC AI & ML ANALYTICS LAYER                |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  |                     7-Agent AI Ensemble Pipeline                  |  |
|  |                                                                   |  |
|  |  [Activity Monitoring] ──► [Behavioral Analysis] ──► [Anomaly ML] |  |
|  |                                                            │      |  |
|  |  [Alert & Response]  ◄── [Investigation] ◄── [Threat Score]       |  |
|  |         │                                                         |  |
|  |         └────────────────► [Blockchain Audit Agent]               |  |
|  +-------------------------------------------------------------------+  |
|  | ML Inference Engine: Scikit-Learn Isolation Forest (10D Vector)   |  |
+------------------------------------▲------------------------------------+
                                     │ (Canonical SHA-256 State Anchors)
+------------------------------------▼------------------------------------+
|                 TIER 4: DECENTRALIZED BLOCKCHAIN AUDIT                  |
|                                                                         |
|  +-----------------------------+     +-------------------------------+  |
|  | Solidity Smart Contract     |     | EVM Local / Testnet Node      |  |
|  | (AuditLedger.sol v0.8.20)   |     | Hardhat / Polygon / Ethereum  |  |
|  +-----------------------------+     +-------------------------------+  |
+-------------------------------------------------------------------------+
```

---

## Component Details

### 1. Presentation Tier (React + Vite + Tailwind)
- **SOC Overview Page:** Real-time metrics on total events, high-risk flags, active anomalies, and live security timeline.
- **Threat Simulator Page:** On-demand execution of realistic insider attack scenarios (e.g. Question Paper Vault Dump, Bulk Grade Alteration, Off-Hours Credential Escalation).
- **Exam Management & Terminal:** Allows invigilators to create exams, generate randomized candidate credentials, and observe live terminal telemetry.
- **Blockchain Audit Page:** Directly pulls events from local SQLite/PostgreSQL and recomputes SHA-256 hashes against smart contract receipts to verify tamper status.

### 2. Application Core (FastAPI)
- Modular routers under `/api/v1` for activities, incidents, exams, simulations, agents, and WebSockets.
- Asynchronous database pooling using SQLAlchemy ORM.
- Secure token authentication with automatic expiration and refresh capabilities.

### 3. Agentic AI & ML Analytics
- Features extracted per telemetry item:
  1. Access Hour (Hour of day, 0–23)
  2. Day of Week (0–6)
  3. Action Frequency (Rolling 60-second window count)
  4. Endpoint Sensitivity Score (0.0 to 1.0)
  5. Payload Size (Bytes transferred)
  6. Failure Count (Consecutive unauthorized/failed actions)
  7. Geographic/IP Drift Score (Binary 0 or 1)
  8. Device User-Agent Novelty
  9. Off-Hours Boolean Flag
  10. Role Escalation Indicator
- Scaled via `StandardScaler` and passed to `IsolationForest(n_estimators=150, contamination=0.05, random_state=42)`.

### 4. Blockchain Layer
- The `AuditLedger.sol` contract exposes an append-only event store:
  ```solidity
  struct AuditRecord {
      uint256 id;
      bytes32 eventHash;
      string eventType;
      string actorId;
      uint256 timestamp;
      address recorder;
  }
  ```
- Any unauthorized update made directly in the database is revealed because `eventHash != SHA256(database_record)`.
