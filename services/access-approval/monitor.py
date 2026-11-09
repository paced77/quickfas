import json
from audit import get_latest, record_snapshot
from gcloud_api import get_access_approval_settings
from notifications import notify_change

def check_once() -> dict:
    current = get_access_approval_settings()
    previous = get_latest()
    changed = bool(previous and previous.get("settingsSha256") != __import__("hashlib").sha256(
        json.dumps(current, sort_keys=True, separators=(",", ":")).encode()
    ).hexdigest())
    snapshot = record_snapshot(current, changed)
    if changed:
        notify_change(
            "Google Cloud Access Approval settings changed for the configured QuickFAS project. "
            f"Observed at {snapshot['observedAt']}. Review the authenticated QuickFAS audit dashboard."
        )
    return {"changed": changed, "observedAt": snapshot["observedAt"], "settingsSha256": snapshot["settingsSha256"]}
