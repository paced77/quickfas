import smtplib
from email.message import EmailMessage
import requests
from config import SLACK_WEBHOOK_URL, EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD, EMAIL_TO

def notify_change(message: str) -> dict:
    results = {"slack": False, "email": False}
    if SLACK_WEBHOOK_URL:
        try:
            response = requests.post(SLACK_WEBHOOK_URL, json={"text": message}, timeout=10)
            response.raise_for_status()
            results["slack"] = True
        except requests.RequestException:
            pass
    if EMAIL_HOST and EMAIL_USER and EMAIL_PASSWORD and EMAIL_TO:
        try:
            email = EmailMessage()
            email["Subject"] = "QuickFAS: Google Cloud Access Approval changed"
            email["From"] = EMAIL_USER
            email["To"] = ", ".join(EMAIL_TO)
            email.set_content(message)
            with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT, timeout=15) as server:
                server.starttls()
                server.login(EMAIL_USER, EMAIL_PASSWORD)
                server.send_message(email)
            results["email"] = True
        except (OSError, smtplib.SMTPException):
            pass
    return results
