"""
rules.py – Hardcoded Victorian Rental Regulations
All data sourced from official Victorian government sources.
Source of truth: consumer.vic.gov.au, energy.vic.gov.au, solar.vic.gov.au
"""

DISCLAIMER = (
    "This tool aggregates publicly available information from official Victorian government "
    "sources. It is NOT professional, legal, financial, compliance, safety, or tenancy advice. "
    "Rules can change. Always verify directly with Consumer Affairs Victoria, Tenants Victoria, "
    "qualified tradespeople, and your own advisors. You remain fully responsible for your "
    "decisions, compliance, and safety."
)

# ─── 15 MINIMUM RENTAL STANDARDS ─────────────────────────────────────────
MINIMUM_RENTAL_STANDARDS = [
    {
        "id": 1,
        "standard": "Structural Soundness",
        "description": "Walls, ceilings, floors, and roof must be in good condition.",
        "effective_date": "25 November 2025",
        "criminal_offence_if_breached": True,
        "questions": [
            "Are there cracks in walls or ceilings?",
            "Is the roof intact with no leaks?",
            "Are floors structurally safe?",
        ],
    },
    {
        "id": 2,
        "standard": "Weatherproofing",
        "description": "No water penetration through walls, roof, windows, or doors.",
        "effective_date": "25 November 2025",
        "criminal_offence_if_breached": True,
        "questions": [
            "Are there signs of water penetration?",
            "Do doors and windows seal properly?",
        ],
    },
    {
        "id": 3,
        "standard": "No Significant Mould or Damp",
        "description": "No significant mould caused by structural defects. Landlord must remediate structural causes.",
        "effective_date": "25 November 2025",
        "criminal_offence_if_breached": True,
        "questions": [
            "Is there visible mould on walls, ceilings, or floors?",
            "Is there evidence of ongoing dampness?",
        ],
    },
    {
        "id": 4,
        "standard": "Secure Locks on External Doors",
        "description": "All external doors must have working locks approved under the Residential Tenancies Act.",
        "effective_date": "25 November 2025",
        "criminal_offence_if_breached": True,
        "questions": [
            "Do all external doors have functioning locks?",
            "Are locks deadlocks or equivalent?",
        ],
    },
    {
        "id": 5,
        "standard": "Ventilation in Bathrooms and Kitchens",
        "description": "Adequate ventilation (opening windows or mechanical exhaust fans) in bathrooms and kitchens.",
        "effective_date": "25 November 2025",
        "criminal_offence_if_breached": True,
        "questions": [
            "Does the bathroom have an opening window or exhaust fan?",
            "Does the kitchen have an opening window or exhaust fan?",
        ],
    },
    {
        "id": 6,
        "standard": "Electrical Safety Switches (RCD)",
        "description": "At least one safety switch (RCD) must protect power circuits.",
        "effective_date": "25 November 2025",
        "criminal_offence_if_breached": True,
        "questions": [
            "Is there at least one RCD safety switch on the switchboard?",
            "Has electrical safety been recently checked?",
        ],
    },
    {
        "id": 7,
        "standard": "Fixed Heating in Main Living Area",
        "description": "A fixed (non-portable) heater must be installed and working in the main living area. Minimum 2-star rating.",
        "effective_date": "25 November 2025",
        "criminal_offence_if_breached": True,
        "questions": [
            "Is there a fixed (non-portable) heater in the main living area?",
            "Is the heater in working condition?",
        ],
    },
    {
        "id": 8,
        "standard": "Smoke Alarms",
        "description": "Working smoke alarms on each level. Tested before each tenancy.",
        "effective_date": "25 November 2025",
        "criminal_offence_if_breached": True,
        "questions": [
            "Are smoke alarms installed on each level?",
            "Have smoke alarms been tested recently?",
        ],
    },
    {
        "id": 9,
        "standard": "Toilet and Bathroom Facilities",
        "description": "Functioning toilet, washbasin, and bath or shower.",
        "effective_date": "25 November 2025",
        "criminal_offence_if_breached": True,
        "questions": [
            "Is the toilet in working order?",
            "Is there a functioning washbasin?",
            "Is there a working bath or shower?",
        ],
    },
    {
        "id": 10,
        "standard": "Kitchen Facilities",
        "description": "Working sink with hot and cold water, working stove with oven and cooktop.",
        "effective_date": "25 November 2025",
        "criminal_offence_if_breached": True,
        "questions": [
            "Is there a working kitchen sink with hot and cold water?",
            "Is there a working cooktop and oven?",
        ],
    },
    {
        "id": 11,
        "standard": "Laundry Facilities",
        "description": "Working laundry tub or washing machine connection where points exist.",
        "effective_date": "25 November 2025",
        "criminal_offence_if_breached": True,
        "questions": [
            "Is there a working laundry tub?",
            "Are washing machine connection points available and working?",
        ],
    },
    {
        "id": 12,
        "standard": "Lighting",
        "description": "Adequate lighting in all habitable rooms and common areas.",
        "effective_date": "25 November 2025",
        "criminal_offence_if_breached": True,
        "questions": [
            "Is there adequate lighting in all rooms?",
            "Are outdoor areas adequately lit?",
        ],
    },
    {
        "id": 13,
        "standard": "Vermin-Proof Bins",
        "description": "Adequate vermin-proof waste disposal must be provided.",
        "effective_date": "25 November 2025",
        "criminal_offence_if_breached": True,
        "questions": ["Are there adequate, vermin-proof bins?"],
    },
    {
        "id": 14,
        "standard": "Window Latches",
        "description": "All windows must have functioning latches for security.",
        "effective_date": "25 November 2025",
        "criminal_offence_if_breached": True,
        "questions": ["Do all windows have working latches?"],
    },
    {
        "id": 15,
        "standard": "Window Coverings (Child-Safe Cords)",
        "description": "Window coverings in bedrooms and living areas. From 1 December 2025, all cords must meet child safety standards.",
        "effective_date": "1 December 2025",
        "criminal_offence_if_breached": True,
        "questions": [
            "Are window coverings provided in all bedrooms and living areas?",
            "Do blind/curtain cords meet child safety standards (no accessible loops)?",
        ],
    },
]

