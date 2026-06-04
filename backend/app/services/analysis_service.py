"""
analysis_service.py – Core compliance & analysis engine.
All 13 modules + advanced scoring features as pure functions.
"""

from datetime import datetime
from typing import Any, Dict, List, Tuple

from ..data.rules import (
    MINIMUM_RENTAL_STANDARDS,
    ENERGY_EFFICIENCY_STANDARDS,
    REBATES,
    HEATING_TYPES,
    HOT_WATER_TYPES,
    INSULATION_TYPES,
    SUBURB_PRICE_GUIDE,
    NEAR_UNI_SUBURBS,
)


# ─── 1. MINIMUM STANDARDS CHECK ────────────────────────────────────────
def check_standards(responses: Dict[str, str]) -> Dict[str, Any]:
    """Run the 15-point minimum standards check."""
    pass_count = 0
    fail_count = 0
    uncertain_count = 0
    results: List[Dict[str, Any]] = []
    failed: List[Dict[str, Any]] = []

    for standard in MINIMUM_RENTAL_STANDARDS:
        sid = str(standard["id"])
        response = responses.get(sid, "Uncertain")

        if response == "Yes – Compliant" or response == "yes":
            status = "pass"
            pass_count += 1
        elif response == "No – Non-Compliant" or response == "no":
            status = "fail"
            fail_count += 1
            failed.append({
                "id": standard["id"],
                "standard": standard["standard"],
                "description": standard["description"],
                "criminal_offence": standard["criminal_offence_if_breached"],
            })
        else:
            status = "uncertain"
            uncertain_count += 1

        results.append({
            "id": standard["id"],
            "standard": standard["standard"],
            "description": standard["description"],
            "effective_date": standard["effective_date"],
            "criminal_offence": standard["criminal_offence_if_breached"],
            "status": status,
            "questions": standard["questions"],
        })

    total = len(MINIMUM_RENTAL_STANDARDS)
    compliance_pct = int((pass_count / total) * 100) if total else 0

    return {
        "pass_count": pass_count,
        "fail_count": fail_count,
        "uncertain_count": uncertain_count,
        "total": total,
        "compliance_pct": compliance_pct,
        "can_advertise": fail_count == 0,
        "results": results,
        "failed_standards": failed,
    }


