"""
rental_finder_service.py – Rental search & scoring helpers.

Provides:
1. Working deep-links to Domain, realestate.com.au, Flatmates with proper filters.
2. A keyword-based scorer for listings the user pastes in themselves.
3. Suburb intelligence + green/red flags.
"""

from typing import Any, Dict, List, Optional

from ..data.rules import SUBURB_PRICE_GUIDE, NEAR_UNI_SUBURBS


# ─── POSTCODE LOOKUP ─────────────────────────────────────────────────────
# Domain and Flatmates need the postcode in the URL slug.
# Mapping covers every suburb listed in SUBURB_PRICE_GUIDE.
SUBURB_POSTCODES: Dict[str, str] = {
    "flemington":       "3031",
    "Glenroy":          "3046",
    "Sunshine":         "3020",
    "Footscray":        "3011",
    "Preston":          "3072",
    "Reservoir":        "3073",
    "Brunswick":        "3056",
    "Coburg":           "3058",
    "Northcote":        "3070",
    "Fitzroy":          "3065",
    "Richmond":         "3121",
    "St Kilda":         "3182",
    "Prahran":          "3181",
    "South Yarra":      "3141",
    "Camberwell":       "3124",
    "Box Hill":         "3128",
    "Glen Waverley":    "3150",
    "Clayton":          "3168",
    "Dandenong":        "3175",
    "Frankston":        "3199",
    "Werribee":         "3030",
    "Hoppers Crossing": "3029",
    "Craigieburn":      "3064",
    "Epping":           "3076",
    "Doncaster":        "3108",
    "Ringwood":         "3134",
    "Heidelberg":       "3084",
    "Moonee Ponds":     "3039",
    "Essendon":         "3040",
    "Altona":           "3018",
    "Point Cook":       "3030",
    "Truganina":        "3029",
    "Carlton":          "3053",
    "Parkville":        "3052",
    "Hawthorn":         "3122",
    "Kew":              "3101",
    "Caulfield":        "3162",
    "Carnegie":         "3163",
}


def _slug(suburb: str) -> str:
    """Lowercase, hyphen-separated suburb slug."""
    return suburb.lower().replace(" ", "-")


