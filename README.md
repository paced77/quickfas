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