# ─── ENERGY EFFICIENCY STANDARDS (2027 / 2030) ────────────────────────────
ENERGY_EFFICIENCY_STANDARDS = [
    {
        "id": "EE1",
        "requirement": "Efficient Electric Heating/Hot Water (when gas fails)",
        "trigger": "When gas heating or hot water system fails",
        "effective_date": "1 March 2027",
        "applies_to": "New AND existing leases",
        "description": "When a gas heater or gas hot water system fails, landlord must replace with an efficient electric alternative (reverse-cycle AC, heat pump hot water).",
        "cost_estimate_low": 1500,
        "cost_estimate_high": 4500,
        "cost_estimate_text": "$1,500–$4,500 depending on system",
    },
    {
        "id": "EE2",
        "requirement": "Ceiling Insulation (R5.0 minimum)",
        "trigger": "At new lease where no ceiling insulation exists",
        "effective_date": "1 March 2027",
        "applies_to": "New leases only",
        "description": "From 1 March 2027, properties without ceiling insulation must install minimum R5.0 ceiling insulation at start of new lease.",
        "cost_estimate_low": 1200,
        "cost_estimate_high": 3500,
        "cost_estimate_text": "$1,200–$3,500 for average Victorian home",
    },
    {
        "id": "EE3",
        "requirement": "4-Star Water-Efficient Showerheads",
        "trigger": "At new lease or showerhead replacement",
        "effective_date": "1 March 2027",
        "applies_to": "New leases",
        "description": "Showerheads must meet minimum 4-star WELS rating at new leases from 1 March 2027.",
        "cost_estimate_low": 30,
        "cost_estimate_high": 150,
        "cost_estimate_text": "$30–$150 per showerhead",
    },
    {
        "id": "EE4",
        "requirement": "Draughtproofing",
        "trigger": "At new lease",
        "effective_date": "1 July 2027",
        "applies_to": "New leases",
        "description": "Adequate draughtproofing at new leases from 1 July 2027 (sealing gaps around doors, windows, floorboards).",
        "cost_estimate_low": 200,
        "cost_estimate_high": 1500,
        "cost_estimate_text": "$200–$1,500",
    },
    {
        "id": "EE5",
        "requirement": "Efficient Electric Cooling (main living area)",
        "trigger": "ALL rental properties",
        "effective_date": "1 July 2030",
        "applies_to": "ALL existing and new leases",
        "description": "By 1 July 2030, all rental properties must have efficient electric cooling (reverse-cycle AC) in the main living area.",
        "cost_estimate_low": 1000,
        "cost_estimate_high": 3000,
        "cost_estimate_text": "$1,000–$3,000 supply + install",
    },
]

