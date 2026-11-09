import os

def required(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise RuntimeError(f"Required environment variable {name} is not configured")
    return value

PROJECT_ID = os.getenv("GCP_PROJECT_ID", "").strip()
SNAPSHOT_BUCKET = os.getenv("SNAPSHOT_BUCKET", "").strip()
SLACK_WEBHOOK_URL = os.getenv("SLACK_WEBHOOK_URL", "").strip()
EMAIL_HOST = os.getenv("EMAIL_HOST", "").strip()
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
EMAIL_USER = os.getenv("EMAIL_USER", "").strip()
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "")
EMAIL_TO = [item.strip() for item in os.getenv("EMAIL_TO", "").split(",") if item.strip()]
LOG_NAME = os.getenv("LOG_NAME", "quickfas-access-approval")
