# Supabase authentication setup

Quickfas (including the Project Kingdom workspace and Stratum Clinical Edge learning experience) uses the existing Supabase project **seventeen-pockets**.

- Project ref: `babdeawtwaoorsmdnxip`
- API URL: `https://babdeawtwaoorsmdnxip.supabase.co`
- Region: `us-east-1`

## QuickFas sign-in method

QuickFas presents Google OAuth as its only sign-in and account-creation option. The application does not display email/password registration or password sign-in. This is an app-level UI choice: it does not disable the Email provider at the shared Supabase project level, because other applications may use the same Supabase Auth tenant.

Configure Google once in Supabase Authentication → Providers → Google using the OAuth Client ID and Client Secret from the Google Cloud OAuth client. Do not put the client secret in Vercel, source control, or browser environment variables.

Set the Supabase Site URL to the production QuickFas origin and add each approved production/preview callback origin to Authentication → URL Configuration → Redirect URLs. In Google Cloud Console, add the Supabase callback URL shown in the Supabase Google provider settings as an authorized redirect URI. The app requests a post-login redirect to the current application origin.

Google OAuth must be enabled and its client credentials valid before the button can complete sign-in. Existing Supabase Auth users and profile rows are not deleted or changed by this UI update. Users must sign in with a Google identity that Supabase can associate with their existing account; do not create a second account if identity linking is not automatic.

## Vercel environment variables

The Quickfas Vercel project uses app-specific variables for production, preview, and development:

- `VITE_SUPABASE_URL`: the project URL above
- `VITE_SUPABASE_PUBLISHABLE_KEY`: the active Supabase publishable key

Only a Supabase publishable key belongs in browser-visible `VITE_` variables. Never use a Supabase secret or service-role key there or commit secrets to Git.

## Database schema and access

The least-privilege profiles migration creates `public.profiles`, enables RLS, allows authenticated users to read only their own profile, and creates a profile for each new Auth user with the least-privileged `viewer` role. Existing profile roles are not modified by the Google sign-in UI change. No account is automatically granted an elevated role.

Promote trusted operators only through a controlled administrative process. Never grant admin based on user-editable `user_metadata` or an email supplied at signup.

All router-mounted application APIs require a verified Supabase access token. Role checks and distributed rate limits remain server-side. The Google-only UI does not change API authorization, RLS, database schema, Vercel deployment protection, or other applications sharing this Supabase project.

## Release verification

1. Verify the Google provider is enabled and its OAuth Client ID/Secret are configured in Supabase.
2. Verify the Supabase callback URL in Google Cloud Console and approved application origins in Supabase URL Configuration.
3. Test Google sign-in, returning-user sign-in, logout, expired sessions, and denied/cancelled OAuth.
4. Test dedicated viewer, analyst, operator, executive, and admin accounts against the existing API role matrix.
5. Confirm direct API requests without a bearer token are rejected and that role restrictions remain enforced.
6. Confirm Vercel production and preview deployment protection remains enabled.

Do not disable Email/Password at the shared Supabase project level as part of this QuickFas-only UI change. A project-wide provider change could affect other applications using the same Auth tenant.
