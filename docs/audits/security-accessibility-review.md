# Security, privacy, and accessibility review

**Repository:** `paced77/quickfas`  
**Review date:** 2026-11-07  
**Status:** In progress — live Vercel project currently reports SSO, password, and trusted-IP protection disabled; production access must not be considered restricted until corrected and verified.  
**Scope:** Existing Quickfas application, including Project Kingdom and Stratum Clinical Edge.

This is an engineering review, not a penetration-test report, compliance certification, clinical validation, or WCAG conformance statement.

## Verified controls

- Existing Supabase bearer-token verification uses `auth.getUser(token)`; authorization roles are read from the server-side `public.profiles` row. User-editable signup metadata is not trusted for authorization.
- The live `seventeen-pockets` Supabase project (`babdeawtwaoorsmdnxip`, `us-east-1`) contains the profile schema, RLS, self-read policy, and new-user trigger assigning the least-privileged `viewer` role.
- The profile table grants authenticated SELECT only; its own-row RLS policy restricts the caller to their own profile. Anonymous SELECT is not granted.
- A Supabase-backed rate-limit counter table is enabled with RLS and caller-scoped read/insert/update policies. There is no caller DELETE privilege. A trigger makes the user/bucket identity immutable and increments or resets counters only when the minute window expires.
- The rate-limit RPC is `SECURITY INVOKER`, restricted to authenticated users, and checks `auth.uid()`. It has a fixed bucket allowlist; callers cannot choose their own quota.
- The live Supabase security advisor currently reports two Auth warnings: leaked-password protection is disabled and too few MFA options are enabled. The previously verified database privilege posture remains: RLS enabled; three rate-limit policies present; anonymous SELECT and RPC execute denied; authenticated DELETE denied; authenticated RPC execute allowed; rate-limit function and trigger function are not SECURITY DEFINER.
- AI and telemetry-write API routes enforce a role matrix and strict bounded Zod request schemas. AI, telemetry-write, and analytics-event routes use a distributed per-user rolling one-minute limit. A failed rate-limit database check fails closed with HTTP 503.
- The public health response has been reduced to `{ status: "ok" }`.
- Express sets `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, HSTS in production, disables `X-Powered-By`, and limits JSON request bodies to 256 KB. Vercel also sets `X-Frame-Options: DENY` on static frontend responses.
- Product analytics requires a verified Supabase session and accepts only strict allow-listed event names. It does not retain account IDs, event properties, IP addresses, route strings, health details, or form contents.
- Every telemetry event must explicitly declare a synthetic classification; unclassified events are rejected. Demo seed and pulse events now run only when `KINGDOM_DEMO_TELEMETRY=true`, are labelled `synthetic_demo`, and use generic illustrative workload values. The schema rejects clinical-domain and FHIR event types. Stratum Clinical Edge is an educational experience and has no EHR integration.
- Vercel deployment protection is currently disabled according to the live project configuration; application-level Supabase authentication is a separate control. Okteto workflow and manifest are removed from PR #4; Vercel is the only configured deployment platform.

## API authorization matrix

| Capability / endpoint | Allowed roles |
|---|---|
| Health check | Public; returns status only |
| Analytics event | Any authenticated profile role; strict event-name-only schema and distributed quota |
| Telemetry events (read) | Any authenticated profile role |
| Analytics summary | `admin`, `executive` |
| Telemetry injection | `admin`, `operator` |
| Analytics event submission | Any authenticated profile role |
| AI council deliberation | `admin`, `executive`, `analyst` |
| Executive briefing | `admin`, `executive` |
| Digital-twin simulation | `admin`, `executive`, `analyst`, `operator` |
| Voice query | `admin`, `executive`, `analyst`, `operator` |

A `viewer` is read-only and cannot call AI-generation or telemetry-write routes. All API aliases with and without the `/api` prefix use the same middleware.

## Distributed per-user limits

The Supabase rate-limit RPC applies rolling one-minute quotas per authenticated user:

| Operation | Limit |
|---|---:|
| Council deliberation | 8/minute |
| Executive briefing | 8/minute |
| Simulation | 5/minute |
| Voice query | 15/minute |
| Telemetry injection | 120/minute |
| Analytics event | 120/minute |

The counter table is RLS-protected. Users can only access their own counter rows; direct deletion is denied; update triggers prevent changing the counter identity or resetting its count before the window expires. The RPC uses invoker privileges. If the rate-limit service fails, the API refuses the protected operation instead of falling back to an in-memory limit.

Analytics event submission is no longer public. It requires a verified Supabase session and uses the distributed per-user quota. Guest Preview therefore does not submit analytics events; analytics remains non-essential and does not block the learning or command experience.

## Supabase migration history

The live project currently records these migrations:

- `20261107192045_quickfas_profiles_least_privilege`
- `20261107194716_quickfas_distributed_api_rate_limits`
- `20261107194735_quickfas_rate_limits_invoker_hardening`
- `20261107194802_quickfas_rate_limit_telemetry_bucket`
- `20261107195234_quickfas_authenticated_analytics_events`

The rate-limit migration files are tracked in this branch under `supabase/migrations/`. The initial rate-limit function is immediately hardened by the subsequent migration to an invoker function with caller-scoped RLS and a counter-enforcement trigger. The final live schema and grants were verified after application.

## Configuration and deployment

- The existing Supabase project `seventeen-pockets` is the backend. No new Supabase project was created and no existing user/business data was deleted or migrated.
- App-specific Vercel `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` variables were created for production, preview, and development. The publishable key is safe for browser use; no service-role key is exposed.
- The browser client also supports the existing `NEXT_PUBLIC_SUPABASE_*` variable names. Existing integration-managed variables were not overwritten.
- Supabase Auth provider enablement, Site URL, redirect allowlist, email confirmation behavior, and end-to-end signup/login/logout have not yet been verified with dedicated test users.
- The live Vercel project configuration was rechecked on 2026-11-10 and reports SSO, password, and trusted-IP protection disabled. Do not describe production as SSO-restricted until the dashboard configuration is changed and independently re-read. Vercel deployment protection is not a substitute for Supabase application authentication.
- Cleanup PR #6 is merged; `.github/workflows/okteto.yml` and `okteto.yml` are deleted from `main`, and the repository tree contains no Okteto paths.
- The last successful Vercel preview is READY at `https://quickfas-no9xdiuhs-quickfas.vercel.app` for code revision `86f8313ffe0b88d85bd98f38d1124493ea6077ca`. The later code head `fffe1cc278dd9b5a2d85bddba2c6b13841228a38` includes a small TypeScript enum compatibility correction; Vercel rate-limited its deployment (`retry in 24 hours`). The preview's current Vercel protection configuration must be verified before browser smoke testing.