# ─── REBATES ─────────────────────────────────────────────────────────────
REBATES = [
    {
        "id": "R1",
        "name": "Solar for Rentals – Solar Panel Rebate",
        "amount": "Up to $1,400 + interest-free loan",
        "max_value": 1400,
        "eligibility": {
            "tenant_household_income": "Under $210,000/yr combined",
            "property_value": "Under $3,000,000",
            "limit_per_landlord": "Maximum 2 properties per year",
            "existing_solar": "Must not already have solar",
        },
        "description": "Victorian Government rebate for landlords installing solar on rentals.",
        "source": "solar.vic.gov.au",
        "url": "https://www.solar.vic.gov.au/solar-for-rentals",
    },
    {
        "id": "R2",
        "name": "Victorian Energy Upgrades (VEU) – Heating/Cooling",
        "amount": "Discounted/free upgrades via accredited providers",
        "max_value": 2000,
        "eligibility": {
            "property_type": "Victorian residential",
            "income": "Various tiers — some targeted at low-income",
        },
        "description": "Subsidised efficient heating, cooling, and hot water through VEU providers.",
        "source": "energy.vic.gov.au",
        "url": "https://www.energy.vic.gov.au/households/victorian-energy-upgrades",
    },
    {
        "id": "R3",
        "name": "Rental Property Insulation Rebate",
        "amount": "Subsidy via VEU program",
        "max_value": 1000,
        "eligibility": {
            "property_type": "Victorian rental properties",
            "insulation_status": "Currently uninsulated or under-insulated",
        },
        "description": "Subsidised ceiling insulation for rental properties via VEU.",
        "source": "energy.vic.gov.au",
        "url": "https://www.energy.vic.gov.au/households/victorian-energy-upgrades",
    },
]

# ─── TENANT RIGHTS ────────────────────────────────────────────────────────
TENANT_RIGHTS = {
    "urgent_repairs": {
        "title": "Urgent Repairs",
        "definition": "Repairs needed for health, safety, or security of tenant.",
        "examples": [
            "Burst pipe",
            "No hot water",
            "No heating in winter",
            "Broken locks",
            "Dangerous electrical fault",
            "Gas leak",
            "Sewerage failure",
        ],
        "landlord_response_time": "Must arrange immediately",
        "tenant_can_arrange": "If landlord unreachable for 24 hours, tenant can arrange repairs up to $2,500 and claim reimbursement.",
    },
    "non_urgent_repairs": {
        "title": "Non-Urgent Repairs",
        "definition": "Repairs needed but not immediately dangerous.",
        "landlord_response_time": "Landlord must respond within 14 days.",
        "process": "Notify landlord in writing. If not fixed, apply to VCAT.",
    },
    "rent_increases": {
        "title": "Rent Increases",
        "frequency": "Maximum once every 12 months.",
        "notice_required": "60 days written notice required.",
        "cap": "No legislated cap (market rent), but excessive increases can be challenged at VCAT.",
    },
    "inspections": {
        "title": "Property Inspections",
        "notice_required": "Minimum 24 hours, maximum 7 days written notice.",
        "frequency": "Maximum once per 6 months for routine inspections.",
        "entry_times": "Between 8am–6pm Monday–Saturday only (not public holidays).",
    },
    "bond": {
        "title": "Bond",
        "maximum": "Maximum 1 month rent (for weekly rent under $900/week).",
        "held_by": "Residential Tenancies Bond Authority (RTBA), not the landlord.",
        "return": "Must be returned within 10 business days after lease ends unless dispute.",
    },
    "eviction": {
        "title": "Eviction Notices",
        "no_fault_notice": "Landlord can issue 'notice to vacate' without fault only in specific circumstances.",
        "minimum_notice": "60–120 days depending on reason.",
        "illegal_eviction": "Landlord cannot change locks, remove belongings, or harass tenant — this is illegal.",
    },
    "resources": [
        {"name": "Consumer Affairs Victoria", "url": "https://www.consumer.vic.gov.au"},
        {"name": "Tenants Victoria", "url": "https://www.tenantsvic.org.au"},
        {"name": "VCAT", "url": "https://www.vcat.vic.gov.au"},
        {"name": "Energy & Water Ombudsman Victoria", "url": "https://www.ewov.com.au"},
        {"name": "RTBA (Bond Authority)", "url": "https://www.rtba.vic.gov.au"},
    ],
}

