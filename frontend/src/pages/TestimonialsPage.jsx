import { useNavigate } from 'react-router-dom'

const C = { blue: '#1E3A8A', indigo: '#6366F1', text: '#0F172A', textMuted: '#64748B', border: '#E2E8F0', bg: '#F8FAFC' }

const testimonials = [
  { name: 'Sarah Chen', role: 'Property Owner', location: 'Richmond', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80', stars: 5, content: 'This platform saved me months of research. The AI assistant explained all the 2027 energy requirements in minutes, and I now have a clear upgrade roadmap for all three of my properties.', tag: 'Landlord' },
  { name: 'James Mitchell', role: 'Renter', location: 'South Yarra', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', stars: 5, content: "Finding a compliant rental was so easy. I love that I can see each property's compliance score and know my landlord is meeting government standards before I even sign.", tag: 'Tenant' },
  { name: 'Lisa Thompson', role: 'Portfolio Manager', location: 'Melbourne CBD', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80', stars: 5, content: 'Managing 15 properties used to be overwhelming. Now I track all compliance deadlines, generate PDF reports for each property, and stay ahead of energy upgrade deadlines in one place.', tag: 'Agency' },
  { name: 'Michael Nguyen', role: 'International Student', location: 'Carlton', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80', stars: 5, content: "As an international student, I didn't know my rights at all. VicRentalHub explained everything clearly — bond rules, inspection rights, repair timelines. I got my bond back in full thanks to this.", tag: 'Tenant' },
  { name: 'Amanda Wilson', role: 'First-Time Landlord', location: 'Brunswick', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80', stars: 5, content: "I was terrified about compliance when I first rented out my place. The compliance analysis gave me a clear A-grade report and told me exactly what I needed to fix. Brilliant service.", tag: 'Landlord' },
  { name: 'David Park', role: 'Property Investor', location: 'Fitzroy', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80', stars: 5, content: "The rebate tracker alone is worth it. I found $2,800 in Solar for Rentals and VEU rebates I didn't know I was eligible for. The ROI calculator made the upgrade decision easy.", tag: 'Landlord' },
]

const stats = [
  { value: '12,000+', label: 'Happy users', icon: '👥' },
  { value: '4.9/5', label: 'Average rating', icon: '⭐' },
  { value: '98%', label: 'Compliance rate', icon: '✅' },
  { value: '$2.4M', label: 'Rebates found', icon: '💰' },
]

const tagColors = {
  Tenant: { bg: '#ECFDF5', text: '#059669' },
  Landlord: { bg: '#EFF6FF', text: '#1E3A8A' },
  Agency: { bg: '#F5F3FF', text: '#7C3AED' },
}

export default function TestimonialsPage() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color: C.text }}>
      <style>{`
        .test-card { background: #fff; border-radius: 20px; padding: 28px; border: 1px solid ${C.border}; transition: all 200ms; display: flex; flex-direction: column; }
        .test-card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(15,23,42,0.10); }
        @media (max-width: 768px) { .test-grid { grid-template-columns: 1fr !important; } .stat-grid { grid-template-columns: repeat(2,1fr) !important; } }
      `}</style>

      {/* Hero */}
      <section style={{ background: `linear-gradient(135deg, ${C.blue} 0%, ${C.indigo} 100%)`, padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⭐⭐⭐⭐⭐</div>
          <h1 style={{ fontSize: 52, fontWeight: 800, color: '#fff', margin: '0 0 20px', lineHeight: 1.1 }}>
            Loved by Melbourne's property community
          </h1>
          <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: 1.6 }}>
            Thousands of landlords, tenants, and agencies trust VicRentalHub to stay compliant and informed.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '64px 24px' }}>
        <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {stats.map(s => (
            <div key={s.label} style={{ background: C.bg, borderRadius: 16, padding: '28px 24px', textAlign: 'center', border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 36, fontWeight: 800, color: C.text, marginBottom: 4 }}>{s.value}</div>
              <div style={{ color: C.textMuted, fontSize: 15 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials grid */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontSize: 40, fontWeight: 700, margin: '0 0 12px' }}>What our users say</h2>
          <p style={{ fontSize: 18, color: C.textMuted }}>Real stories from real Victorians.</p>
        </div>
        <div className="test-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {testimonials.map(t => (
            <div key={t.name} className="test-card">
              {/* Tag */}
              <div style={{ marginBottom: 16 }}>
                <span style={{ background: tagColors[t.tag].bg, color: tagColors[t.tag].text, fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 100 }}>{t.tag}</span>
              </div>
              {/* Stars */}
              <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
                {[...Array(t.stars)].map((_, i) => <span key={i} style={{ color: '#F59E0B', fontSize: 16 }}>★</span>)}
              </div>
              {/* Quote */}
              <p style={{ color: C.textMuted, lineHeight: 1.7, margin: '0 0 24px', flex: 1 }}>"{t.content}"</p>
              {/* Person */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img src={t.avatar} alt={t.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{t.name}</div>
                  <div style={{ fontSize: 13, color: C.textMuted }}>{t.role} · {t.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: C.bg, padding: '80px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 40, fontWeight: 700, margin: '0 0 16px' }}>Join thousands of happy users</h2>
          <p style={{ fontSize: 18, color: C.textMuted, margin: '0 0 32px' }}>Free for tenants. No credit card needed.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/register')} style={{ padding: '14px 32px', background: `linear-gradient(135deg, ${C.blue}, ${C.indigo})`, color: '#fff', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(30,58,138,0.3)' }}>
              Get Started Free →
            </button>
            <button onClick={() => navigate('/how-it-works')} style={{ padding: '14px 32px', background: '#fff', color: C.text, border: `1px solid ${C.border}`, borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
              See How It Works
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}