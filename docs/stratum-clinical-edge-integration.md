# Stratum Clinical Edge + Project Kingdom
## Unified product architecture and implementation plan

**Product identity:** Stratum Clinical Edge, powered by Project Kingdom  
**Founder:** O'Dell Anderson  
**Tagline:** Clear Health Insights for Every Generation  
**Repository:** `paced77/quickfas`

> **Architecture decision:** This is one product in the existing repository, not a second application, fork, copied codebase, or duplicate account system. Stratum Clinical Edge is the public-facing healthcare education experience. Project Kingdom remains the shared intelligence, operations, governance, and decision-support engine behind it. Both names appear together in product identity and documentation.

## 1. Non-negotiable integration rules

1. Keep the existing Project Kingdom application and its working modules; extend and refactor in place.
2. Do not create a second React app, second API server, duplicate Supabase project, duplicate user table, or parallel deployment.
3. Use one Supabase Auth tenant and one identity lifecycle. Add role/capability boundaries to the existing profile model through reviewed migrations.
4. Keep healthcare education content and enterprise operational intelligence in separate domain modules and data access policies, even though they share infrastructure.
5. Never put real patient records, protected health information, credentials, access tokens, or secrets into sample data, analytics, logs, screenshots, or demo fixtures.
6. Treat all existing clinical-looking dashboard values as synthetic demonstration content unless provenance proves otherwise. Do not present them as actual clinical outcomes.
7. Do not silently change or delete existing routes, navigation, features, or stored data. Migrations must be additive, reversible where practical, and verified before rollout.
8. A build, test, accessibility, privacy, or security failure blocks deployment. No automatic production deployment is authorized by this plan.

## 2. Repository inspection: verified baseline

The current repository is an existing React 19 + Vite + TypeScript application with an Express API, a Vercel configuration, Supabase JS, Zod, and Gemini integration.

Observed application modules include the executive dashboard/briefing, charts, strategic radar, mission control, map, automation engine, AI council, digital twin, telemetry feed, voice console, landing page, and investor portal. These are existing Project Kingdom capabilities and must be retained as the operational/intelligence layer.

The current Supabase schema defines `public.profiles`, links each profile to `auth.users`, assigns a default `viewer` role, enables row-level security, and creates a profile on user creation. The API middleware verifies a Supabase bearer token with `auth.getUser`, loads the caller's profile role, and protects application API routes. Therefore, the repository already contains a server-side Supabase authentication/authorization foundation; it should be audited and completed rather than replaced with another auth system.

The current API also seeds and generates in-memory telemetry, including clinical-domain examples. These values are synthetic code fixtures, not evidence of a connected EHR or production clinical data source. The event history is process-local and is not a durable governed audit store.

The repository's README is currently empty. The inspected application entry point is Project Kingdom-branded and does not yet provide the complete Stratum Clinical Edge public healthcare education experience described in the product brief.

### Verified gaps before public launch

- Stratum public learning journeys, topic library, age-aware onboarding, caregiver/student pathways, and plain-language article experience are not yet evidenced in the inspected entry point.
- The existing profile role model is a useful starting point, but granular capabilities, admin provisioning, account lifecycle UX, and security tests need verification.
- Telemetry is an in-memory demo stream; it is not a consent-governed analytics pipeline or durable audit system.
- The inspected API installs JSON parsing but does not show the complete security-header, request-size, rate-limit, consent, referral, or storage-audit controls in the requested specification.
- Accessibility, audio retry/cancellation states, analytics consent synchronization, storage governance, CSV round-trip tests, and migration recovery tests require implementation and verification.
- The existing demo/telemetry content needs a clear synthetic-data label and a strict prohibition on importing real patient data into demos.

## 3. Target architecture: one application, bounded domains

Keep the existing runtime and deployable unit. Organize the code into domain boundaries inside the same frontend, API, Supabase project, and CI pipeline.

| Layer | Stratum Clinical Edge | Project Kingdom |
|---|---|---|
| Product surface | Health education, topic discovery, plain-language explainers, age-aware learning paths, caregiver resources | Executive dashboard, operations, missions, AI council, analytics, automations, strategy |
| Domain services | Content catalogue, learning progress, saved resources, referrals, accessibility preferences | Operational telemetry, decision support, workflow orchestration, reporting |
| Shared platform | One auth/session service, consent manager, storage registry, privacy-safe analytics client, audit interfaces | Same shared services; no parallel implementation |
| Governance | Content review, clinical-source provenance, age-appropriate presentation, educational-not-medical-advice boundaries | Role/capability access, auditability, operational safeguards |
| Infrastructure | Existing Express/Vite/Vercel deployment and existing Supabase project | Same deployment and Supabase project |