# ─── PRICING TIERS ────────────────────────────────────────────────────────
PRICING = {
    "tenant": {
        "id": "tenant",
        "price": 0,
        "label": "Tenant – Free",
        "currency": "AUD",
        "interval": "forever",
        "features": [
            "All tenant modules",
            "Property health checker",
            "Rights guide",
            "Bill predictor",
            "Affordable rental finder",
        ],
    },
    "landlord_report": {
        "id": "landlord_report",
        "price": 14.99,
        "label": "One-Time Report",
        "currency": "AUD",
        "interval": "one-time",
        "features": [
            "Full compliance report",
            "PDF download",
            "Compliance score",
            "Rebate finder",
        ],
    },
    "landlord_pro": {
        "id": "landlord_pro",
        "price": 29.00,
        "label": "Pro Monthly",
        "currency": "AUD",
        "interval": "month",
        "features": [
            "Unlimited reports",
            "Portfolio dashboard",
            "AI insights",
            "Email reminders",
            "All landlord modules",
        ],
    },
    "agency": {
        "id": "agency",
        "price": 99.00,
        "label": "Agency Monthly",
        "currency": "AUD",
        "interval": "month",
        "features": [
            "Everything in Pro",
            "Up to 50 properties",
            "White-label reports",
            "Priority support",
            "Suburb intelligence",
        ],
    },
}

# ─── HEATING / HOT WATER / INSULATION CATALOGUES ──────────────────────────
HEATING_TYPES = {
    "Ducted Gas": {"efficient": False, "stars": 2, "annual_cost": 1400, "co2_kg": 3200},
    "Split System (Electric)": {"efficient": True, "stars": 5, "annual_cost": 600, "co2_kg": 900},
    "Reverse Cycle AC": {"efficient": True, "stars": 5, "annual_cost": 600, "co2_kg": 900},
    "Gas Space Heater": {"efficient": False, "stars": 2, "annual_cost": 1200, "co2_kg": 2800},
    "Electric Radiant/Panel": {"efficient": False, "stars": 2, "annual_cost": 1800, "co2_kg": 2700},
    "Wood Heater": {"efficient": False, "stars": 1, "annual_cost": 800, "co2_kg": 4000},
    "Evaporative Cooling": {"efficient": True, "stars": 4, "annual_cost": 300, "co2_kg": 400},
    "None": {"efficient": False, "stars": 0, "annual_cost": 0, "co2_kg": 0},
}

HOT_WATER_TYPES = {
    "Gas Storage": {"efficient": False, "annual_cost": 900, "co2_kg": 2100},
    "Gas Continuous Flow": {"efficient": False, "annual_cost": 700, "co2_kg": 1600},
    "Electric Storage": {"efficient": False, "annual_cost": 1200, "co2_kg": 1800},
    "Heat Pump": {"efficient": True, "annual_cost": 350, "co2_kg": 500},
    "Solar Hot Water": {"efficient": True, "annual_cost": 200, "co2_kg": 200},
    "Electric Instantaneous": {"efficient": False, "annual_cost": 1400, "co2_kg": 2100},
}

