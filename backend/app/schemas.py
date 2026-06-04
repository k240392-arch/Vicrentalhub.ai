"""Pydantic schemas — request/response models."""

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, EmailStr, Field


# ─── AUTH ────────────────────────────────────────────────────────────
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: Optional[str] = None
    role: str = "tenant"  # tenant | landlord | agency


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    role: str
    plan: str
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ─── PROPERTY ────────────────────────────────────────────────────────
class PropertyBase(BaseModel):
    address: str
    suburb: Optional[str] = None
    postcode: Optional[str] = None
    year_built: Optional[int] = None
    bedrooms: int = 2
    bathrooms: int = 1
    heating: str = "None"
    cooling: str = "None"
    hot_water: str = "Gas Storage"
    insulation: str = "None"
    mould: bool = False
    draughts: bool = False
    solar: bool = False
    water_efficient: bool = False
    property_value: Optional[float] = None
    weekly_rent: Optional[float] = None
    notes: Optional[str] = None
    standards_responses: Dict[str, str] = Field(default_factory=dict)


class PropertyCreate(PropertyBase):
    pass


class PropertyUpdate(BaseModel):
    address: Optional[str] = None
    suburb: Optional[str] = None
    postcode: Optional[str] = None
    year_built: Optional[int] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    heating: Optional[str] = None
    cooling: Optional[str] = None
    hot_water: Optional[str] = None
    insulation: Optional[str] = None
    mould: Optional[bool] = None
    draughts: Optional[bool] = None
    solar: Optional[bool] = None
    water_efficient: Optional[bool] = None
    property_value: Optional[float] = None
    weekly_rent: Optional[float] = None
    notes: Optional[str] = None
    standards_responses: Optional[Dict[str, str]] = None


class PropertyOut(PropertyBase):
    id: int
    owner_id: Optional[int] = None
    last_compliance_score: Optional[int] = None
    last_grade: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ─── ANALYSIS REQUESTS ───────────────────────────────────────────────
class AnalysisRequest(BaseModel):
    """Generic request that takes property data inline (no save)."""
    property: PropertyBase


class StandardsCheckRequest(BaseModel):
    property: PropertyBase
    responses: Dict[str, str] = Field(default_factory=dict)


# ─── ANALYSIS RESPONSES ──────────────────────────────────────────────
class ScoreBreakdownEntry(BaseModel):
    score: int
    max: int
    pct: float


class ComplianceScoreResponse(BaseModel):
    total: int
    grade: str
    grade_color: str
    breakdown: Dict[str, ScoreBreakdownEntry]
    summary: str


class StandardsCheckResponse(BaseModel):
    pass_count: int
    fail_count: int
    uncertain_count: int
    total: int
    compliance_pct: int
    can_advertise: bool
    results: List[Dict[str, Any]]
    failed_standards: List[Dict[str, Any]]


class ROIResponse(BaseModel):
    current_annual_cost: int
    upgraded_annual_cost: int
    annual_savings: int
    upgrade_cost_low: int
    upgrade_cost_high: int
    payback_years: float
    co2_savings_kg: int
    ten_year_savings: int
    chart_data: List[Dict[str, Any]]


class EnergyScannerResponse(BaseModel):
    energy_score: int
    heating_status: Dict[str, Any]
    hot_water_status: Dict[str, Any]
    insulation_status: Dict[str, Any]
    timeline: List[Dict[str, Any]]
    recommendations: List[str]
    estimated_total_upgrade: Dict[str, int]


class RebateMatch(BaseModel):
    rebate: Dict[str, Any]
    eligible: bool
    reasons: List[str]


class RebateResponse(BaseModel):
    matches: List[RebateMatch]
    total_potential_value: int


class SafetyResponse(BaseModel):
    safety_score: int
    risk_level: str
    risks: List[Dict[str, Any]]
    actions: List[str]


class TimelineEvent(BaseModel):
    date: str
    title: str
    description: str
    priority: str  # high | medium | low
    cost_estimate: str
    affected: bool


class TimelineResponse(BaseModel):
    events: List[TimelineEvent]
    next_action: Optional[Dict[str, Any]] = None


