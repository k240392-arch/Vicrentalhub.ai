"""
pdf_service.py – Generate professional PDF reports.
Uses ReportLab for precise layout control.
"""

import io
import os
from datetime import datetime
from typing import Any, Dict

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm, mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether,
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT


VIC_NAVY = colors.HexColor("#0A1628")
VIC_BLUE = colors.HexColor("#1B4FDB")
VIC_SKY = colors.HexColor("#3B9EF8")
VIC_GREEN = colors.HexColor("#00C47D")
VIC_AMBER = colors.HexColor("#F59E0B")
VIC_RED = colors.HexColor("#EF4444")
SURFACE = colors.HexColor("#F8FAFC")
BORDER = colors.HexColor("#E2E8F0")
TEXT_PRIMARY = colors.HexColor("#0F172A")
TEXT_SECONDARY = colors.HexColor("#64748B")


def _build_styles():
    base = getSampleStyleSheet()
    return {
        "Title": ParagraphStyle(
            "TitleX", parent=base["Title"], fontSize=22, leading=26,
            textColor=colors.white, alignment=TA_LEFT, spaceAfter=4, fontName="Helvetica-Bold",
        ),
        "Subtitle": ParagraphStyle(
            "SubtitleX", parent=base["Normal"], fontSize=11, leading=14,
            textColor=colors.HexColor("#CBD5E1"), alignment=TA_LEFT,
        ),
        "H1": ParagraphStyle(
            "H1", parent=base["Heading1"], fontSize=16, leading=20,
            textColor=VIC_NAVY, spaceBefore=14, spaceAfter=8, fontName="Helvetica-Bold",
        ),
        "H2": ParagraphStyle(
            "H2", parent=base["Heading2"], fontSize=13, leading=16,
            textColor=VIC_BLUE, spaceBefore=10, spaceAfter=6, fontName="Helvetica-Bold",
        ),
        "Body": ParagraphStyle(
            "Body", parent=base["Normal"], fontSize=10, leading=14,
            textColor=TEXT_PRIMARY, alignment=TA_LEFT, spaceAfter=4,
        ),
        "Small": ParagraphStyle(
            "Small", parent=base["Normal"], fontSize=8.5, leading=11,
            textColor=TEXT_SECONDARY, alignment=TA_LEFT,
        ),
        "Bullet": ParagraphStyle(
            "Bullet", parent=base["Normal"], fontSize=10, leading=14,
            textColor=TEXT_PRIMARY, leftIndent=14, bulletIndent=2, spaceAfter=2,
        ),
        "BigScore": ParagraphStyle(
            "BigScore", parent=base["Normal"], fontSize=48, leading=52,
            textColor=colors.white, alignment=TA_CENTER, fontName="Helvetica-Bold",
        ),
        "Grade": ParagraphStyle(
            "Grade", parent=base["Normal"], fontSize=14, leading=16,
            textColor=colors.white, alignment=TA_CENTER, fontName="Helvetica-Bold",
        ),
    }


def _header_block(styles, title: str, subtitle: str) -> Table:
    """Navy header block with title."""
    inner = Table(
        [[Paragraph(title, styles["Title"])], [Paragraph(subtitle, styles["Subtitle"])]],
        colWidths=[16 * cm],
    )
    inner.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 16),
        ("RIGHTPADDING", (0, 0), (-1, -1), 16),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    wrapper = Table([[inner]], colWidths=[17 * cm])
    wrapper.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), VIC_NAVY),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 18),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 18),
        ("ROUNDEDCORNERS", [8, 8, 8, 8]),
    ]))
    return wrapper


def _score_card(styles, score: int, grade: str) -> Table:
    if score >= 70:
        bg = VIC_GREEN
    elif score >= 55:
        bg = VIC_AMBER
    else:
        bg = VIC_RED

    cell = Table(
        [
            [Paragraph(f"{score}", styles["BigScore"])],
            [Paragraph(f"/100", ParagraphStyle("S", parent=styles["Small"], textColor=colors.white, alignment=TA_CENTER))],
            [Paragraph(grade, styles["Grade"])],
        ],
        colWidths=[6 * cm],
    )
    cell.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), bg),
        ("TOPPADDING", (0, 0), (-1, -1), 14),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 14),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    return cell


