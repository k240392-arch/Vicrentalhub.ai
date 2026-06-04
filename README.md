# VicRentalHub.ai 🏠

**Victorian Rental Compliance & Property Management Platform**  
Built for Melbourne landlords, tenants, and property agencies.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Pages & Features](#pages--features)
- [API Endpoints](#api-endpoints)
- [User Roles](#user-roles)
- [Admin Panel](#admin-panel)
- [AI Chatbot (Groq)](#ai-chatbot-groq)
- [Email System](#email-system)
- [Database](#database)
- [Deployment](#deployment)
- [Demo Credentials](#demo-credentials)

---

## Overview

VicRentalHub.ai helps Victorian landlords and tenants stay compliant with rental laws,
energy efficiency standards, and the 15 Minimum Rental Standards — all powered by AI
and official Victorian government data.

---

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React 18, Vite, React Router v6         |
| Backend    | FastAPI (Python), Uvicorn               |
| Database   | SQLite (dev) / PostgreSQL (production)  |
| ORM        | SQLAlchemy 2.0                          |
| Auth       | JWT (python-jose), bcrypt (passlib)     |
| AI         | Groq (Llama 3.3 70B) — free             |
| PDF        | ReportLab                               |
| Email      | SMTP (Gmail / SendGrid)                 |
| Payments   | Stripe                                  |

---

## Project Structure

```
Vicrentalhub/
├── backend/
│   ├── .env                        ← Environment variables (never commit)
│   ├── requirements.txt
│   ├── seed.py                     ← Seeds demo user
│   ├── create_admin.py             ← Creates admin account
│   └── app/
│       ├── main.py                 ← FastAPI app, router registration
│       ├── database.py             ← SQLAlchemy engine & session
│       ├── models.py               ← ORM models (User, Property, Report…)
│       ├── schemas.py              ← Pydantic request/response schemas
│       ├── auth.py                 ← JWT helpers, get_current_user
│       ├── services/
│       │   └── email_service.py    ← SMTP email sending
│       └── routers/
│           ├── auth.py             ← /api/auth/* (register, login, verify)
│           ├── admin.py            ← /api/admin/* (user management)
│           ├── properties.py       ← /api/properties/*
│           ├── analyse.py          ← /api/analyse/* (compliance scoring)
│           ├── rentals.py          ← /api/rentals/* (search, score listing)
│           ├── reports.py          ← /api/reports/* (PDF generation)
│           ├── chat.py             ← /api/chat (AI chatbot)
│           └── reference.py        ← /api/reference/* (standards, rebates)
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                 ← Router, Layout, FloatingChat, PublicNavbar
│   │   ├── main.jsx                ← React entry point
│   │   ├── api.js                  ← Axios/fetch API helpers
│   │   ├── styles.css              ← Global styles
│   │   ├── state/
│   │   │   └── AuthContext.jsx     ← Auth state (user, token, login, logout)
│   │   ├── components/
│   │   │   └── UI.jsx              ← Shared UI components (Spinner, Badge…)
│   │   └── pages/
│   │       ├── HomePage.jsx        ← Landing page (public)
│   │       ├── FeaturesPage.jsx    ← /features (public)
│   │       ├── HowItWorksPage.jsx  ← /how-it-works (public)
│   │       ├── TestimonialsPage.jsx← /testimonials (public)
│   │       ├── LoginPage.jsx       ← /login
│   │       ├── RegisterPage.jsx    ← /register
│   │       ├── PricingPage.jsx     ← /pricing
│   │       ├── DashboardPage.jsx   ← /dashboard (protected)
│   │       ├── PropertyFormPage.jsx← /properties/new, /properties/:id/edit
│   │       ├── AnalysisPage.jsx    ← /analyse
│   │       ├── RentalsPage.jsx     ← /rentals
│   │       ├── TenantToolsPage.jsx ← /tenant
│   │       ├── RightsPage.jsx      ← /rights
│   │       ├── StandardsReferencePage.jsx ← /standards
│   │       ├── ChatPage.jsx        ← /chat
│   │       ├── ReportsPage.jsx     ← /reports (protected)
│   │       └── AdminPage.jsx       ← /admin (admin only)
│   └── dist/                       ← Built frontend (served by FastAPI)
│
├── data/
│   └── vicrentalhub.db             ← SQLite database
└── start.sh                        ← Startup script
```

---

## Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- pip3

### 1. Install & Run

```bash
# Clone / unzip the project
cd "Vicrentalhub "

# Fix start.sh for Mac (one time only)
sed -i '' 's/pip install/pip3 install/' start.sh
sed -i '' 's/python seed.py/python3 seed.py/' start.sh
sed -i '' 's/uvicorn app.main:app/python3 -m uvicorn app.main:app/' start.sh

# Install extra dependencies
pip3 install python-dotenv httpx

# Build frontend
cd frontend && npm install && npm run build && cd ..

# Create admin account
cd backend && python3 create_admin.py && cd ..

# Start everything
bash start.sh
```

### 2. Open in browser
```
http://127.0.0.1:8000
```

---

## Environment Variables

Create `backend/.env` with these values:

```env
# App
APP_URL=http://127.0.0.1:8000
SECRET_KEY=your-long-random-secret-key

# Database (SQLite default)
DATABASE_URL=sqlite:///./data/vicrentalhub.db

# JWT
JWT_SECRET_KEY=your-jwt-secret
JWT_EXPIRE_MINUTES=10080

# Groq AI (FREE) — get key at console.groq.com
GROQ_API_KEY=gsk_your-key-here
GROQ_MODEL=llama-3.3-70b-versatile

# Email (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=VicRentalHub <your@gmail.com>
EMAIL_VERIFICATION_ENABLED=true

# Stripe (payments)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

---

## Pages & Features

### Public Pages (no login required)

| URL | Page | Description |
|-----|------|-------------|
| `/` | Home | Landing page with hero, stats, CTA |
| `/features` | Features | All platform features + pricing plans |
| `/how-it-works` | How It Works | Step-by-step guide for tenants & landlords + FAQ |
| `/testimonials` | Testimonials | User reviews + platform stats |
| `/pricing` | Pricing | Plan comparison |
| `/login` | Login | Sign in |
| `/register` | Register | Create account (tenant/landlord/agency) |

### App Pages (login required for full access)

| URL | Page | Description |
|-----|------|-------------|
| `/dashboard` | Dashboard | Property portfolio overview |
| `/rentals` | Find Rentals | Search rentals, score listings |
| `/analyse` | Compliance Analysis | 15-question property compliance check |
| `/tenant` | Tenant Tools | Bond calculator, rights checker, negotiation |
| `/rights` | Rights | Victorian tenant rights guide |
| `/standards` | Standards | All 15 Minimum Rental Standards |
| `/chat` | Ask AI | Full-page AI chat |
| `/reports` | Reports | Download PDF compliance reports |
| `/properties/new` | Add Property | Add property to portfolio |
| `/admin` | Admin Panel | Super admin only — user management |

---

## API Endpoints

### Auth `/api/auth`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user + send verification email |
| POST | `/login` | Login, returns JWT token |
| GET | `/verify-email?token=xxx` | Verify email address |
| POST | `/forgot-password` | Send password reset email |
| POST | `/reset-password` | Reset password with token |
| GET | `/me` | Get current user profile |

### Admin `/api/admin` *(admin role only)*
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats` | Platform stats (users, properties, reports) |
| GET | `/users` | List all users (search, filter, paginate) |
| GET | `/users/:id` | Get single user with full history |
| POST | `/users/:id/suspend` | Suspend user account |
| POST | `/users/:id/activate` | Reactivate user account |
| DELETE | `/users/:id` | Permanently delete user |
| PATCH | `/users/:id/role` | Change user role |
| GET | `/users/:id/export/json` | Export user history as JSON |
| GET | `/users/:id/export/pdf` | Export user history as PDF |
| GET | `/export/users/json` | Export all users as JSON |

### Properties `/api/properties`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List user's properties |
| POST | `/` | Add new property |
| GET | `/:id` | Get property detail |
| PUT | `/:id` | Update property |
| DELETE | `/:id` | Delete property |

### Analysis `/api/analyse`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/compliance-score` | Full compliance score (A–F grade) |
| POST | `/standards-check` | 15 Minimum Standards checker |
| POST | `/energy-scanner` | Energy efficiency scan + 2027/2030 deadlines |
| POST | `/roi-calculator` | Upgrade ROI calculator |
| POST | `/rebates` | Rebate eligibility checker |
| POST | `/safety` | Safety risk assessment |
| POST | `/timeline` | Compliance deadline timeline |
| POST | `/listing-optimiser` | AI listing description generator |
| POST | `/pre-ad-audit` | Pre-advertisement compliance audit |

### Rentals `/api/rentals`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/search` | Smart rental search with Domain/REA links |
| POST | `/score-listing` | Score a rental listing |
| GET | `/suburbs` | List of Melbourne suburbs |
| GET | `/universities` | List of universities |

### Chat `/api/chat`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `` | AI chat (Groq or rule-based fallback) |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health + config status |

---

## User Roles

| Role | Access | Plan |
|------|--------|------|
| `tenant` | Rentals, rights, chat, tenant tools | Free |
| `landlord` | All tenant features + compliance analysis, PDF reports | Paid |
| `agency` | Everything + portfolio management | Paid |
| `admin` | Everything + admin panel at `/admin` | N/A |

---

## Admin Panel

Access at: `http://127.0.0.1:8000/admin` (admin role required)

**Create admin account:**
```bash
cd backend && python3 create_admin.py
```
Default credentials:
- Email: `admin@vicrentalhub.ai`
- Password: `admin1234` ← **change after first login**

**Features:**
- 📊 Dashboard — platform stats, user breakdown by role, recent signups
- 👥 Users — search, filter, view profiles, suspend/activate/delete users
- 🔑 Role management — change any user's role
- ⬇ Export — individual user PDF/JSON history, full database export

---

## AI Chatbot (Groq)

The floating chat bubble (bottom right) is available on every page.

**Setup (free, no credit card):**
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up → API Keys → Create Key
3. Add to `backend/.env`: `GROQ_API_KEY=gsk_...`
4. Restart server

**Model:** `llama-3.3-70b-versatile` (fast, capable, free tier)

**Fallback:** If no Groq key is set, the chatbot uses a built-in rule-based system covering bonds, rent increases, repairs, minimum standards, energy deadlines, and rebates.

**Verify it's working:**
```
http://127.0.0.1:8000/api/health
```
Should show `"groq_ai": "configured"`.

---

## Email System

Real email sending via SMTP. Triggered on:
- ✉️ Registration → verification email
- ✅ Email verified → welcome email
- 🔑 Forgot password → reset link

**Gmail setup:**
1. Enable 2-Factor Authentication on your Google account
2. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Create app password → copy 16-char password
4. Add to `.env`:
   ```
   SMTP_USER=your@gmail.com
   SMTP_PASSWORD=xxxx-xxxx-xxxx-xxxx
   ```

**Disable email verification** (for development):
```env
EMAIL_VERIFICATION_ENABLED=false
```

---

## Database

**Development:** SQLite at `data/vicrentalhub.db` — works out of the box.

**Production:** Switch to PostgreSQL:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/vicrentalhub
```

**Tables:**
- `users` — accounts, roles, verification tokens
- `properties` — landlord properties + compliance data
- `reports` — generated PDF reports
- `saved_searches` — tenant saved searches
- `listings` — sample rental listings

**Reset database** (dev only — loses all data):
```bash
rm data/vicrentalhub.db && bash start.sh
```

---

## Deployment

### Quick production checklist
1. Set `ENVIRONMENT=production` in `.env`
2. Change `SECRET_KEY` and `JWT_SECRET_KEY` to strong random values
3. Switch `DATABASE_URL` to PostgreSQL
4. Set real `SMTP_*` credentials
5. Set real `STRIPE_*` keys
6. Set `APP_URL` to your domain
7. Add domain to `VICRENTAL_CORS`
8. Build frontend: `cd frontend && npm run build`

---

## Demo Credentials

| Account | Email | Password | Role |
|---------|-------|----------|------|
| Demo User | `demo@vicrentalhub.ai` | `demo1234` | Landlord |
| Super Admin | `admin@vicrentalhub.ai` | `admin1234` | Admin |

---

## Support

- Victorian rental laws: [consumer.vic.gov.au](https://consumer.vic.gov.au)
- Tenant support: [tenantsvic.org.au](https://tenantsvic.org.au)
- Energy standards: [energy.vic.gov.au](https://energy.vic.gov.au)
- Solar rebates: [solar.vic.gov.au](https://solar.vic.gov.au)

---

*VicRentalHub.ai — Built on official Victorian government data.*# Vicrentalhub.ai
