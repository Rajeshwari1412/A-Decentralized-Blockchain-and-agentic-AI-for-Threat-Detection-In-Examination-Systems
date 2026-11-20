# Frontend Engineering & System Design Specification

This document provides a comprehensive technical breakdown of the frontend development, user interface design, and architectural patterns implemented in **ExamSentinel AI**.

---

## 1. High-Level Frontend Architecture

The frontend is engineered as a high-performance **Single Page Application (SPA)** using **React 18, TypeScript, and Vite**, styled with **Tailwind CSS**, and instrumented with **Lucide Icons** and **Chart.js / SVG Canvas**.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                               USER BROWSER                                   │
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       │
                         ┌─────────────┴─────────────┐
                         │   React Router DOM (v6)   │
                         └─────────────┬─────────────┘
                                       │
        ┌──────────────────────────────┼──────────────────────────────┐
        ▼                              ▼                              ▼
┌──────────────┐               ┌──────────────┐               ┌──────────────┐
│ AuthContext  │               │ WebSocketCtx │               │ ThemeContext │
│ (RBAC & JWT) │               │ (<200ms Feed)│               │  (Dark SOC)  │
└───────┬──────┘               └───────┬──────┘               └───────┬──────┘
        │                              │                              │
        └──────────────────────────────┼──────────────────────────────┘
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                            COMPONENT HIERARCHY                               │
│                                                                              │
│   Navbar (Status Badges)  ◄──►  Sidebar (Role-Filtered Navigation)           │
│   LiveAlertBanner (High-Severity WebSocket Broadcasts)                       │
│                                                                              │
│  ┌─────────────────────────┐  ┌─────────────────────────┐  ┌──────────────┐  │
│  │ Executive SOC Dashboard │  │ Candidate Exam Terminal │  │ Blockchain   │  │
│  │ • Metric KPI Cards      │  │ • Fullscreen Lock Check │  │   Verifier   │  │
│  │ • Network Topology Map  │  │ • Dynamic Question UI   │  │ • Hash Check │  │
│  │ • Threat Radar & Trends │  │ • Telemetry Heartbeat   │  │ • Tamper Demo│  │
│  └─────────────────────────┘  └─────────────────────────┘  └──────────────┘  │
│                                                                              │
│  ┌─────────────────────────┐  ┌─────────────────────────┐  ┌──────────────┐  │
│  │  Agent Matrix Visualizer│  │  Threat Scenario Runner │  │ Incidents &  │  │
│  │ • 7-Agent Status Hub    │  │ • 1-Click Attack Demo   │  │  Forensics   │  │
│  │ • Inter-Agent Consensus │  │ • Step-by-Step Timeline │  │ • XAI Modal  │  │
│  └─────────────────────────┘  └─────────────────────────┘  └──────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Design System & Visual Palette

The user interface follows a modern **Cybersecurity Security Operations Center (SOC)** aesthetic designed for high data density, zero visual clutter, and instant situational awareness.

### Color Tokens
* **Background Deep Space:** `#0B0F19` (main view canvas)
* **Surface Navy / Card Shell:** `#111827` (card panels with subtle `#1F2937` borders)
* **Cyber Cyan (Primary Accent):** `#06B6D4` / `#00F0FF` (telemetry feeds & active navigation)
* **Emerald Green (Safe Status):** `#10B981` (blockchain verified & healthy agent nodes)
* **Amber Yellow (Suspicious Warning):** `#F59E0B` (elevated behavioral anomaly scores)
* **Crimson Red (Critical Threat):** `#EF4444` (MITRE ATT&CK flags & incident alerts)
* **Electric Purple (Agentic AI):** `#8B5CF6` (AI ensemble consensus badges)

---

## 3. Core Pages & Component Implementation Details

### 1. Executive SOC Dashboard (`DashboardPage.tsx`)
The centerpiece of the application, rendering real-time metrics and defense topology:
* **Metric KPI Cards (`MetricCards.tsx`):** Displays real-time counts for *Monitored Users*, *Active Examinations*, *Telemetry Events*, *Active Incidents*, *High-Risk Users*, and *Blockchain Anchors*.
* **Interactive Cyber Defense Topology (`NetworkTopologyMap.tsx`):** A custom SVG network visualizer connecting Exam Servers, Faculty Terminals, the 7-Agent AI Core, and the Blockchain EVM Ledger.
* **Threat Radar & Anomaly Trends (`ThreatRadarChart.tsx`, `AnomalyTrendChart.tsx`):** Visualizes 6-axis risk dimensions (off-hours, query volume, exfiltration rate, IP drift, role escalation, file payload) and temporal anomaly spikes.

---

### 2. Candidate Exam Terminal (`CandidateExamTerminal.tsx`)
Designed specifically for student assessment under active proctoring:
* **Fullscreen Lock Engine:** Tracks tab switching, mouse blur, and window resizing events, emitting immediate telemetry flags.
* **Proctored Question Interface:** Renders questions, timer countdowns, and real-time network connection indicators.
* **Telemetry Heartbeat:** Sends encrypted periodic beacon frames every 5 seconds back to the backend FastAPI ingestion hub.