def _kv_table(rows, col_widths=(5.5 * cm, 11 * cm)):
    t = Table(rows, colWidths=list(col_widths))
    t.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (1, 0), (1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 9.5),
        ("TEXTCOLOR", (0, 0), (0, -1), TEXT_SECONDARY),
        ("TEXTCOLOR", (1, 0), (1, -1), TEXT_PRIMARY),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LINEBELOW", (0, 0), (-1, -2), 0.4, BORDER),
        ("BACKGROUND", (0, 0), (-1, -1), SURFACE),
    ]))
    return t


def _breakdown_table(breakdown: Dict[str, Dict]) -> Table:
    rows = [["Category", "Score", "Max", "Percentage"]]
    for k, v in breakdown.items():
        rows.append([k, str(v["score"]), str(v["max"]), f"{v['pct']}%"])
    t = Table(rows, colWidths=[6 * cm, 3 * cm, 3 * cm, 4 * cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), VIC_NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9.5),
        ("ALIGN", (1, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LINEBELOW", (0, 0), (-1, -1), 0.4, BORDER),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [SURFACE, colors.white]),
    ]))
    return t


def _bullet_list(styles, items, prefix="•"):
    elements = []
    for item in items:
        elements.append(Paragraph(f"{prefix} {item}", styles["Bullet"]))
    return elements