### Suggested in-repository organization

Add domain folders incrementally; do not move existing modules until tests and import boundaries are in place.

```text
src/
  app/                    # shared shell, routing, navigation
  domains/
    stratum/              # healthcare education experience
      onboarding/
      topics/
      learning/
      caregivers/
      content/
    kingdom/              # existing intelligence and operations modules
  platform/
    auth/                 # shared Supabase session and role/capability checks
    consent/               # versioned consent and cross-tab synchronization
    analytics/             # allow-listed, consent-gated event client
    storage/               # key registry and retention/ownership rules
    accessibility/         # shared accessibility preferences and helpers
    audio/                 # cancellable audio state machine and retry policy
  services/                # existing shared integrations; migrate carefully
  schemas/                 # runtime-validated contracts
server/
  middleware/              # security headers, auth, rate limits, request IDs
  routes/                  # analytics, consent, referrals, audit, existing APIs
supabase/
  migrations/              # ordered, additive, reviewed SQL migrations
docs/
  security/
  architecture/
  operations/
tests/
  unit/
  integration/
  contract/
  privacy/
  accessibility/
  property/
```

## 4. Shared identity, roles, and data boundaries

Continue using the existing `auth.users` identity and `public.profiles` row. Do not create a second users table. Introduce a capability mapping in application code or a normalized role-capability table after reviewing current usage. Do not let signup metadata, client-supplied role values, or email address determine privileged access.

Initial capability groups to review:
- `education:read`, `education:save`, `education:progress`
- `content:review`, `content:publish`
- `kingdom:read`, `kingdom:operate`
- `governance:audit`, `governance:admin`

Use least privilege and enforce authorization server-side and with Supabase RLS. Keep learning records scoped to the signed-in user. Keep operational data in its own tables/policies. Do not join educational learner data to operational telemetry by default. Any future cross-domain reporting must be explicitly approved, aggregated, privacy-reviewed, and free of health information.

## 5. Healthcare education product requirements

The Stratum experience should use the product name **Stratum Clinical Edge** and the tagline **Clear Health Insights for Every Generation**. The public landing page should explain that the platform provides education and navigation support, not diagnosis, treatment decisions, or a substitute for a qualified clinician.

Core journeys:
- Discover topics and browse plain-language explanations.
- Understand medical terminology, conditions, tests, treatments, medication concepts, prevention, and healthcare systems.
- Save resources and track learning progress.
- Provide caregiver and student learning paths.
- Offer age-aware onboarding bands: 10–17, 18–39, 40–64, 65+, and caregiver. For minors, implement age-appropriate privacy and consent requirements before collecting account or tracking data.
- Use grade 6–8 language as a default readability target, explain unavoidable terminology, cite reputable source material, and show content review dates.
- Support keyboard-only navigation, screen readers, visible focus, scalable text, high contrast, dark mode, read-aloud, reduced motion, and responsive layouts.

Target conformance is WCAG 2.2 AA. Accessibility is a release gate, not a later polish task.

## 6. Privacy, consent, analytics, and storage

### Consent
- Consent states: `unknown`, `granted`, `denied`; analytics runs only when state is `granted`.
- Store a versioned consent record. Unknown and denied both mean no analytics transmission.
- Synchronize changes across tabs with BroadcastChannel and a storage-event fallback; handle unavailable browser APIs safely.
- Propagate opt-out immediately, stop queued sends, and clean up listeners/channels.
- Migrations must handle v1, v2, and unknown future versions without downgrading or destroying newer state.

### Analytics allow-list
Validate event names and payloads at runtime. Reject unknown events and unknown properties. Initial event catalogue:
`page_view`, `onboarding_started`, `age_group_selected`, `article_opened`, `article_completed`, `resource_saved`, `share_clicked`, `referral_sent`, `referral_signup`, `account_created`, `newsletter_joined`, `demo_requested`, and audio lifecycle events `audio_started`, `audio_retry_scheduled`, `audio_retry_executed`, `audio_completed`, `audio_aborted`, `audio_failed`.

Never send names, email addresses, passwords, tokens, auth secrets, referral codes, healthcare data, consent values, raw storage contents, or other PII. Use allow-listed categorical metadata only. Sentry/error telemetry may include failure category, error type, and migration version only; scrub request bodies and user identifiers.