INSULATION_TYPES = {
    "None": {"r_value": 0, "compliant_2027": False},
    "Basic (R1.5–R2.5)": {"r_value": 2.0, "compliant_2027": False},
    "Standard (R2.5–R4.0)": {"r_value": 3.5, "compliant_2027": False},
    "Good (R4.0–R5.0)": {"r_value": 4.5, "compliant_2027": False},
    "Excellent (R5.0+)": {"r_value": 5.5, "compliant_2027": True},
}

# ─── SUBURB PRICE GUIDE (Melbourne 2026) ──────────────────────────────────
SUBURB_PRICE_GUIDE = {
    "Sunshine":         {"avg_1br": 320, "avg_2br": 400, "avg_3br": 480, "trend": "stable", "region": "West"},
    "Footscray":        {"avg_1br": 340, "avg_2br": 420, "avg_3br": 500, "trend": "rising", "region": "West"},
    "Preston":          {"avg_1br": 360, "avg_2br": 440, "avg_3br": 520, "trend": "stable", "region": "North"},
    "Reservoir":        {"avg_1br": 330, "avg_2br": 410, "avg_3br": 490, "trend": "stable", "region": "North"},
    "Brunswick":        {"avg_1br": 400, "avg_2br": 500, "avg_3br": 600, "trend": "rising", "region": "Inner North"},
    "Coburg":           {"avg_1br": 380, "avg_2br": 470, "avg_3br": 560, "trend": "rising", "region": "Inner North"},
    "Northcote":        {"avg_1br": 420, "avg_2br": 520, "avg_3br": 630, "trend": "rising", "region": "Inner North"},
    "Fitzroy":          {"avg_1br": 450, "avg_2br": 560, "avg_3br": 700, "trend": "rising", "region": "Inner"},
    "Richmond":         {"avg_1br": 440, "avg_2br": 550, "avg_3br": 680, "trend": "rising", "region": "Inner"},
    "St Kilda":         {"avg_1br": 430, "avg_2br": 540, "avg_3br": 660, "trend": "stable", "region": "Inner South"},
    "Prahran":          {"avg_1br": 450, "avg_2br": 560, "avg_3br": 690, "trend": "rising", "region": "Inner South"},
    "South Yarra":      {"avg_1br": 480, "avg_2br": 590, "avg_3br": 750, "trend": "rising", "region": "Inner South"},
    "Camberwell":       {"avg_1br": 460, "avg_2br": 570, "avg_3br": 720, "trend": "stable", "region": "East"},
    "Box Hill":         {"avg_1br": 350, "avg_2br": 430, "avg_3br": 520, "trend": "stable", "region": "East"},
    "Glen Waverley":    {"avg_1br": 370, "avg_2br": 460, "avg_3br": 560, "trend": "stable", "region": "South East"},
    "Clayton":          {"avg_1br": 330, "avg_2br": 410, "avg_3br": 490, "trend": "stable", "region": "South East"},
    "Dandenong":        {"avg_1br": 290, "avg_2br": 360, "avg_3br": 430, "trend": "stable", "region": "South East"},
    "Frankston":        {"avg_1br": 280, "avg_2br": 350, "avg_3br": 420, "trend": "stable", "region": "South East"},
    "Werribee":         {"avg_1br": 270, "avg_2br": 340, "avg_3br": 400, "trend": "stable", "region": "West"},
    "Hoppers Crossing": {"avg_1br": 280, "avg_2br": 350, "avg_3br": 410, "trend": "stable", "region": "West"},
    "Craigieburn":      {"avg_1br": 300, "avg_2br": 370, "avg_3br": 440, "trend": "rising", "region": "North"},
    "Epping":           {"avg_1br": 310, "avg_2br": 390, "avg_3br": 460, "trend": "rising", "region": "North"},
    "Doncaster":        {"avg_1br": 390, "avg_2br": 480, "avg_3br": 580, "trend": "stable", "region": "East"},
    "Ringwood":         {"avg_1br": 360, "avg_2br": 440, "avg_3br": 530, "trend": "stable", "region": "East"},
    "Heidelberg":       {"avg_1br": 370, "avg_2br": 460, "avg_3br": 550, "trend": "stable", "region": "North East"},
    "Moonee Ponds":     {"avg_1br": 400, "avg_2br": 490, "avg_3br": 590, "trend": "rising", "region": "Inner North"},
    "Essendon":         {"avg_1br": 410, "avg_2br": 510, "avg_3br": 620, "trend": "rising", "region": "Inner North"},
    "Altona":           {"avg_1br": 350, "avg_2br": 430, "avg_3br": 520, "trend": "stable", "region": "West"},
    "Point Cook":       {"avg_1br": 320, "avg_2br": 400, "avg_3br": 480, "trend": "rising", "region": "West"},
    "Truganina":        {"avg_1br": 310, "avg_2br": 380, "avg_3br": 450, "trend": "rising", "region": "West"},
    "Carlton":          {"avg_1br": 440, "avg_2br": 540, "avg_3br": 660, "trend": "stable", "region": "Inner"},
    "Parkville":        {"avg_1br": 450, "avg_2br": 560, "avg_3br": 700, "trend": "stable", "region": "Inner"},
    "Hawthorn":         {"avg_1br": 460, "avg_2br": 570, "avg_3br": 700, "trend": "stable", "region": "Inner East"},
    "Kew":              {"avg_1br": 470, "avg_2br": 580, "avg_3br": 720, "trend": "stable", "region": "Inner East"},
    "Caulfield":        {"avg_1br": 410, "avg_2br": 510, "avg_3br": 620, "trend": "stable", "region": "Inner South"},
    "Carnegie":         {"avg_1br": 390, "avg_2br": 480, "avg_3br": 580, "trend": "stable", "region": "Inner South"},
}