# ─── DEEP LINKS TO REAL RENTAL SITES ─────────────────────────────────────
def build_search_links(
    suburb: Optional[str],
    bedrooms: int,
    max_rent: int,
) -> List[Dict[str, str]]:
    """
    Build pre-filtered search URLs for the major Australian rental sites.
    All URLs verified against real site URL formats.
    """
    links: List[Dict[str, str]] = []

    if suburb:
        slug = _slug(suburb)
        postcode = SUBURB_POSTCODES.get(suburb)

        # ─── Domain.com.au ──
        # Format: /rent/{suburb-state-postcode}/?bedrooms=N&price=0-X
        # Example: /rent/brunswick-vic-3056/?bedrooms=2&price=0-500
        if postcode:
            domain_url = (
                f"https://www.domain.com.au/rent/{slug}-vic-{postcode}/"
                f"?bedrooms={bedrooms}&price=0-{max_rent}&excludedeposittaken=1"
            )
        else:
            # Fallback to Melbourne region if we don't have postcode
            domain_url = (
                f"https://www.domain.com.au/rent/melbourne-region-vic/"
                f"?bedrooms={bedrooms}&price=0-{max_rent}"
            )

        links.append({
            "site": "Domain.com.au",
            "label": f"Search Domain — {bedrooms}-bed in {suburb} under ${max_rent}/wk",
            "url": domain_url,
            "note": "Australia's largest rental portal. Free to browse.",
        })

        # ─── realestate.com.au ──
        # Format: /rent/in-{suburb}+vic/list-1?maxBeds=N&minBeds=N&maxPrice=X
        # (already working — no change)
        links.append({
            "site": "realestate.com.au",
            "label": f"Search realestate.com.au — {bedrooms}-bed in {suburb}",
            "url": (
                f"https://www.realestate.com.au/rent/in-{slug},+vic/list-1"
                f"?maxBeds={bedrooms}&minBeds={bedrooms}&maxPrice={max_rent}"
            ),
            "note": "Other major Australian portal — different listings to Domain.",
        })

        # ─── Flatmates.com.au ──
        # Format: /rooms/{suburb-postcode}
        # Example: /rooms/brunswick-3056
        if postcode:
            flatmates_url = f"https://flatmates.com.au/rooms/{slug}-{postcode}"
        else:
            # Fallback to city-level
            flatmates_url = "https://flatmates.com.au/rooms/melbourne"

        links.append({
            "site": "Flatmates.com.au",
            "label": f"Find a room or flatmate in {suburb}",
            "url": flatmates_url,
            "note": "Share-housing — often cheaper than renting solo.",
        })

        # ─── Rent.com.au ──
        # Format: /properties/{suburb}+vic-{postcode}
        # Note: spaces in suburb become "+" not "-"
        rent_slug = suburb.lower().replace(" ", "+")
        if postcode:
            rent_url = f"https://www.rent.com.au/properties/{rent_slug}-vic-{postcode}"
        else:
            rent_url = "https://www.rent.com.au/properties/melbourne-vic"
        links.append({
            "site": "Rent.com.au",
            "label": f"Search Rent.com.au in {suburb}",
            "url": rent_url,
            "note": "Free rental site — often has listings the others miss.",
        })
    else:
        # No suburb specified — give Melbourne-wide links
        links.append({
            "site": "Domain.com.au",
            "label": f"Search Domain — Melbourne rentals under ${max_rent}/wk",
            "url": (
                f"https://www.domain.com.au/rent/melbourne-region-vic/"
                f"?bedrooms={bedrooms}&price=0-{max_rent}"
            ),
            "note": "Browse all Melbourne suburbs.",
        })
        links.append({
            "site": "realestate.com.au",
            "label": "Search realestate.com.au — Victorian rentals",
            "url": f"https://www.realestate.com.au/rent/in-vic/list-1?maxPrice={max_rent}",
            "note": "Browse all of Victoria.",
        })
        links.append({
            "site": "Flatmates.com.au",
            "label": "Browse rooms across Melbourne",
            "url": "https://flatmates.com.au/rooms/melbourne",
            "note": "Share-housing — often cheaper than renting solo.",
        })

    return links


# ─── GREEN / RED FLAGS ───────────────────────────────────────────────────
def green_flags() -> List[Dict[str, str]]:
    """Features that indicate an energy-efficient, well-maintained rental."""
    return [
        {
            "flag": "Reverse-cycle air-conditioning / split system",
            "why": "Efficient electric heating + cooling. Will meet 2030 cooling rule. Lowest running cost.",
        },
        {
            "flag": "Heat pump or solar hot water",
            "why": "Avoids gas — cheapest hot water to run. Won't need replacing under 2027 rules.",
        },
        {
            "flag": "Ceiling insulation R5.0 or better",
            "why": "Required at new leases from March 2027. Cuts heating bills 25–30%.",
        },
        {
            "flag": "Double glazing",
            "why": "Major comfort upgrade. Reduces draughts and noise. Rare in older Vic rentals.",
        },
        {
            "flag": "Solar panels",
            "why": "Cuts daytime electricity bill significantly. Bonus if landlord pays the connection fee.",
        },
        {
            "flag": "4-star water-efficient showerheads",
            "why": "Required at new leases from March 2027. Cuts hot water bills.",
        },
        {
            "flag": "Property built after 2010",
            "why": "Built to higher energy standards by default. Generally better insulation, fewer draughts.",
        },
    ]


