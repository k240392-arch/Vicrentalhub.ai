import { useNavigate } from 'react-router-dom'

const C = { blue: '#1E3A8A', indigo: '#6366F1', text: '#0F172A', textMuted: '#64748B', border: '#E2E8F0', bg: '#F8FAFC' }

const features = [
  {
    icon: '🔍',
    title: 'Smart Property Search',
    description: 'Find compliant rentals with advanced filters including energy ratings and Victorian compliance scores. We send you straight to Domain and realestate.com.au with the right filters pre-loaded.',
    detail: ['Filter by suburb, bedrooms, budget', 'University proximity filter', 'Score any listing you find', 'Compliance checklist for each property'],
  },
  {
    icon: '🛡️',
    title: 'Compliance Tracking',
    description: 'Stay ahead of 2027 all-electric requirements with automated compliance monitoring. Know exactly where your property stands against all 15 Minimum Rental Standards.',
    detail: ['15 Minimum Standards checker', '2027 energy deadline tracker', 'Automated compliance scoring', 'Remediation action plan'],
  },
  {
    icon: '🤖',
    title: 'AI-Powered Assistant',
    description: 'Get instant answers about Victorian rental laws, energy upgrades, and government regulations in plain language — available 24/7.',
    detail: ['Powered by Groq (Llama 3.3 70B)', 'Victorian rental law expert', 'Bond, repairs, VCAT guidance', 'Plain-language explanations'],
  },
  {
    icon: '🔔',
    title: 'Real-Time Updates',
    description: 'Automatic monitoring of Victorian government announcements, Consumer Affairs updates, and regulation changes so you\'re never caught off guard.',
    detail: ['Consumer Affairs Vic alerts', 'Energy.vic.gov.au updates', 'Deadline reminders', 'Email notifications'],
  },
  {
    icon: '📊',
    title: 'Property Analytics',
    description: 'Comprehensive insights on rental performance, energy efficiency scores, rebate eligibility, and Melbourne market trends.',
    detail: ['Energy efficiency scoring', 'Rebate eligibility calculator', 'ROI on upgrades', 'Market rent comparison'],
  },
  {
    icon: '📄',
    title: 'Report Generation',
    description: 'Generate professional PDF compliance reports for landlords and tenants. Perfect for VCAT hearings, property sales, or lease renewals.',
    detail: ['Landlord compliance report', 'Tenant rights summary', 'PDF download', 'Shareable link'],
  },
]

const plans = [
  { name: 'Tenant', price: 'Free', color: '#10B981', features: ['Find & score rentals', 'Know your rights', 'AI assistant', 'Minimum standards guide'] },
  { name: 'Landlord', price: '$29/mo', color: C.blue, features: ['Everything in Tenant', 'Property compliance analysis', 'PDF reports', 'Energy upgrade planner', 'Rebate tracker'] },
  { name: 'Agency', price: '$99/mo', color: C.indigo, features: ['Everything in Landlord', 'Unlimited properties', 'Portfolio dashboard', 'Priority support', 'White-label reports'] },
]

export default function FeaturesPage() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color: C.text }}>
      <style>{`
        .feat-card { background: #fff; border-radius: 20px; padding: 32px; border: 1px solid ${C.border}; transition: all 200ms ease; }
        .feat-card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(15,23,42,0.10); border-color: ${C.indigo}; }
        .plan-card { border-radius: 20px; padding: 32px; border: 2px solid ${C.border}; transition: all 200ms ease; }
        .plan-card:hover { transform: translateY(-4px); box-shadow: 0 16px 32px rgba(15,23,42,0.08); }
        @media (max-width: 768px) { .feat-grid { grid-template-columns: 1fr !important; } .plan-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* Hero */}
      <section style={{ background: `linear-gradient(135deg, ${C.blue} 0%, ${C.indigo} 100%)`, padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', borderRadius: 100, padding: '6px 18px', fontSize: 13, color: 'rgba(255,255,255,0.9)', marginBottom: 24 }}>
            ✨ Everything you need
          </div>
          <h1 style={{ fontSize: 52, fontWeight: 800, color: '#fff', margin: '0 0 20px', lineHeight: 1.1 }}>
            Powerful features for every user
          </h1>
          <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.8)', margin: '0 0 40px', lineHeight: 1.6 }}>
            Whether you're a tenant finding a home, a landlord managing compliance, or an agency running a portfolio — VicRentalHub has you covered.
          </p>
          <button onClick={() => navigate('/register')} style={{ padding: '14px 32px', background: '#fff', color: C.blue, border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
            Get Started Free →
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h2 style={{ fontSize: 40, fontWeight: 700, margin: '0 0 16px' }}>Everything you need to stay compliant</h2>
          <p style={{ fontSize: 18, color: C.textMuted, maxWidth: 600, margin: '0 auto' }}>
            Comprehensive tools built on official Victorian government data.
          </p>
        </div>
        <div className="feat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }}>
          {features.map(f => (
            <div key={f.title} className="feat-card">
              <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 12px' }}>{f.title}</h3>
              <p style={{ color: C.textMuted, margin: '0 0 20px', lineHeight: 1.6 }}>{f.description}</p>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {f.detail.map(d => (
                  <li key={d} style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.textMuted, fontSize: 14, marginBottom: 6 }}>
                    <span style={{ color: '#10B981', fontWeight: 700 }}>✓</span> {d}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Stats banner */}
      <section style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.indigo})`, padding: '64px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32, textAlign: 'center' }}>
          {[['5,000+', 'Active Properties'], ['12,000+', 'Happy Users'], ['98%', 'Compliance Rate'], ['24/7', 'AI Support']].map(([val, label]) => (
            <div key={label}>
              <div style={{ fontSize: 48, fontWeight: 800, color: '#fff', marginBottom: 8 }}>{val}</div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 16 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Plans */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h2 style={{ fontSize: 40, fontWeight: 700, margin: '0 0 16px' }}>Simple, transparent pricing</h2>
          <p style={{ fontSize: 18, color: C.textMuted }}>Start free, upgrade when you're ready.</p>
        </div>
        <div className="plan-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }}>
          {plans.map(p => (
            <div key={p.name} className="plan-card" style={{ borderColor: p.name === 'Landlord' ? C.blue : C.border, background: p.name === 'Landlord' ? `linear-gradient(135deg, ${C.blue}08, ${C.indigo}08)` : '#fff' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: p.color, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>{p.name}</div>
              <div style={{ fontSize: 40, fontWeight: 800, color: C.text, marginBottom: 24 }}>{p.price}</div>
              <ul style={{ margin: '0 0 32px', padding: 0, listStyle: 'none' }}>
                {p.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: C.textMuted }}>
                    <span style={{ color: p.color, fontWeight: 700 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate('/register')} style={{ width: '100%', padding: '12px', background: p.name === 'Landlord' ? C.blue : '#F1F5F9', color: p.name === 'Landlord' ? '#fff' : C.text, border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                Get Started
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.indigo})`, borderRadius: 24, padding: '64px 48px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 40, fontWeight: 700, color: '#fff', margin: '0 0 16px' }}>Ready to get started?</h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', margin: '0 0 32px' }}>Join thousands of landlords and tenants using VicRentalHub.</p>
          <button onClick={() => navigate('/register')} style={{ padding: '14px 36px', background: '#fff', color: C.blue, border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
            Start Free Today →
          </button>
        </div>
      </section>
    </div>
  )
}