def generate_landlord_report(
    property_data: Dict[str, Any],
    score_data: Dict[str, Any],
    standards: Dict[str, Any],
    energy: Dict[str, Any],
    rebates: Dict[str, Any],
    safety: Dict[str, Any],
) -> bytes:
    """Generate a comprehensive landlord PDF report. Returns bytes."""
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        leftMargin=2 * cm, rightMargin=2 * cm,
        topMargin=1.5 * cm, bottomMargin=1.5 * cm,
        title="VicRentalHub Compliance Report",
    )
    styles = _build_styles()
    story = []

    # ── Header ──
    story.append(_header_block(
        styles,
        "Compliance Report",
        f"VicRentalHub.ai • Generated {datetime.now().strftime('%d %B %Y')}",
    ))
    story.append(Spacer(1, 14))

    # ── Property summary ──
    story.append(Paragraph("Property Details", styles["H1"]))
    rows = [
        ["Address", property_data.get("address", "—")],
        ["Year Built", str(property_data.get("year_built") or "—")],
        ["Bedrooms / Bathrooms", f"{property_data.get('bedrooms', '—')} / {property_data.get('bathrooms', '—')}"],
        ["Heating", property_data.get("heating", "—")],
        ["Cooling", property_data.get("cooling", "—")],
        ["Hot Water", property_data.get("hot_water", "—")],
        ["Insulation", property_data.get("insulation", "—")],
        ["Solar Panels", "Yes" if property_data.get("solar") else "No"],
        ["Mould Detected", "Yes" if property_data.get("mould") else "No"],
        ["Draughts Detected", "Yes" if property_data.get("draughts") else "No"],
    ]
    if property_data.get("notes"):
        rows.append(["Notes", property_data["notes"]])
    story.append(_kv_table(rows))
    story.append(Spacer(1, 14))

    # ── Score ──
    story.append(Paragraph("Smart Compliance Score", styles["H1"]))
    score_table = Table(
        [[_score_card(styles, score_data["total"], score_data["grade"]),
          Paragraph(score_data.get("summary", ""), styles["Body"])]],
        colWidths=[6.5 * cm, 10 * cm],
    )
    score_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (1, 0), (1, -1), 12),
    ]))
    story.append(score_table)
    story.append(Spacer(1, 12))

    story.append(Paragraph("Score Breakdown", styles["H2"]))
    story.append(_breakdown_table(score_data["breakdown"]))
    story.append(Spacer(1, 14))

    # ── Standards ──
    story.append(Paragraph("Minimum Standards (15-Point Check)", styles["H1"]))
    summary = (
        f"<b>{standards['pass_count']}</b> Passing &nbsp;|&nbsp; "
        f"<b>{standards['fail_count']}</b> Failing &nbsp;|&nbsp; "
        f"<b>{standards['uncertain_count']}</b> Uncertain &nbsp;|&nbsp; "
        f"<b>{standards['compliance_pct']}%</b> Compliance"
    )
    story.append(Paragraph(summary, styles["Body"]))
    story.append(Spacer(1, 4))

    if not standards["can_advertise"]:
        story.append(Paragraph(
            "<b><font color='#EF4444'>WARNING:</font></b> Property cannot be legally advertised. "
            "Advertising a non-compliant property is a criminal offence under Victorian law.",
            styles["Body"],
        ))
        story.append(Spacer(1, 4))

    if standards["failed_standards"]:
        story.append(Paragraph("Failed Standards", styles["H2"]))
        for f in standards["failed_standards"]:
            story.append(Paragraph(
                f"<b>{f['standard']}:</b> {f['description']}",
                styles["Body"],
            ))
            story.append(Spacer(1, 2))

    story.append(Spacer(1, 8))

    # ── Energy ──
    story.append(PageBreak())
    story.append(Paragraph("Energy Efficiency Assessment", styles["H1"]))
    story.append(Paragraph(f"Energy Score: <b>{energy['energy_score']}/100</b>", styles["Body"]))
    story.append(Spacer(1, 6))

    story.append(Paragraph("Standards Timeline", styles["H2"]))
    timeline_rows = [["Requirement", "Effective", "Affected", "Cost"]]
    for t in energy["timeline"]:
        timeline_rows.append([
            Paragraph(t["requirement"], styles["Small"]),
            Paragraph(t["effective_date"], styles["Small"]),
            Paragraph("Yes" if t["affected"] else "No", styles["Small"]),
            Paragraph(t["cost_estimate"], styles["Small"]),
        ])
    tt = Table(timeline_rows, colWidths=[6.5 * cm, 3.5 * cm, 2.5 * cm, 4.5 * cm])
    tt.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), VIC_NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 9.5),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [SURFACE, colors.white]),
        ("LINEBELOW", (0, 0), (-1, -1), 0.3, BORDER),
    ]))
    story.append(tt)
    story.append(Spacer(1, 10))

    story.append(Paragraph("Recommendations", styles["H2"]))
    for r in energy["recommendations"]:
        story.append(Paragraph(f"• {r}", styles["Bullet"]))
    story.append(Spacer(1, 10))

    # ── Rebates ──
    story.append(Paragraph("Available Rebates", styles["H1"]))
    story.append(Paragraph(
        f"Total potential rebate value: <b>up to ${rebates['total_potential_value']:,}</b>",
        styles["Body"],
    ))
    story.append(Spacer(1, 6))
    for m in rebates["matches"]:
        r = m["rebate"]
        eligible_text = "ELIGIBLE" if m["eligible"] else "Not eligible"
        eligible_color = "#00C47D" if m["eligible"] else "#94A3B8"
        story.append(Paragraph(
            f"<b>{r['name']}</b> — <font color='{eligible_color}'>{eligible_text}</font>",
            styles["Body"],
        ))
        story.append(Paragraph(f"Amount: {r['amount']}", styles["Small"]))
        story.append(Paragraph(f"Source: {r['source']}", styles["Small"]))
        for reason in m["reasons"]:
            story.append(Paragraph(f"  · {reason}", styles["Small"]))
        story.append(Spacer(1, 6))

    # ── Safety ──
    story.append(Paragraph("Safety & Risk Assessment", styles["H1"]))
    story.append(Paragraph(
        f"Safety Score: <b>{safety['safety_score']}/100</b> &nbsp;|&nbsp; Risk Level: <b>{safety['risk_level']}</b>",
        styles["Body"],
    ))
    story.append(Spacer(1, 6))
    if safety["risks"]:
        for risk in safety["risks"]:
            story.append(Paragraph(
                f"<b>{risk['type']}</b> ({risk['severity'].title()} severity)",
                styles["Body"],
            ))
            story.append(Paragraph(risk["description"], styles["Small"]))
            story.append(Spacer(1, 4))
    story.append(Paragraph("Recommended Actions", styles["H2"]))
    for action in safety["actions"]:
        story.append(Paragraph(f"• {action}", styles["Bullet"]))

    story.append(Spacer(1, 14))

    # ── Disclaimer ──
    story.append(Paragraph(
        "<i>This report aggregates publicly available information from official Victorian government sources "
        "(consumer.vic.gov.au, energy.vic.gov.au, solar.vic.gov.au). It is not professional, legal, financial, "
        "compliance, safety, or tenancy advice. Rules can change. Always verify directly with Consumer Affairs "
        "Victoria, qualified tradespeople, and your own advisors.</i>",
        styles["Small"],
    ))

    doc.build(story)
    return buf.getvalue()


