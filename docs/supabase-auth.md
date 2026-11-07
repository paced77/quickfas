# Supabase authentication setup

Quickfas (including the Project Kingdom workspace and Stratum Clinical Edge learning experience) uses the existing Supabase project **seventeen-pockets** in the Simplemn organization.

- Project ref: `babdeawtwaoorsmdnxip`
- API URL: `https://babdeawtwaoorsmdnxip.supabase.co`
- Region: `us-east-1`

## Vercel environment variables

The Quickfas Vercel project has the following app-specific variables configured for production, preview, and development:

- `VITE_SUPABASE_URL`: the project URL above
- `VITE_SUPABASE_PUBLISHABLE_KEY`: the active Supabase publishable key

The `VITE_` values are bundled into the browser. Only a Supabase publishable key belongs there. Never use a Supabase secret or service-role key in a `VITE_` variable or commit any secret to Git. Existing integration-managed Vercel variables were left untouched.

## Database schema

The migration [20261107192045_quickfas_profiles_least_privilege.sql](../supabase/migrations/20261107192045_quickfas_profiles_least_privilege.sql) has been applied to the target project.

It creates `public.profiles`, enables RLS, allows authenticated users to read only their own profile, and creates a profile for each new Auth user with the least-privileged `viewer` role. Anonymous users have no table SELECT grant. No account is automatically granted an elevated role.

The migration was verified in Supabase: the table and profile-creation trigger exist, the own-profile policy exists, RLS is enabled, authenticated SELECT is granted, and anon SELECT is not granted. Security and performance advisors returned no findings.

After verifying the first trusted operator's Auth user UUID, promote that account manually using a controlled SQL session. Never grant admin based on user-editable `user_metadata` or an email supplied at signup.

## Auth settings still to verify

- Enable Email / Password in Supabase Authentication → Providers if that is the selected sign-in method.
- Set the Site URL to the deployed Vercel origin.
- Add the Vercel production and preview origins to allowed redirect URLs.
- Decide whether email confirmation is required. If enabled, configure the confirmation email redirect to return users to the application origin.

## Release verification

1. Confirm the Vercel variables are available to the target deployment.
2. Review and approve the security/accessibility pull request before deploying.
3. Test signup, email confirmation (if enabled), login, logout, expired sessions, and direct API requests without a bearer token.
4. Run end-to-end tests with dedicated `viewer`, `analyst`, `operator`, `executive`, and `admin` accounts.
5. Verify telemetry injection is rejected for `viewer` and `analyst` accounts and allowed only for `admin` and `operator`.

All router-mounted application APIs require a verified Supabase access token. The public exceptions are `GET /health` and the two aliases for `POST /analytics/event`; analytics accepts only a strict allow-listed event name and stores aggregate counts, with no user ID or event properties. Its current throttle is process-local and is not a distributed edge rate limiter.

The API role matrix is:
- `admin`, `executive`, `analyst`: council deliberation.
- `admin`, `executive`: executive briefing.
- `admin`, `executive`, `analyst`, `operator`: simulation and voice query.
- `admin`, `operator`: telemetry injection.
- `viewer`: authenticated read-only telemetry access; no AI-generation or telemetry-write capability.

AI and telemetry-write routes validate strict bounded request schemas and consume a Supabase-backed per-user rolling one-minute quota. Limits are 8 council calls, 8 briefings, 5 simulations, 15 voice queries, and 120 telemetry injections per user per minute. If the database rate-limit check is unavailable, these operations fail closed with HTTP 503. The rate-limit table is RLS-protected, caller-scoped, has no delete privilege, and a trigger prevents callers from resetting or rewriting their own counter. The RPC function is SECURITY INVOKER; the Supabase security advisor currently reports no findings.

The health endpoint returns only `{ status: "ok" }`. The Gemini key remains server-side. These code and database controls still require authenticated end-to-end tests against dedicated role accounts before public launch.
