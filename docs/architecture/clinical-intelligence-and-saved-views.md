# Stratum Clinical Edge — Clinical Intelligence, Trials & Collaboration Architecture

**Product:** Stratum Clinical Edge, powered by Project Kingdom  
**Status:** Target architecture and implementation specification — not a claim of completed functionality  
**Repository:** `paced77/quickfas`  
**Runtime decision:** Preserve the existing React 19 + Vite + TypeScript frontend, Express API, Supabase project, PostgreSQL database, and Vercel deployment. Do not introduce a parallel Next.js application or duplicate identity system.

## 1. Purpose and architectural fit

This document extends the unified product architecture with the clinical intelligence, clinical-trial exploration, saved-view collaboration, folder organization, and fine-grained authorization requirements.

The existing application remains the single product and deployable unit:

- **Stratum Clinical Edge** provides the healthcare education and, after the required reviews, clinical intelligence experience.
- **Project Kingdom** provides the shared intelligence, operations, governance, and decision-support foundation.
- Both experiences share the existing application shell, Supabase Auth tenant, API runtime, CI, and deployment pipeline.
- Domain data, authorization boundaries, and audit responsibilities remain separate even when infrastructure is shared.

The source proposal names Next.js App Router. That framework-specific folder structure is not adopted because the verified repository is React/Vite with Express. Translate the intended behavior as follows:

| Proposed Next.js pattern | Existing-stack implementation |
|---|---|
| App Router pages and layouts | Existing React router/navigation and shared application shell |
| Server Components / SSR data access | Express API endpoints; server-side Supabase queries; client-side route loaders |
| `loading.tsx` / `error.tsx` | Existing React loading, error-boundary, and route states |
| Server Actions | Authenticated Express routes and validated service functions |
| TypeScript + Tailwind | Retain existing TypeScript and Tailwind setup |
| Supabase PostgreSQL | Retain the connected Supabase project and existing migrations |

Do not add Next.js, duplicate frontend builds, or another server merely to reproduce the example tree.

## 2. Product modules

The target clinical workspace includes:

1. Executive Clinical Dashboard
2. Clinical Trials Explorer
3. Protocol Search
4. Patient Dossiers
5. FHIR Hub
6. Clinical Analytics
7. Saved Views
8. Team Collaboration
9. Folder Organization
10. Role-Based Access Control

The existing Project Kingdom dashboard, missions, AI council, analytics, map, automations, reports, strategy, governance, and voice capabilities remain in place.

### Executive dashboard

Target indicators:

- Clinical Edge Score
- Availability
- Pocket Readiness
- Security Score
- System Health
- Pocket Matrix
- AI Insights

Every metric must have a defined source, calculation, freshness timestamp, owner, and data classification. Until connected to validated sources, display clearly labeled illustrative or unavailable states. Never fabricate clinical performance, system availability, security posture, or patient outcomes.

### Twenty-Pocket architecture

The existing Project Kingdom Pocket concept is extended as a clinical workspace view, not as a second infrastructure platform:

1. Nexus
2. Intelligence
3. Data
4. Sync
5. API
6. Compute
7. Storage
8. Pipeline
9. Monitor
10. Alert
11. Analytics
12. Documentation
13. Circuits
14. Bridges
15. Sparse
16. Interpretability
17. Security
18. Backup
19. Optimize
20. Scale

Each Pocket should eventually expose its purpose, owner, operational state, dependencies, data classification, last verification, and relevant alerts. A displayed status is not a verified health check unless it comes from a real monitored source.

## 3. Clinical Trials Explorer

### Required behavior

- Server-side querying through authenticated Express endpoints.
- URL-backed filters so views can be bookmarked and shared.
- Pagination and stable sorting.
- Filter persistence and clear/reset behavior.
- Search with debounce and keyboard accessibility.
- Personal and team saved views.
- CSV export with authorization checks.
- Explicit empty, loading, error, and stale-data states.

Initial filter contract:

- `search`
- `phase`
- `status`
- `sponsor`
- `sort`
- `page`

Example route/query:

```text
/dashboard/trials?page=2&phase=III&status=Recruiting&search=oncology&sort=enrollment:desc
```

The route is illustrative; implement it using the repository's existing router conventions.

### Search interaction

- `/` focuses the trial search when the user is not typing in an editable control.
- `Ctrl+K` and `Cmd+K` focus search.
- `Esc` clears the search when focus and context make that behavior safe.
- Provide a visible clear-search control and a clear-all-filters action.
- Debounce network requests and cancel stale requests.
- Keep filter state in the URL; do not put sensitive patient information or private query content in URLs.

