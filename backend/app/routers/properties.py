"""Properties CRUD."""

from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import Property, User
from ..schemas import PropertyCreate, PropertyOut, PropertyUpdate
from ..services import analysis_service

router = APIRouter(prefix="/api/properties", tags=["properties"])


@router.get("", response_model=List[PropertyOut])
def list_properties(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Property).filter(Property.owner_id == user.id).order_by(Property.created_at.desc()).all()


@router.post("", response_model=PropertyOut, status_code=201)
def create_property(
    payload: PropertyCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    prop = Property(**payload.model_dump(), owner_id=user.id)
    # Compute initial score
    standards = analysis_service.check_standards(payload.standards_responses or {})
    score = analysis_service.calculate_compliance_score(payload.model_dump(), standards)
    prop.last_compliance_score = score["total"]
    prop.last_grade = score["grade"]
    db.add(prop)
    db.commit()
    db.refresh(prop)
    return prop


@router.get("/{property_id}", response_model=PropertyOut)
def get_property(
    property_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    prop = db.query(Property).filter(Property.id == property_id, Property.owner_id == user.id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    return prop


@router.patch("/{property_id}", response_model=PropertyOut)
def update_property(
    property_id: int,
    payload: PropertyUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    prop = db.query(Property).filter(Property.id == property_id, Property.owner_id == user.id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(prop, k, v)

    # Recompute score
    standards = analysis_service.check_standards(prop.standards_responses or {})
    prop_dict = {
        c.name: getattr(prop, c.name) for c in Property.__table__.columns
    }
    score = analysis_service.calculate_compliance_score(prop_dict, standards)
    prop.last_compliance_score = score["total"]
    prop.last_grade = score["grade"]

    db.commit()
    db.refresh(prop)
    return prop


@router.delete("/{property_id}", status_code=204)
def delete_property(
    property_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    prop = db.query(Property).filter(Property.id == property_id, Property.owner_id == user.id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    db.delete(prop)
    db.commit()
    return None
