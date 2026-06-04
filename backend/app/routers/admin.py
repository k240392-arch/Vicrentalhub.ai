"""Admin router — full control panel for superadmin users."""

import json
import io
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..auth import get_current_user
from ..database import get_db
from ..models import User, Property, Report, SavedSearch

router = APIRouter(prefix="/api/admin", tags=["admin"])


def require_admin(user: User = Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


# ── Dashboard stats ───────────────────────────────────────────────────
@router.get("/stats")
def get_stats(db: Session = Depends(get_db), admin=Depends(require_admin)):
    total_users = db.query(func.count(User.id)).scalar()
    active_users = db.query(func.count(User.id)).filter(User.is_active == True).scalar()
    suspended_users = db.query(func.count(User.id)).filter(User.is_active == False).scalar()
    total_properties = db.query(func.count(Property.id)).scalar()
    total_reports = db.query(func.count(Report.id)).scalar()

    by_role = {}
    for role in ["tenant", "landlord", "agency", "admin"]:
        count = db.query(func.count(User.id)).filter(User.role == role).scalar()
        by_role[role] = count

    by_plan = {}
    for plan in ["tenant", "landlord_report", "landlord_pro", "agency"]:
        count = db.query(func.count(User.id)).filter(User.plan == plan).scalar()
        by_plan[plan] = count

    recent_signups = db.query(User).order_by(User.created_at.desc()).limit(5).all()

    return {
        "total_users": total_users,
        "active_users": active_users,
        "suspended_users": suspended_users,
        "total_properties": total_properties,
        "total_reports": total_reports,
        "by_role": by_role,
        "by_plan": by_plan,
        "recent_signups": [
            {
                "id": u.id,
                "email": u.email,
                "full_name": u.full_name,
                "role": u.role,
                "plan": u.plan,
                "is_active": u.is_active,
                "created_at": u.created_at.isoformat(),
            }
            for u in recent_signups
        ],
    }


# ── List all users ────────────────────────────────────────────────────
@router.get("/users")
def list_users(
    search: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    q = db.query(User)
    if search:
        q = q.filter(
            (User.email.ilike(f"%{search}%")) | (User.full_name.ilike(f"%{search}%"))
        )
    if role:
        q = q.filter(User.role == role)
    if is_active is not None:
        q = q.filter(User.is_active == is_active)

    total = q.count()
    users = q.order_by(User.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()

    return {
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": (total + per_page - 1) // per_page,
        "users": [_user_detail(u, db) for u in users],
    }


# ── Get single user ───────────────────────────────────────────────────
@router.get("/users/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db), admin=Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return _user_detail(user, db, full=True)


# ── Suspend user ──────────────────────────────────────────────────────
@router.post("/users/{user_id}/suspend")
def suspend_user(user_id: int, db: Session = Depends(get_db), admin=Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role == "admin":
        raise HTTPException(status_code=400, detail="Cannot suspend another admin")
    user.is_active = False
    db.commit()
    return {"message": f"User {user.email} suspended", "is_active": False}


# ── Reactivate user ───────────────────────────────────────────────────
@router.post("/users/{user_id}/activate")
def activate_user(user_id: int, db: Session = Depends(get_db), admin=Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = True
    db.commit()
    return {"message": f"User {user.email} activated", "is_active": True}


# ── Delete user ───────────────────────────────────────────────────────
@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), admin=Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role == "admin":
        raise HTTPException(status_code=400, detail="Cannot delete an admin account")
    email = user.email
    db.delete(user)
    db.commit()
    return {"message": f"User {email} permanently deleted"}


# ── Change user role ──────────────────────────────────────────────────
@router.patch("/users/{user_id}/role")
def change_role(user_id: int, new_role: str, db: Session = Depends(get_db), admin=Depends(require_admin)):
    if new_role not in {"tenant", "landlord", "agency", "admin"}:
        raise HTTPException(status_code=400, detail="Invalid role")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = new_role
    db.commit()
    return {"message": f"Role updated to {new_role}", "role": new_role}


# ── Export user history as JSON ───────────────────────────────────────
@router.get("/users/{user_id}/export/json")
def export_user_json(user_id: int, db: Session = Depends(get_db), admin=Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    data = _user_detail(user, db, full=True)
    json_bytes = json.dumps(data, indent=2, default=str).encode("utf-8")

    return StreamingResponse(
        io.BytesIO(json_bytes),
        media_type="application/json",
        headers={"Content-Disposition": f'attachment; filename="user_{user_id}_history.json"'},
    )


# ── Export user history as PDF ────────────────────────────────────────
@router.get("/users/{user_id}/export/pdf")
def export_user_pdf(user_id: int, db: Session = Depends(get_db), admin=Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    data = _user_detail(user, db, full=True)

    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.colors import HexColor
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
        from reportlab.lib import colors
        from reportlab.lib.units import cm

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=2*cm, leftMargin=2*cm, topMargin=2*cm, bottomMargin=2*cm)
        styles = getSampleStyleSheet()
        navy = HexColor("#1E3A8A")
        slate = HexColor("#475569")

        title_style = ParagraphStyle("Title", parent=styles["Heading1"], textColor=navy, fontSize=22, spaceAfter=6)
        h2_style = ParagraphStyle("H2", parent=styles["Heading2"], textColor=navy, fontSize=14, spaceBefore=16, spaceAfter=6)
        body_style = ParagraphStyle("Body", parent=styles["Normal"], textColor=slate, fontSize=10, spaceAfter=4)

        story = []

        # Header
        story.append(Paragraph("VicRentalHub.ai", title_style))
        story.append(Paragraph("Admin — User History Report", ParagraphStyle("Sub", parent=styles["Normal"], textColor=slate, fontSize=12)))
        story.append(Spacer(1, 0.3*cm))
        story.append(HRFlowable(width="100%", thickness=2, color=navy))
        story.append(Spacer(1, 0.4*cm))

        # User info
        story.append(Paragraph("User Profile", h2_style))
        user_data = [
            ["Field", "Value"],
            ["ID", str(data["id"])],
            ["Email", data["email"]],
            ["Full Name", data["full_name"] or "—"],
            ["Role", data["role"]],
            ["Plan", data["plan"]],
            ["Status", "Active" if data["is_active"] else "Suspended"],
            ["Joined", data["created_at"][:10]],
        ]
        t = Table(user_data, colWidths=[5*cm, 12*cm])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), navy),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [HexColor("#F8FAFC"), colors.white]),
            ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#E2E8F0")),
            ("PADDING", (0, 0), (-1, -1), 6),
        ]))
        story.append(t)

        # Properties
        props = data.get("properties", [])
        story.append(Paragraph(f"Properties ({len(props)})", h2_style))
        if props:
            prop_data = [["Address", "Suburb", "Bedrooms", "Score", "Grade"]]
            for p in props:
                prop_data.append([p["address"], p.get("suburb") or "—", str(p["bedrooms"]), str(p.get("last_compliance_score") or "—"), p.get("last_grade") or "—"])
            pt = Table(prop_data, colWidths=[7*cm, 3*cm, 2.5*cm, 2*cm, 2.5*cm])
            pt.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), navy),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [HexColor("#F8FAFC"), colors.white]),
                ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#E2E8F0")),
                ("PADDING", (0, 0), (-1, -1), 5),
            ]))
            story.append(pt)
        else:
            story.append(Paragraph("No properties on record.", body_style))

        # Reports
        rpts = data.get("reports", [])
        story.append(Paragraph(f"Reports Generated ({len(rpts)})", h2_style))
        if rpts:
            rpt_data = [["Report ID", "Type", "Date"]]
            for r in rpts:
                rpt_data.append([str(r["id"]), r["report_type"], r["created_at"][:10]])
            rt = Table(rpt_data, colWidths=[4*cm, 6*cm, 7*cm])
            rt.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), navy),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [HexColor("#F8FAFC"), colors.white]),
                ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#E2E8F0")),
                ("PADDING", (0, 0), (-1, -1), 5),
            ]))
            story.append(rt)
        else:
            story.append(Paragraph("No reports generated.", body_style))

        # Footer
        story.append(Spacer(1, 0.5*cm))
        story.append(HRFlowable(width="100%", thickness=1, color=HexColor("#E2E8F0")))
        story.append(Paragraph(f"Generated by VicRentalHub.ai Admin Panel · {datetime.utcnow().strftime('%Y-%m-%d %H:%M')} UTC", ParagraphStyle("Footer", parent=styles["Normal"], textColor=HexColor("#94A3B8"), fontSize=8)))

        doc.build(story)
        buffer.seek(0)

        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="user_{user_id}_history.pdf"'},
        )

    except ImportError:
        raise HTTPException(status_code=500, detail="reportlab not installed")