### CSV export

Use proper CSV quoting and a UTF-8 BOM when an Excel-compatible export is required. Escape commas, quotes, CRLF/newlines, Unicode, and empty/null values. Export only the rows and columns the requesting user is authorized to see. Apply the same server-side filters and authorization rules as the table. Do not treat client-side hiding as access control.

Reference escaping helper:

```ts
export function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return '""';
  return `"${String(value).replace(/"/g, '""')}"`;
}
```

The helper is a quoting primitive, not a complete export implementation. Add delimiter/line-ending handling, spreadsheet-formula-injection mitigation for untrusted text cells, and round-trip tests before release.

## 4. Saved Views and folders

### Saved view model

The proposed logical model is:

```ts
type SavedTrialView = {
  id: string;
  name: string;
  filters: Record<string, string>;
  owner_user_id: string;
  visibility: "private" | "team";
  team_id?: string;
  folder_id?: string;
  is_favorite: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};
```

Supported operations:

- Create, rename, duplicate, and delete.
- Favorite/unfavorite.
- Set or clear a default view.
- Share privately or with an authorized team.
- Move a view between accessible folders.
- List views the caller can access.

A user may have only one default view per agreed scope (for example, per user and workspace). Enforce this in the database with a unique partial index or a transactional invariant, not only in the UI. Define whether a team-shared default is allowed before implementation.

### Folder organization

Example logical hierarchy:

```text
Oncology
  Phase III
  Recruiting

Cardiology
  Active Trials
  Device Trials

Clinical Operations
  Weekly Review
