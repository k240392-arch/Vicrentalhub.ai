#!/usr/bin/env bash
# Quick-start script for VicRentalHub.ai
# Installs Python deps, seeds DB, and launches uvicorn.

set -e

echo "=> Installing Python dependencies"
pip3 install -r backend/requirements.txt

echo "=> Seeding database (idempotent)"
cd backend && python3 seed.py
cd ..

echo "=> Starting server on http://127.0.0.1:8000"
echo "   Demo login: demo@vicrentalhub.ai / demo1234"
echo
cd backend && python3 -m uvicorn app.main:app --reload --port 8000