### Storage governance
Maintain one registry describing each key's owner, purpose, category, retention, version, and opt-out behavior. Review existing keys including `analytics-consent`, `consent:v2`, `consent:version`, `referral_code`, `analytics-session`, and `first_visit_at` before changing or deleting them. Do not store sensitive health information in browser storage.

### API contracts to implement and test
- `POST /api/analytics/event`: authenticated or anonymous policy must be explicitly chosen; regardless, accept only the allow-listed privacy-safe event schema and enforce consent.
- `POST /api/consent`: validate and persist the minimum necessary consent version/state; never include consent state in analytics.
- `POST /api/referrals`: validate referral input, rate-limit, prevent duplicates, and never expose referral codes to analytics.
- `GET /api/audit/storage`: admin-only, return a metadata inventory, never raw stored values.

These endpoints are target contracts, not claims that they are already implemented.

## 7. Reliability, retries, and security

Audio and network retry state must be explicit: idle, loading, playing, retrying, cancelled, error. Support AbortController cancellation, manual retry, bounded exponential backoff with jitter, and accessible status announcements. Do not retry after cancellation.

For HTTP retries, treat 408, 429, 500, 502, 503, and 504 as retryable; treat 400, 401, 403, 404, and 422 as non-retryable. Respect Retry-After in seconds or HTTP-date form, cap attempts and delays, add jitter, and stop on abort. Parse and test relevant rate-limit headers. Never retry non-idempotent writes unless an idempotency strategy is in place.

Apply and verify appropriate CSP, X-Frame-Options or frame-ancestors policy, X-Content-Type-Options, Referrer-Policy, and Permissions-Policy. Add request-size limits, strict input validation, safe error responses, and rate limiting. Avoid logging authorization headers, request bodies, user content, or secrets.

## 8. Migrations, CSV, audit, and test strategy

- Use ordered SQL migrations with preflight checks, snapshots where needed, transactional execution, rollback/recovery instructions, idempotence checks, and post-migration verification.
- Keep existing profile data and user IDs intact. No destructive schema migration without a reviewed backup and explicit approval.
- Audit output should be structured JSON with schema version and safe metadata.
- CSV import/export must follow RFC 4180 and be tested for commas, quotes, CRLF, embedded newlines, Unicode, emoji, RTL, CJK, null bytes, empty values, and round-trip fidelity.
- Use property-based tests (for example, fast-check) for CSV parsing/serialization, migration transformations, event schemas, and retry behavior.

Required test suites:
1. Unit: consent state machine, storage registry, event schemas, retry policy, CSV.
2. Integration: Supabase auth/profile/RLS, API auth, consent enforcement, referral duplicate/rate limits.
3. Contract: all API request/response schemas, reject unknown event names/properties.
4. Privacy: no PII/health data/secrets in analytics or error telemetry; opt-out stops transmission.
5. Accessibility: automated checks plus keyboard and screen-reader manual review; WCAG 2.2 AA acceptance.
6. Property: CSV round trips, migration idempotence, retry bounds and cancellation.
7. Regression: existing Project Kingdom navigation, dashboard, missions, AI council, map, automations, reports, strategy, governance, and voice flows.

CI gates: install, lint/typecheck, unit, integration, contract, privacy, property, accessibility checks, production build. Production deploy is blocked if any required gate fails.

## 9. Ordered delivery roadmap

### Phase 0 — Baseline and safety
- Capture current main-branch behavior and test/build baseline.
- Inventory every route, component, table, policy, environment variable, and existing storage key.
- Label demo telemetry as synthetic and remove any implication that it represents live patient care.
- Add architecture decision records and a migration/rollback checklist.

### Phase 1 — Shared platform foundation
- Establish shared app shell and product identity: “Stratum Clinical Edge, powered by Project Kingdom.”
- Preserve Project Kingdom routes and components.
- Complete Supabase auth UX and role/capability audit using the existing auth system.
- Add domain boundaries and route-level access controls.

### Phase 2 — Stratum education experience
- Build landing page, topic catalogue, article template, plain-language glossary, learning paths, caregiver/student resources, saved resources, and age-aware onboarding.
- Add content provenance, reviewer, reviewed-at date, and educational disclaimer.
- Implement accessibility preferences and WCAG 2.2 AA checks.

### Phase 3 — Privacy and governance
- Implement consent state/version migration, cross-tab sync, opt-out cleanup, storage registry, allow-listed analytics, referral controls, and storage audit API.
- Add RLS policies and privacy-focused integration/contract tests.