class ListingOptimiserRequest(BaseModel):
    property: PropertyBase
    style: str = "professional"  # professional | warm | concise


class ListingOptimiserResponse(BaseModel):
    headline: str
    description: str
    bullet_points: List[str]
    seo_keywords: List[str]


class PreAdAuditResponse(BaseModel):
    can_advertise: bool
    blocking_issues: List[str]
    warnings: List[str]
    recommendations: List[str]
    risk_score: int


class HealthCheckRequest(BaseModel):
    property: PropertyBase
    issues: List[str] = Field(default_factory=list)


class HealthCheckResponse(BaseModel):
    issues_found: List[Dict[str, Any]]
    landlord_must_fix: List[Dict[str, Any]]
    tenant_actions: List[str]
    severity_score: int


class BillPredictionRequest(BaseModel):
    property: PropertyBase
    occupants: int = 2


class BillPredictionResponse(BaseModel):
    annual_estimate: int
    monthly_estimate: int
    breakdown: Dict[str, int]
    comparison_to_efficient: int
    tips: List[str]


class NegotiationRequest(BaseModel):
    scenario: str  # rent_increase | repairs | bond_dispute | non_renewal
    context: str = ""


class NegotiationResponse(BaseModel):
    talking_points: List[str]
    sample_email: str
    escalation_path: List[str]


# ─── RENTAL FINDER ───────────────────────────────────────────────────
class RentalSearchRequest(BaseModel):
    suburb: Optional[str] = None
    bedrooms: int = 2
    max_rent: int = 500
    priorities: List[str] = Field(default_factory=list)
    university: Optional[str] = None


class SearchLink(BaseModel):
    site: str
    label: str
    url: str
    note: str


class FlagItem(BaseModel):
    flag: str
    why: str


class RentalSearchResponse(BaseModel):
    suburb: Optional[str] = None
    suburb_data: Optional[Dict[str, Any]] = None
    suggested_suburbs: List[str] = Field(default_factory=list)
    search_links: List[SearchLink] = Field(default_factory=list)
    green_flags: List[FlagItem] = Field(default_factory=list)
    red_flags: List[FlagItem] = Field(default_factory=list)
    inspection_checklist: List[str] = Field(default_factory=list)


class ScoreListingRequest(BaseModel):
    description: str
    weekly_rent: Optional[float] = None
    bedrooms: Optional[int] = None
    suburb: Optional[str] = None


class ScoreListingResponse(BaseModel):
    score: int
    verdict: str
    verdict_color: str
    detected_green: List[str]
    detected_red: List[str]
    value_rating: Optional[str] = None
    suburb_avg_rent: Optional[int] = None
    questions_to_ask: List[str]


class SavedSearchCreate(BaseModel):
    name: str
    suburb: Optional[str] = None
    bedrooms: int = 2
    max_rent: int = 500
    priorities: List[str] = Field(default_factory=list)
    university: Optional[str] = None


class SavedSearchOut(SavedSearchCreate):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ─── AFFORDABILITY ───────────────────────────────────────────────────
class AffordabilityRequest(BaseModel):
    weekly_income: float
    weekly_rent: float


class AffordabilityResponse(BaseModel):
    rent_to_income_pct: float
    stress_level: str  # safe | moderate | high | extreme
    recommended_max_rent: float
    monthly_disposable: float
    advice: List[str]


# ─── ESG ─────────────────────────────────────────────────────────────
class ESGResponse(BaseModel):
    overall_grade: str
    overall_score: int
    environmental: Dict[str, Any]
    social: Dict[str, Any]
    governance: Dict[str, Any]


# ─── REPORT ──────────────────────────────────────────────────────────
class ReportCreate(BaseModel):
    property_id: int
    report_type: str = "landlord"  # landlord | tenant


class ReportOut(BaseModel):
    id: int
    user_id: int
    property_id: Optional[int] = None
    report_type: str
    pdf_path: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ─── CHAT ────────────────────────────────────────────────────────────
class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    context: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    suggestions: List[str] = Field(default_factory=list)