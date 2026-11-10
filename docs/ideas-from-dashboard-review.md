# Stratum Clinical Edge + Project Kingdom — Dashboard Architecture & Credibility Review

**Review date:** 2026-11-10  
**Scope:** Read-only review of the signed-in VIEWER dashboard at https://quickfas-tawny.vercel.app/ and the `paced77/quickfas` repository.  
**Review status:** No changes or submissions were made during the review.

## Executive summary

The platform is a compelling founder/investor demo command center that combines two presentation identities:

- **Stratum Clinical Edge:** decentralized and offline-first clinical-trial infrastructure, rural edge appliances (“Seventeen Pockets”), patient tracking, FHIR/HL7 pipelines, bedside decision support, and SUDS distress/polyvagal telemetry.
- **Project Kingdom:** a gamified “imperial cyber command” layer with missions, sectors, an AI council, automations, and an investor deck.

The current experience should be treated as a **founder/investor demo, not a functioning clinical system**. The reviewed screens show summary cards, charts, and narrative briefings rather than identifiable patients, trial records, or live clinical workflows. The README states that telemetry ingestion accepts only `synthetic_demo` events; clinical/FHIR ingestion is disabled; there is no EHR connection; and real patient data must not be received.

The central credibility risk is a mismatch between what the dashboard claims and what the application demonstrably does. Numbers, alerts, health indicators, and execution controls need authoritative sources and enforceable behavior before the product is presented as live operational or clinical infrastructure.

## What was visible

### Global status header

The header displayed these values across modules:

- HEALTH 98%
- MISSIONS 24 ACTIVE
- READINESS 87%
- ALERTS 5
- RISK LOW
- AUTOMATION 76%
- STATE: SOVEREIGN READY

The dashboard headline read: **“All Clinical Edge Systems Nominal · Phase III Trial Cohort Accelerated.”**

### Dashboard cards

- Revenue/MRR: $14.2M (+24.8% YoY)
- Clinical Velocity: 28.5 enrollments/month (+32% vs baseline)
- Edge System Health: 99.4% (16 edge nodes autonomous)
- 684 active patients
- 14,200 telemetry events buffered locally
- $4.0M/month resource allocation

### Mission Control

Mission Control showed 5 campaigns and 224 tasks:

| Campaign | Progress | Status |
| --- | ---: | --- |
| MORPHOS-7 | 79% | — |
| MORPHIS-5 | 78% | FAILING |
| VEILING-2 | 85% | — |
| PHI-LITE | 88% | — |
| VELOUTE-9 | 84% | — |

### Strategic Analytics

Analytics showed approximately $13.1M projected ARR, $1.18M MRR, and $599k receipts, with growth of +48.2% YoY. Phase III figures included 14.4% enrollment, 93.0% 30-day retention, and +18.0% outcome delta. The talent pipeline was labelled “Simulated performance data.”

### Intelligence Feed

The “Seventeen Pockets Telemetry Fabric” showed 0 events ingested and a “Run simulated activity” action. The production endpoint displayed was `/api/stratum-events`.

### AI Council and AI Sovereign Advisor

Both pages displayed the same seven-member roster, but their vote tallies differed.

### Investor Deck

The deck displayed a Stratum Performance Index of 94/100, a $28.5M raise at a $28.5M pre-money valuation, and inconsistent market-size claims: $2.9B TAM in one location and “Unlock a $480B market” elsewhere.

### Settings & Governance

There was no conventional settings experience. The enterprise topology view reported 7 core issues, 5 applications offline, 7 external APIs failing, and Covenant Integrity of 87.4% marked “At Risk.” The privacy section stated that all data was local-storage-only in the browser.

### Quickfas Nexus

Quickfas Nexus was the one clearly live module: it displayed actual GitHub data for `paced77/quickfas`, including 186 commits, activity on November 8–9, 2026, and 2 contributors.

## Key inconsistencies and risks

1. **Five alerts with no alert records or details.** The global header shows 5 alerts, but there is no corresponding alert list or traceable alert detail.
2. **Mission totals and system status conflict.** The header says 24 active missions while Mission Control shows 5 campaigns; MORPHIS-5 is marked FAILING while the headline says all systems are nominal.
3. **Health and governance disagree.** HEALTH 98% and “All Systems Nominal” conflict with 7 core issues, 5 offline applications, 7 failing external APIs, and integrity marked “At Risk.”
4. **Financial and telemetry figures do not reconcile.** Revenue/MRR and growth claims differ across modules; 14,200 events are said to be buffered while the Intelligence Feed reports 0 ingested.
5. **AI decision records are duplicated inconsistently.** The same seven-member council appears in two places with different vote counts.
6. **Viewer role exposes execution affordances.** The VIEWER dashboard displays actions such as “Ratify & Execute Recommendation” and “Execute Mission.” Whether the server blocks these actions is unclear from the UI.
7. **Market-size claims conflict.** The deck uses both $2.9B TAM and a $480B market statement without a clear scope distinction.

