# Security, privacy, and accessibility review

**Repository:** `paced77/quickfas`  
**Review baseline:** `main`, integration commit `6ead302899ea69761668937b40833f20653918d8`  
**Review date:** 2026-11-07  
**Status:** In progress — production remains SSO-restricted.

This is an evidence-based engineering review, not a penetration-test report, compliance certification, clinical validation, or WCAG conformance statement.

## Controls verified

- Existing Supabase Auth bearer-token verification and profile-role lookup are retained. No second identity system was introduced.
- `public.profiles` has row-level security enabled, with a self-read policy; signup profile creation assigns the least-privileged `viewer` role.
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

## Security work still required

1. **API route and authorization review:** enumerate every route and verify method, authentication, role/capability, schema validation, and rate limits. In particular, add explicit input schemas and per-user/IP abuse controls for AI generation and other expensive routes.
2. **Health endpoint disclosure:** review the unauthenticated health response and reduce operational metadata to the minimum required for uptime checks.
3. **CSP hardening:** the current Content-Security-Policy only sets `frame-ancestors 'none'`. Define and test a complete policy (including script, style, connect, image, font, and object sources) against the actual Vite/Gemini/Supabase runtime before enforcing it.
4. **Logging:** inspect error paths for possible token, prompt, user-content, or provider-response leakage. Keep request bodies and authorization headers out of logs.
5. **Synthetic content:** remove or unmistakably label fabricated clinical trial, named institution, FHIR, revenue, and financial-allocation assertions in dashboard/AI fallback content. The persistent illustrative-workspace warning is helpful but does not make fabricated specifics safe for all readers.
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
| Existing Project Kingdom features and auth retained | Verified by source inspection; regression walkthrough pending |
| Core unit/privacy/typecheck/build workflow | Passed on prior integration PR; rerun required for subsequent code changes |
| Supabase security advisor | <span>Clear after privilege remediation</span> |
| Supabase privilege change captured as migration | Pending |
| API route threat review and abuse controls | Pending |
| CSP and production header validation | Pending |
| Synthetic-content cleanup/review | Pending |
| Automated accessibility scan | Pending |
| Keyboard and screen-reader review | Pending |
| WCAG 2.2 AA assessment | Pending |
| Clinical source/reviewer sign-off | Pending |
| Browser/mobile smoke tests | Pending |
| Independent security assessment | Pending |
| Public access approval | Blocked; keep Vercel SSO enabled |

## Operating decision

Keep the existing production deployment restricted. Do not disable Vercel SSO, change identity configuration, connect EHR/patient data, or claim public launch readiness until the outstanding gates have evidence and explicit approval.
