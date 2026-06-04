import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

/**
 * Home page — ported from the Figma "RentCompliance" LandingPage design.
 * Uses inline styles to stay independent of the rest of the app's CSS.
 * Navigation buttons route through react-router instead of the original onNavigate prop.
 */

// Inline SVG icon set (replaces lucide-react which isn't installed)
const Icon = {
  Home: ({ size = 20, color = 'currentColor', strokeWidth = 2 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Search: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
  ),
  Check: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  Message: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Shield: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Sparkles: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z" />
    </svg>
  ),
  Bell: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  ),
  Bar: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="20" y2="10" /><line x1="18" x2="18" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  ),
  File: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  Zap: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Star: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Arrow: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  ),
}

const C = {
  navy: '#0F172A',
  blue: '#1E3A8A',
  indigo: '#6366F1',
  green: '#10B981',
  text: '#0F172A',
  textMuted: '#64748B',
  bg: '#FAFBFC',
  border: 'rgba(15, 23, 42, 0.05)',
  amber: '#F59E0B',
}

const fontStack = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"

const features = [
  { icon: Icon.Search, title: 'Smart Property Search', description: 'Find compliant rentals with advanced filters including energy ratings and Victorian compliance scores.' },
  { icon: Icon.Shield, title: 'Compliance Tracking', description: 'Stay ahead of 2027 all-electric requirements with automated compliance monitoring and reminders.' },
  { icon: Icon.Sparkles, title: 'AI-Powered Assistant', description: 'Get instant answers about rental laws, energy upgrades, and government regulations in plain language.' },
  { icon: Icon.Bell, title: 'Real-Time Updates', description: 'Automatic monitoring of Victorian government announcements and regulation changes.' },
  { icon: Icon.Bar, title: 'Property Analytics', description: 'Comprehensive insights on rental performance, energy efficiency, and market trends.' },
  { icon: Icon.File, title: 'Document Management', description: 'Securely store and manage compliance certificates, leases, and inspection reports.' },
]

const stats = [
  { value: '5,000+', label: 'Active Properties' },
  { value: '12,000+', label: 'Happy Users' },
  { value: '98%', label: 'Compliance Rate' },
  { value: '24/7', label: 'AI Support' },
]

