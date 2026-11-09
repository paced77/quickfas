import google.auth
from google.auth.transport.requests import AuthorizedSession
from config import PROJECT_ID

SCOPES = ["https://www.googleapis.com/auth/cloud-platform"]

def get_access_approval_settings() -> dict:
    if not PROJECT_ID:
        raise RuntimeError("GCP_PROJECT_ID is not configured")
    credentials, _ = google.auth.default(scopes=SCOPES)
    session = AuthorizedSession(credentials)
    url = f"https://accessapproval.googleapis.com/v1/projects/{PROJECT_ID}/accessApprovalSettings"
    response = session.get(url, timeout=20)
    if response.status_code == 404:
        return {"resource": f"projects/{PROJECT_ID}", "configured": False}
    response.raise_for_status()
    return response.json()
