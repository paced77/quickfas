# Project Integrity — Unified Truth & Governance

## Implementation plan for paced77/quickfas

**Milestone goal:** Make everything the platform displays traceable to something the platform actually does — without losing the Project Kingdom identity, and with all clinical data kept synthetic.

**Basis:** Architecture and credibility review (2026-11-10) and the preceding read-only dashboard walkthrough (`docs/ideas-from-dashboard-review.md`).

**One adaptation from the review:** the review's diagram mentions Next.js APIs. The repo is not Next.js — it is a Vite SPA (`index.html`, `vite.config.ts`) with a server API runtime (`server.ts`, `api/`) and Supabase (project `seventeen-pockets`) for identity. This plan keeps the review's four-layer model but maps it onto the stack that actually exists:

```
Presentation modes        Clinical Command  |  Project Kingdom
Unified intelligence      Metrics API · Alert registry · Permissions · Audit events
Platform services         server.ts / api/ routes (Supabase-token verified)
Data                      Supabase / PostgreSQL (profiles, alerts, metrics, decisions, events)
```

**Ground rules (unchanged from the README, treated as constraints):**

- Telemetry ingestion accepts only `dataClassification: "synthetic_demo"` events; clinical/FHIR ingestion stays disabled; no EHR connection; no real or identifiable patient data anywhere.
- New profiles default to `viewer`; permissions are enforced server-side, never only in the UI.
- Changes are additive and tested; GitHub Actions gates (tests, TypeScript, production build) must stay green.

---

## Phase 0 — Inventory of record (½ day)

Before changing code, freeze the list of claims the product currently makes, so every later phase has a checklist to close out. Known items from the walkthrough:

| Claim | Where it appears | Conflicts with |
| --- | --- | --- |
| ARR $14.2M | Dashboard, Finance Oracle | Analytics: ~$13.1M projected, $1.18M MRR, $599k receipts |
| Growth +24.8% YoY | Dashboard | Analytics chart: +48.2% YoY |
| 24 active missions | Global header | Mission Control: 5 campaigns |
| ALERTS: 5 | Global header | No alert records exist anywhere |
| Health 98% / "All Systems Nominal" | Header, Dashboard | Governance: 7 core issues, 5 apps offline, 7 APIs failing, integrity 87.4% "At Risk"; Mission MORPHIS-5 FAILING |
| 14,200 events buffered | Telemetry card | Intelligence Feed: 0 events ingested |
| Market $2.9B TAM | Investor Deck | Deck also claims "Unlock a $480B market" |
| AI Council votes | AI Council page | AI Sovereign Advisor shows the same roster with different tallies |

**Deliverable:** `docs/claims-inventory.md` generated from the table above, extended by a code search for hardcoded figures.  
**Completion test:** every number rendered by the UI appears in the inventory with a named owner.

---

## Phase 1 — Metrics service & demo-data integrity (P0)

**Data contract.** Every displayed metric is served in one envelope — no module keeps its own copy:

```ts
interface Metric {
  key: string;                    // e.g. "finance.arr"
  value: number;
  unit?: string;                  // "USD", "%", "count"
  source: string;                 // "finance-oracle" | "manual-entry" | "github-api" ...
  classification: "demo" | "production";
  verification: "verified" | "unverified" | "illustrative";
  updatedAt: string;              // ISO timestamp
}
```

**Implementation**

- Add `GET /api/metrics` (and `GET /api/metrics/:key`) in the existing API runtime; verify the Supabase access token the same way current routes do.
- Store metric definitions/values in a new table `public.metrics` (migration `supabase/migrations/<ts>_project_integrity_metrics.sql`), seeded with the reconciled values from the Phase 0 inventory. RLS: public read for authenticated users; writes restricted to `admin` role via service role on the server only.
- Frontend: one `useMetric(key)` hook + a `<MetricValue>` component that renders value, source, timestamp, and — for `classification: "demo"` — a persistent **DEMO** badge that cannot be hidden by CSS themes. Header, Dashboard, Analytics, Finance and Deck modules all migrate to it.
- Reconcile the inventory conflicts to one value each (e.g. a single ARR, a single YoY, mission count derived from Mission Control data).

**Tests**

