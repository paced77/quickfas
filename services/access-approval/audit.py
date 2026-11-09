import hashlib
import json
from datetime import datetime, timezone
from google.cloud import logging as cloud_logging
from google.cloud import storage
from config import SNAPSHOT_BUCKET, LOG_NAME

def _clients():
    return storage.Client(), cloud_logging.Client()

def record_snapshot(settings: dict, changed: bool) -> dict:
    if not SNAPSHOT_BUCKET:
        raise RuntimeError("SNAPSHOT_BUCKET is not configured")
    storage_client, logging_client = _clients()
    now = datetime.now(timezone.utc)
    payload = {
        "observedAt": now.isoformat(),
        "settings": settings,
        "settingsSha256": hashlib.sha256(
            json.dumps(settings, sort_keys=True, separators=(",", ":")).encode()
        ).hexdigest(),
        "changed": changed,
    }
    bucket = storage_client.bucket(SNAPSHOT_BUCKET)
    name = f"snapshots/{now.strftime('%Y/%m/%d/%H%M%S%f')}.json"
    bucket.blob(name).upload_from_string(json.dumps(payload), content_type="application/json")
    bucket.blob("latest.json").upload_from_string(json.dumps(payload), content_type="application/json")
    logging_client.logger(LOG_NAME).log_struct(payload, severity="WARNING" if changed else "INFO")
    return payload

def get_history(limit: int = 100) -> list[dict]:
    if not SNAPSHOT_BUCKET:
        raise RuntimeError("SNAPSHOT_BUCKET is not configured")
    client = storage.Client()
    blobs = list(client.list_blobs(SNAPSHOT_BUCKET, prefix="snapshots/"))
    blobs.sort(key=lambda blob: blob.name, reverse=True)
    output = []
    for blob in blobs[:max(1, min(limit, 500))]:
        output.append(json.loads(blob.download_as_text()))
    return output

def get_latest() -> dict | None:
    if not SNAPSHOT_BUCKET:
        raise RuntimeError("SNAPSHOT_BUCKET is not configured")
    blob = storage.Client().bucket(SNAPSHOT_BUCKET).blob("latest.json")
    if not blob.exists():
        return None
    return json.loads(blob.download_as_text())