def red_flags() -> List[Dict[str, str]]:
    """Warning signs of a problematic rental."""
    return [
        {
            "flag": "Ducted gas heating or gas wall heaters",
            "why": "When it fails, landlord must replace with electric (March 2027). ~$1,400/yr running cost vs $600 for split-system.",
        },
        {
            "flag": "Gas storage hot water",
            "why": "Same 2027 rule applies. Heat pump replacement will be required when it fails.",
        },
        {
            "flag": "No insulation mentioned",
            "why": "If you're signing a new lease, insulation is required by March 2027 — but landlord doesn't have to upgrade for an existing tenancy.",
        },
        {
            "flag": "No fixed heater in the main living area",
            "why": "ILLEGAL since November 2025. This is a Minimum Standard breach — do not rent.",
        },
        {
            "flag": "Visible mould or strong damp smell",
            "why": "Minimum Standard 3 violation if structural. Health risk. Landlord must remediate.",
        },
        {
            "flag": "Single glazing + draughts",
            "why": "Heating bills will be 30–50% higher. Bedrooms hard to keep warm in winter.",
        },
        {
            "flag": "Property built before 1980 with no recent renovation",
            "why": "May have asbestos, lead paint, aging electrical. Insist on RCD safety switches.",
        },
        {
            "flag": "No working smoke alarm",
            "why": "Minimum Standard 8 violation. Landlord must install/test before you move in.",
        },
    ]