## Remaining security work

1. Enable the approved Supabase Auth password-compromise protection and MFA factors, then run real integration tests with dedicated `viewer`, `analyst`, `operator`, `executive`, and `admin` accounts. Cover missing, malformed, expired, and revoked tokens; missing profiles; profile-query failures; self-role escalation attempts; and every route's expected 401/403/2xx behavior.
2. Verify that the new rate-limit RPC behaves correctly under authenticated concurrency and that a caller cannot reset or delete their own counter. The SQL grants, RLS, function security mode, trigger, and advisor findings have been inspected; an authenticated end-to-end exercise is still outstanding.
3. Complete a repository-wide audit of every API route, static chart/map, AI response schema, and future generated content. Primary dashboard, mission, map, telemetry, and investor-model displays now carry explicit illustrative/sample disclosures; keep all figures visibly labelled and never present them as live clinical, financial, regulatory, or operational results.
4. Complete logging review to confirm tokens, prompts, user content, and provider responses cannot leak through runtime logs.
5. Review whether the event-only analytics aggregate needs durable storage; it is currently process-local and should not be presented as a durable or cross-instance metric.
6. Complete a full Content Security Policy based on the actual Vite, Supabase, Gemini, asset, font, and media requirements. `X-Frame-Options: DENY` is now set at the Express layer; do not apply a stricter CSP without browser regression testing.
7. Complete secret scanning, dependency advisory review, lockfile consistency, and build provenance review.
8. Conduct input fuzzing, rate-limit concurrency tests, role-escalation tests, and an independent penetration test before public access.

## Accessibility work still required

The learning hub contains accessibility foundations such as labels, live status regions, button pressed states, keyboard focus styles, semantic sections, and native disclosure elements. These observations are not a complete audit.

Complete and record:
- Automated axe-core checks on the landing page, learning hub, and core Project Kingdom routes.
- Full keyboard-only walkthrough: logical focus order, no traps, visible focus, disclosure controls, filters, dialogs, and navigation.
- Screen-reader review with NVDA/Firefox and VoiceOver/Safari (or equivalent representative combinations).
- WCAG 2.2 AA checks for contrast, text resize/reflow, target size, focus not obscured, headings/landmarks, accessible names, error identification, status messages, and reduced motion.
- Mobile viewport testing at narrow widths and zoom/reflow testing at 200% and 400%.
- Verify that read-aloud status and cancellation are announced without relying on color or animation.
- Check every Project Kingdom workflow for regressions; do not limit the audit to Stratum.

No WCAG 2.2 AA conformance claim should be made until manual and automated evidence is recorded and all critical issues are resolved.

## Release gates

| Gate | Current evidence / status |
|---|---|
| Existing Project Kingdom features retained | Code remains in the same application; regression walkthrough pending |
| Supabase profile table, RLS, own-profile policy | Verified live |
| New-user least-privileged role | Migration and trigger verified live |
| API role guards and bounded AI request schemas | Implemented on PR branch; fresh CI required |
| Distributed per-user AI and telemetry quotas | Implemented and live; SQL privilege/RLS/advisor checks verified; authenticated concurrency test pending |
| Analytics event access and quota | Authenticated-only with distributed per-user quota; live schema and advisor checks verified |
| Supabase security advisor | Two Auth warnings remain: leaked-password protection disabled and insufficient MFA options |
| Auth provider, Site URL, redirects, real role-account tests | Pending |
| TypeScript, tests, production build, CodeQL | Previous branch head passed; rerun after latest changes |
| Vercel production protection | Live project API reports SSO/password/trusted-IP protection disabled; access policy decision and re-verification required |
| Complete CSP and runtime validation | Pending |
| Synthetic-content and clinical telemetry boundary | Clinical/FHIR event ingestion disabled; all telemetry requires explicit synthetic_demo marker; key dashboards and investor model carry illustrative disclosures; final visual review pending |
| Automated accessibility scan | Pending |
| Keyboard and screen-reader review | Pending |
| WCAG 2.2 AA assessment | Pending |
| Clinical source/reviewer sign-off | Pending |
| Browser/mobile smoke tests | Pending |
| Independent security assessment | Pending |
| Public access approval | Blocked; keep Vercel SSO enabled |

## Operating decision

Keep public release approval blocked until the intended Vercel access policy is selected, applied, and verified. Do not connect EHR/patient data or claim public launch readiness until the outstanding gates have evidence and explicit approval. The application may be prepared for a controlled, authenticated test deployment once the latest code checks and Vercel preview are confirmed; unrestricted production remains blocked.