const testimonials = [
  { name: 'Sarah Chen', role: 'Property Owner, Richmond', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80', content: 'This platform saved me months of research. The AI assistant explained all the 2027 energy requirements in minutes, and I now have a clear upgrade roadmap.' },
  { name: 'James Mitchell', role: 'Tenant, South Yarra', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', content: "Finding a compliant rental was so easy. I love that I can see each property's energy rating and know my landlord is meeting government standards." },
  { name: 'Lisa Thompson', role: 'Portfolio Manager, Melbourne', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80', content: 'Managing 15 properties used to be overwhelming. Now I track all compliance deadlines, tenant requests, and maintenance in one beautiful dashboard.' },
]

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(to bottom, ${C.bg}, #ffffff)`, fontFamily: fontStack, color: C.text }}>
      <style>{`
        .lp-feature-card { transition: transform 200ms ease, box-shadow 200ms ease; }
        .lp-feature-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(15,23,42,0.10); }
        .lp-btn { transition: transform 120ms ease, box-shadow 120ms ease, background 120ms ease, color 120ms ease; cursor: pointer; border: none; }
        .lp-btn:hover { transform: scale(1.02); }
        .lp-btn:active { transform: scale(0.98); }
        .lp-btn-outline:hover { background: ${C.blue}; color: #fff; }
        .lp-cta-btn:hover { transform: scale(1.05); }
        .lp-link { color: ${C.textMuted}; text-decoration: none; transition: color 150ms ease; font-size: 14px; font-weight: 500; }
        .lp-link:hover { color: ${C.blue}; }
        .lp-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; }
        .lp-grid-feat { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
        .lp-grid-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; }
        .lp-grid-test { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
        .lp-grid-foot { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 32px; margin-bottom: 32px; }
        .lp-hero-title { font-size: 60px; line-height: 1.1; }
        .lp-section-title { font-size: 40px; }
        .lp-stat-num { font-size: 48px; }
        .lp-hero-stats { display: flex; align-items: center; gap: 32px; }
        @media (max-width: 1024px) {
          .lp-grid-2, .lp-grid-feat, .lp-grid-test { grid-template-columns: 1fr; }
          .lp-grid-stats { grid-template-columns: repeat(2, 1fr); }
          .lp-grid-foot { grid-template-columns: 1fr 1fr; }
          .lp-hero-title { font-size: 40px; }
          .lp-section-title { font-size: 30px; }
          .lp-nav-links { display: none !important; }
        }
        @media (max-width: 640px) {
          .lp-hero-title { font-size: 32px; }
          .lp-stat-num { font-size: 32px; }
          .lp-hero-stats { gap: 16px; flex-wrap: wrap; }
        }
      `}</style>

      {/* Navigation */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '16px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
              <div style={{
                width: 40, height: 40,
                background: `linear-gradient(135deg, ${C.blue}, ${C.indigo})`,
                borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 8px rgba(30,58,138,0.2)',
              }}>
                <Icon.Home size={20} color="white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.text }}>VicRentalHub</h1>
                <p style={{ margin: 0, fontSize: 10, color: C.textMuted }}>Melbourne Property Platform</p>
              </div>
            </Link>

            <div className="lp-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
              <a href="/features" className="lp-link" onClick={e => { e.preventDefault(); navigate('/features') }}>Features</a>
              <a href="/how-it-works" className="lp-link" onClick={e => { e.preventDefault(); navigate('/how-it-works') }}>How It Works</a>
              <a href="/testimonials" className="lp-link" onClick={e => { e.preventDefault(); navigate('/testimonials') }}>Testimonials</a>
              <button
                onClick={() => navigate('/register')}
                className="lp-btn"
                style={{
                  padding: '8px 20px', background: C.blue, color: '#fff',
                  borderRadius: 8, fontSize: 14, fontWeight: 500,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                }}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px 64px' }}>
        <div className="lp-grid-2">
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 16px', background: 'rgba(16,185,129,0.1)',
              borderRadius: 999, marginBottom: 24,
            }}>
              <Icon.Sparkles size={16} />
              <span style={{ fontSize: 14, fontWeight: 500, color: C.green }}>AI-Powered Compliance Platform</span>
            </div>

            <h1 className="lp-hero-title" style={{ fontWeight: 700, color: C.text, marginBottom: 24 }}>
              Smart Rental & Energy Compliance Platform for{' '}
              <span style={{
                background: `linear-gradient(to right, ${C.blue}, ${C.indigo})`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>Melbourne</span>
            </h1>

            <p style={{ fontSize: 18, color: C.textMuted, marginBottom: 32, lineHeight: 1.7 }}>
              Helping landlords and tenants stay compliant, informed, and connected with AI-powered tools and real-time government updates.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 48 }}>
              <button
                onClick={() => navigate('/rentals')}
                className="lp-btn"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '14px 24px', background: C.blue, color: '#fff',
                  borderRadius: 12, fontWeight: 600, fontSize: 15,
                  boxShadow: '0 10px 25px rgba(30,58,138,0.25)',
                }}
              >
                <Icon.Search size={20} /> Find Rentals
              </button>

              <button
                onClick={() => navigate('/analyse')}
                className="lp-btn lp-btn-outline"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '14px 24px', background: '#fff', color: C.blue,
                  border: `2px solid ${C.blue}`, borderRadius: 12,
                  fontWeight: 600, fontSize: 15,
                }}
              >
                <Icon.Check size={20} /> Check Compliance
              </button>

              <button
                onClick={() => navigate('/chat')}
                className="lp-btn"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '14px 24px', background: C.green, color: '#fff',
                  borderRadius: 12, fontWeight: 600, fontSize: 15,
                  boxShadow: '0 10px 25px rgba(16,185,129,0.25)',
                }}
              >
                <Icon.Message size={20} /> Talk to AI Assistant
              </button>
            </div>

            <div className="lp-hero-stats">
              {stats.slice(0, 3).map((stat) => (
                <div key={stat.label}>
                  <div className="lp-stat-num" style={{ fontWeight: 700, color: C.blue }}>{stat.value}</div>
                  <div style={{ fontSize: 14, color: C.textMuted }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, rgba(30,58,138,0.2), rgba(16,185,129,0.2))',
              borderRadius: 24, filter: 'blur(48px)',
            }} />
            <img
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80"
              alt="Modern Melbourne property"
              style={{ position: 'relative', borderRadius: 16, width: '100%', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}
            />
            <div style={{
              position: 'absolute', bottom: -24, left: -24,
              background: '#fff', borderRadius: 16, padding: 16,
              boxShadow: '0 10px 25px rgba(0,0,0,0.10)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 48, height: 48, background: C.green, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon.Zap size={24} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Energy Compliant</div>
                  <div style={{ fontSize: 12, color: C.textMuted }}>2027 Ready</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h2 className="lp-section-title" style={{ fontWeight: 700, color: C.text, marginBottom: 16 }}>
            Everything you need to stay compliant
          </h2>
          <p style={{ fontSize: 18, color: C.textMuted, maxWidth: 640, margin: '0 auto' }}>
            Comprehensive tools for landlords, tenants, and property managers to navigate Victorian rental regulations.
          </p>
        </div>

        <div className="lp-grid-feat">
          {features.map((f) => (
            <div key={f.title} className="lp-feature-card" style={{
              background: '#fff', borderRadius: 16, padding: 24,
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              border: `1px solid ${C.border}`,
            }}>
              <div style={{
                width: 48, height: 48,
                background: `linear-gradient(135deg, ${C.blue}, ${C.indigo})`,
                borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16, color: 'white',
              }}>
                <f.icon size={24} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 600, color: C.text, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: C.textMuted, margin: 0 }}>{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.indigo})`, padding: '64px 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <div className="lp-grid-stats">
            {stats.map((s) => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div className="lp-stat-num" style={{ fontWeight: 700, color: '#fff', marginBottom: 8 }}>{s.value}</div>
                <div style={{ color: 'rgba(255,255,255,0.8)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h2 className="lp-section-title" style={{ fontWeight: 700, color: C.text, marginBottom: 16 }}>
            Trusted by Melbourne's property community
          </h2>
          <p style={{ fontSize: 18, color: C.textMuted }}>See what our users have to say</p>
        </div>

        <div className="lp-grid-test">
          {testimonials.map((t) => (
            <div key={t.name} style={{
              background: '#fff', borderRadius: 16, padding: 24,
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              border: `1px solid ${C.border}`,
            }}>
              <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                {[...Array(5)].map((_, i) => <Icon.Star key={i} />)}
              </div>
              <p style={{ color: C.textMuted, marginBottom: 24, lineHeight: 1.7 }}>{t.content}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img src={t.avatar} alt={t.name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <div style={{ fontWeight: 600, color: C.text }}>{t.name}</div>
                  <div style={{ fontSize: 14, color: C.textMuted }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{
          background: `linear-gradient(135deg, ${C.blue}, ${C.indigo})`,
          borderRadius: 24, padding: 48, textAlign: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'relative', zIndex: 10 }}>
            <h2 className="lp-section-title" style={{ fontWeight: 700, color: '#fff', marginBottom: 16 }}>
              Ready to get started?
            </h2>
            <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.9)', marginBottom: 32, maxWidth: 640, margin: '0 auto 32px' }}>
              Join thousands of landlords and tenants using VicRentalHub to stay ahead of Victorian regulations.
            </p>
            <button
              onClick={() => navigate('/register')}
              className="lp-btn lp-cta-btn"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '16px 32px', background: '#fff', color: C.blue,
                borderRadius: 12, fontWeight: 600, fontSize: 16,
                boxShadow: '0 10px 25px rgba(0,0,0,0.10)',
              }}
            >
              Start Free Trial <Icon.Arrow size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: C.navy, color: '#fff' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px' }}>
          <div className="lp-grid-foot">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{
                  width: 32, height: 32,
                  background: `linear-gradient(135deg, ${C.blue}, ${C.indigo})`,
                  borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon.Home size={16} color="white" />
                </div>
                <span style={{ fontWeight: 700 }}>VicRentalHub</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, margin: 0 }}>
                Melbourne's leading rental and energy compliance platform.
              </p>
            </div>

            <div>
              <h4 style={{ fontWeight: 600, marginBottom: 16, fontSize: 14 }}>Product</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li><Link to="/analyse" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Compliance Check</Link></li>
                <li><Link to="/pricing" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Pricing</Link></li>
                <li><Link to="/rentals" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Find Rentals</Link></li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontWeight: 600, marginBottom: 16, fontSize: 14 }}>Resources</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li><Link to="/standards" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Standards</Link></li>
                <li><Link to="/rights" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Tenant Rights</Link></li>
                <li><Link to="/chat" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>AI Assistant</Link></li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontWeight: 600, marginBottom: 16, fontSize: 14 }}>External</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li><a href="https://www.consumer.vic.gov.au" target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Consumer Affairs Vic</a></li>
                <li><a href="https://www.tenantsvic.org.au" target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Tenants Victoria</a></li>
                <li><a href="https://www.energy.vic.gov.au" target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Energy Victoria</a></li>
              </ul>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 32, textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
            <p style={{ margin: 0 }}>© 2026 VicRentalHub. All rights reserved. Melbourne, Victoria, Australia.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}