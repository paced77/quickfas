# QuickFAS Access Approval Monitoring

QuickFAS's Access Approval monitor is an additive security operations service. It runs separately from the existing React/Express application and Supabase authentication foundation.

See [the service deployment guide](../services/access-approval/README.md) for IAM, Cloud Scheduler, Cloud Storage, Cloud Logging, and notification setup.

## Architecture

```text
Cloud Scheduler (OIDC service account; every minute)
        |
        v
Cloud Run service (IAM protected)
        |-- Access Approval API (read-only)
        |-- canonical settings hash / change detection
        |-- private Cloud Storage snapshots
        |-- Cloud Logging audit events
        |-- optional Slack + SMTP notifications
        |
        +--> IAM-protected dashboard + JSON history endpoints
```

The original Flask/Google OAuth sketch is intentionally adapted to QuickFAS: it does not create a second user database or duplicate login system. Cloud Run IAM is the service boundary; an Identity-Aware Proxy or organization-approved identity gateway can be used for a broader dashboard audience.

## Rollout gates

1. Confirm the target Google Cloud project and Access Approval API are enabled.
2. Create the private audit bucket and dedicated runtime and Scheduler service accounts.
3. Grant only Access Approval read access, bucket object access, log writing, and service invocation as documented.
4. Deploy with unauthenticated access disabled.
5. Store notification credentials in Secret Manager, never in Git.
6. Create the Cloud Scheduler OIDC job.
7. Verify the first snapshot, a controlled settings-change test, Cloud Logging entries, alert delivery, and denied unauthenticated access.
8. Review snapshot contents and retention with the security owner before enabling production monitoring.

The monitor does not make approval decisions or mutate Google Cloud settings. This repository change adds source code and deployment guidance only; it does not provision or deploy cloud resources.
