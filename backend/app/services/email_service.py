"""Email service — real SMTP email sending for VicRentalHub.ai."""

import os
import smtplib
import secrets
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime, timedelta
from typing import Optional

# ── Config from environment ───────────────────────────────────────────
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
EMAIL_FROM = os.getenv("EMAIL_FROM", "VicRentalHub <noreply@vicrentalhub.ai>")
APP_URL = os.getenv("APP_URL", "http://127.0.0.1:8000")
EMAIL_VERIFICATION_ENABLED = os.getenv("EMAIL_VERIFICATION_ENABLED", "true").lower() == "true"


def send_email(to: str, subject: str, html_body: str) -> bool:
    """Send an HTML email. Returns True on success, False on failure."""
    if not SMTP_USER or not SMTP_PASSWORD:
        print(f"[EMAIL] SMTP not configured — skipping email to {to}")
        print(f"[EMAIL] Subject: {subject}")
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = EMAIL_FROM
        msg["To"] = to
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_USER, to, msg.as_string())

        print(f"[EMAIL] Sent '{subject}' to {to}")
        return True
    except Exception as e:
        print(f"[EMAIL] Failed to send to {to}: {e}")
        return False


def generate_verification_token() -> str:
    return secrets.token_urlsafe(32)


def send_verification_email(to: str, full_name: str, token: str) -> bool:
    verify_url = f"{APP_URL}/verify-email?token={token}"
    subject = "Verify your VicRentalHub email"
    html = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #F8FAFC; margin: 0; padding: 40px 20px;">
      <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        <div style="background: linear-gradient(135deg, #1E3A8A, #6366F1); padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">VicRentalHub.ai</h1>
          <p style="color: rgba(255,255,255,0.7); margin: 4px 0 0; font-size: 13px;">Melbourne Property Platform</p>
        </div>
        <div style="padding: 40px 32px;">
          <h2 style="color: #0F172A; font-size: 20px; margin: 0 0 12px;">Welcome, {full_name or 'there'}! 👋</h2>
          <p style="color: #475569; line-height: 1.6; margin: 0 0 24px;">
            Thanks for signing up to VicRentalHub.ai. Please verify your email address to activate your account and access all features.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="{verify_url}"
               style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #1E3A8A, #6366F1); color: white; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(30,58,138,0.3);">
              Verify Email Address
            </a>
          </div>
          <p style="color: #94A3B8; font-size: 13px; text-align: center; margin: 0;">
            This link expires in 24 hours. If you didn't sign up, you can safely ignore this email.
          </p>
        </div>
        <div style="background: #F8FAFC; padding: 20px 32px; text-align: center; border-top: 1px solid #E2E8F0;">
          <p style="color: #94A3B8; font-size: 12px; margin: 0;">
            VicRentalHub.ai — Victorian Rental Compliance Platform<br>
            Built on official Victorian government data
          </p>
        </div>
      </div>
    </body>
    </html>
    """
    return send_email(to, subject, html)


def send_welcome_email(to: str, full_name: str, role: str) -> bool:
    role_label = {"tenant": "Tenant", "landlord": "Landlord", "agency": "Agency"}.get(role, "Member")
    subject = f"Welcome to VicRentalHub.ai — Your {role_label} account is ready"
    html = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #F8FAFC; margin: 0; padding: 40px 20px;">
      <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        <div style="background: linear-gradient(135deg, #1E3A8A, #6366F1); padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">VicRentalHub.ai</h1>
          <p style="color: rgba(255,255,255,0.7); margin: 4px 0 0; font-size: 13px;">Melbourne Property Platform</p>
        </div>
        <div style="padding: 40px 32px;">
          <h2 style="color: #0F172A; font-size: 20px; margin: 0 0 12px;">You're all set, {full_name or 'there'}! 🎉</h2>
          <p style="color: #475569; line-height: 1.6; margin: 0 0 24px;">
            Your <strong>{role_label}</strong> account is now active. Here's what you can do:
          </p>
          {"<ul style='color: #475569; line-height: 2; padding-left: 20px;'><li>Find and score rental listings</li><li>Check your rights under Victorian law</li><li>Chat with our AI assistant</li></ul>" if role == "tenant" else "<ul style='color: #475569; line-height: 2; padding-left: 20px;'><li>Run property compliance analysis</li><li>Generate professional compliance reports</li><li>Track minimum standards across your portfolio</li></ul>"}
          <div style="text-align: center; margin: 32px 0;">
            <a href="{APP_URL}/dashboard"
               style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #1E3A8A, #6366F1); color: white; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">
              Go to Dashboard
            </a>
          </div>
        </div>
        <div style="background: #F8FAFC; padding: 20px 32px; text-align: center; border-top: 1px solid #E2E8F0;">
          <p style="color: #94A3B8; font-size: 12px; margin: 0;">VicRentalHub.ai — Victorian Rental Compliance Platform</p>
        </div>
      </div>
    </body>
    </html>
    """
    return send_email(to, subject, html)


def send_password_reset_email(to: str, full_name: str, token: str) -> bool:
    reset_url = f"{APP_URL}/reset-password?token={token}"
    subject = "Reset your VicRentalHub password"
    html = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #F8FAFC; margin: 0; padding: 40px 20px;">
      <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        <div style="background: linear-gradient(135deg, #1E3A8A, #6366F1); padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">VicRentalHub.ai</h1>
        </div>
        <div style="padding: 40px 32px;">
          <h2 style="color: #0F172A; font-size: 20px; margin: 0 0 12px;">Reset your password</h2>
          <p style="color: #475569; line-height: 1.6; margin: 0 0 24px;">
            Hi {full_name or 'there'}, we received a request to reset your password. Click below to choose a new one.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="{reset_url}"
               style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #1E3A8A, #6366F1); color: white; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">
              Reset Password
            </a>
          </div>
          <p style="color: #94A3B8; font-size: 13px; text-align: center; margin: 0;">
            This link expires in 1 hour. If you didn't request this, ignore this email.
          </p>
        </div>
      </div>
    </body>
    </html>
    """
    return send_email(to, subject, html)
