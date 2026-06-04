"""Seed the database with a demo user and sample properties."""

from app.auth import hash_password
from app.data.rules import SAMPLE_PROPERTIES
from app.database import Base, SessionLocal, engine
from app.models import Property, User
from app.services import analysis_service


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == "demo@vicrentalhub.ai").first()
        if existing:
            print("Demo user already exists — skipping.")
            return

        demo = User(
            email="demo@vicrentalhub.ai",
            full_name="Demo Landlord",
            hashed_password=hash_password("demo1234"),
            role="landlord",
            plan="landlord_pro",
        )
        db.add(demo)
        db.commit()
        db.refresh(demo)

        for key, sample in SAMPLE_PROPERTIES.items():
            address = sample["address"]
            suburb_part = address.split(",")[1].strip().split(" ")[0] if "," in address else None

            prop = Property(
                owner_id=demo.id,
                address=address,
                suburb=suburb_part,
                year_built=sample["year_built"],
                bedrooms=sample["bedrooms"],
                bathrooms=sample["bathrooms"],
                heating=sample["heating"],
                cooling=sample["cooling"],
                hot_water=sample["hot_water"],
                insulation=sample["insulation"],
                mould=sample["mould"],
                draughts=sample["draughts"],
                solar=sample["solar"],
                water_efficient=sample["water_efficient"],
                property_value=sample["property_value"],
                weekly_rent=sample["weekly_rent"],
                notes=sample["notes"],
                standards_responses={},
            )
            standards = analysis_service.check_standards({})
            score = analysis_service.calculate_compliance_score(
                {
                    "heating": sample["heating"],
                    "hot_water": sample["hot_water"],
                    "insulation": sample["insulation"],
                    "cooling": sample["cooling"],
                    "mould": sample["mould"],
                    "draughts": sample["draughts"],
                    "solar": sample["solar"],
                    "water_efficient": sample["water_efficient"],
                    "year_built": sample["year_built"],
                },
                standards,
            )
            prop.last_compliance_score = score["total"]
            prop.last_grade = score["grade"]
            db.add(prop)
        db.commit()
        print(f"Seeded demo user (demo@vicrentalhub.ai / demo1234) with {len(SAMPLE_PROPERTIES)} sample properties.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
