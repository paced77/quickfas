# QuickFAS Access Approval Monitor

A standalone, additive Cloud Run service for monitoring Google Cloud Access Approval settings. It does not replace QuickFAS's existing Supabase sign-in or frontend runtime. The service is protected by Cloud Run IAM; do not deploy it with unauthenticated access.

## Runtime model

- Cloud Scheduler invokes `POST /internal/check` on a schedule (recommended: every minute).
- The service reads `projects/{GCP_PROJECT_ID}/accessApprovalSettings` using its attached Cloud Run service account and Application Default Credentials.
- A canonical JSON hash detects configuration changes.
- Each observation is written to a private Cloud Storage bucket and Cloud Logging.
- Slack and SMTP email notifications are optional and are sent only when a change is detected.
- The dashboard and JSON endpoints are served by the same IAM-protected Cloud Run service.

This uses scheduled checks rather than a permanent in-process polling loop. Cloud Run instances can scale to zero or restart, so a process-local infinite loop is not a reliable scheduler. Cloud Storage is the durable source for snapshots; local filesystem logs are intentionally not used.

## Required Google Cloud setup

Enable these APIs in the target project:

- Access Approval API
- Cloud Run API
- Cloud Build API
- Cloud Scheduler API
- Cloud Storage API
- Cloud Logging API

Create a private, regional Cloud Storage bucket for audit snapshots. Keep public access prevention enabled and use uniform bucket-level access.

Create two service accounts:

1. **Runtime service account** attached to Cloud Run:
   - `roles/accessapproval.viewer` (or the narrowest supported Access Approval read permission in your organization)
   - `roles/storage.objectAdmin` scoped to the audit bucket
   - `roles/logging.logWriter`
2. **Scheduler service account**:
   - `roles/run.invoker` on this Cloud Run service only

Deploy from this directory:

```bash
gcloud run deploy quickfas-access-approval \
  --source . \
  --region REGION \
  --service-account RUNTIME_SERVICE_ACCOUNT \
  --no-allow-unauthenticated \
  --set-env-vars GCP_PROJECT_ID=PROJECT_ID,SNAPSHOT_BUCKET=PRIVATE_BUCKET
```

Grant the scheduler identity invocation permission:

```bash
gcloud run services add-iam-policy-binding quickfas-access-approval \
  --region REGION \
  --member serviceAccount:SCHEDULER_SERVICE_ACCOUNT \
  --role roles/run.invoker
```

Create a Cloud Scheduler job with an OIDC token from the scheduler service account, target the service URL plus `/internal/check`, HTTP method POST, and cron schedule `* * * * *`. Use the Cloud Run service URL as the OIDC audience. Do not add a public unauthenticated route.

## Optional notifications

Set secrets through Secret Manager and map them into Cloud Run environment variables (do not commit them):

- `SLACK_WEBHOOK_URL`
- `EMAIL_HOST`, `EMAIL_PORT` (default 587)
- `EMAIL_USER`, `EMAIL_PASSWORD`
- `EMAIL_TO` (comma-separated recipients)

The notifier returns per-channel delivery results internally; the audit record remains the authoritative change evidence. Configure alerting on Cloud Run errors and failed Cloud Scheduler executions as well.

## Endpoints

- `GET /healthz` — process health
- `GET /` — dashboard (auto-refreshes every 30 seconds)
- `GET /api/current` — latest persisted snapshot
- `GET /api/history?limit=100` — recent snapshots (limit capped at 500)
- `POST /internal/check` — scheduler-only check; must remain protected by Cloud Run IAM

All routes are behind Cloud Run IAM because unauthenticated invocation is disabled. The Scheduler service account receives invoker access; dashboard viewers must authenticate to Google Cloud with an identity granted `roles/run.invoker`. For broader end-user access, place the service behind Identity-Aware Proxy and grant only the intended group access.

## Important scope and safety notes

- The service is read-only: it does not approve, deny, or modify access requests or settings.
- The dashboard shows settings returned by the API. It does not claim to inspect unrelated IAM keys or service-account key versions.
- The current implementation stores full API settings snapshots. Restrict bucket and log access to the security team, define retention/lifecycle rules, and confirm your organization's data-retention policy before production use.
- The service has not been deployed to a Google Cloud project by this repository change. API enablement, IAM grants, bucket creation, scheduler creation, secret configuration, and a live smoke test remain deployment steps.
