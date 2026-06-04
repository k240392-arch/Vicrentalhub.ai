"""Reference data routes — exposes rules, standards, rebates, etc. to the frontend."""

from fastapi import APIRouter

from ..data.rules import (
    DISCLAIMER, ENERGY_EFFICIENCY_STANDARDS, HEATING_TYPES, HOT_WATER_TYPES,
    INSULATION_TYPES, MINIMUM_RENTAL_STANDARDS, PRICING, REBATES,
    SAMPLE_PROPERTIES, TENANT_RIGHTS,
)

router = APIRouter(prefix="/api/reference", tags=["reference"])


@router.get("/standards")
def get_standards():
    return MINIMUM_RENTAL_STANDARDS


@router.get("/energy-standards")
def get_energy_standards():
    return ENERGY_EFFICIENCY_STANDARDS


@router.get("/rebates")
def get_rebates():
    return REBATES


@router.get("/tenant-rights")
def get_tenant_rights():
    return TENANT_RIGHTS


@router.get("/pricing")
def get_pricing():
    return PRICING


@router.get("/catalogue")
def get_catalogue():
    """All the dropdown choices the frontend needs."""
    return {
        "heating": list(HEATING_TYPES.keys()),
        "hot_water": list(HOT_WATER_TYPES.keys()),
        "insulation": list(INSULATION_TYPES.keys()),
        "cooling": ["None", "Reverse Cycle AC", "Split System (Electric)", "Evaporative Cooling", "Ceiling Fans"],
        "heating_details": HEATING_TYPES,
        "hot_water_details": HOT_WATER_TYPES,
        "insulation_details": INSULATION_TYPES,
    }


@router.get("/sample-properties")
def get_sample_properties():
    return SAMPLE_PROPERTIES


@router.get("/disclaimer")
def get_disclaimer():
    return {"disclaimer": DISCLAIMER}
