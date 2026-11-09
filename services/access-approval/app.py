from flask import Flask, jsonify, render_template, request
from audit import get_history, get_latest
from monitor import check_once

app = Flask(__name__)

@app.get("/healthz")
def health():
    return jsonify({"status": "ok", "service": "quickfas-access-approval"})

@app.get("/")
def dashboard():
    return render_template("index.html")

@app.get("/api/current")
def current():
    snapshot = get_latest()
    return jsonify(snapshot or {"status": "awaiting_first_snapshot"})

@app.get("/api/history")
def history():
    try:
        limit = int(request.args.get("limit", "100"))
    except ValueError:
        return jsonify({"error": "limit must be an integer"}), 400
    return jsonify(get_history(limit))

@app.post("/internal/check")
def scheduled_check():
    # Protect this route with Cloud Run IAM: grant run.invoker only to the
    # dedicated Cloud Scheduler service account. Do not enable unauthenticated access.
    return jsonify(check_once())
