# Quickfas Nexus

Quickfas Nexus is an additive project-intelligence module inside the existing Quickfas application. It does not create a second application, identity system, API runtime, or deployment.

## First connector: public GitHub

The initial connector reads public repository information from GitHub's unauthenticated REST API:
- Repository metadata and default branch.
- Up to 30 recent commits.
- Up to 100 contributor records.
- Up to 8 recently created public forks for the relationship snapshot.
- Up to 100 open issue/ pull-request records, separated by the presence of GitHub's `pull_request` field.

The module starts with `paced77/quickfas`. Users can enter another repository as `owner/repository` or a GitHub repository URL. The view refreshes when opened, on demand, and every six hours while it remains mounted.

## Metric definitions and limits

- **Recent commits** is the number of commit records returned (maximum 30), not the lifetime commit count.
- **Contributors** is the number of contributor records returned (maximum 100), not necessarily every contributor in a large repository.
- **Forks** is GitHub's repository-level total; the graph only plots the latest eight returned forks.
- **Open issues** and **open pull requests** are counted from the first 100 open items returned by GitHub. These counts can be incomplete when a repository has more than 100 open items.
- The 14-day activity bars are calculated from the fetched recent-commit sample. They are not a full Git contribution history.
- GitHub's unauthenticated API has rate limits. The UI surfaces a clear message when the public API quota is exhausted.

## Security and privacy

- Public repositories only. Private repository access is intentionally not enabled in this first version.
- No personal access token, GitLab account, or secret is requested or stored by the browser module.
- The module does not write to repositories, create issues, or change GitHub data.
- No clinical, patient, financial, or operational system data is accessed.
- Existing Quickfas authentication, authorization, Supabase configuration, and production access restrictions are unchanged.

## Follow-on work

Potential next phases, subject to separate implementation and review:
1. A server-side GitHub App integration for private repositories, with least-privilege installation permissions and credentials kept only in server-side secret storage.
2. A D3-based force-directed network with pagination and richer relationship exploration.
3. Scheduled server-side snapshots with retention, source timestamps, and explicit API quota handling.
4. Provider adapters for other project hosts if access becomes available.

The six-hour refresh in this first release is browser-session refresh only. It is not a background scheduled job and will not run while the application is closed.
