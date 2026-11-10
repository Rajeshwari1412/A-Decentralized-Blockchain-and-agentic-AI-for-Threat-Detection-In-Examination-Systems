# 7-Agent Autonomous AI Ensemble Specification

ExamSentinel AI implements a collaborative multi-agent architecture where autonomous software agents collaborate synchronously and asynchronously to analyze security events in real time.

---

## 1. Agent Overview & Responsibilities

```
                                  [ Incoming Telemetry Stream ]
                                                │
                                                ▼
                             ┌──────────────────────────────────────┐
                             │ 01. Activity Monitoring Agent        │
                             │ - Schema validation & hygiene checks │
                             │ - Working hours & perimeter rules    │
                             └──────────────────┬───────────────────┘
                                                │
                                                ▼
                             ┌──────────────────────────────────────┐
                             │ 02. Behavioral Analysis Agent        │
                             │ - Compares activity vs 30d baseline  │
                             │ - Calculates volumetric anomaly index│
                             └──────────────────┬───────────────────┘
                                                │
                                                ▼
                             ┌──────────────────────────────────────┐
                             │ 03. Anomaly Detection Agent (ML)     │
                             │ - 10D Feature vector transformation  │
                             │ - Scikit-learn Isolation Forest model│
                             └──────────────────┬───────────────────┘
                                                │
                                                ▼
                             ┌──────────────────────────────────────┐
                             │ 04. Threat Assessment Agent          │
                             │ - Composite 0-100 risk formulation   │
                             │ - MITRE ATT&CK insider classification│
                             └──────────────────┬───────────────────┘
                                                │
                                                ▼
                             ┌──────────────────────────────────────┐
                             │ 05. Investigation Agent              │
                             │ - Root-cause hypothesis generation   │
                             │ - Human-readable analyst summaries   │
                             └──────────┬────────────────┬──────────┘
                                        │                │
            ┌───────────────────────────┘                └───────────────────────────┐
            ▼                                                                        ▼
┌──────────────────────────────────────┐                         ┌──────────────────────────────────────┐
│ 06. Alert & Response Agent           │                         │ 07. Blockchain Audit Agent           │
│ - WebSocket real-time broadcast      │                         │ - Canonical JSON state serialization │
│ - Automated policy containment       │                         │ - SHA-256 hash generation & Web3 tx  │
└──────────────────────────────────────┘                         └──────────────────────────────────────┘
```

---

## 2. Agent Technical Implementations

### Agent 01: Activity Monitoring Agent (`activity_monitoring_agent.py`)
- **Type:** Rule & Boundary Sentinel
- **Functions:**
  - Ingests raw telemetry events (HTTP verb, endpoint, user ID, client IP, timestamp).
  - Determines if the action occurred outside institution operating hours (e.g., 23:00 – 06:00).
  - Checks if the user is accessing an administrative endpoint from an unregistered external IP.

### Agent 02: Behavioral Analysis Agent (`behavioral_analysis_agent.py`)
- **Type:** Statistical Baseline Comparator
- **Functions:**
  - Maintains historical rolling stats per user role (average queries/hour, median download size).
  - Flags abrupt spikes (e.g. downloading 500 exam scripts when historical mean is 12).
  - Calculates behavioral drift:
    $$\Delta B = \frac{|X_{current} - \mu_{baseline}|}{\sigma_{baseline}}$$

### Agent 03: Anomaly Detection Agent (`anomaly_detection_agent.py`)
- **Type:** Unsupervised ML Outlier Detector
- **Functions:**
  - Runs Scikit-Learn `IsolationForest` across a 10-dimensional normalized feature matrix.
  - Generates an anomaly score between -1.0 (severe outlier) and +1.0 (normal behavior).
  - Identifies which features contributed most significantly to the anomaly score.

### Agent 04: Threat Assessment Agent (`threat_assessment_agent.py`)
- **Type:** Risk Synthesizer & Tagging Engine
- **Functions:**
  - Calculates composite risk score (0 to 100):
    $$\text{Risk Score} = 0.35 \cdot S_{ML} + 0.30 \cdot S_{Behavior} + 0.20 \cdot S_{Sensitivity} + 0.15 \cdot S_{Rule}$$
  - Classifies threat into severity buckets:
    - **CRITICAL:** Score ≥ 80
    - **HIGH:** Score ≥ 65
    - **MEDIUM:** Score ≥ 40
    - **LOW:** Score < 40
  - Maps indicators to MITRE ATT&CK (e.g. `T1078 Valid Accounts`, `T1530 Data from Cloud Storage Object`).

### Agent 05: Investigation Agent (`investigation_agent.py`)
- **Type:** Natural Language & Forensic Reasoning
- **Functions:**
  - Analyzes the chain of events leading up to the flagged action.
  - Formulates hypotheses: *“User logged in at 02:14 AM from residential IP, requested exam paper encryption keys 4 times, followed by bulk paper download.”*
  - Suggests immediate actionable response steps for security analysts.

### Agent 06: Alert & Response Agent (`alert_response_agent.py`)
- **Type:** Active Defense & Notification
- **Functions:**
  - Dispatches priority WebSocket frames to connected SOC dashboards in under 200 milliseconds.
  - Triggers automated mitigation if configured (e.g., revoking JWT token, invalidating exam session).

### Agent 07: Blockchain Audit Agent (`blockchain_audit_agent.py`)
- **Type:** Cryptographic Notary & Ledger Interface
- **Functions:**
  - Serializes security events into canonical, sorted JSON.
  - Computes the SHA-256 cryptographic digest.
  - Calls `AuditLedger.sol` via Web3.py / RPC provider, binding the transaction hash to the incident.
