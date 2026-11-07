# Supabase authentication setup

## Vercel environment variables

Set these in the Vercel project for the environments you intend to use:

- `VITE_SUPABASE_URL`: `https://babdeawtwaoorsmdnxip.supabase.co`
- `VITE_SUPABASE_PUBLISHABLE_KEY`: the active publishable key from Supabase Project Settings → API Keys
- `SUPABASE_URL`: same project URL (server-side)
- `SUPABASE_PUBLISHABLE_KEY`: same publishable key (server-side)
- `GEMINI_API_KEY`: existing server-side Gemini key, if AI endpoints are enabled

The `VITE_` values are bundled into the browser. Only a Supabase publishable key belongs there. Never use a Supabase secret or service-role key in a `VITE_` variable or commit any secret to Git.

## Database setup

Review and run [schema.sql](./schema.sql) in the Supabase SQL Editor. It creates a profile row for each new account, defaults every new account to the least-privileged `viewer` role, and permits users to read only their own profile. It does not automatically grant anyone admin privileges.

After verifying the first trusted operator's Auth user UUID, promote that account manually in the SQL Editor using the commented example at the end of `schema.sql`.

## Auth settings

- Enable Email / Password in Supabase Authentication → Providers.
- Set the Site URL to the deployed Vercel origin.
- Add the Vercel production and preview origins to the allowed redirect URLs.
- Decide whether email confirmation is required. If enabled, configure the confirmation email redirect to return users to the application origin.

## Deploy and verify

1. Install dependencies and build the project.
2. Configure environment variables in Vercel.
3. Apply the reviewed database schema.
4. Deploy only after reviewing and approving the pull request.
5. Test signup, email confirmation (if enabled), login, logout, expired sessions, and direct API requests without a bearer token.
6. Verify telemetry injection is rejected for `viewer` and `analyst` accounts and allowed only for `admin` and `operator`.

The application API routes other than `/api/health` require a verified Supabase access token. The telemetry write route additionally checks the server-loaded profile role. The Gemini key remains server-side.
