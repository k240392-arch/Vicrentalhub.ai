import { useNavigate } from 'react-router-dom'

const C = { blue: '#1E3A8A', indigo: '#6366F1', text: '#0F172A', textMuted: '#64748B', border: '#E2E8F0', bg: '#F8FAFC' }

const tenantSteps = [
  { num: '01', icon: '🏠', title: 'Create your free account', desc: 'Sign up in 30 seconds. No credit card needed. Choose the Tenant role.' },
  { num: '02', icon: '🔍', title: 'Search for rentals', desc: 'Set your suburb, bedrooms, and budget. We generate smart search links to Domain and realestate.com.au with filters pre-applied.' },
  { num: '03', icon: '📋', title: 'Score any listing', desc: 'Paste any rental URL and get an instant compliance score — heating, ventilation, safety switches, and more.' },
  { num: '04', icon: '⚖️', title: 'Know your rights', desc: 'Use the Rights section to understand exactly what your landlord must provide under Victorian law.' },
  { num: '05', icon: '🤖', title: 'Ask the AI assistant', desc: 'Got a question about your bond, a repair, or an inspection notice? Ask our AI — available 24/7.' },
]

const landlordSteps = [
  { num: '01', icon: '🏢', title: 'Create your Landlord account', desc: 'Sign up and choose the Landlord role. Add your property details in minutes.' },
  { num: '02', icon: '✅', title: 'Run a compliance analysis', desc: 'Answer 15 questions about your property. Get an instant compliance score and grade (A–F).' },
  { num: '03', icon: '🔧', title: 'Get your action plan', desc: 'See exactly what needs fixing, estimated costs, and available government rebates.' },
  { num: '04', icon: '📄', title: 'Generate a PDF report', desc: 'Download a professional compliance report. Perfect for records, agents, or VCAT.' },
  { num: '05', icon: '📅', title: 'Track energy deadlines', desc: 'Get reminders for the 2027 and 2030 energy efficiency deadlines specific to your property.' },
]

const faqs = [
  { q: 'Is VicRentalHub free to use?', a: 'The Tenant plan is completely free forever. Landlord and Agency plans have a small monthly fee for premium features like PDF reports and portfolio tracking.' },
  { q: 'Is this information legally accurate?', a: 'All content is based on official Victorian government sources: Consumer Affairs Victoria, energy.vic.gov.au, and tenantsvic.org.au. However, for legal disputes we recommend consulting a solicitor or Tenants Victoria.' },
  { q: 'What are the 15 Minimum Rental Standards?', a: 'They cover structural soundness, weatherproofing, no significant mould, secure locks, ventilation, RCD safety switches, fixed heating, smoke alarms, toilet/bathroom, kitchen, laundry, lighting, vermin-proof bins, window locks, and child-safe cords.' },
  { q: 'What happens with my data?', a: 'Your data is stored securely in our database. We never sell your information to third parties. You can delete your account at any time.' },
  { q: 'Does the AI chatbot give legal advice?', a: 'The AI provides information based on Victorian rental law, not legal advice. For disputes or formal proceedings, always consult a qualified professional.' },
  { q: 'Can I use this for properties outside Melbourne?', a: 'Yes — all Victorian rentals are covered. The laws apply state-wide, though some rebates may have location-specific criteria.' },
]