- Contract test: `/api/metrics` response matches the envelope schema for every seeded key.
- Repo test (grep-based, in the existing `tests/` style): no numeric literals matching the inventoried claims remain hardcoded in `src/` components.
- UI test: a demo-classified metric always renders the DEMO badge.

**Completion test (from the review):** *No unexplained conflicting figures* — the same metric shows the same value in every module.

---

## Phase 2 — Alert registry & honest health (P0)

**Schema** (migration `..._project_integrity_alerts.sql`):

```sql
create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  severity text not null check (severity in ('critical','high','medium','low')),
  source_module text not null,
  owner text,
  status text not null default 'open' check (status in ('open','acknowledged','resolved')),
  created_at timestamptz not null default now(),
  acknowledged_at timestamptz,
  resolved_at timestamptz
);
```

RLS: authenticated read; status changes only by `operator`/`admin` (enforced again in the API).

**Implementation**

- Endpoints: `GET /api/alerts?status=open`, `POST /api/alerts/:id/acknowledge`, `POST /api/alerts/:id/resolve` (role-gated, see Phase 3).
- Header alert count = `count(alerts where status != 'resolved')`. The hardcoded "5" disappears; seed the registry with records matching the real known conditions (e.g. MORPHIS-5 failing, 7 failing external APIs from Governance) so the first honest count is explainable.
- Health % becomes a documented function, e.g. weighted subsystem status minus penalties for open critical/high alerts — implemented once, server-side, and displayed with its inputs visible. "All Systems Nominal" may only render when there are zero unresolved critical/high alerts and no failing subsystems; otherwise the headline reports the worst active condition.
- UI: an alerts panel (from the header count) listing severity, source, owner, age, and ack/resolve actions for permitted roles.

**Tests**

- Creating/resolving an alert changes the header count accordingly (integration test against a test Supabase project or mocked client, consistent with existing test setup).
- Health function unit tests: known inputs → known score; "Nominal" gating test.

**Completion test:** *Every alert has a corresponding record* — the count and the list always agree.

---

## Phase 3 — Viewer authorization, enforced server-side (P0)

**Role model** (extends the existing least-privilege profile migration): `viewer` < `operator` < `admin`, stored on the Supabase profile; the server reads the role from the verified token's profile on every privileged request — never from client-supplied fields.

**Action matrix**

| Action | viewer | operator | admin |
| --- | --- | --- | --- |
| View dashboards, alerts, deck | ✓ | ✓ | ✓ |
| Acknowledge / resolve alerts | – | ✓ | ✓ |
| Execute mission / ratify AI recommendation / deploy intervention | – | ✓ | ✓ |
| Modify settings, roles, metrics | – | – | ✓ |
| Run simulations that write state | – | ✓ | ✓ |

**Implementation**

- A single server middleware `requireRole('operator')` applied to every mutating route (mission execute, council ratify, automations run, settings, metrics write, alert transitions).
- UI: action buttons are hidden/disabled for viewers (secondary defence and honest UX), with a tooltip "Requires operator access."
- Audit: every privileged action appends to `public.audit_events` (actor, action, target, timestamp) — this also feeds Phase 6 traceability.

**Tests**

- For each mutating endpoint: request with a viewer token → **403**; with operator/admin → success. These become part of the CI contract tests.
- Regression test: direct API call (no UI) cannot execute a mission as viewer.

**Completion test:** *Unauthorized execution requests rejected* — verified by the 403 test suite, not by inspecting the UI.

---

## Phase 4 — Clinical / Kingdom presentation separation (P1)

**Implementation**

- A presentation-mode context (`clinical` | `kingdom`) stored per user in local storage (consistent with the current local-only model) with a visible toggle; both modes read the *same* metrics/alerts APIs.
- Clinical mode: plain-language labels (no "Soul Auditor," "Citadel," or imperial framing), trial identifiers and synthetic-cohort labels surfaced, compliance statements shown next to the figures they qualify.
- Kingdom mode: the existing aesthetic, missions, sectors, and council presentation — unchanged visually.
- Shared components (header status bar, MetricValue, alerts panel) render in both modes so the numbers can never diverge between modes.

**Tests**

- Snapshot/contract test: for a fixed metrics payload, both modes render identical values and alert counts.
- Content lint: a denylist of Kingdom terms fails CI if it appears in clinical-mode components.

**Completion test:** *Both presentation modes work consistently* — same truth, two presentations.

