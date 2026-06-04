"""SQLAlchemy ORM models for VicRentalHub."""

from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
)
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="tenant")  # tenant | landlord | agency | admin
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)  # email verified
    plan = Column(String, default="tenant")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Email verification
    verification_token = Column(String, nullable=True, index=True)
    verification_token_expires = Column(DateTime, nullable=True)

    # Password reset
    reset_token = Column(String, nullable=True, index=True)
    reset_token_expires = Column(DateTime, nullable=True)

    properties = relationship("Property", back_populates="owner", cascade="all, delete-orphan")
    saved_searches = relationship("SavedSearch", back_populates="user", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="user", cascade="all, delete-orphan")


class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    address = Column(String, nullable=False)
    suburb = Column(String, nullable=True, index=True)
    postcode = Column(String, nullable=True)
    year_built = Column(Integer, nullable=True)
    bedrooms = Column(Integer, default=2)
    bathrooms = Column(Integer, default=1)

    heating = Column(String, default="None")
    cooling = Column(String, default="None")
    hot_water = Column(String, default="Gas Storage")
    insulation = Column(String, default="None")

    mould = Column(Boolean, default=False)
    draughts = Column(Boolean, default=False)
    solar = Column(Boolean, default=False)
    water_efficient = Column(Boolean, default=False)

    property_value = Column(Float, nullable=True)
    weekly_rent = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)

    standards_responses = Column(JSON, default=dict)
    last_compliance_score = Column(Integer, nullable=True)
    last_grade = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="properties")
    reports = relationship("Report", back_populates="property", cascade="all, delete-orphan")


class SavedSearch(Base):
    __tablename__ = "saved_searches"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, nullable=False)
    suburb = Column(String, nullable=True)
    bedrooms = Column(Integer, default=2)
    max_rent = Column(Integer, default=500)
    priorities = Column(JSON, default=list)
    university = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="saved_searches")


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=True)
    report_type = Column(String, default="landlord")
    payload = Column(JSON, default=dict)
    pdf_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="reports")
    property = relationship("Property", back_populates="reports")


class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)
    address = Column(String, nullable=False)
    suburb = Column(String, nullable=False, index=True)
    property_type = Column(String, default="Apartment")
    bedrooms = Column(Integer, default=2)
    bathrooms = Column(Integer, default=1)
    weekly_rent = Column(Integer, nullable=False)
    features = Column(JSON, default=list)
    compliance_score = Column(Integer, default=70)
    has_efficient_heating = Column(Boolean, default=False)
    has_solar = Column(Boolean, default=False)
    days_listed = Column(Integer, default=1)
    source = Column(String, default="VicRentalHub Sample")
    source_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)