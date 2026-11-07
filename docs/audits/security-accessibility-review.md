# Security, privacy, and accessibility review

**Repository:** `paced77/quickfas`  
**Review baseline:** `main`, integration commit `6ead302899ea69761668937b40833f20653918d8`  
**Review date:** 2026-11-07  
**Status:** In progress — production remains SSO-restricted.

This is an evidence-based engineering review, not a penetration-test report, compliance certification, clinical validation, or WCAG conformance statement.

## Controls verified

- Source inspection confirms that the existing API verifies Supabase bearer tokens with `auth.getUser(token)` and reads the caller's `public.profiles.role`; no second identity system was introduced.
- The checked-in `supabase/schema.sql` defines RLS, a self-read policy, and a `viewer` default for new profiles. This is source-code evidence only; live profile-table availability and policy behavior are not yet verified.
- API middleware applies `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS in production, disables Express technology disclosure, and limits JSON bodies to 256 KB.
- Analytics event schema accepts allow-listed event names and rejects additional payload properties. Client-side analytics requires explicit consent.
- Synthetic telemetry is disabled unless `KINGDOM_DEMO_TELEMETRY=true`.
- The Stratum learning hub uses session-only progress and browser-native speech synthesis; no EHR integration is present.
- Vercel SSO protection is enabled for non-custom domains. Keep this setting enabled throughout review.
- Supabase security advisor was rerun after remediation below and returned no remaining security lint findings.

## Remediation completed in Supabase

The Supabase security advisor identified `public.rls_auto_enable()` as a `SECURITY DEFINER` event-trigger function executable by `PUBLIC`, `anon`, and `authenticated`.

Inspection confirmed it is attached to the enabled `ensure_rls` event trigger and automatically enables RLS on newly created public tables. The function does not need to be callable through the Data API.

Executed:

```sql
REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
```

Post-change database inspection confirmed:
- The `ensure_rls` event trigger remains enabled.
- Execute privileges remain for `postgres` and `service_role`.
- `PUBLIC`, `anon`, and `authenticated` no longer have execute privileges.
- A fresh Supabase security-advisor run returned an empty lint list.

**Migration follow-up:** the live database change still needs to be captured in the repository's reviewed migration history and verified in a staging/restore workflow before it is considered fully reproducible. No table, row, profile, or user data was changed by this privilege revocation.

## Authentication and authorization review

### Source-code findings

- The browser client originally read only `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. The draft branch now supports the existing Vercel integration names `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` as fallbacks, and Vite is configured to expose only the explicitly public `VITE_` and `NEXT_PUBLIC_` prefixes. This resolves the variable-name mismatch in source, subject to CI verification.
- The Vercel environment-variable name inventory contains the `NEXT_PUBLIC_SUPABASE_*` URL/publishable-key variables and server-side `SUPABASE_URL`/`SUPABASE_PUBLISHABLE_KEY` names. Values were not decrypted or copied. `AuthGate` still offers guest preview if the browser variables are absent at build time; guest preview is not an authenticated identity and must not be described as role-based access. Confirm runtime sign-in using dedicated test accounts before claiming production auth is configured.
- The repository's `.env.example` references Supabase project ref `babdeawtwaoorsmdnxip`. Read-only inspection of that project found no tables in the `public` schema, no public RLS policies, and no recorded migrations. The checked-in `supabase/schema.sql` has not been applied there. If production's `SUPABASE_URL` points to this project, the API profile lookup cannot succeed and authenticated API requests will fail closed with a service error. The production URL value was not exposed, so the live target must be confirmed before applying schema changes.
- The Supabase security advisor returned no current security lints for that project. The `ensure_rls` event trigger remains enabled, and `public.rls_auto_enable()` is not executable by `anon` or `authenticated`. This does not prove that the application profile schema exists.
- API middleware verifies the bearer token with Supabase Auth, then reads the profile role using the same user-scoped client. A missing profile returns 403; a profile-query failure returns 503. Signup profile creation is defined to assign `viewer`, and the schema does not trust user-editable signup metadata for role assignment.
- The current route policy is:
  - Public: `GET /health` (returns operational metadata) and `POST /analytics/event` (strict event-name-only payload).
  - Authenticated, any profile role: telemetry read; AI council, executive briefing, simulation, and voice-query endpoints.
  - `admin` or `executive`: analytics summary.
  - `admin` or `operator`: telemetry injection.
- AI and simulation endpoints currently have no role-specific guard, runtime request schema, or per-user/IP abuse limit. Existing analytics and telemetry caps are process-wide, not identity-aware. These are release blockers until the intended role/capability matrix is approved and enforced.
- The unauthenticated health response includes version, timestamp, AI-key-configured state, telemetry mode, and persistence mode. Review whether each field is operationally necessary.
- The current Content-Security-Policy only sets `frame-ancestors 'none'`; it is not a complete CSP.

### Required role tests

Before enabling public access, add integration tests using the actual configured Supabase project and dedicated test users for every role (`viewer`, `analyst`, `operator`, `executive`, `admin`). Verify:

1. Missing, malformed, expired, and revoked tokens are rejected.
2. A valid token with no profile is rejected; a profile lookup outage fails closed.
3. A user cannot read another user's profile or elevate their own role through signup metadata, client payloads, or direct profile updates.
4. Each route returns the expected 401/403/2xx outcome for every role in the approved matrix.
5. A user cannot call telemetry injection, analytics summaries, or privileged AI workflows outside their approved capabilities.
6. Guest preview cannot access protected APIs or persist data under another identity.
7. Rate limits, schema validation, and safe error responses behave consistently across aliases with and without the `/api` prefix.

Do not apply `supabase/schema.sql` or change Vercel environment variables until the production Supabase project is confirmed and a reviewed, reproducible migration plus rollback plan is ready.

## Synthetic-content correction

The initial Project Kingdom briefing, server-side executive/council/simulation/voice fallbacks, opt-in telemetry seed events, and sample telemetry injection have been changed to generic fictional workstream examples. The dashboard, strategic radar, digital-twin, council, mission, chart, and telemetry views have also had fabricated named-institution, patient-count, FHIR, trial, and financial claims replaced with sample-only language where identified. The global illustrative-workspace disclosure remains in place.

Some non-clinical numeric UI examples remain as static interface fixtures. They must remain visibly identified as illustrative and must not be represented as live measurements. A repository-wide review of every remaining static chart, map, and generated AI output is still required; generated model output must be grounded in approved source data or explicitly labelled illustrative.

## Security work still required

1. **API route and authorization review:** enumerate every route and verify method, authentication, role/capability, schema validation, and rate limits. In particular, add explicit input schemas and per-user/IP abuse controls for AI generation and other expensive routes.
2. **Health endpoint disclosure:** review the unauthenticated health response and reduce operational metadata to the minimum required for uptime checks.
3. **CSP hardening:** the current Content-Security-Policy only sets `frame-ancestors 'none'`. Define and test a complete policy (including script, style, connect, image, font, and object sources) against the actual Vite/Gemini/Supabase runtime before enforcing it.
4. **Logging:** inspect error paths for possible token, prompt, user-content, or provider-response leakage. Keep request bodies and authorization headers out of logs.
5. **Synthetic content:** complete a repository-wide sweep of remaining static charts, maps, mission data, and AI-generated responses. Do not invent real institutions, patients, trials, regulatory approvals, or financial/operational outcomes. Keep sample labels visible wherever fictional values remain.
6. **Supabase authorization:** audit every exposed table, view, function, trigger, and storage bucket. Confirm RLS on all exposed tables, correct ownership predicates, and least-privilege grants. Inspect any additional security-definer functions and view security-invoker behavior.
7. **Secrets and supply chain:** verify production environment variables, secret scanning, lockfile consistency, dependency advisories, and build provenance. Do not print or expose secret values during review.
8. **Threat model and testing:** run authenticated/unauthenticated route tests, role escalation tests, input fuzzing, abuse/rate-limit tests, dependency scanning, and an independent penetration test before public access.

## Accessibility work still required

The learning hub contains useful accessibility foundations (labels, live result/status regions, button pressed states, keyboard focus styles, semantic sections, and native disclosure elements). These observations are not a complete audit.

Complete and record:
- Automated axe-core checks on the landing page, learning hub, and core Project Kingdom routes.
- Full keyboard-only walkthrough: logical focus order, no traps, visible focus, disclosure controls, filters, dialogs, and navigation.
- Screen-reader review with NVDA/Firefox and VoiceOver/Safari (or equivalent representative combinations).
- WCAG 2.2 AA checks for contrast, text resize/reflow, target size, focus not obscured, headings/landmarks, accessible names, error identification, status messages, and reduced motion.
- Mobile viewport testing at narrow widths and zoom/reflow testing at 200% and 400%.
- Verify that read-aloud status and cancellation are announced without relying on color or animation.
- Check every Project Kingdom workflow for regressions; do not limit the audit to the Stratum learning hub.

No WCAG 2.2 AA conformance claim should be made until manual and automated evidence is recorded and all critical issues are resolved.

## Release gates

| Gate | Status |
|---|---|
| Existing Project Kingdom features retained | Verified by source inspection; regression walkthrough pending |
| Browser Supabase configuration and live profile schema | Blocked: Vite env names absent from Vercel inventory; checked example project has no public tables |
| Role/capability route matrix and integration tests | Pending; AI/simulation routes are currently authenticated-only |
| Core unit/privacy/typecheck/build workflow | Passed on prior integration PR; rerun required for subsequent code changes |
| Supabase security advisor | <span>Clear after privilege remediation</span> |
| Supabase privilege change captured as migration | Pending |
| API route threat review and abuse controls | Pending |
| CSP and production header validation | Pending |
| Primary fabricated clinical claims removed from briefing/fallback/demo fixtures | Implemented on draft branch; CI verification pending |
| Repository-wide synthetic-content sweep | Pending |
| Automated accessibility scan | Pending |
| Keyboard and screen-reader review | Pending |
| WCAG 2.2 AA assessment | Pending |
| Clinical source/reviewer sign-off | Pending |
| Browser/mobile smoke tests | Pending |
| Independent security assessment | Pending |
| Public access approval | Blocked; keep Vercel SSO enabled |

## Operating decision

Keep the existing production deployment restricted. Do not disable Vercel SSO, change identity configuration, connect EHR/patient data, or claim public launch readiness until the outstanding gates have evidence and explicit approval.
