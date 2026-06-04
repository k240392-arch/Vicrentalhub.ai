"""Auth routes: register, login, verify email, password reset."""

import os
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from ..auth import (
    create_access_token, get_current_user, hash_password, verify_password,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)
from ..database import get_db
from ..models import User
from ..schemas import TokenResponse, UserLogin, UserOut, UserRegister
from ..services.email_service import (
    generate_verification_token,
    send_verification_email,
    send_welcome_email,
    send_password_reset_email,
    EMAIL_VERIFICATION_ENABLED,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    if payload.role not in {"tenant", "landlord", "agency"}:
        raise HTTPException(status_code=400, detail="Invalid role")

    plan_default = (
        "tenant" if payload.role == "tenant"
        else "landlord_pro" if payload.role == "landlord"
        else "agency"
    )

    # Generate verification token
    verification_token = generate_verification_token()
    verification_expires = datetime.utcnow() + timedelta(hours=24)

    user = User(
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=hash_password(payload.password),
        role=payload.role,
        plan=plan_default,
        is_verified=not EMAIL_VERIFICATION_ENABLED,  # auto-verify if email disabled
        verification_token=verification_token,
        verification_token_expires=verification_expires,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Send verification email (non-blocking — failure doesn't break registration)
    if EMAIL_VERIFICATION_ENABLED:
        send_verification_email(user.email, user.full_name or "", verification_token)
    else:
        send_welcome_email(user.email, user.full_name or "", user.role)

    token = create_access_token(
        {"sub": str(user.id)},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


@router.get("/verify-email")
def verify_email(token: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.verification_token == token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid verification token")
    if user.verification_token_expires and datetime.utcnow() > user.verification_token_expires:
        raise HTTPException(status_code=400, detail="Verification token has expired")

    user.is_verified = True
    user.verification_token = None
    user.verification_token_expires = None
    db.commit()

    # Send welcome email
    send_welcome_email(user.email, user.full_name or "", user.role)

    return {"message": "Email verified successfully. You can now log in."}


@router.post("/forgot-password")
def forgot_password(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    # Always return success to avoid email enumeration
    if user:
        reset_token = generate_verification_token()
        user.reset_token = reset_token
        user.reset_token_expires = datetime.utcnow() + timedelta(hours=1)
        db.commit()
        send_password_reset_email(user.email, user.full_name or "", reset_token)
    return {"message": "If that email exists, a reset link has been sent."}


@router.post("/reset-password")
def reset_password(token: str, new_password: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.reset_token == token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    if user.reset_token_expires and datetime.utcnow() > user.reset_token_expires:
        raise HTTPException(status_code=400, detail="Reset token has expired")

    user.hashed_password = hash_password(new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()

    return {"message": "Password reset successfully. You can now log in."}


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is inactive")

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


@router.post("/login/oauth", response_model=TokenResponse)
def login_oauth(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form.username).first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
def get_me(user: User = Depends(get_current_user)):
    return UserOut.model_validate(user)