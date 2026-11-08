# Stratum Clinical Edge + Project Kingdom

**Clear Health Insights for Every Generation**

This repository contains one integrated platform, not two copied applications:

- **Stratum Clinical Edge** is the healthcare-education experience.
- **Project Kingdom** remains the intelligence, operations, governance, and decision-support engine.

The existing Project Kingdom application, modules, navigation, and Supabase identity foundation are retained and extended in place. There is one application codebase, one API runtime, one Supabase identity system, and one deployment pipeline.

## Current implementation

The existing application includes the Project Kingdom dashboard, mission, AI council, analytics, map, automation, reports, strategy, governance, and voice modules.

The integrated Stratum learning hub currently provides:
- Ten searchable, category-filtered introductory health-literacy topics.
- Session-only saved-topic and reading-progress state.
- Browser-native read-aloud controls with cancellation and bounded retry states.
- An education-not-diagnosis boundary and a plain-language data-handling disclosure.
- Consent-gated, allow-listed analytics events with event names only.
- A Governance workspace storage audit that reports registered key names and presence, not stored values.

The platform also includes versioned analytics-consent handling, cross-tab consent synchronization, telemetry input validation, baseline API security headers, request-body size limits, and automated privacy/contract tests.

**These safeguards are a foundation, not proof of production readiness.** Analytics aggregates and telemetry history are process-local, not durable audit records. The current product does not have an EHR connection and must not receive real patient data. Clinical-looking operational scenarios and AI fallback content are synthetic examples, not real clinical, financial, or operational measurements.

## Architecture and roadmap

- [Unified architecture and phased roadmap](docs/stratum-clinical-edge-integration.md)
- [Clinical intelligence, trials, saved views, folders, and authorization architecture](docs/architecture/clinical-intelligence-and-saved-views.md)
- [Security and accessibility review status](docs/audits/security-accessibility-review.md)

The clinical intelligence document is a target architecture, not a statement that trials, patient dossiers, FHIR connectivity, team permissions, or the proposed database schema are already implemented.

## Release status

The current production deployment is intentionally restricted by Vercel SSO while security, privacy, clinical-content, and accessibility reviews continue. Do not disable SSO or expose the deployment publicly until the release gates are signed off.

The latest recorded quality workflow passed tests, TypeScript validation, and a production build. That does not replace browser-level smoke tests, a manual keyboard/screen-reader review, WCAG 2.2 AA evaluation, security testing, or clinical-content review.

## Development

Install dependencies and use the scripts in `package.json`:

- `npm run dev` — development server
- `npm test` — automated privacy and contract tests
- `npm run lint` — TypeScript validation
- `npm run build` — production frontend build

Configure deployment environment variables securely. Never commit credentials, API keys, service-role keys, access tokens, patient data, or secrets. Browser-exposed `VITE_*` variables must contain publishable values only.

## Authentication configuration

The browser client accepts either `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` or the existing Vercel integration names `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Only these public-prefixed variables are exposed to the browser. The Express API uses server-side `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`.

The profile/role schema in `supabase/schema.sql` must be applied to the confirmed Supabase project through a reviewed migration before persistent role-based sign-in can be considered verified. Do not rely on guest preview as authenticated access.

## Safety and privacy

- Use synthetic fixtures only in demos and tests.
- Never place real patient data, protected health information, credentials, or secrets in sample data, logs, analytics, or screenshots.
- Do not use illustrative scenarios for clinical, financial, regulatory, or operational decisions.
- Preserve the existing Project Kingdom application and authentication system; changes must be additive, reviewed, and tested.
- Production access remains restricted until the documented release gates are complete.
