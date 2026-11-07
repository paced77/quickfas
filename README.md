# Stratum Clinical Edge, powered by Project Kingdom

**Clear Health Insights for Every Generation**  
Founder: O'Dell Anderson

This repository contains one integrated platform, not two copied applications:

- **Stratum Clinical Edge** is the healthcare education product experience.
- **Project Kingdom** is the intelligence, operations, governance, and decision-support engine that powers the shared platform.

The existing Project Kingdom application is retained and extended in place. The product uses one application codebase, one API runtime, one Supabase identity system, and one deployment pipeline. Healthcare education data and operational intelligence remain separate domains with explicit access controls.

## Architecture and delivery plan

See [the unified architecture, verified repository baseline, privacy/security requirements, and phased launch roadmap](docs/stratum-clinical-edge-integration.md).

## Current implementation status

The existing application includes Project Kingdom dashboard, mission, AI council, analytics, map, automation, reports, strategy, governance, and voice modules. The repository also contains a Supabase profile/role schema and API-side bearer-token verification.

An initial Stratum Clinical Edge learning hub is now integrated into the existing landing page, with four expandable health-literacy topics and clear educational boundaries. The broader consent-governed analytics, referral, storage audit, accessibility validation, migration, and reliability requirements remain staged work until implemented and verified by tests. Do not treat this README or the architecture document as evidence that those features are already live.

## Development

Install dependencies and use the scripts in `package.json`:

- `npm run dev` — development server
- `npm run lint` — TypeScript check
- `npm run build` — production frontend build

Configure the required environment variables in your deployment environment. Never commit credentials, API keys, service-role keys, access tokens, or production data.

## Safety and privacy

Use synthetic fixtures only in demos and tests. Never place real patient data, protected health information, credentials, or secrets in sample data, logs, analytics, or screenshots. Production deployment must be gated on the test, privacy, security, accessibility, and migration checks described in the architecture plan.

## Privacy, analytics, and telemetry safeguards

The current branch includes a versioned local analytics-consent preference with cross-tab synchronization, an accessible consent control, an allow-listed event contract, and authenticated analytics intake that accepts event names only. Event totals are aggregate and process-local; they reset when the API process restarts. No route, topic title, account identifier, age band, health information, form content, or credentials are sent in analytics events.

Synthetic telemetry is disabled by default. To intentionally enable the legacy illustrative stream in a non-production demonstration environment, set `KINGDOM_DEMO_TELEMETRY=true`. The interface identifies this mode as synthetic. Without that setting, the telemetry feed waits for authenticated event ingestion and reports that the current in-memory feed is not a durable audit log.

The API now applies baseline security headers, disables Express's `X-Powered-By` header, and limits JSON request bodies. These controls are a foundation, not a substitute for a full security review, durable audit storage, deployment configuration review, or penetration testing.

Run `npm test` for the privacy and analytics contract tests, `npm run lint` for TypeScript checking, and `npm run build` for the production frontend build. These commands must pass in CI before the pull request is considered release-ready.

The Stratum learning hub now provides a searchable, category-filtered set of ten plain-language topics. Visitors can save topics and mark them read for the current browser session; only generic allow-listed event names are eligible for analytics. The existing Governance workspace also includes a local-storage audit with JSON and RFC4180 CSV export. It reports registered key names and presence only, never stored values.