NEAR_UNI_SUBURBS = {
    "University of Melbourne": ["Carlton", "Parkville", "Fitzroy", "Brunswick", "Coburg"],
    "RMIT": ["Carlton", "Fitzroy", "Brunswick", "Coburg", "Footscray"],
    "Monash Clayton": ["Clayton", "Glen Waverley", "Caulfield", "Carnegie"],
    "Monash Caulfield": ["Caulfield", "Carnegie", "St Kilda"],
    "La Trobe Bundoora": ["Heidelberg", "Reservoir", "Preston", "Epping"],
    "Deakin Burwood": ["Box Hill", "Camberwell", "Hawthorn"],
    "Victoria University": ["Footscray", "Sunshine", "Werribee"],
    "Swinburne": ["Hawthorn", "Camberwell", "Richmond", "Kew"],
}

# ─── SAMPLE PROPERTIES ────────────────────────────────────────────────────
SAMPLE_PROPERTIES = {
    "sunshine": {
        "address": "123 Example St, Sunshine VIC 3020",
        "year_built": 1975,
        "bedrooms": 3,
        "bathrooms": 1,
        "heating": "Ducted Gas",
        "cooling": "None",
        "hot_water": "Gas Storage",
        "insulation": "None",
        "mould": True,
        "draughts": True,
        "solar": False,
        "water_efficient": False,
        "property_value": 850000,
        "weekly_rent": 480,
        "notes": "Possible bathroom mould and draughts in living area",
    },
    "compliant": {
        "address": "45 Green St, Camberwell VIC 3124",
        "year_built": 2018,
        "bedrooms": 2,
        "bathrooms": 1,
        "heating": "Reverse Cycle AC",
        "cooling": "Reverse Cycle AC",
        "hot_water": "Heat Pump",
        "insulation": "Excellent (R5.0+)",
        "mould": False,
        "draughts": False,
        "solar": True,
        "water_efficient": True,
        "property_value": 650000,
        "weekly_rent": 570,
        "notes": "Well-maintained modern apartment",
    },
}