```

Folders support parent/child organization, private or team visibility, and explicit ownership. Define maximum depth, cycle prevention, deletion behavior, and what happens to contained views before enabling nested folders.

### Core data model

Proposed entities:

- `teams`: team identity and metadata.
- `team_members`: team/user membership and team-level role.
- `trial_view_folders`: owner, visibility, optional team, parent folder.
- `saved_trial_views`: filters, owner, visibility, team/folder references, favorite/default flags.
- `saved_view_permissions`: explicit user/team grants for a view.

Use UUID primary keys, foreign keys, NOT NULL constraints where appropriate, timestamp defaults, indexes for ownership/team/folder lookups, and CHECK/enum constraints for visibility and roles. Add uniqueness constraints for duplicate membership and duplicate grants. Add `updated_at` maintenance triggers where needed.

The SQL in the original proposal is a logical outline, not a ready-to-apply migration. It omits important foreign keys, nullability, uniqueness, indexes, RLS policies, and concurrency protections. Generate ordered migrations only after inspecting the live schema and current branch migrations.

## 5. Authorization: separate global roles from view permissions

There are two independent authorization scopes.

### Platform-wide authorization

Continue using the existing Supabase Auth identity and the existing `public.profiles` role model. Current application roles include `admin`, `executive`, `operator`, `analyst`, and `viewer`. Do not silently replace or rename them.

Platform roles govern access to Project Kingdom capabilities and administrative functions. They do not automatically grant access to every private clinical view or future patient record.

### Per-view authorization

The proposed view roles are:

- `owner`
- `admin`
- `editor`
- `viewer`
- `none`

Resolution rank:

| Role | Rank | Meaning |
|---|---:|---|
| owner | 40 | Resource owner; ownership cannot be reassigned through normal view editing |
| admin | 30 | Manage view and its grants |
| editor | 20 | Read and modify view configuration |
| viewer | 10 | Read view |
| none | 0 | No access |

When multiple applicable grants exist, use the highest valid effective permission. Team membership alone must not imply view access unless the view/folder is explicitly shared with that team. An explicit denial/blocked membership policy, if introduced, must be defined separately rather than assumed to be represented by rank zero.

Recommended helper responsibilities:

- `app_auth.role_rank(role)`
- `app_auth.highest_view_role(view_id, user_id)`
- `app_auth.can_view(view_id, user_id)`
- `app_auth.can_edit(view_id, user_id)`
- `app_auth.can_admin(view_id, user_id)`
- `app_auth.can_access_folder(folder_id, user_id)`

Use one authoritative permission-resolution implementation and test it against every access path. Do not duplicate slightly different authorization logic in React, Express, and SQL.

### Important Supabase/PostgreSQL hardening

The supplied design proposes SECURITY DEFINER helpers. These functions bypass ordinary caller privileges and may bypass RLS depending on the function owner. They are privileged code, not a default convenience.

Prefer SECURITY INVOKER where it can safely satisfy the policy. If a SECURITY DEFINER function is demonstrably necessary:

- Put it in a non-exposed schema such as `app_auth`, not an API-exposed schema.
- Use a narrowly privileged owner; do not casually use a BYPASSRLS owner.
- Set a fixed, minimal search_path and schema-qualify referenced objects.
- Validate the caller identity and every supplied resource identifier inside the function.
- Revoke default EXECUTE from PUBLIC, anon, and authenticated as appropriate.
- Grant EXECUTE only on individually reviewed function signatures.
- Never grant execute on all functions in a schema.
- Run Supabase security advisors and test as anon, authenticated, and each role class.

Never use user-editable signup metadata for authorization. Do not rely on `TO authenticated` alone: every policy also needs resource ownership or a validated grant. UPDATE policies need both USING and WITH CHECK so a caller cannot transfer ownership or change protected references.

## 6. RLS policy intent

Enable RLS on every exposed table. Define policies for SELECT, INSERT, UPDATE, and DELETE separately for:

- Teams and team membership.
- Folders.
- Saved views.
- Per-view permissions.

Policy intent:

- A view owner can read and manage their own view, subject to immutable ownership.
- An authorized viewer can read the view.
- An editor can update allowed view fields but cannot grant permissions or transfer ownership.
- An admin can manage view permissions, subject to the last-admin invariant.
- A user outside the owner/team/grant boundary cannot read, change, or delete the resource.
- Folder access checks must account for visibility, owner, team membership, parent hierarchy, and folder-specific policy.
- Permission-table writes must be restricted to authorized admins and must not permit self-promotion.

Do not implement folder access as “any team member can access every folder” unless the folder is explicitly team-visible. Avoid recursive RLS policy chains. Use a tested, bounded helper or a carefully designed closure/path model for nested folders.

Every policy must be tested through the Supabase Data API with realistic JWT claims. SQL-owner tests alone do not prove RLS behavior.

## 7. Ownership immutability and last-admin invariant

### Ownership immutability

The view and folder owner columns are immutable through normal application operations. Protect them with database constraints/triggers and update policies. Ownership transfer, if ever required, must be a distinct audited administrative workflow, not an ordinary UPDATE.

### Last-admin protection

Every shared view must retain at least one effective administrator. Prevent:

- Deleting the final admin grant.
- Demoting the final admin.
- Bulk operations that remove all admins.
- Concurrent transactions that independently remove different admins and leave none.

A deferred constraint trigger can validate the final state at transaction commit, but the implementation must also serialize competing changes for the same view (for example, by locking the parent view row in a consistent order). A deferred check without concurrency control can still race. Add two-connection integration tests that attempt simultaneous demotions/deletions and verify at least one admin remains after both transactions complete.

Clarify whether the owner always counts as an admin. Recommended: the immutable owner is always an effective admin, so the invariant is based on effective authorization rather than a duplicated permission row. If the product requires an explicit admin grant independent of owner, encode and test that rule instead.

## 8. Clinical data, FHIR R4, and patient dossier safeguards

FHIR R4 is a target interoperability standard, not a currently connected data source. The current application must not imply it is connected to an EHR or receiving live patient records.

Before implementing FHIR or patient dossier storage:

1. Define the intended use, data controller/processor responsibilities, legal basis, and required agreements.
2. Complete a threat model, privacy impact assessment, retention/deletion design, breach response plan, and independent security review.
3. Determine whether HIPAA applies and obtain appropriate compliance/legal review; do not claim HIPAA compliance from technical controls alone.
4. Establish a verified identity-matching and authorization model, minimum-necessary access, break-glass policy if justified, and immutable audit requirements.
5. Use synthetic fixtures only in development and demos. Never use real PHI in tests, analytics, screenshots, support tickets, or logs.
6. Design FHIR resource validation, provenance, terminology/version handling, consent, audit, and safe failure behavior before connecting any external system.

Patient Dossiers must remain disabled or synthetic-only until these gates are approved. Do not create a patient table or accept PHI as part of this architecture-document update.

## 9. Migration and rollout strategy

Use staged, additive migrations:

1. Inspect current schema, migration history, foreign keys, policies, grants, and existing role usage.
2. Add new ownership columns/tables without dropping existing fields.
3. Backfill only from verified source columns; record row counts and unresolved rows.
4. Deploy application code that can safely read/write the transitional representation.
5. Switch reads only after backfill validation and test coverage.
6. Enforce NOT NULL, foreign keys, and constraints after validation.
7. Remove obsolete fields only in a separately reviewed migration after rollback windows and backups are confirmed.

The original proposal's generic `user_id` to `owner_user_id` sequence is illustrative. Do not assume such a legacy column exists; inspect the actual table before writing migrations. Every migration needs preflight checks, transactional safety where possible, postflight assertions, and a documented recovery plan. Do not run a production migration as part of this documentation change.

## 10. Testing strategy

### Database/RLS tests

Use pgTAP or the repository's established database test harness to cover:

- Owner read/update/delete.
- Admin read/update/delete and grant management.
- Editor read/update but not delete or grant management.
- Viewer read-only access.
- Outsider denied access.
- Team-visible and private folder access.
- Nested-folder boundary behavior.
- Permission escalation and self-promotion denial.
- Ownership immutability.
- Last-admin protection.
- Unknown/invalid enum values rejected.
- Default-view uniqueness and folder-cycle prevention.

Use synthetic fixture identities only. Test through authenticated roles and actual RLS, not just as the database owner.

### Concurrency tests

pgTAP is useful for policy and transaction assertions but does not by itself prove independent concurrent transaction behavior. Add TypeScript integration tests using two independent database connections for competing final-admin removal attempts. Assert that every committed view retains at least one effective admin.

### CI

Add database security tests to the existing GitHub Actions workflow only after validating its current service setup and Supabase CLI version. A target job should start an isolated local Supabase stack, reset from migrations, execute RLS tests, run the TypeScript concurrency suite, and stop the stack even on failure.

Do not copy a workflow that assumes `supabase/setup-cli@v1` or system pgTAP availability without verifying the current CLI, PostgreSQL image, and extension setup. Pin actions and dependencies to reviewed versions.

Release gates also include existing application tests, TypeScript validation, production build, CodeQL/secret scanning, API authorization tests, privacy tests, accessibility checks, and review of deployment protection.

## 11. Delivery sequence

### Stage A — Architecture and schema inventory
- Record current profiles, roles, policies, migrations, routes, and API patterns.
- Decide workspace/team boundaries and the semantics of owner, team admin, and per-view admin.
- Confirm the existing app router and Express endpoint conventions.

### Stage B — Trial explorer foundation
- Implement trial catalogue contracts and server-side filtering using a validated, approved data source.
- Add pagination, URL filters, loading/error states, and CSV export.
- Keep trial records distinct from patient records.

### Stage C — Saved views and folders
- Add saved-view and folder migrations with RLS and indexes.
- Implement private views first, then team sharing.
- Add favorites, default views, duplicate, rename, and delete.
- Complete the permission helper and last-admin concurrency protections before exposing admin controls.

### Stage D — Clinical workspace modules
- Add protocol search and clinical analytics only with documented, validated sources.
- Build FHIR Hub behind a disabled integration boundary until an approved FHIR endpoint and security review exist.
- Keep Patient Dossiers synthetic-only until PHI governance and compliance gates are satisfied.

### Stage E — Executive dashboard and Pocket Matrix
- Connect indicators only to verified services and documented calculations.
- Show unknown/unavailable states rather than inventing values.
- Provide freshness and source provenance for every indicator.

### Stage F — Release review
- Complete RLS, concurrency, privacy, accessibility, source-provenance, backup/restore, and security testing.
- Obtain qualified clinical-content review.
- Keep production access restricted until release owners sign off.

## 12. Acceptance criteria

This architecture is accepted as implemented only when:

- The new modules are integrated into the existing application, not a second app.
- Existing Project Kingdom modules and Supabase identities remain intact.
- Clinical trials use a documented source and enforce server-side access.
- Saved views, folders, team membership, and permissions have complete constraints and RLS.
- Permission resolution is consistent across SQL and API boundaries.
- Owner immutability and last-admin concurrency tests pass.
- CSV export is authorized, safe, and round-trip tested.
- FHIR and patient dossier features remain disabled until their separate clinical, privacy, and security gates are approved.
- CI proves the relevant tests and production build on the exact proposed commit.
- Documentation accurately distinguishes implemented code from future architecture.

**Current status:** This document defines the target architecture and staged implementation plan. It does not create database tables, migrations, clinical APIs, FHIR connectivity, patient dossiers, or live dashboard metrics. Those are separate engineering changes requiring schema inspection, implementation, tests, and review.