def generate_tenant_report(
    property_data: Dict[str, Any],
    health: Dict[str, Any],
    bills: Dict[str, Any],
    affordability: Dict[str, Any] = None,
) -> bytes:
    """Generate a tenant-focused PDF report."""
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        leftMargin=2 * cm, rightMargin=2 * cm,
        topMargin=1.5 * cm, bottomMargin=1.5 * cm,
        title="VicRentalHub Tenant Report",
    )
    styles = _build_styles()
    story = []

    story.append(_header_block(
        styles, "Tenant Property Report",
        f"VicRentalHub.ai • Generated {datetime.now().strftime('%d %B %Y')}",
    ))
    story.append(Spacer(1, 14))

    story.append(Paragraph("Property", styles["H1"]))
    rows = [
        ["Address", property_data.get("address", "—")],
        ["Bedrooms / Bathrooms", f"{property_data.get('bedrooms', '—')} / {property_data.get('bathrooms', '—')}"],
        ["Heating", property_data.get("heating", "—")],
        ["Hot Water", property_data.get("hot_water", "—")],
    ]
    story.append(_kv_table(rows))
    story.append(Spacer(1, 14))

    # Health check
    story.append(Paragraph("Property Health Check", styles["H1"]))
    story.append(Paragraph(f"Severity score: {health['severity_score']}/100", styles["Body"]))
    if health["issues_found"]:
        story.append(Paragraph("Issues Found", styles["H2"]))
        for issue in health["issues_found"]:
            story.append(Paragraph(
                f"<b>{issue['issue']}</b> ({issue['severity'].title()})",
                styles["Body"],
            ))
            story.append(Paragraph(f"Your right: {issue['tenant_right']}", styles["Small"]))
            story.append(Paragraph(f"Action: {issue['action']}", styles["Small"]))
            story.append(Spacer(1, 4))

    story.append(Paragraph("What You Should Do", styles["H2"]))
    for action in health["tenant_actions"]:
        story.append(Paragraph(f"• {action}", styles["Bullet"]))
    story.append(Spacer(1, 12))

    # Bills
    story.append(Paragraph("Estimated Annual Bills", styles["H1"]))
    rows = [
        ["Annual estimate", f"${bills['annual_estimate']:,}"],
        ["Monthly estimate", f"${bills['monthly_estimate']:,}"],
        ["Heating", f"${bills['breakdown']['heating']:,}"],
        ["Hot water", f"${bills['breakdown']['hot_water']:,}"],
        ["Other electricity", f"${bills['breakdown']['electricity_other']:,}"],
    ]
    story.append(_kv_table(rows))
    story.append(Spacer(1, 8))
    story.append(Paragraph("Tips to Lower Bills", styles["H2"]))
    for tip in bills["tips"]:
        story.append(Paragraph(f"• {tip}", styles["Bullet"]))

    if affordability:
        story.append(Spacer(1, 14))
        story.append(Paragraph("Affordability", styles["H1"]))
        rows = [
            ["Rent-to-income", f"{affordability['rent_to_income_pct']}%"],
            ["Stress level", affordability['stress_level'].title()],
            ["Recommended max rent", f"${affordability['recommended_max_rent']:.0f}/wk"],
            ["Monthly disposable", f"${affordability['monthly_disposable']:.0f}"],
        ]
        story.append(_kv_table(rows))
        story.append(Spacer(1, 6))
        for line in affordability["advice"]:
            story.append(Paragraph(f"• {line}", styles["Bullet"]))

    story.append(Spacer(1, 16))
    story.append(Paragraph(
        "<i>This report aggregates publicly available information from official Victorian government sources. "
        "It is not legal advice. For free help, contact Consumer Affairs Victoria (1300 558 181) or "
        "Tenants Victoria (tenantsvic.org.au).</i>",
        styles["Small"],
    ))

    doc.build(story)
    return buf.getvalue()
