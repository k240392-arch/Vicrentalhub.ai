"""
Run this once to create your admin account:
  cd backend && python3 create_admin.py

Then log in at http://127.0.0.1:8000/login with:
  Email:    admin@vicrentalhub.ai
  Password: admin1234

Then go to: http://127.0.0.1:8000/admin
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, Base, engine
from app.models import User
from passlib.context import CryptContext

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
Base.metadata.create_all(bind=engine)

db = SessionLocal()

ADMIN_EMAIL = "admin@vicrentalhub.ai"
ADMIN_PASSWORD = "admin1234"
ADMIN_NAME = "Super Admin"

existing = db.query(User).filter(User.email == ADMIN_EMAIL).first()
if existing:
    existing.role = "admin"
    existing.is_active = True
    db.commit()
    print(f"✓ Admin already exists — role updated to admin")
else:
    admin = User(
        email=ADMIN_EMAIL,
        full_name=ADMIN_NAME,
        hashed_password=pwd.hash(ADMIN_PASSWORD),
        role="admin",
        plan="agency",
        is_active=True,
    )
    db.add(admin)
    db.commit()
    print(f"✓ Admin created!")

print(f"\n  Email:    {ADMIN_EMAIL}")
print(f"  Password: {ADMIN_PASSWORD}")
print(f"  URL:      http://127.0.0.1:8000/admin")
print(f"\n  Change your password after first login!")
db.close()