## Recommended fixes, in priority order

1. **Build a real alert registry.** Each alert should have severity, owner, status, timestamps, and acknowledge/resolve actions. Derive the header count from unresolved records.
2. **Establish one source of truth for metrics.** Serve each displayed metric from a shared service, identify its source and verification state, and persistently label simulated values as DEMO.
3. **Separate the serious clinical view from the Project Kingdom presentation.** Provide a clinical presentation mode with plain-language labels, trial identifiers, synthetic-cohort labels, and evidence appropriate to actual capabilities. Keep the Kingdom theme as a distinct presentation layer.
4. **Wire the Intelligence Feed to the event endpoint.** Persist accepted synthetic events and make each feed item traceable to an event record.
5. **Merge AI Sovereign Advisor and AI Council.** Use one roster and one authoritative decision/vote record.
6. **Make Settings & Governance functional.** Provide real role, notification, and export settings; hide or disable execution actions for viewers in the UI and enforce permissions on the server.
7. **Reconcile the Investor Deck.** Separate verified actuals, projections, estimates, and assumptions; resolve the TAM scope conflict.
8. **Surface failures honestly.** Show failing missions, applications, APIs, and other material issues on the executive dashboard and calculate health from documented inputs.

## Suggested architecture

Preserve the current visual identity while organizing the platform into four cooperating layers:

1. **Stratum Clinical Edge** — clinical intelligence, trial infrastructure, synthetic cohorts, and FHIR readiness.
2. **Clinical Command** — protocols, sites, trial status, data integrity, and evidence-backed clinical presentation.
3. **Project Kingdom** — missions, sectors, strategy, and council presentation.
4. **Unified Intelligence Layer** — shared metrics API, alert registry, permissions, audit events, and traceability.

Use the existing application stack and persistent platform services rather than introducing an unrelated framework. Metrics, alerts, decisions, and events should have authoritative data contracts and server-enforced access controls.

## Implementation requirements

### Metrics and demo-data integrity

Each metric should identify its value, source, update time, classification (demo or production), and verification status. A demo-classified value must always carry a visible DEMO label. Do not present synthetic clinical enrollment, patient, revenue, or trial figures as verified operational results.

### Alerts and health

Create persistent alert records with severity, source, owner, status, and lifecycle timestamps. Derive the header alert count from unresolved records. Define health calculation once, expose its inputs, and do not show “Nominal” when critical/high alerts or failing subsystems remain.

### Permissions and auditability

Enforce roles on the server for every privileged operation. A viewer must not be able to execute missions, ratify recommendations, modify settings, or trigger privileged operations by calling an API directly. Record privileged actions in an audit trail.

### Clinical integrity and privacy

Keep all cohorts and telemetry synthetic. Keep FHIR/EHR ingestion disabled and do not accept identifiable patient data until the required infrastructure, security controls, privacy review, and regulatory obligations have been independently verified. Place limitations and synthetic-data labels next to the claims they qualify.

### Investor claims

Separate actual verified performance from projections, market estimates, and fundraising assumptions. Any market-size figure must include a clear definition and source; remove or explain conflicting claims.

## Recommended delivery sequence

1. Inventory every displayed claim and its owner.
2. Centralize metrics and persistent demo-data labels.
3. Implement the alert registry and calculated health.
4. Enforce viewer authorization on the server and test forbidden requests.
5. Separate Clinical and Kingdom presentation modes.
6. Consolidate AI Council and AI Sovereign Advisor into one decision service.
7. Persist and trace synthetic Intelligence Feed events.
8. Reconcile Investor Deck claims against the shared metrics/claims registry.

## Definition of success

- No unexplained or conflicting dashboard figures.
- Every alert is backed by a traceable record.
- Every simulated metric is visibly identified as demo data.
- Viewer permissions are enforced server-side and covered by 403 tests.
- AI recommendations use one authoritative roster and voting record.
- Clinical claims accurately describe implemented capabilities and remain synthetic.
- Investor figures are sourced, classified, and reconciled across modules.
- The dashboard reports failures honestly rather than masking them with “Nominal” status.

## Preservation principle

This is a credibility and governance correction, not a generic redesign. Preserve the current design language and imperial command aesthetic, Mission Control, the AI Council concept, QuickFAS Nexus GitHub integration, the six-pillar Seventeen Pockets identity, and the decentralized clinical-edge vision. The goal is to make the experience trustworthy by ensuring that what it displays is traceable to what the platform actually does.
