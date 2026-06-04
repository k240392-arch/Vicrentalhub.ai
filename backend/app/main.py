"""VicRentalHub.ai – FastAPI application entry point."""

import os
from pathlib import Path

# Load .env file FIRST before anything else
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).parent.parent / ".env"
    if env_path.exists():
        load_dotenv(dotenv_path=str(env_path))
        print(f"[ENV] Loaded {env_path}")
    else:
        print(f"[ENV] No .env found at {env_path} — using system environment")
except ImportError:
    print("[ENV] python-dotenv not installed — run: pip3 install python-dotenv")
from .routers import analyse, auth, chat, properties, reference, rentals, reports, admin
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from .database import Base, engine
from .routers import analyse, auth, chat, properties, reference, rentals, reports

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="VicRentalHub.ai API",
    description="Victorian rental compliance, energy efficiency, and tenant rights platform.",
    version="2.0.0",
)

# CORS
allowed_origins = os.getenv("VICRENTAL_CORS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(admin.router)
app.include_router(auth.router)
app.include_router(properties.router)
app.include_router(analyse.router)
app.include_router(rentals.router)
app.include_router(reports.router)
app.include_router(reference.router)
app.include_router(chat.router)


@app.get("/api/health")
def health():
    groq_configured = bool(os.getenv("GROQ_API_KEY", ""))
    email_configured = bool(os.getenv("SMTP_USER", ""))
    return {
        "status": "ok",
        "service": "VicRentalHub.ai API",
        "version": "2.0.0",
        "groq_ai": "configured" if groq_configured else "not configured — add GROQ_API_KEY to .env",
        "email": "configured" if email_configured else "not configured — add SMTP credentials to .env",
    }


# Static frontend
FRONTEND_DIST = Path(__file__).parent.parent.parent / "frontend" / "dist"

if FRONTEND_DIST.exists() and (FRONTEND_DIST / "index.html").exists():
    assets_dir = FRONTEND_DIST / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/{full_path:path}")
    def spa_fallback(full_path: str):
        if full_path.startswith("api/"):
            return JSONResponse(status_code=404, content={"detail": "Not found"})
        index = FRONTEND_DIST / "index.html"
        return FileResponse(str(index))