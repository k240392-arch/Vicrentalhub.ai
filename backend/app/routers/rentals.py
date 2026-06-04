"""Rental finder routes — deep-links to real sites + listing scorer."""

from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..data.rules import NEAR_UNI_SUBURBS, SUBURB_PRICE_GUIDE
from ..database import get_db
from ..models import SavedSearch, User
from ..schemas import (
    RentalSearchRequest, RentalSearchResponse,
    SavedSearchCreate, SavedSearchOut,
    ScoreListingRequest, ScoreListingResponse,
)
from ..services import rental_finder_service

router = APIRouter(prefix="/api/rentals", tags=["rentals"])


@router.post("/search", response_model=RentalSearchResponse)
def search_rentals(payload: RentalSearchRequest):
    """
    Returns search guidance — NOT scraped listings.
    The user is sent to Domain / realestate.com.au with the right filters
    to do their actual search there.
    """
    suggested = rental_finder_service.suggest_suburbs(
        budget=payload.max_rent,
        bedrooms=payload.bedrooms,
        university=payload.university,
    )

    # If suburb wasn't specified, try to use the top suggestion (if any)
    target_suburb = payload.suburb or (suggested[0] if suggested else None)

    suburb_data = (
        rental_finder_service.get_suburb_data(target_suburb)
        if target_suburb else None
    )

    search_links = rental_finder_service.build_search_links(
        suburb=target_suburb,
        bedrooms=payload.bedrooms,
        max_rent=payload.max_rent,
    )

    return {
        "suburb": target_suburb,
        "suburb_data": suburb_data,
        "suggested_suburbs": suggested,
        "search_links": search_links,
        "green_flags": rental_finder_service.green_flags(),
        "red_flags": rental_finder_service.red_flags(),
        "inspection_checklist": rental_finder_service.inspection_checklist(),
    }


@router.post("/score-listing", response_model=ScoreListingResponse)
def score_listing(payload: ScoreListingRequest):
    """
    Score a real listing the user found themselves.
    Paste the listing description + key details — get a compliance score.
    """
    return rental_finder_service.score_listing(
        description=payload.description,
        weekly_rent=payload.weekly_rent,
        bedrooms=payload.bedrooms,
        suburb=payload.suburb,
    )


@router.get("/suburbs", response_model=List[dict])
def list_suburbs():
    return [
        {"name": name, **data}
        for name, data in sorted(SUBURB_PRICE_GUIDE.items())
    ]


@router.get("/universities", response_model=dict)
def list_universities():
    return NEAR_UNI_SUBURBS


# ─── SAVED SEARCHES ──────────────────────────────────────────────────
@router.get("/saved-searches", response_model=List[SavedSearchOut])
def list_saved(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(SavedSearch)
        .filter(SavedSearch.user_id == user.id)
        .order_by(SavedSearch.created_at.desc())
        .all()
    )


@router.post("/saved-searches", response_model=SavedSearchOut, status_code=201)
def create_saved(
    payload: SavedSearchCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    search = SavedSearch(**payload.model_dump(), user_id=user.id)
    db.add(search)
    db.commit()
    db.refresh(search)
    return search


@router.delete("/saved-searches/{search_id}", status_code=204)
def delete_saved(
    search_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    s = (
        db.query(SavedSearch)
        .filter(SavedSearch.id == search_id, SavedSearch.user_id == user.id)
        .first()
    )
    if not s:
        raise HTTPException(status_code=404, detail="Saved search not found")
    db.delete(s)
    db.commit()
    return None