# ─── LISTING SCORER ──────────────────────────────────────────────────────
def score_listing(
    description: str,
    weekly_rent: Optional[float] = None,
    bedrooms: Optional[int] = None,
    suburb: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Score a real listing the user found themselves. They paste the listing
    description and we look for green/red flag keywords + structural data.
    """
    text = (description or "").lower()

    detected_green: List[str] = []
    detected_red: List[str] = []
    score = 60

    GREEN_PATTERNS = {
        "Split-system / reverse-cycle AC": [
            "split system", "split-system", "reverse cycle", "reverse-cycle", "rcac",
        ],
        "Heat pump hot water": ["heat pump"],
        "Solar hot water": ["solar hot water", "solar hws"],
        "Solar panels": ["solar panel", "solar pv", "rooftop solar"],
        "Ceiling insulation": ["insulation", "insulated", "r5.0", "r5 ", "r-value"],
        "Double glazing": ["double glaz", "double-glaz", "dual glaz"],
        "Modern build / renovated": [
            "recently renovated", "newly renovated", "fully renovated", "brand new",
            "just renovated", "modern kitchen", "modern bathroom",
        ],
        "Water-efficient fixtures": [
            "4-star", "4 star", "water-efficient", "water efficient", "wels",
        ],
        "Energy efficient": ["energy efficient", "energy-efficient", "eer", "nathers"],
        "Pets considered": ["pet friendly", "pet-friendly", "pets considered", "pets ok"],
    }

    RED_PATTERNS = {
        "Gas heating": [
            "gas heat", "gas heater", "ducted gas", "gas wall", "gas central",
            "space heater",
        ],
        "Gas hot water": ["gas hot water", "gas hws", "gas storage"],
        "Older / unrenovated": ["original condition", "needs tlc", "renovator's delight", "as is"],
        "Mould / damp risk": ["mould", "mold", "damp", "moisture issue"],
        "Single glazing": ["single glaz"],
    }

    for label, patterns in GREEN_PATTERNS.items():
        if any(p in text for p in patterns):
            detected_green.append(label)
            score += 5

    for label, patterns in RED_PATTERNS.items():
        if any(p in text for p in patterns):
            detected_red.append(label)
            score -= 8

    has_heating_mention = any(
        kw in text for kw in [
            "heat", "ac ", "air-con", "air con", "aircon", "split", "reverse",
            "heater", "warming",
        ]
    )
    if not has_heating_mention and len(text) > 100:
        detected_red.append("No heating mentioned in listing")
        score -= 12

    has_safety_mention = any(kw in text for kw in ["smoke alarm", "safety switch", "rcd"])
    if has_safety_mention:
        score += 4

    value_rating: Optional[str] = None
    suburb_avg: Optional[int] = None
    if suburb and weekly_rent and bedrooms:
        suburb_data = SUBURB_PRICE_GUIDE.get(suburb)
        if suburb_data:
            key = f"avg_{bedrooms}br" if bedrooms in (1, 2, 3) else "avg_2br"
            suburb_avg = suburb_data.get(key)
            if suburb_avg:
                if weekly_rent < suburb_avg - 30:
                    value_rating = "Below market — great value"
                    score += 3
                elif weekly_rent <= suburb_avg + 20:
                    value_rating = "At market average"
                else:
                    value_rating = "Above market average"
                    score -= 3

    score = max(20, min(98, score))

    if score >= 80:
        verdict = "Strong listing"
        verdict_color = "green"
    elif score >= 65:
        verdict = "Decent — worth viewing"
        verdict_color = "lime"
    elif score >= 50:
        verdict = "Mixed — inspect carefully"
        verdict_color = "amber"
    else:
        verdict = "Caution — significant concerns"
        verdict_color = "red"

    green_lower = [g.lower() for g in detected_green]
    questions: List[str] = []
    if not any("hot water" in g for g in green_lower):
        questions.append("What type of hot water system? (gas storage = expensive to run)")
    if "ceiling insulation" not in green_lower:
        questions.append("Is the ceiling insulated, and to what R-value?")
    if "Gas heating" in detected_red:
        questions.append("How old is the gas heater? When it fails, landlord must replace with electric.")
    if not has_safety_mention:
        questions.append("Is there an RCD safety switch on the switchboard? When were smoke alarms last tested?")
    if "Mould / damp risk" in detected_red:
        questions.append("Where exactly is the mould, and what's the cause? Has it been remediated before?")
    questions.append("Can I see the gas/electricity bills from the previous tenant?")
    questions.append("Is the property compliant with the 15 Minimum Rental Standards (in force since Nov 2025)?")

    return {
        "score": score,
        "verdict": verdict,
        "verdict_color": verdict_color,
        "detected_green": detected_green,
        "detected_red": detected_red,
        "value_rating": value_rating,
        "suburb_avg_rent": suburb_avg,
        "questions_to_ask": questions,
    }


# ─── SUBURB HELPERS ──────────────────────────────────────────────────────
def get_suburb_data(suburb: str) -> Optional[Dict[str, Any]]:
    return SUBURB_PRICE_GUIDE.get(suburb)


def suggest_suburbs(budget: int, bedrooms: int, university: Optional[str] = None) -> List[str]:
    """Suggest top suburbs matching budget."""
    if university and university in NEAR_UNI_SUBURBS:
        candidates = NEAR_UNI_SUBURBS[university]
    else:
        candidates = list(SUBURB_PRICE_GUIDE.keys())

    if bedrooms == 1:
        key = "avg_1br"
    elif bedrooms == 2:
        key = "avg_2br"
    else:
        key = "avg_3br"

    matches = []
    for suburb in candidates:
        data = SUBURB_PRICE_GUIDE.get(suburb)
        if not data:
            continue
        avg = data[key]
        if avg <= budget * 1.05:
            distance = abs(avg - budget)
            matches.append((suburb, distance, avg))

    matches.sort(key=lambda x: x[1])
    return [m[0] for m in matches[:5]]


def inspection_checklist() -> List[str]:
    return [
        "Check water pressure in all taps and shower",
        "Test heating and cooling — turn them on at the inspection",
        "Look for mould signs in bathroom, behind furniture, and on ceilings",
        "Check window seals and feel for draughts around doors/windows",
        "Confirm smoke alarms are visibly installed (and ask if recently tested)",
        "Check power point density — older properties have fewer",
        "Look at electrical switchboard — is there an RCD safety switch?",
        "Test toilet flush and drainage in sinks",
        "Look for cracks in walls, ceilings, and check floor levelness",
        "Ask about insulation — what type and when installed",
        "Check internet connectivity and mobile signal in the property",
        "Note natural light — visit at the time of day you'd be home",
        "Walk around outside — check fences, drainage, and condition of roof",
        "Read the lease carefully BEFORE signing — note any unusual clauses",
    ]