```typescript
// Heartbeat Telemetry Ingestion Hook in Candidate Terminal
useEffect(() => {
  const interval = setInterval(async () => {
    if (examActive) {
      await api.post('/api/v1/activities', {
        action: 'EXAM_HEARTBEAT',
        endpoint: `/exams/${examId}/session`,
        payload_size: 128,
        tab_switches: tabSwitchCount,
        is_fullscreen: document.fullscreenElement !== null
      });
    }
  }, 5000);
  return () => clearInterval(interval);
}, [examActive, tabSwitchCount]);
```

---

### 3. Live Proctoring Grid & Exam Management (`LiveProctoringGrid.tsx`)
Provides invigilators with a high-density candidate surveillance wall:
* **Candidate Status Tiles:** Displays real-time webcam simulation status, terminal health, answered question count, and behavioral risk flags.
* **Credential Generator (`CandidateCredentialsTable.tsx`):** Allows invigilators to generate and export randomized candidate exam credentials on demand.
* **Emergency Remote Lock:** One-click invigilator action to pause or invalidate a suspicious candidate's session.

---

### 4. Interactive Threat Simulator (`ThreatSimulatorPage.tsx`)
Built specifically for project reviews and live examiner demonstrations:
* **1-Click Attack Demo:** Simulates an authorized user downloading confidential question papers at midnight.
* **Multi-Stage Attack Scenarios:**
  1. *Question Paper Vault Exfiltration (T1530)*
  2. *Unauthorized Grade Manipulation (T1078)*
  3. *Off-Hours Administrative Privilege Escalation (T1098)*
* **Threat Step Timeline (`ThreatStepTimeline.tsx`):** Animates each stage of the attack and highlights the exact moment the AI agents intercept the operation.

---

### 5. Blockchain Audit Explorer (`BlockchainAuditPage.tsx`)
Provides mathematical and cryptographic proof of log immutability:
* **Block Explorer Table (`BlockExplorerTable.tsx`):** Lists every recorded audit block with block number, event ID, actor ID, timestamp, and transaction hash.
* **Cryptographic Hash Verifier (`BlockchainVerifier.tsx`):** Takes any database event and queries the Ethereum/Hardhat smart contract `AuditLedger.sol` via Web3 to check:
  $$\text{keccak256}(\text{StoredHash}) \stackrel{?}{=} \text{keccak256}(\text{CalculatedHash})$$
* **Live Tamper Demonstration Card (`TamperDemoCard.tsx`):** Allows an examiner to intentionally change a database value with one click, showing how the ledger instantly turns red with a **Cryptographic Hash Mismatch** warning.

---

### 6. Incident Forensics & Explainable AI (`IncidentsPage.tsx`)
* **Explainable AI (XAI) Modal (`FeatureAttributionModal.tsx`):** Breaks down the Isolation Forest decision, highlighting which exact features caused the anomaly (e.g., `off_hours: +38%`, `payload_size: +42%`).
* **Incident Timeline (`IncidentTimeline.tsx`):** Visualizes the full chain of events preceding the alert.
* **Analyst Action Modal (`AnalystActionModal.tsx`):** Enables analysts to execute immediate containment actions (Kill Session, Freeze Role, Whitelist Activity).

---

## 4. Frontend State Management & Real-Time Flow

```
[WebSocket Broadcast Hub]
            │
            ▼ (Sub-200ms JSON frames)
   [WebSocketContext]
            │
            ├─► Updates RecentEvents Table (Prepends event, keeps latest 50)
            ├─► Triggers LiveAlertBanner (Pops down for risk > 65/100)
            └─► Re-indexes Topology Nodes (Flashing pulses on active node)
```

* **Zero-Flicker Updates:** Telemetry updates mutate targeted state arrays without causing full-page re-renders.
* **JWT Interceptor:** Axios automatically injects `Bearer <token>` from local storage and routes expired tokens back to `/login`.

---

## 5. Review Presentation Guide for the Frontend Developer (B. Manikanta)

When presenting the frontend during your project evaluation, use this structured walkthrough:

1. **Architecture & Component Modularity:**
   *"We chose React 18 with TypeScript and Vite because it provides strict type safety across complex threat models and renders high-frequency WebSocket streams without frame drops."*

2. **Real-Time SOC Experience:**
   *"Instead of standard static pages, our UI functions as a true SOC console. The dashboard integrates full-duplex WebSockets, so when a threat occurs in the exam hall or vault, the alert flashes instantly without needing a page refresh."*

3. **Demonstrating the Threat Simulator & Blockchain Verifier:**
   *"To prove our system works to evaluators, we engineered an interactive Threat Simulator and a Blockchain Tamper Verifier. In 2 clicks, any evaluator can test an attack scenario and verify that the blockchain detects unauthorized data changes."*
