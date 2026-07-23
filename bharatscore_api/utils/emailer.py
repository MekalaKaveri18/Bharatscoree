# utils/emailer.py
import os
import smtplib
from email.message import EmailMessage

SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")
SMTP_FROM = os.getenv("SMTP_FROM", "no-reply@bharatscore.local")

def send_email(to_email: str, subject: str, body: str) -> bool:
    # If SMTP not configured, print to console and pretend it's sent.
    if not SMTP_HOST or not SMTP_USER or not SMTP_PASS:
        print(f"[EMAIL DEBUG]\nTo: {to_email}\nSubject: {subject}\n\n{body}\n")
        return True

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = SMTP_FROM
    msg["To"] = to_email
    msg.set_content(body)

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as s:
            s.starttls()
            s.login(SMTP_USER, SMTP_PASS)
            s.send_message(msg)
        return True
    except Exception as e:
        print("SMTP send failed:", e)
        return False