export default function HowItWorksPage() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color: C.text }}>
      <style>{`
        .step-card { background: #fff; border-radius: 20px; padding: 28px; border: 1px solid ${C.border}; position: relative; transition: all 200ms; }
        .step-card:hover { box-shadow: 0 12px 32px rgba(15,23,42,0.08); transform: translateY(-4px); }
        .faq-item { border-bottom: 1px solid ${C.border}; padding: 24px 0; }
        @media (max-width: 768px) { .steps-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* Hero */}
      <section style={{ background: `linear-gradient(135deg, ${C.blue} 0%, ${C.indigo} 100%)`, padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', borderRadius: 100, padding: '6px 18px', fontSize: 13, color: 'rgba(255,255,255,0.9)', marginBottom: 24 }}>
            ⚡ Simple & fast
          </div>
          <h1 style={{ fontSize: 52, fontWeight: 800, color: '#fff', margin: '0 0 20px', lineHeight: 1.1 }}>How VicRentalHub works</h1>
          <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.8)', margin: '0 0 40px', lineHeight: 1.6 }}>
            Get started in minutes. Whether you're a tenant or landlord, we make Victorian rental compliance simple.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/register')} style={{ padding: '12px 28px', background: '#fff', color: C.blue, border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>I'm a Tenant →</button>
            <button onClick={() => navigate('/register')} style={{ padding: '12px 28px', background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>I'm a Landlord →</button>
          </div>
        </div>
      </section>

      {/* Tenant steps */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 48 }}>
          <div style={{ width: 48, height: 48, background: '#ECFDF5', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🏠</div>
          <div>
            <h2 style={{ fontSize: 36, fontWeight: 700, margin: 0 }}>For Tenants</h2>
            <p style={{ color: C.textMuted, margin: 0 }}>Find a compliant home and know your rights</p>
          </div>
        </div>
        <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 20 }}>
          {tenantSteps.map((s, i) => (
            <div key={s.num} className="step-card">
              <div style={{ fontSize: 11, fontWeight: 700, color: C.indigo, letterSpacing: 1, marginBottom: 12, textTransform: 'uppercase' }}>Step {s.num}</div>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{s.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: C.textMuted, margin: 0, lineHeight: 1.5 }}>{s.desc}</p>
              {i < tenantSteps.length - 1 && (
                <div style={{ position: 'absolute', right: -12, top: '50%', fontSize: 20, color: C.indigo, zIndex: 1 }}>›</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div style={{ borderTop: `1px solid ${C.border}`, margin: '0 24px' }} />

      {/* Landlord steps */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 48 }}>
          <div style={{ width: 48, height: 48, background: '#EFF6FF', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🏢</div>
          <div>
            <h2 style={{ fontSize: 36, fontWeight: 700, margin: 0 }}>For Landlords</h2>
            <p style={{ color: C.textMuted, margin: 0 }}>Check compliance and stay ahead of deadlines</p>
          </div>
        </div>
        <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 20 }}>
          {landlordSteps.map((s, i) => (
            <div key={s.num} className="step-card">
              <div style={{ fontSize: 11, fontWeight: 700, color: C.blue, letterSpacing: 1, marginBottom: 12, textTransform: 'uppercase' }}>Step {s.num}</div>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{s.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: C.textMuted, margin: 0, lineHeight: 1.5 }}>{s.desc}</p>
              {i < landlordSteps.length - 1 && (
                <div style={{ position: 'absolute', right: -12, top: '50%', fontSize: 20, color: C.blue, zIndex: 1 }}>›</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: C.bg, padding: '80px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontSize: 40, fontWeight: 700, margin: '0 0 16px' }}>Frequently asked questions</h2>
            <p style={{ fontSize: 18, color: C.textMuted }}>Everything you need to know about VicRentalHub.</p>
          </div>
          {faqs.map(f => (
            <div key={f.q} className="faq-item">
              <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 10px' }}>{f.q}</h3>
              <p style={{ color: C.textMuted, margin: 0, lineHeight: 1.7 }}>{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.indigo})`, borderRadius: 24, padding: '64px 48px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 40, fontWeight: 700, color: '#fff', margin: '0 0 16px' }}>Start in under 2 minutes</h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', margin: '0 0 32px' }}>Free for tenants. No credit card required.</p>
          <button onClick={() => navigate('/register')} style={{ padding: '14px 36px', background: '#fff', color: C.blue, border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
            Create Free Account →
          </button>
        </div>
      </section>
    </div>
  )
}