### Phase 4 — Reliability and hardening
- Implement audio/retry state machine, Retry-After support, request limits, security headers, safe logging, CSV import/export, audit reports, and migration recovery.
- Run accessibility, privacy, property-based, and regression suites.

### Phase 5 — Beta and public launch
- Conduct clinical-content review by appropriately qualified reviewers; do not imply medical endorsement without authorization.
- Run privacy/security review, accessibility audit, threat model, backup/restore exercise, and incident-response tabletop.
- Launch a limited beta with synthetic demo data only, collect opt-in feedback, resolve release blockers, then approve public launch.

## 10. Definition of done

A phase is complete only when its code is merged through review, tests pass in CI, data/privacy boundaries are verified, accessibility requirements for the phase pass, operational documentation exists, and rollback/recovery is documented. A written plan or an open pull request is not implementation completion.

**Current implementation update:** the existing landing page now includes a searchable, category-filtered Stratum Clinical Edge learning hub with ten introductory topics, session-only save/reading progress, the education-not-diagnosis boundary, and visible co-branding with Project Kingdom. The existing Governance workspace includes a browser-storage registry audit with JSON and CSV export. Privacy consent, cross-tab synchronization, allow-listed analytics intake, telemetry privacy screening, and baseline API hardening are also implemented. Referral services, durable governed persistence, age-aware onboarding, clinical-source review, complete accessibility validation, migration recovery, and launch gates remain outstanding. No production deployment or clinical-content review is claimed.

## 11. Implemented foundation on the integration branch

The following items are implemented in code on the current branch:

- A versioned analytics consent record (schema version 2) stored locally, with malformed/future records failing closed.
- Cross-tab consent synchronization using BroadcastChannel with the browser storage event as a fallback.
- A visible, keyboard-operable privacy control that allows the visitor to grant or withdraw optional analytics consent.
- An allow-listed analytics event schema. The client sends only the event name and only after local consent is granted; event properties are rejected.
- An anonymous analytics intake endpoint that validates the event contract, applies a process-wide request cap, and retains only aggregate counters in process memory. It does not retain account IDs, IP addresses, route strings, topic titles, form contents, health information, or credentials.
- Telemetry contracts restrict metadata to scalar values and reject common direct identifiers, contact details, credentials, and obvious health-data fields before accepting events.
- Telemetry ingestion is rate-limited and the in-memory event history is bounded; synthetic fixtures and random pulses are opt-in only.
- A central browser-storage registry and governance audit report registered namespaced keys and presence without reading or exporting values. JSON and RFC4180 CSV export are available.
- Baseline API security headers, disabled Express technology disclosure, and a bounded JSON request body.
- Synthetic telemetry seeding and random pulse generation are disabled by default. They can be enabled only with the explicit `KINGDOM_DEMO_TELEMETRY=true` environment setting. The interface labels those events as illustrative.
- A persistent dashboard disclosure that the existing hardcoded charts, map, briefing and AI fallback scenarios are not connected to live clinical, financial, or operational systems.
- Node test-runner coverage for consent record validation, analytics allow-list enforcement, telemetry privacy rejection, and storage-audit/CSV behavior.

### Important limits that remain

The current telemetry event store and analytics aggregates are process-local and are lost on restart; neither is a durable audit or reporting database. No EHR/FHIR integration, production clinical data connection, durable consent ledger, age verification, referral service, full migration/rollback system, complete WCAG 2.2 AA audit, or end-to-end security test suite is claimed by this implementation. The integration remains additive and uses the existing Supabase authentication foundation. Do not use synthetic scenarios for clinical, financial, regulatory, or operational decisions.

### Verification gate

The source changes are committed to this branch. The quality workflow has passed tests, TypeScript validation, and a production build on an earlier head; the current head must complete the same checks again after the latest changes. Accessibility, clinical-content review, security testing, and deployment preview are separate release gates. Keep the pull request in draft until those checks pass and the Okteto preview credential dependency is resolved or the preview workflow is intentionally changed.

The Stratum learning hub has expanded to ten searchable, category-filtered health-literacy topics. Save and reading-progress state is session-only and is not sent to analytics; only the generic event name is sent when analytics consent is granted. The existing Governance workspace now contains a browser-storage registry audit with JSON and RFC4180 CSV export. The audit enumerates namespaced keys and presence only; it never reads or exports stored values.