# ── Export ALL users as JSON ──────────────────────────────────────────
@router.get("/export/users/json")
def export_all_users_json(db: Session = Depends(get_db), admin=Depends(require_admin)):
    users = db.query(User).order_by(User.created_at.desc()).all()
    data = {"exported_at": datetime.utcnow().isoformat(), "total": len(users), "users": [_user_detail(u, db) for u in users]}
    json_bytes = json.dumps(data, indent=2, default=str).encode("utf-8")
    return StreamingResponse(
        io.BytesIO(json_bytes),
        media_type="application/json",
        headers={"Content-Disposition": 'attachment; filename="all_users_export.json"'},
    )


# ── Helper ────────────────────────────────────────────────────────────
def _user_detail(user: User, db: Session, full: bool = False):
    props = db.query(Property).filter(Property.owner_id == user.id).all()
    reports = db.query(Report).filter(Report.user_id == user.id).all()
    searches = db.query(SavedSearch).filter(SavedSearch.user_id == user.id).all()

    out = {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "plan": user.plan,
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat(),
        "property_count": len(props),
        "report_count": len(reports),
        "saved_search_count": len(searches),
    }

    if full:
        out["properties"] = [
            {
                "id": p.id, "address": p.address, "suburb": p.suburb,
                "bedrooms": p.bedrooms, "last_compliance_score": p.last_compliance_score,
                "last_grade": p.last_grade, "created_at": p.created_at.isoformat(),
            }
            for p in props
        ]
        out["reports"] = [
            {"id": r.id, "report_type": r.report_type, "created_at": r.created_at.isoformat()}
            for r in reports
        ]
        out["saved_searches"] = [
            {"id": s.id, "name": s.name, "suburb": s.suburb, "created_at": s.created_at.isoformat()}
            for s in searches
        ]

    return out