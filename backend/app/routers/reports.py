"""Reports — generates and serves PDF reports."""

import os
from datetime import datetime
from typing import Dict, Any

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session

from ..auth import get_current_user, get_current_user_optional
from ..database import get_db
from ..models import Property, Report, User
from ..schemas import StandardsCheckRequest, AnalysisRequest, BillPredictionRequest, HealthCheckRequest
from ..services import analysis_service, pdf_service

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.post("/landlord-pdf")
def landlord_report_pdf(
    payload: StandardsCheckRequest,
    user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """Generate landlord PDF report. Streams the PDF bytes directly."""
    prop = payload.property.model_dump()
    standards = analysis_service.check_standards(payload.responses)
    score = analysis_service.calculate_compliance_score(prop, standards)
    energy = analysis_service.energy_scanner(prop)
    rebates = analysis_service.find_rebates(prop)
    safety = analysis_service.safety_scan(prop)

    pdf_bytes = pdf_service.generate_landlord_report(
        property_data=prop,
        score_data=score,
        standards=standards,
        energy=energy,
        rebates=rebates,
        safety=safety,
    )

    # If user is authenticated, save report record
    if user:
        report = Report(
            user_id=user.id,
            report_type="landlord",
            payload={
                "property": prop,
                "score": score,
                "standards": {
                    "pass_count": standards["pass_count"],
                    "fail_count": standards["fail_count"],
                    "uncertain_count": standards["uncertain_count"],
                    "compliance_pct": standards["compliance_pct"],
                },
            },
        )
        db.add(report)
        db.commit()

    safe_address = (prop.get("address", "property") or "property").replace(" ", "_").replace(",", "")[:40]
    filename = f"VicRentalHub_Compliance_{safe_address}_{datetime.now().strftime('%Y%m%d')}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post("/tenant-pdf")
def tenant_report_pdf(
    payload: HealthCheckRequest,
    user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """Generate tenant PDF report."""
    prop = payload.property.model_dump()
    health = analysis_service.property_health_check(prop, payload.issues)
    bills = analysis_service.predict_bills(prop, occupants=2)

    pdf_bytes = pdf_service.generate_tenant_report(
        property_data=prop,
        health=health,
        bills=bills,
    )

    if user:
        report = Report(
            user_id=user.id,
            report_type="tenant",
            payload={"property": prop, "health": health, "bills": bills},
        )
        db.add(report)
        db.commit()

    safe_address = (prop.get("address", "property") or "property").replace(" ", "_").replace(",", "")[:40]
    filename = f"VicRentalHub_Tenant_{safe_address}_{datetime.now().strftime('%Y%m%d')}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/my-reports")
def my_reports(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    reports = db.query(Report).filter(Report.user_id == user.id).order_by(Report.created_at.desc()).all()
    return [
        {
            "id": r.id,
            "report_type": r.report_type,
            "property_id": r.property_id,
            "created_at": r.created_at,
            "summary": _summarise_report(r.payload or {}),
        }
        for r in reports
    ]


def _summarise_report(payload: Dict[str, Any]) -> Dict[str, Any]:
    summary: Dict[str, Any] = {}
    if "property" in payload and isinstance(payload["property"], dict):
        summary["address"] = payload["property"].get("address")
    if "score" in payload and isinstance(payload["score"], dict):
        summary["score"] = payload["score"].get("total")
        summary["grade"] = payload["score"].get("grade")
    return summary
