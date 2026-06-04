"""Chat router — powered by Groq (free) with rule-based fallback."""

import os
import json
import httpx
from fastapi import APIRouter
from ..schemas import ChatRequest, ChatResponse

router = APIRouter(prefix="/api/chat", tags=["chat"])

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

SYSTEM_PROMPT = """You are the VicRentalHub.ai AI assistant — an expert on Victorian rental law, 
tenant rights, landlord compliance, energy efficiency standards, and the 15 Minimum Rental Standards.

Key facts you know:
- Victoria has 15 Minimum Rental Standards (in force 25 Nov 2025)
- Bond max = 1 month rent (under $900/wk), held by RTBA
- Rent increases: max once per 12 months, 60 days written notice
- Urgent repairs must be fixed immediately; non-urgent within 14 days
- Energy efficiency deadlines: Mar 2027 (gas replacements, insulation), Jul 2030 (cooling)
- Solar for Rentals rebate: up to $1,400 available
- VCAT handles tenancy disputes — free for most tenant applications

Always be helpful, accurate, and cite official Victorian sources where relevant 
(consumer.vic.gov.au, tenantsvic.org.au, energy.vic.gov.au).
Keep responses concise and use bullet points for clarity.
End each response with 2-3 suggested follow-up questions as JSON: {"suggestions": ["...", "...", "..."]}"""

DEFAULT_SUGGESTIONS = [
    "What are my bond rights?",
    "How do rent increases work?",
    "Tell me about minimum standards",
    "What rebates are available?",
]


async def ask_groq(messages: list) -> tuple[str, list]:
    """Call Groq API. Returns (reply_text, suggestions)."""
    if not GROQ_API_KEY:
        return None, []

    groq_messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for m in messages[-10:]:  # last 10 messages for context
        groq_messages.append({"role": m.role, "content": m.content})

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                GROQ_URL,
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": GROQ_MODEL,
                    "messages": groq_messages,
                    "max_tokens": 1024,
                    "temperature": 0.7,
                },
            )
            data = resp.json()
            text = data["choices"][0]["message"]["content"]

            # Extract suggestions if model included them
            suggestions = DEFAULT_SUGGESTIONS
            if '{"suggestions"' in text:
                try:
                    json_start = text.rfind('{"suggestions"')
                    json_str = text[json_start:]
                    parsed = json.loads(json_str)
                    suggestions = parsed.get("suggestions", DEFAULT_SUGGESTIONS)
                    text = text[:json_start].strip()
                except Exception:
                    pass

            return text, suggestions
    except Exception as e:
        print(f"[GROQ] Error: {e}")
        return None, []


# ── Rule-based fallback (when no Groq key) ────────────────────────────
KNOWLEDGE = [
    {
        "keywords": ["bond", "deposit"],
        "reply": (
            "**Bond / Security Deposit**\n\n"
            "• Maximum bond is **1 month's rent** for weekly rent under $900/week.\n"
            "• Bond is held by the **RTBA** — not your landlord.\n"
            "• Must be returned within **10 business days** after lease ends.\n"
            "• Fair wear and tear is NOT deductible."
        ),
        "suggestions": ["How long for bond return?", "What is fair wear and tear?", "Can landlord keep my bond?"],
    },
    {
        "keywords": ["rent increase", "rent rise", "raise rent"],
        "reply": (
            "**Rent Increases in Victoria**\n\n"
            "• Maximum **once every 12 months**.\n"
            "• Landlord must give **60 days written notice**.\n"
            "• Excessive increases can be challenged at VCAT within 30 days."
        ),
        "suggestions": ["How to challenge rent increase?", "VCAT process?", "What's a fair increase?"],
    },
    {
        "keywords": ["repair", "fix", "broken", "leak", "mould"],
        "reply": (
            "**Repairs**\n\n"
            "**Urgent** (immediate): burst pipes, no hot water, no heating, broken locks.\n\n"
            "**Non-urgent**: landlord must respond within **14 days**.\n\n"
            "Always notify in writing and keep records."
        ),
        "suggestions": ["Mould remediation rights?", "How to apply to VCAT?"],
    },
    {
        "keywords": ["minimum standards", "15 standards"],
        "reply": (
            "**15 Minimum Rental Standards (Nov 2025)**\n\n"
            "All Victorian rentals must have: structural soundness, weatherproofing, no mould, "
            "secure locks, ventilation, RCD switches, fixed heating, smoke alarms, and more.\n\n"
            "Advertising a non-compliant property is a **criminal offence**."
        ),
        "suggestions": ["Run a standards check", "Fixed heating requirement?"],
    },
    {
        "keywords": ["energy", "2027", "2030", "insulation"],
        "reply": (
            "**Energy Efficiency Deadlines**\n\n"
            "• **Mar 2027**: Replace gas heating/HW with efficient electric when they fail.\n"
            "• **Jul 2030**: Efficient electric cooling in main living area — ALL rentals.\n\n"
            "Rebates: Solar for Rentals (up to $1,400), VEU program."
        ),
        "suggestions": ["Solar rebates?", "ROI calculator", "Run energy scan"],
    },
    {
        "keywords": ["rebate", "grant", "solar", "veu"],
        "reply": (
            "**Available Rebates**\n\n"
            "• **Solar for Rentals**: up to $1,400 + interest-free loan.\n"
            "• **VEU**: subsidised heating, cooling, hot water.\n\n"
            "Visit solar.vic.gov.au and energy.vic.gov.au for applications."
        ),
        "suggestions": ["Solar eligibility criteria", "VEU providers"],
    },
]

DEFAULT_REPLY = (
    "I can help with Victorian rental compliance, tenant rights, energy efficiency, and rebates. "
    "Ask me about: bond, rent increases, repairs, mould, minimum standards, energy standards, or rebates."
)


def rule_based_reply(text: str):
    text_lower = text.lower()
    best_score, best_entry = 0, None
    for entry in KNOWLEDGE:
        score = sum(1 for kw in entry["keywords"] if kw in text_lower)
        if score > best_score:
            best_score, best_entry = score, entry
    return best_entry


@router.post("", response_model=ChatResponse)
async def chat(payload: ChatRequest):
    if not payload.messages:
        return ChatResponse(reply=DEFAULT_REPLY, suggestions=DEFAULT_SUGGESTIONS)

    # Try Groq first (free AI)
    if GROQ_API_KEY:
        reply, suggestions = await ask_groq(payload.messages)
        if reply:
            return ChatResponse(reply=reply, suggestions=suggestions)

    # Fallback to rule-based
    last = payload.messages[-1]
    entry = rule_based_reply(last.content)
    if entry:
        return ChatResponse(reply=entry["reply"], suggestions=entry["suggestions"])
    return ChatResponse(reply=DEFAULT_REPLY, suggestions=DEFAULT_SUGGESTIONS)