# ─── 2. SMART COMPLIANCE SCORE ─────────────────────────────────────────
def calculate_compliance_score(prop: Dict[str, Any], standards_result: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate the Smart Compliance Score™ (0–100) with breakdown."""
    breakdown: Dict[str, Dict[str, float]] = {}
    score = 0

    # 1. Minimum Standards (40 points)
    pass_count = standards_result.get("pass_count", 0)
    total_std = len(MINIMUM_RENTAL_STANDARDS)
    standards_score = int((pass_count / total_std) * 40) if total_std else 0
    score += standards_score
    breakdown["Minimum Standards"] = {
        "score": standards_score,
        "max": 40,
        "pct": round((pass_count / total_std) * 100, 1) if total_std else 0,
    }

    # 2. Energy Efficiency (30 points)
    ee_score = 0
    heating = prop.get("heating", "None")
    hot_water = prop.get("hot_water", "Gas Storage")
    insulation = prop.get("insulation", "None")

    if HEATING_TYPES.get(heating, {}).get("efficient"):
        ee_score += 10
    elif heating != "None":
        ee_score += 4

    if HOT_WATER_TYPES.get(hot_water, {}).get("efficient"):
        ee_score += 10

    if INSULATION_TYPES.get(insulation, {}).get("compliant_2027"):
        ee_score += 10
    elif insulation != "None":
        ee_score += 4

    score += ee_score
    breakdown["Energy Efficiency"] = {"score": ee_score, "max": 30, "pct": round(ee_score / 30 * 100, 1)}

    # 3. Safety & Condition (20 points)
    safety_score = 20
    if prop.get("mould"):
        safety_score -= 10
    if prop.get("draughts"):
        safety_score -= 5
    yb = prop.get("year_built")
    if yb and int(yb) < 1980:
        safety_score -= 5
    safety_score = max(0, safety_score)
    score += safety_score
    breakdown["Safety & Condition"] = {"score": safety_score, "max": 20, "pct": round(safety_score / 20 * 100, 1)}

    # 4. Sustainability (10 points)
    sus_score = 0
    if prop.get("solar"):
        sus_score += 5
    if prop.get("cooling") and prop.get("cooling") != "None":
        sus_score += 3
    if prop.get("water_efficient"):
        sus_score += 2
    score += sus_score
    breakdown["Sustainability"] = {"score": sus_score, "max": 10, "pct": round(sus_score / 10 * 100, 1)}

    # Grade & color
    if score >= 85:
        grade, color = "A — Excellent", "green"
    elif score >= 70:
        grade, color = "B — Good", "lime"
    elif score >= 55:
        grade, color = "C — Adequate", "amber"
    elif score >= 40:
        grade, color = "D — Below Standard", "orange"
    else:
        grade, color = "F — Non-Compliant", "red"

    summary = _generate_score_summary(score, breakdown, prop)

    return {
        "total": score,
        "grade": grade,
        "grade_color": color,
        "breakdown": breakdown,
        "summary": summary,
    }


def _generate_score_summary(score: int, breakdown: Dict, prop: Dict) -> str:
    weakest = min(breakdown.items(), key=lambda kv: kv[1]["pct"])
    if score >= 85:
        return f"Excellent compliance. Strongest area is {max(breakdown.items(), key=lambda kv: kv[1]['pct'])[0]}. Keep records updated for next inspection."
    if score >= 70:
        return f"Good compliance. Focus next on improving {weakest[0]} to reach an A grade."
    if score >= 55:
        return f"Adequate compliance. Significant gaps in {weakest[0]} ({weakest[1]['pct']}% of max). Plan upgrades before 2027 standards arrive."
    if score >= 40:
        return f"Below standard. {weakest[0]} is the biggest issue at {weakest[1]['pct']}% of max. Immediate action recommended."
    return "Property does not meet expected standards. Property may not be legally advertisable. Prioritise structural/safety issues first."


# ─── 3. ENERGY SCANNER ─────────────────────────────────────────────────
def energy_scanner(prop: Dict[str, Any]) -> Dict[str, Any]:
    heating = prop.get("heating", "None")
    hot_water = prop.get("hot_water", "Gas Storage")
    insulation = prop.get("insulation", "None")
    cooling = prop.get("cooling", "None")
    draughts = prop.get("draughts", False)

    h_info = HEATING_TYPES.get(heating, {})
    hw_info = HOT_WATER_TYPES.get(hot_water, {})
    ins_info = INSULATION_TYPES.get(insulation, {})

    # Score
    score = 0
    if h_info.get("efficient"):
        score += 30
    elif heating != "None":
        score += 10
    if hw_info.get("efficient"):
        score += 25
    if ins_info.get("compliant_2027"):
        score += 25
    if not draughts:
        score += 10
    if cooling and cooling != "None":
        score += 10

    # Timeline
    timeline = []
    for std in ENERGY_EFFICIENCY_STANDARDS:
        affected = False
        trig = std["trigger"].lower()
        if "gas heating" in trig and "gas" in heating.lower():
            affected = True
        elif "gas hot water" in trig and "gas" in hot_water.lower():
            affected = True
        elif "no ceiling insulation" in trig and insulation == "None":
            affected = True
        elif "new lease" in trig and std["id"] == "EE3":
            affected = True
        elif std["id"] == "EE4" and draughts:
            affected = True
        elif std["id"] == "EE5" and (not cooling or cooling == "None"):
            affected = True

        timeline.append({
            "id": std["id"],
            "requirement": std["requirement"],
            "effective_date": std["effective_date"],
            "applies_to": std["applies_to"],
            "description": std["description"],
            "cost_estimate": std["cost_estimate_text"],
            "cost_low": std["cost_estimate_low"],
            "cost_high": std["cost_estimate_high"],
            "affected": affected,
        })

    # Recommendations
    recs: List[str] = []
    if "gas" in heating.lower():
        recs.append("Plan to replace gas heater with reverse-cycle AC when it fails. Required from 1 March 2027.")
    if "gas" in hot_water.lower():
        recs.append("Plan to replace gas hot water with heat pump when it fails. Required from 1 March 2027.")
    if insulation == "None":
        recs.append("Install R5.0 ceiling insulation before next new lease. Required from 1 March 2027.")
    if draughts:
        recs.append("Install draught seals around doors, windows, and floorboards. Required at new leases from 1 July 2027.")
    if not cooling or cooling == "None":
        recs.append("Plan for efficient electric cooling in main living area. Required for ALL rentals by 1 July 2030.")
    if not recs:
        recs.append("Property meets known energy efficiency standards. Maintain records for next inspection.")

    # Total upgrade cost estimate (only affected items)
    total_low = sum(t["cost_low"] for t in timeline if t["affected"])
    total_high = sum(t["cost_high"] for t in timeline if t["affected"])

    return {
        "energy_score": min(100, score),
        "heating_status": {
            "type": heating,
            "efficient": h_info.get("efficient", False),
            "stars": h_info.get("stars", 0),
            "annual_cost": h_info.get("annual_cost", 0),
            "co2_kg": h_info.get("co2_kg", 0),
        },
        "hot_water_status": {
            "type": hot_water,
            "efficient": hw_info.get("efficient", False),
            "annual_cost": hw_info.get("annual_cost", 0),
            "co2_kg": hw_info.get("co2_kg", 0),
        },
        "insulation_status": {
            "type": insulation,
            "r_value": ins_info.get("r_value", 0),
            "compliant_2027": ins_info.get("compliant_2027", False),
        },
        "timeline": timeline,
        "recommendations": recs,
        "estimated_total_upgrade": {"low": total_low, "high": total_high},
    }


# ─── 4. ROI SIMULATOR ──────────────────────────────────────────────────
def roi_simulator(prop: Dict[str, Any]) -> Dict[str, Any]:
    heating = prop.get("heating", "Ducted Gas")
    hot_water = prop.get("hot_water", "Gas Storage")

    h_info = HEATING_TYPES.get(heating, {})
    hw_info = HOT_WATER_TYPES.get(hot_water, {})

    current = h_info.get("annual_cost", 0) + hw_info.get("annual_cost", 0)
    upgraded = HEATING_TYPES["Reverse Cycle AC"]["annual_cost"] + HOT_WATER_TYPES["Heat Pump"]["annual_cost"]
    annual_savings = max(0, current - upgraded)

    upgrade_low = 3500
    upgrade_high = 7000
    payback = (upgrade_low / annual_savings) if annual_savings > 0 else 99.0

    co2_current = h_info.get("co2_kg", 0) + hw_info.get("co2_kg", 0)
    co2_upgraded = HEATING_TYPES["Reverse Cycle AC"]["co2_kg"] + HOT_WATER_TYPES["Heat Pump"]["co2_kg"]
    co2_savings = max(0, co2_current - co2_upgraded)

    # 10-year savings chart
    chart_data = []
    cumulative = -upgrade_low
    for year in range(0, 11):
        if year > 0:
            cumulative += annual_savings
        chart_data.append({
            "year": year,
            "cumulative_savings": cumulative,
            "annual_cost_current": current * year,
            "annual_cost_upgraded": (upgrade_low + upgraded * year) if year > 0 else upgrade_low,
        })

    ten_year = annual_savings * 10 - upgrade_low

    return {
        "current_annual_cost": current,
        "upgraded_annual_cost": upgraded,
        "annual_savings": annual_savings,
        "upgrade_cost_low": upgrade_low,
        "upgrade_cost_high": upgrade_high,
        "payback_years": round(payback, 1),
        "co2_savings_kg": co2_savings,
        "ten_year_savings": ten_year,
        "chart_data": chart_data,
    }


# ─── 5. REBATE TRACKER ─────────────────────────────────────────────────
def find_rebates(prop: Dict[str, Any]) -> Dict[str, Any]:
    matches = []
    total_value = 0

    for rebate in REBATES:
        eligible = True
        reasons: List[str] = []

        if rebate["id"] == "R1":  # Solar for Rentals
            if prop.get("solar"):
                eligible = False
                reasons.append("Property already has solar panels.")
            else:
                reasons.append("No existing solar — eligible.")
            pv = prop.get("property_value")
            if pv and pv >= 3_000_000:
                eligible = False
                reasons.append(f"Property value (${pv:,.0f}) exceeds $3M cap.")
            elif pv:
                reasons.append(f"Property value (${pv:,.0f}) under $3M cap.")
        elif rebate["id"] == "R2":  # VEU
            reasons.append("Available for all Victorian residential properties.")
        elif rebate["id"] == "R3":  # Insulation
            ins = prop.get("insulation", "None")
            if INSULATION_TYPES.get(ins, {}).get("compliant_2027"):
                eligible = False
                reasons.append("Property already meets R5.0 insulation requirement.")
            else:
                reasons.append("Property needs better insulation — eligible.")

        if eligible:
            total_value += rebate.get("max_value", 0)

        matches.append({
            "rebate": rebate,
            "eligible": eligible,
            "reasons": reasons,
        })

    return {"matches": matches, "total_potential_value": total_value}


# ─── 6. SAFETY SCANNER ─────────────────────────────────────────────────
def safety_scan(prop: Dict[str, Any]) -> Dict[str, Any]:
    score = 100
    risks: List[Dict[str, Any]] = []
    actions: List[str] = []

    yb = prop.get("year_built")
    if yb and yb < 1980:
        score -= 15
        risks.append({
            "type": "Age",
            "severity": "medium",
            "description": f"Property built in {yb} — pre-1980 properties may have asbestos, lead paint, or aging electrical.",
        })
        actions.append("Commission asbestos and electrical safety inspection from licensed inspectors.")

    if prop.get("mould"):
        score -= 25
        risks.append({
            "type": "Mould",
            "severity": "high",
            "description": "Mould is a Minimum Standard breach if from structural cause. Health risk for tenants.",
        })
        actions.append("Engage licensed builder to identify and remediate the structural cause of mould.")

    if prop.get("draughts"):
        score -= 10
        risks.append({
            "type": "Draughts",
            "severity": "low",
            "description": "Draughts indicate gaps that increase energy bills and may signal weatherproofing issues.",
        })
        actions.append("Conduct draughtproofing assessment and seal gaps around doors, windows, and floorboards.")

    if "gas" in str(prop.get("heating", "")).lower():
        score -= 5
        risks.append({
            "type": "Gas Heating",
            "severity": "low",
            "description": "Gas appliances require annual safety check for carbon monoxide leaks.",
        })
        actions.append("Schedule annual gas appliance safety check by licensed gasfitter (Type A appliances).")

    if prop.get("heating") == "None":
        score -= 15
        risks.append({
            "type": "No Fixed Heating",
            "severity": "high",
            "description": "Minimum Standards require fixed heating in main living area from 25 Nov 2025.",
        })
        actions.append("Install fixed heater in main living area immediately — required by law.")

    score = max(0, score)
    if score >= 80:
        risk_level = "Low"
    elif score >= 60:
        risk_level = "Moderate"
    elif score >= 40:
        risk_level = "High"
    else:
        risk_level = "Critical"

    if not actions:
        actions.append("No critical safety risks identified. Maintain regular inspections.")

    return {
        "safety_score": score,
        "risk_level": risk_level,
        "risks": risks,
        "actions": actions,
    }


# ─── 7. COMPLIANCE TIMELINE ────────────────────────────────────────────
def compliance_timeline(prop: Dict[str, Any]) -> Dict[str, Any]:
    today = datetime.now()
    events: List[Dict[str, Any]] = []

    # Standards already in force
    events.append({
        "date": "25 November 2025",
        "title": "Minimum Rental Standards in Force",
        "description": "All 15 minimum standards must be met. Advertising non-compliant property is a criminal offence.",
        "priority": "high",
        "cost_estimate": "Variable",
        "affected": True,
    })

    events.append({
        "date": "1 December 2025",
        "title": "Window Covering Cord Safety",
        "description": "All blind/curtain cords must meet child safety standards (no accessible loops).",
        "priority": "medium",
        "cost_estimate": "$50–$300",
        "affected": True,
    })

    # 2027 standards
    energy = energy_scanner(prop)
    for item in energy["timeline"]:
        if "2027" in item["effective_date"] or "2030" in item["effective_date"]:
            events.append({
                "date": item["effective_date"],
                "title": item["requirement"],
                "description": item["description"],
                "priority": "high" if item["affected"] else "low",
                "cost_estimate": item["cost_estimate"],
                "affected": item["affected"],
            })

    # Find next action (earliest affected event)
    affected_events = [e for e in events if e["affected"]]
    next_action = affected_events[0] if affected_events else None

    return {"events": events, "next_action": next_action}


# ─── 8. PRE-AD AUDITOR ─────────────────────────────────────────────────
def pre_ad_audit(prop: Dict[str, Any], standards_responses: Dict[str, str]) -> Dict[str, Any]:
    standards = check_standards(standards_responses)
    blocking: List[str] = []
    warnings: List[str] = []
    recs: List[str] = []

    # Any failed standard blocks advertising
    for f in standards["failed_standards"]:
        blocking.append(f"FAIL — {f['standard']}: {f['description']} (Criminal offence if breached)")

    # Uncertain items become warnings
    if standards["uncertain_count"] > 0:
        warnings.append(f"{standards['uncertain_count']} standards marked as Uncertain. Verify before advertising.")

    # Energy issues are warnings (not blockers yet)
    if prop.get("heating") == "None":
        blocking.append("No fixed heating in main living area — Minimum Standard violation.")
    if prop.get("mould"):
        blocking.append("Mould present — likely Minimum Standard breach if structural cause.")

    if "gas" in str(prop.get("heating", "")).lower():
        warnings.append("Gas heating: when it fails, must replace with efficient electric (1 Mar 2027).")
    if prop.get("insulation") == "None":
        warnings.append("No insulation: R5.0 required at next new lease from 1 March 2027.")

    if not blocking:
        recs.append("Property appears advertisable. Take quality photos and ensure listing mentions energy features.")
    else:
        recs.append("Resolve all blocking issues before advertising — advertising non-compliant property is a CRIMINAL OFFENCE.")
    recs.append("Engage Consumer Affairs Victoria to confirm compliance status if uncertain.")

    risk_score = len(blocking) * 30 + len(warnings) * 5
    risk_score = min(100, risk_score)

    return {
        "can_advertise": len(blocking) == 0,
        "blocking_issues": blocking,
        "warnings": warnings,
        "recommendations": recs,
        "risk_score": risk_score,
    }


# ─── 9. PROPERTY HEALTH CHECKER (Tenant) ──────────────────────────────
def property_health_check(prop: Dict[str, Any], issues: List[str]) -> Dict[str, Any]:
    """For tenants — what should the landlord fix?"""
    issues_found: List[Dict[str, Any]] = []
    landlord_must_fix: List[Dict[str, Any]] = []
    tenant_actions: List[str] = []
    severity = 0

    issue_lower = [i.lower() for i in issues]
    full_issue_text = " ".join(issue_lower)

    if "mould" in full_issue_text or prop.get("mould"):
        item = {
            "issue": "Mould or damp",
            "severity": "high",
            "tenant_right": "Landlord must remediate if caused by structural defects (Minimum Standard 3).",
            "action": "Notify landlord in writing. Document with photos. Request urgent repair.",
        }
        issues_found.append(item)
        landlord_must_fix.append(item)
        severity += 30

    if "no heating" in full_issue_text or "no heater" in full_issue_text or prop.get("heating") == "None":
        item = {
            "issue": "No fixed heating in main living area",
            "severity": "high",
            "tenant_right": "Required by Minimum Standard 7 (effective 25 Nov 2025).",
            "action": "Notify landlord in writing. This is an URGENT repair — landlord must act immediately.",
        }
        issues_found.append(item)
        landlord_must_fix.append(item)
        severity += 30

    if "no hot water" in full_issue_text or "hot water" in full_issue_text:
        item = {
            "issue": "No hot water",
            "severity": "high",
            "tenant_right": "Urgent repair — landlord must respond immediately.",
            "action": "If landlord unreachable for 24 hrs, you may arrange repair up to $2,500 and claim reimbursement.",
        }
        issues_found.append(item)
        landlord_must_fix.append(item)
        severity += 25

    if "draught" in full_issue_text or prop.get("draughts"):
        item = {
            "issue": "Draughts",
            "severity": "medium",
            "tenant_right": "Draughtproofing required at new leases from 1 July 2027.",
            "action": "Request landlord arrange draught seals on next lease renewal.",
        }
        issues_found.append(item)
        landlord_must_fix.append(item)
        severity += 10

    if "lock" in full_issue_text or "broken lock" in full_issue_text:
        item = {
            "issue": "Broken or insecure locks",
            "severity": "high",
            "tenant_right": "Minimum Standard 4 — secure locks required on all external doors.",
            "action": "URGENT. Notify landlord and request immediate repair.",
        }
        issues_found.append(item)
        landlord_must_fix.append(item)
        severity += 25

    if "smoke alarm" in full_issue_text or "no smoke" in full_issue_text:
        item = {
            "issue": "Smoke alarm not working",
            "severity": "high",
            "tenant_right": "Minimum Standard 8 — working smoke alarms on each level required.",
            "action": "URGENT. Notify landlord — they must test and ensure working alarms.",
        }
        issues_found.append(item)
        landlord_must_fix.append(item)
        severity += 25

    # Generic tenant actions
    tenant_actions.append("Always notify landlord in writing (email/SMS), keep copies.")
    tenant_actions.append("Take dated photos and short videos of issues.")
    tenant_actions.append("Allow landlord 14 days for non-urgent repairs; urgent repairs require immediate response.")
    tenant_actions.append("If landlord doesn't respond, contact Consumer Affairs Victoria or apply to VCAT.")
    tenant_actions.append("Never withhold rent — this can lead to eviction. Use proper VCAT process instead.")

    return {
        "issues_found": issues_found,
        "landlord_must_fix": landlord_must_fix,
        "tenant_actions": tenant_actions,
        "severity_score": min(100, severity),
    }


# ─── 10. BILL & COMFORT PREDICTOR ─────────────────────────────────────
def predict_bills(prop: Dict[str, Any], occupants: int = 2) -> Dict[str, Any]:
    heating = prop.get("heating", "None")
    hot_water = prop.get("hot_water", "Gas Storage")
    insulation = prop.get("insulation", "None")

    h_cost = HEATING_TYPES.get(heating, {}).get("annual_cost", 800)
    hw_cost = HOT_WATER_TYPES.get(hot_water, {}).get("annual_cost", 800)
    base_electricity = 600 + (occupants - 1) * 200

    # Insulation modifier
    if insulation == "None":
        h_cost = int(h_cost * 1.3)  # 30% more without insulation
    elif INSULATION_TYPES.get(insulation, {}).get("compliant_2027"):
        h_cost = int(h_cost * 0.85)

    # Draughts increase heating cost
    if prop.get("draughts"):
        h_cost = int(h_cost * 1.15)

    # Solar reduces electricity bill
    if prop.get("solar"):
        base_electricity = int(base_electricity * 0.5)

    annual = h_cost + hw_cost + base_electricity
    monthly = round(annual / 12)

    # Compare to efficient benchmark
    efficient = HEATING_TYPES["Reverse Cycle AC"]["annual_cost"] + HOT_WATER_TYPES["Heat Pump"]["annual_cost"] + 500
    diff = annual - efficient

    tips = []
    if "gas" in heating.lower():
        tips.append(f"Switching to reverse-cycle AC could save ~${h_cost - HEATING_TYPES['Reverse Cycle AC']['annual_cost']}/yr.")
    if "gas" in hot_water.lower() or "Electric Storage" in hot_water:
        tips.append(f"Heat pump hot water saves ~${hw_cost - HOT_WATER_TYPES['Heat Pump']['annual_cost']}/yr.")
    if insulation == "None":
        tips.append("Insulation alone could cut heating costs by 25–30%.")
    if not prop.get("solar"):
        tips.append("Solar panels (eligible for $1,400 rebate) could halve your electricity bill.")
    tips.append("Energy.vic.gov.au has free home energy assessments for Victorians.")

    return {
        "annual_estimate": annual,
        "monthly_estimate": monthly,
        "breakdown": {
            "heating": h_cost,
            "hot_water": hw_cost,
            "electricity_other": base_electricity,
        },
        "comparison_to_efficient": diff,
        "tips": tips,
    }


# ─── 11. NEGOTIATION BOOSTER (Tenant) ─────────────────────────────────
def negotiation_booster(scenario: str, context: str = "") -> Dict[str, Any]:
    SCENARIOS = {
        "rent_increase": {
            "talking_points": [
                "Confirm the rent increase complies with rules: only once every 12 months, with 60 days written notice.",
                "Research recent comparable rents in your suburb to argue if the increase is excessive.",
                "Highlight your record as a reliable tenant: on-time rent, property maintenance.",
                "Propose a smaller increase or a longer fixed term in exchange for stability.",
                "Note that excessive increases can be challenged at VCAT.",
            ],
            "sample_email": (
                "Subject: Proposed Rent Increase – Discussion Request\n\n"
                "Dear [Landlord/Agent],\n\n"
                "Thank you for your notice dated [date] regarding the proposed rent increase to $[amount]/week.\n\n"
                "I have been a reliable tenant since [start date], paying rent on time and maintaining the property in good condition. "
                "After researching comparable rents in [suburb], I believe a more modest increase to $[counter]/week would better reflect the local market.\n\n"
                "I would appreciate the opportunity to discuss this. I'm also open to discussing a longer fixed term in exchange for a reduced increase.\n\n"
                "Kind regards,\n[Your Name]"
            ),
            "escalation_path": [
                "1. Negotiate directly with landlord in writing.",
                "2. Contact Consumer Affairs Victoria for advice (1300 558 181).",
                "3. Apply to VCAT to challenge an excessive increase (within 30 days of notice).",
                "4. Tenants Victoria offers free advice and support.",
            ],
        },
        "repairs": {
            "talking_points": [
                "Distinguish urgent (immediate) from non-urgent (14-day response) repairs.",
                "Document the issue with dated photos and a written description.",
                "Send a formal repair request in writing — keep records.",
                "Reference the specific Minimum Rental Standard if applicable.",
                "If landlord ignores: you can apply to VCAT for repair orders.",
            ],
            "sample_email": (
                "Subject: Repair Request – [Issue]\n\n"
                "Dear [Landlord/Agent],\n\n"
                "I'm writing to formally request repair of [issue] at [address]. The issue first appeared on [date] and "
                "[describe impact – e.g., affecting hot water, causing health concerns from mould].\n\n"
                "Under the Residential Tenancies Act, this is a [urgent / non-urgent] repair. I have attached photos.\n\n"
                "Could you please confirm by [date] when this will be repaired?\n\n"
                "Kind regards,\n[Your Name]"
            ),
            "escalation_path": [
                "1. Written request to landlord/agent.",
                "2. If urgent and no response within 24 hrs: arrange repair yourself (up to $2,500) and claim reimbursement.",
                "3. Apply to VCAT for repair order (free for tenants).",
                "4. Contact Consumer Affairs Victoria (1300 558 181).",
            ],
        },
        "bond_dispute": {
            "talking_points": [
                "Bond is held by RTBA — landlord cannot keep it without your consent or VCAT order.",
                "Document property condition with the entry condition report and exit photos.",
                "Fair wear and tear is NOT deductible from your bond.",
                "Landlord must provide receipts for any cleaning or repair claims.",
                "You have a right to challenge any deductions at VCAT.",
            ],
            "sample_email": (
                "Subject: Bond Refund Request – [Address]\n\n"
                "Dear [Landlord/Agent],\n\n"
                "Following my vacating of [address] on [date], I am requesting full return of my bond ($[amount]) held by RTBA.\n\n"
                "I have left the property in the condition agreed at the start of tenancy, accounting for fair wear and tear. "
                "Attached are dated photos taken on [exit date].\n\n"
                "If you intend to claim any deductions, please provide itemised receipts and a written explanation. "
                "Otherwise, please sign the RTBA bond release form for full refund.\n\n"
                "Kind regards,\n[Your Name]"
            ),
            "escalation_path": [
                "1. Submit RTBA bond claim independently if landlord delays.",
                "2. RTBA will notify landlord — if they don't dispute within 14 days, bond is released.",
                "3. If disputed: VCAT hearing (low cost, often within 4–6 weeks).",
                "4. Tenants Victoria can assist with VCAT preparation.",
            ],
        },
        "non_renewal": {
            "talking_points": [
                "Confirm landlord's reason — 'no fault' notices have specific allowed grounds.",
                "Check the notice period: 60–120 days depending on reason.",
                "Notice must be in writing on the proper Form.",
                "If reason is questionable, you may challenge at VCAT.",
                "Use the time to find new accommodation and request a reference.",
            ],
            "sample_email": (
                "Subject: Notice to Vacate – Clarification & Reference Request\n\n"
                "Dear [Landlord/Agent],\n\n"
                "I have received your Notice to Vacate dated [date], citing [reason]. Could you please confirm:\n\n"
                "1. The exact section of the Residential Tenancies Act this notice is issued under.\n"
                "2. Confirmation that the proper Form has been used.\n\n"
                "Additionally, given my record as a reliable tenant, I would appreciate a written reference for future rentals.\n\n"
                "Kind regards,\n[Your Name]"
            ),
            "escalation_path": [
                "1. Verify notice form and notice period are correct.",
                "2. If notice appears invalid: apply to VCAT to challenge.",
                "3. Contact Tenants Victoria for advice on specific grounds.",
                "4. Begin search for new property — don't rely solely on challenge succeeding.",
            ],
        },
    }

    data = SCENARIOS.get(scenario)
    if not data:
        return {
            "talking_points": ["Unknown scenario. Choose: rent_increase, repairs, bond_dispute, non_renewal."],
            "sample_email": "",
            "escalation_path": [],
        }
    return data


# ─── 12. AFFORDABILITY STRESS INDEX ───────────────────────────────────
def affordability_check(weekly_income: float, weekly_rent: float) -> Dict[str, Any]:
    if weekly_income <= 0:
        return {
            "rent_to_income_pct": 0,
            "stress_level": "unknown",
            "recommended_max_rent": 0,
            "monthly_disposable": 0,
            "advice": ["Enter a valid income to assess affordability."],
        }

    pct = (weekly_rent / weekly_income) * 100
    recommended_max = round(weekly_income * 0.30, 2)
    monthly_disposable = round((weekly_income - weekly_rent) * 4.33, 2)

    if pct < 25:
        level = "safe"
        advice = ["Your rent-to-income ratio is healthy. You have buffer for savings and unexpected costs."]
    elif pct < 30:
        level = "moderate"
        advice = ["You're at the standard 'affordable' boundary. Aim to keep costs at or below current."]
    elif pct < 40:
        level = "high"
        advice = [
            "You're in housing stress (>30% of income). Consider:",
            "Cheaper suburb in same region",
            "Sharing with a flatmate to halve rent",
            "Centrelink Rent Assistance if eligible",
        ]
    else:
        level = "extreme"
        advice = [
            "You're in EXTREME housing stress (>40% of income). Urgent action needed:",
            "Contact a financial counsellor (free): 1800 007 007",
            "Apply for Centrelink Rent Assistance",
            "Investigate community housing options via Housing.vic.gov.au",
            "Consider sharing or moving to a more affordable suburb",
        ]

    return {
        "rent_to_income_pct": round(pct, 1),
        "stress_level": level,
        "recommended_max_rent": recommended_max,
        "monthly_disposable": monthly_disposable,
        "advice": advice,
    }


# ─── 13. ESG RATING ───────────────────────────────────────────────────
def esg_rating(prop: Dict[str, Any]) -> Dict[str, Any]:
    # Environmental
    e_score = 0
    if HEATING_TYPES.get(prop.get("heating", ""), {}).get("efficient"):
        e_score += 25
    if HOT_WATER_TYPES.get(prop.get("hot_water", ""), {}).get("efficient"):
        e_score += 20
    if INSULATION_TYPES.get(prop.get("insulation", ""), {}).get("compliant_2027"):
        e_score += 20
    if prop.get("solar"):
        e_score += 25
    if prop.get("water_efficient"):
        e_score += 10

    # Social (tenant-affecting)
    s_score = 100
    if prop.get("mould"):
        s_score -= 30
    if prop.get("draughts"):
        s_score -= 15
    if prop.get("heating") == "None":
        s_score -= 30
    yb = prop.get("year_built")
    if yb and yb < 1980:
        s_score -= 10
    s_score = max(0, s_score)

    # Governance (compliance with regulations)
    g_score = 60  # baseline
    if HEATING_TYPES.get(prop.get("heating", ""), {}).get("efficient"):
        g_score += 10
    if INSULATION_TYPES.get(prop.get("insulation", ""), {}).get("compliant_2027"):
        g_score += 15
    if prop.get("cooling") and prop.get("cooling") != "None":
        g_score += 15
    g_score = min(100, g_score)

    overall = round((e_score + s_score + g_score) / 3)

    def grade(s):
        if s >= 85:
            return "A"
        if s >= 70:
            return "B"
        if s >= 55:
            return "C"
        if s >= 40:
            return "D"
        return "F"

    return {
        "overall_grade": grade(overall),
        "overall_score": overall,
        "environmental": {"score": e_score, "grade": grade(e_score)},
        "social": {"score": s_score, "grade": grade(s_score)},
        "governance": {"score": g_score, "grade": grade(g_score)},
    }


# ─── 14. LISTING OPTIMISER ─────────────────────────────────────────────
def listing_optimiser(prop: Dict[str, Any], style: str = "professional") -> Dict[str, Any]:
    bedrooms = prop.get("bedrooms", 2)
    bathrooms = prop.get("bathrooms", 1)
    suburb = prop.get("suburb") or _extract_suburb(prop.get("address", ""))
    heating = prop.get("heating", "None")
    insulation = prop.get("insulation", "None")
    has_solar = prop.get("solar", False)

    # Headline
    energy_features = []
    if HEATING_TYPES.get(heating, {}).get("efficient"):
        energy_features.append("efficient heating")
    if INSULATION_TYPES.get(insulation, {}).get("compliant_2027"):
        energy_features.append("R5.0 insulation")
    if has_solar:
        energy_features.append("solar panels")
    if prop.get("water_efficient"):
        energy_features.append("water-efficient fixtures")

    if energy_features:
        headline = f"Modern {bedrooms}-Bedroom Home with {energy_features[0].title()} in {suburb}"
    else:
        headline = f"Comfortable {bedrooms}-Bedroom {bathrooms}-Bathroom Property in {suburb}"

    # Description
    intro = f"Welcome to this welcoming {bedrooms}-bedroom, {bathrooms}-bathroom property located in the heart of {suburb}."
    energy_text = ""
    if energy_features:
        energy_text = f" The property features {', '.join(energy_features)}, helping keep energy bills low and meeting upcoming Victorian rental standards."
    closing = " Inspections by appointment. Apply via the rental application portal."

    description = intro + energy_text + closing

    # Bullet points
    bullets = [
        f"{bedrooms} bedrooms, {bathrooms} bathroom{'s' if bathrooms > 1 else ''}",
    ]
    if heating != "None":
        bullets.append(f"{heating} heating")
    if insulation != "None":
        bullets.append(f"{insulation} insulation")
    if has_solar:
        bullets.append("Solar panels installed")
    if prop.get("water_efficient"):
        bullets.append("Water-efficient fixtures (4-star showerheads)")
    if prop.get("cooling") and prop.get("cooling") != "None":
        bullets.append(f"{prop.get('cooling')} cooling")
    bullets.append("Compliant with current Victorian Minimum Rental Standards")

    # SEO keywords
    keywords = [
        f"{bedrooms} bedroom {suburb} rental",
        f"{suburb} energy efficient rental",
        f"{suburb} property for rent",
        "Victorian compliant rental",
    ]
    if has_solar:
        keywords.append("solar rental Melbourne")

    return {
        "headline": headline,
        "description": description,
        "bullet_points": bullets,
        "seo_keywords": keywords,
    }


def _extract_suburb(address: str) -> str:
    if not address:
        return "Melbourne"
    # Try to find a suburb in the address
    for suburb in SUBURB_PRICE_GUIDE:
        if suburb.lower() in address.lower():
            return suburb
    # Otherwise use the part before VIC
    if "VIC" in address.upper():
        before_vic = address.upper().split("VIC")[0].strip().rstrip(",").strip()
        parts = before_vic.split(",")
        if parts:
            return parts[-1].strip().title()
    return "Melbourne"
