"""Analysis router — runs the 13 modules + advanced features."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import (
    AffordabilityRequest, AffordabilityResponse,
    AnalysisRequest, BillPredictionRequest, BillPredictionResponse,
    ComplianceScoreResponse, ESGResponse, EnergyScannerResponse,
    HealthCheckRequest, HealthCheckResponse,
    ListingOptimiserRequest, ListingOptimiserResponse,
    NegotiationRequest, NegotiationResponse,
    PreAdAuditResponse, RebateResponse, ROIResponse,
    SafetyResponse, StandardsCheckRequest, StandardsCheckResponse,
    TimelineResponse,
)
from ..services import analysis_service

router = APIRouter(prefix="/api/analyse", tags=["analysis"])


@router.post("/standards", response_model=StandardsCheckResponse)
def standards_check(payload: StandardsCheckRequest):
    result = analysis_service.check_standards(payload.responses)
    return result


@router.post("/score", response_model=ComplianceScoreResponse)
def compliance_score(payload: StandardsCheckRequest):
    standards = analysis_service.check_standards(payload.responses)
    score = analysis_service.calculate_compliance_score(payload.property.model_dump(), standards)
    return score


@router.post("/energy", response_model=EnergyScannerResponse)
def energy_scan(payload: AnalysisRequest):
    return analysis_service.energy_scanner(payload.property.model_dump())


@router.post("/roi", response_model=ROIResponse)
def roi(payload: AnalysisRequest):
    return analysis_service.roi_simulator(payload.property.model_dump())


@router.post("/rebates", response_model=RebateResponse)
def rebates(payload: AnalysisRequest):
    return analysis_service.find_rebates(payload.property.model_dump())


@router.post("/safety", response_model=SafetyResponse)
def safety(payload: AnalysisRequest):
    return analysis_service.safety_scan(payload.property.model_dump())


@router.post("/timeline", response_model=TimelineResponse)
def timeline(payload: AnalysisRequest):
    return analysis_service.compliance_timeline(payload.property.model_dump())


@router.post("/pre-ad-audit", response_model=PreAdAuditResponse)
def pre_ad(payload: StandardsCheckRequest):
    return analysis_service.pre_ad_audit(payload.property.model_dump(), payload.responses)


@router.post("/listing-optimiser", response_model=ListingOptimiserResponse)
def listing_optimiser(payload: ListingOptimiserRequest):
    return analysis_service.listing_optimiser(payload.property.model_dump(), payload.style)


@router.post("/health-check", response_model=HealthCheckResponse)
def health_check(payload: HealthCheckRequest):
    return analysis_service.property_health_check(payload.property.model_dump(), payload.issues)


@router.post("/bills", response_model=BillPredictionResponse)
def bills(payload: BillPredictionRequest):
    return analysis_service.predict_bills(payload.property.model_dump(), payload.occupants)


@router.post("/negotiation", response_model=NegotiationResponse)
def negotiation(payload: NegotiationRequest):
    return analysis_service.negotiation_booster(payload.scenario, payload.context)


@router.post("/affordability", response_model=AffordabilityResponse)
def affordability(payload: AffordabilityRequest):
    return analysis_service.affordability_check(payload.weekly_income, payload.weekly_rent)


@router.post("/esg", response_model=ESGResponse)
def esg(payload: AnalysisRequest):
    return analysis_service.esg_rating(payload.property.model_dump())


@router.post("/full-report", response_model=dict)
def full_report(payload: StandardsCheckRequest):
    """Run all relevant analyses for a single property and return a bundle."""
    prop = payload.property.model_dump()
    standards = analysis_service.check_standards(payload.responses)
    score = analysis_service.calculate_compliance_score(prop, standards)
    energy = analysis_service.energy_scanner(prop)
    roi = analysis_service.roi_simulator(prop)
    rebates = analysis_service.find_rebates(prop)
    safety = analysis_service.safety_scan(prop)
    timeline = analysis_service.compliance_timeline(prop)
    audit = analysis_service.pre_ad_audit(prop, payload.responses)
    esg = analysis_service.esg_rating(prop)
    listing = analysis_service.listing_optimiser(prop)

    return {
        "property": prop,
        "standards": standards,
        "score": score,
        "energy": energy,
        "roi": roi,
        "rebates": rebates,
        "safety": safety,
        "timeline": timeline,
        "audit": audit,
        "esg": esg,
        "listing": listing,
    }
