import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'

/**
 * Combined login + register page, split-screen layout.
 * Used by both /login and /register routes — toggled by the `mode` prop.
 * Wired to the existing useAuth() context so it talks to the real backend.
 */

const C = {
  navy: '#0F172A',
  blue: '#1E3A8A',
  indigo: '#6366F1',
  green: '#10B981',
  greenDark: '#059669',
  purple: '#8B5CF6',
  text: '#0F172A',
  textMuted: '#64748B',
  bg: '#FAFBFC',
  bgAlt: '#F1F5F9',
  inputBg: '#F8FAFC',
  border: 'rgba(15, 23, 42, 0.05)',
  borderInput: 'rgba(15, 23, 42, 0.1)',
  red: '#EF4444',
}

const fontStack = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"

// Inline SVG icons (matches HomePage approach — no external dep)
const Icon = {
  Home: ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Mail: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
  Lock: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  User: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Building: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M12 6h.01" /><path d="M12 10h.01" /><path d="M12 14h.01" /><path d="M16 10h.01" /><path d="M16 14h.01" /><path d="M8 10h.01" /><path d="M8 14h.01" />
    </svg>
  ),
  Shield: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Eye: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  EyeOff: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  ),
  Arrow: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
    </svg>
  ),
  Check: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
}

const userTypes = [
  { id: 'tenant',   icon: Icon.User,     title: 'Tenant',   gradient: ['#1E3A8A', '#6366F1'] },
  { id: 'landlord', icon: Icon.Building, title: 'Landlord', gradient: ['#10B981', '#059669'] },
  { id: 'agency',   icon: Icon.Shield,   title: 'Agency',   gradient: ['#6366F1', '#8B5CF6'] },
]

const features = [
  { title: 'Real-time Government Updates', desc: 'Automated monitoring of Victorian rental regulations.' },
  { title: 'AI-Powered Compliance Assistant', desc: 'Get instant answers about rental laws and energy requirements.' },
  { title: 'Enterprise-Grade Security', desc: 'Bank-level encryption and data protection.' },
]

const stats = [
  { value: '98%', label: 'Compliance Rate' },
  { value: '5k+', label: 'Properties' },
  { value: '24/7', label: 'AI Support' },
]