---

## Phase 5 — One AI Council (P1)

**Implementation**

- Single `council_members` roster (config or table) used by both pages.
- `council_decisions` table: proposal, per-member votes, outcome, decided_at. AI Sovereign Advisor becomes a view over the council service: its "directive of the day" is the latest decision record, not a separate dataset.
- The existing conflicting tallies are replaced by one seeded decision history; votes are written once, by the council endpoint, and are read-only elsewhere.

**Tests**

- Both routes render the same roster and the same vote record for a given decision ID.
- Writing a decision requires operator role (Phase 3 matrix).

**Completion test:** *One roster, one authoritative voting record.*

---

## Phase 6 — Intelligence Feed with traceable synthetic events

**Implementation**

- Keep the existing ingestion guard: `POST /api/stratum-events` rejects anything not marked `synthetic_demo` (already the documented behaviour) — persist accepted events to `public.stratum_events` (id, type, source, payload summary, received_at) instead of process-local memory, so history survives restarts.
- The Feed reads from that table; the "0 events ingested" state disappears once real synthetic events flow, and each item links to its event record. The "Run simulated activity" button remains, clearly labelled as simulation, and its events are stored with source `simulator`.
- Reconcile the telemetry card: "events buffered" and "events ingested" become two defined metrics in the Phase 1 service, sourced from this table.

**Tests**

- Ingestion rejects a non-`synthetic_demo` payload (existing behaviour — add explicit contract test if missing).
- A posted synthetic event appears in the feed query with a stable ID.

**Completion test:** *Synthetic events processed and traceable* end-to-end.

---

## Phase 7 — Investor Deck reconciliation

**Implementation**

- A `claims` registry (can live alongside metrics): every figure in the deck — TAM, raise, valuation, runway, cap table — is a metric/claim entry with `source` and `classification` (`actual` | `projection` | `estimate` | `assumption`).
- Resolve the market-size conflict by defining scopes explicitly (e.g. $2.9B serviceable obtainable market vs a broader category figure) or deleting the $480B line; whichever survives must carry its definition and source next to the number.
- Deck renders from the same `/api/metrics` + claims data as the dashboard, so the deck can no longer drift from the product.

**Tests**

- Contract test: every numeric figure rendered by the Deck exists in the registry with a source.
- The Phase 0 inventory rows for finance/market are marked closed.

**Completion test:** *All financial and market claims have sources* and match across modules.

---

## Cross-cutting

- **Migrations** follow the existing convention (`supabase/migrations/<timestamp>_project_integrity_*.sql`), reviewed and applied to `seventeen-pockets` the same way the profiles migration was.
- **CI:** existing GitHub Actions gates (tests, TypeScript validation, production build) must pass; the new contract/authorization tests join `npm test`.
- **Release gating:** per the README, production stays restricted (Vercel SSO) until security, privacy, clinical-content, and accessibility reviews are signed off. Phases 1–3 are the P0 blockers for *any* presentation that could be mistaken for a live system; they land first and in order.
- **Accessibility:** DEMO badges and mode toggle must meet the WCAG 2.2 AA evaluation already called for in the README (badge meaning never carried by colour alone).

## Suggested sequence

| Order | Phase | Why first/last |
| --- | --- | --- |
| 0 | Inventory | Cheap; defines "done" for everything else |
| 1 | Metrics & demo integrity | Every other fix reads from this |
| 2 | Alerts & health | Depends on metrics service patterns |
| 3 | Viewer authorization | Independent; can run parallel to 2 |
| 4 | Presentation separation | Needs shared components from 1–2 |
| 5 | AI Council consolidation | Small, self-contained |
| 6 | Intelligence Feed | Needs persistence + audit patterns from 2–3 |
| 7 | Investor Deck | Last — it consumes the reconciled truth |

## Definition of success (review §6, mapped)

1. No unexplained dashboard numbers → Phase 0 + 1 tests.
2. Every alert traceable → Phase 2.
3. Every simulated metric visibly identified → Phase 1 DEMO badge.
4. Viewer permissions enforced → Phase 3 403 suite.
5. AI recommendations consistent → Phase 5.
6. Clinical claims match implemented capabilities → Phase 4 + ground rules.
7. Investor figures reconcile → Phase 7.
8. Dashboard reports failures honestly → Phase 2 health gating.