export default function AuthPage({ mode = 'login' }) {
  const isLogin = mode === 'login'
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [userType, setUserType] = useState('tenant')
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    email: isLogin ? 'demo@vicrentalhub.ai' : '',
    password: isLogin ? 'demo1234' : '',
    full_name: '',
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (isLogin) {
        await login(form.email, form.password)
        const from = location.state?.from?.pathname || '/dashboard'
        navigate(from)
      } else {
        await register({
          email: form.email,
          password: form.password,
          full_name: form.full_name,
          role: userType,
        })
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message || (isLogin ? 'Sign in failed' : 'Registration failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${C.bg} 0%, #ffffff 50%, ${C.bgAlt} 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: fontStack,
    }}>
      <style>{`
        .auth-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; max-width: 1200px; width: 100%; align-items: center; }
        .auth-card { background: #fff; border-radius: 24px; box-shadow: 0 25px 50px rgba(15,23,42,0.10); padding: 48px; }
        .auth-input { width: 100%; padding: 14px 16px 14px 48px; background: ${C.inputBg}; border-radius: 12px; border: 2px solid ${C.border}; font-size: 15px; color: ${C.text}; transition: all 200ms; outline: none; font-family: inherit; box-sizing: border-box; }
        .auth-input:focus { border-color: ${C.blue}; background: #fff; box-shadow: 0 0 0 4px rgba(30,58,138,0.08); }
        .auth-input::placeholder { color: #94A3B8; }
        .auth-input.has-eye { padding-right: 48px; }
        .auth-icon-wrap { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: ${C.textMuted}; pointer-events: none; }
        .auth-eye-btn { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: transparent; border: none; cursor: pointer; color: ${C.textMuted}; padding: 6px; border-radius: 6px; display: flex; align-items: center; }
        .auth-eye-btn:hover { color: ${C.blue}; background: rgba(30,58,138,0.06); }
        .auth-type-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .auth-type-btn { position: relative; padding: 16px 12px; border-radius: 12px; border: 2px solid ${C.borderInput}; background: #fff; cursor: pointer; transition: all 200ms; text-align: center; font-family: inherit; }
        .auth-type-btn:hover { border-color: rgba(30,58,138,0.3); transform: translateY(-2px); }
        .auth-type-btn.active { border-color: ${C.blue}; background: rgba(30,58,138,0.04); box-shadow: 0 4px 12px rgba(30,58,138,0.10); }
        .auth-type-icon { width: 40px; height: 40px; margin: 0 auto 8px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; }
        .auth-submit { width: 100%; padding: 16px; background: linear-gradient(to right, ${C.blue}, ${C.indigo}); color: #fff; border: none; border-radius: 12px; font-weight: 600; font-size: 15px; cursor: pointer; box-shadow: 0 10px 25px rgba(30,58,138,0.25); transition: all 200ms; font-family: inherit; }
        .auth-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 15px 30px rgba(30,58,138,0.30); }
        .auth-submit:active:not(:disabled) { transform: translateY(0); }
        .auth-submit:disabled { opacity: 0.7; cursor: not-allowed; }
        .auth-back-btn { display: inline-flex; align-items: center; gap: 8px; color: ${C.textMuted}; background: transparent; border: none; cursor: pointer; font-size: 14px; font-weight: 500; padding: 0; transition: color 150ms; font-family: inherit; }
        .auth-back-btn:hover { color: ${C.blue}; }
        .auth-back-btn svg { transition: transform 200ms; }
        .auth-back-btn:hover svg { transform: translateX(-3px); }
        .auth-feature-row { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 16px; }
        .auth-feature-tick { width: 24px; height: 24px; border-radius: 50%; background: ${C.green}; display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0; margin-top: 2px; }
        .auth-stat-card { background: rgba(255,255,255,0.12); backdrop-filter: blur(8px); border-radius: 12px; padding: 16px; text-align: center; }
        .auth-form-group { margin-bottom: 18px; }
        .auth-form-label { display: block; font-size: 13px; font-weight: 600; color: ${C.text}; margin-bottom: 8px; }
        .auth-checkbox-row { display: flex; align-items: center; justify-content: space-between; }
        .auth-link { color: ${C.blue}; font-weight: 600; text-decoration: none; font-size: 14px; }
        .auth-link:hover { text-decoration: underline; }
        .auth-error { background: #FEE2E2; border-left: 4px solid ${C.red}; color: #7F1D1D; padding: 12px 16px; border-radius: 8px; font-size: 14px; margin-bottom: 20px; }
        @media (max-width: 1024px) {
          .auth-grid { grid-template-columns: 1fr; max-width: 560px; }
          .auth-side { display: none; }
          .auth-card { padding: 32px; }
        }
        @media (max-width: 480px) {
          .auth-card { padding: 24px; border-radius: 16px; }
          .auth-type-grid { gap: 8px; }
          .auth-type-btn { padding: 12px 8px; }
        }
      `}</style>

      <div className="auth-grid">
        {/* LEFT: Form card */}
        <div className="auth-card">
          <button className="auth-back-btn" onClick={() => navigate('/')} style={{ marginBottom: 32 }}>
            <Icon.Arrow /> Back to Home
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <div style={{
              width: 48, height: 48,
              background: `linear-gradient(135deg, ${C.blue}, ${C.indigo})`,
              borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(30,58,138,0.25)',
            }}>
              <Icon.Home size={24} color="white" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: C.text }}>VicRentalHub</h1>
              <p style={{ margin: 0, fontSize: 13, color: C.textMuted }}>Secure Access</p>
            </div>
          </div>

          <h2 style={{ margin: 0, fontSize: 30, fontWeight: 700, color: C.text, marginBottom: 8 }}>
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h2>
          <p style={{ margin: 0, color: C.textMuted, marginBottom: 32, fontSize: 15 }}>
            {isLogin ? 'Enter your credentials to access your dashboard' : 'Join thousands managing compliant Victorian properties'}
          </p>

          {error && <div className="auth-error">{error}</div>}

          {/* User type selector — only on register */}
          {!isLogin && (
            <div style={{ marginBottom: 28 }}>
              <label className="auth-form-label" style={{ marginBottom: 12 }}>I am a</label>
              <div className="auth-type-grid">
                {userTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setUserType(type.id)}
                    className={`auth-type-btn ${userType === type.id ? 'active' : ''}`}
                  >
                    <div className="auth-type-icon" style={{
                      background: `linear-gradient(135deg, ${type.gradient[0]}, ${type.gradient[1]})`,
                    }}>
                      <type.icon size={20} />
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{type.title}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="auth-form-group">
                <label className="auth-form-label" htmlFor="full_name">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <span className="auth-icon-wrap"><Icon.User /></span>
                  <input
                    id="full_name"
                    type="text"
                    className="auth-input"
                    value={form.full_name}
                    onChange={update('full_name')}
                    placeholder="Jane Smith"
                    required
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            <div className="auth-form-group">
              <label className="auth-form-label" htmlFor="email">Email Address</label>
              <div style={{ position: 'relative' }}>
                <span className="auth-icon-wrap"><Icon.Mail /></span>
                <input
                  id="email"
                  type="email"
                  className="auth-input"
                  value={form.email}
                  onChange={update('email')}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-form-group">
              <label className="auth-form-label" htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <span className="auth-icon-wrap"><Icon.Lock /></span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input has-eye"
                  value={form.password}
                  onChange={update('password')}
                  placeholder="••••••••"
                  required
                  minLength={isLogin ? undefined : 6}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <Icon.EyeOff /> : <Icon.Eye />}
                </button>
              </div>
              {!isLogin && (
                <div style={{ fontSize: 12, color: C.textMuted, marginTop: 6 }}>Minimum 6 characters.</div>
              )}
            </div>

            {isLogin && (
              <div className="auth-checkbox-row" style={{ marginBottom: 24 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: C.textMuted, cursor: 'pointer' }}>
                  <input type="checkbox" style={{ width: 16, height: 16, accentColor: C.blue }} />
                  Remember me
                </label>
                <a href="#" className="auth-link" onClick={(e) => e.preventDefault()}>Forgot password?</a>
              </div>
            )}

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? (isLogin ? 'Signing in…' : 'Creating account…') : (isLogin ? 'Sign In' : 'Create Account')}
            </button>

            <div style={{ textAlign: 'center', paddingTop: 20, fontSize: 14, color: C.textMuted }}>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <Link to={isLogin ? '/register' : '/login'} className="auth-link">
                {isLogin ? 'Sign Up' : 'Sign In'}
              </Link>
            </div>
          </form>

          {isLogin && (
            <div style={{
              marginTop: 24, padding: 12, borderRadius: 8,
              background: 'rgba(30,58,138,0.05)',
              fontSize: 13, color: C.textMuted, textAlign: 'center',
            }}>
              <strong style={{ color: C.text }}>Demo:</strong> demo@vicrentalhub.ai / demo1234
            </div>
          )}
        </div>

        {/* RIGHT: Marketing panel */}
        <div className="auth-side">
          <div style={{
            background: `linear-gradient(135deg, ${C.blue}, ${C.indigo})`,
            borderRadius: 24,
            padding: 48,
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 25px 50px rgba(30,58,138,0.30)',
          }}>
            {/* Decorative gradient orb */}
            <div style={{
              position: 'absolute',
              top: -120, right: -120,
              width: 400, height: 400,
              background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
              borderRadius: '50%',
              pointerEvents: 'none',
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '8px 16px',
                background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)',
                borderRadius: 999, marginBottom: 24,
              }}>
                <span style={{
                  width: 8, height: 8, background: C.green, borderRadius: '50%',
                  animation: 'auth-pulse 2s ease-in-out infinite',
                }} />
                <span style={{ fontSize: 13, fontWeight: 500 }}>Trusted by 12,000+ users</span>
              </div>

              <h3 style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.2, margin: 0, marginBottom: 16 }}>
                Stay compliant with Victoria's 2027 energy regulations
              </h3>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, margin: 0, marginBottom: 32 }}>
                Join Melbourne's leading platform for rental compliance, property management, and AI-powered assistance.
              </p>

              <div style={{ marginBottom: 32 }}>
                {features.map((f) => (
                  <div key={f.title} className="auth-feature-row">
                    <div className="auth-feature-tick"><Icon.Check /></div>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 2 }}>{f.title}</div>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {stats.map((s) => (
                  <div key={s.label} className="auth-stat-card">
                    <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 2 }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes auth-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
      `}</style>
    </div>
  )
}