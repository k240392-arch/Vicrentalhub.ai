import React, { useState, useEffect, useRef } from 'react'
import { Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './state/AuthContext.jsx'
import { Spinner } from './components/UI.jsx'
 
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import PropertyFormPage from './pages/PropertyFormPage.jsx'
import AnalysisPage from './pages/AnalysisPage.jsx'
import RentalsPage from './pages/RentalsPage.jsx'
import TenantToolsPage from './pages/TenantToolsPage.jsx'
import RightsPage from './pages/RightsPage.jsx'
import ChatPage from './pages/ChatPage.jsx'
import PricingPage from './pages/PricingPage.jsx'
import ReportsPage from './pages/ReportsPage.jsx'
import StandardsReferencePage from './pages/StandardsReferencePage.jsx'
import FeaturesPage from './pages/FeaturesPage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import HowItWorksPage from './pages/HowItWorksPage.jsx'
import TestimonialsPage from './pages/TestimonialsPage.jsx'
 
// ─── Route classification ─────────────────────────────────────────────
const PUBLIC_ROUTES = ['/', '/login', '/register']
 
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <div className="container mt-4"><Spinner label="Loading…" /></div>
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return children
}
 
// ─── Inline icons ─────────────────────────────────────────────────────
const Ic = {
  Home: ({ size = 18 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Grid: ({ size = 18 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>,
  Search: ({ size = 18 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  Check: ({ size = 18 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  Tools: ({ size = 18 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  Book: ({ size = 18 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  Shield: ({ size = 18 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Chat: ({ size = 18 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  File: ({ size = 18 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>,
  Bell: ({ size = 18 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>,
  ChevronDown: ({ size = 14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  LogOut: ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>,
  Settings: ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
  Plus: ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
}
 
// ─── Public marketing navbar (logged-out users browsing inner pages) ──
// ─── Floating AI Chatbot ─────────────────────────────────────────────
function FloatingChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '👋 Hi! I\'m your VicRentalHub AI. Ask me anything about Victorian rental law, bonds, repairs, or tenant rights!' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
 
  useEffect(() => {
    if (open && bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])
 
  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg = { role: 'user', content: input.trim() }
    const newMsgs = [...messages, userMsg]
    setMessages(newMsgs)
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMsgs.slice(-10) })
      })
      const data = await res.json()
      setMessages(m => [...m, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Sorry, connection error. Please try again.' }])
    }
    setLoading(false)
  }
 
  return (
    <>
      <style>{`
        .fc-btn { position:fixed; bottom:24px; right:24px; z-index:9999; width:56px; height:56px; border-radius:50%; background:linear-gradient(135deg,#1E3A8A,#6366F1); border:none; cursor:pointer; box-shadow:0 4px 16px rgba(30,58,138,0.4); display:flex; align-items:center; justify-content:center; }
        .fc-btn:hover { transform:scale(1.08); }
        .fc-window { position:fixed; bottom:92px; right:24px; width:360px; height:520px; background:white; border-radius:20px; box-shadow:0 8px 40px rgba(0,0,0,0.15); display:flex; flex-direction:column; overflow:hidden; z-index:9999; border:1px solid #E2E8F0; }
        .fc-header { background:linear-gradient(135deg,#1E3A8A,#6366F1); padding:16px 20px; display:flex; align-items:center; gap:12px; }
        .fc-msgs { flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:12px; background:#F8FAFC; }
        .fc-ai { background:white; border:1px solid #E2E8F0; border-radius:12px 12px 12px 4px; padding:10px 14px; font-size:13.5px; color:#1E293B; line-height:1.5; max-width:85%; }
        .fc-user { background:linear-gradient(135deg,#1E3A8A,#6366F1); color:white; border-radius:12px 12px 4px 12px; padding:10px 14px; font-size:13.5px; line-height:1.5; max-width:85%; align-self:flex-end; }
        .fc-row { padding:12px; border-top:1px solid #E2E8F0; display:flex; gap:8px; background:white; }
        .fc-input { flex:1; border:1px solid #E2E8F0; border-radius:10px; padding:9px 12px; font-size:13.5px; outline:none; font-family:inherit; }
        .fc-input:focus { border-color:#6366F1; }
        .fc-send { width:36px; height:36px; border-radius:10px; background:linear-gradient(135deg,#1E3A8A,#6366F1); border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .fc-send:disabled { opacity:0.5; cursor:not-allowed; }
        .fc-dot { width:6px; height:6px; border-radius:50%; background:#94A3B8; animation:fc-b 1.2s infinite; display:inline-block; margin:0 2px; }
        .fc-dot:nth-child(2){animation-delay:0.2s} .fc-dot:nth-child(3){animation-delay:0.4s}
        @keyframes fc-b{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}
      `}</style>
      {open && (
        <div className="fc-window">
          <div className="fc-header">
            <div style={{width:36,height:36,borderRadius:'50%',background:'rgba(255,255,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <div>
              <div style={{color:'white',fontWeight:700,fontSize:15}}>VicRentalHub AI</div>
              <div style={{color:'rgba(255,255,255,0.7)',fontSize:12}}>Victorian Rental Expert</div>
            </div>
            <button onClick={() => setOpen(false)} style={{marginLeft:'auto',background:'rgba(255,255,255,0.15)',border:'none',borderRadius:8,width:28,height:28,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div className="fc-msgs">
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'fc-user' : 'fc-ai'}>{m.content}</div>
            ))}
            {loading && <div className="fc-ai"><span className="fc-dot"/><span className="fc-dot"/><span className="fc-dot"/></div>}
            <div ref={bottomRef} />
          </div>
          <div className="fc-row">
            <input className="fc-input" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==='Enter' && send()} placeholder="Ask about bonds, repairs, rights..."/>
            <button className="fc-send" onClick={send} disabled={loading||!input.trim()}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      )}
      <button className="fc-btn" onClick={() => setOpen(o => !o)}>
        {open
          ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        }
      </button>
    </>
  )
}
 
// ─── Public navbar (logo + Get Started only) ──────────────────────────
function PublicNavbar() {
  const navigate = useNavigate()
  return (
    <nav style={{position:'sticky',top:0,zIndex:50,background:'rgba(255,255,255,0.92)',backdropFilter:'blur(16px)',borderBottom:'1px solid #E2E8F0'}}>
      <div style={{maxWidth:1280,margin:'0 auto',padding:'14px 24px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <Link to="/" style={{display:'flex',alignItems:'center',gap:12,textDecoration:'none'}}>
          <div style={{width:40,height:40,background:'linear-gradient(135deg,#1E3A8A,#6366F1)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 8px rgba(30,58,138,0.2)'}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <div>
            <div style={{fontSize:18,fontWeight:700,color:'#0F172A',lineHeight:1.2}}>VicRentalHub</div>
            <div style={{fontSize:10,color:'#94A3B8',lineHeight:1.2}}>Melbourne Property Platform</div>
          </div>
        </Link>
        <button onClick={() => navigate('/register')} style={{padding:'8px 18px',background:'#1E3A8A',color:'#fff',borderRadius:8,fontSize:14,fontWeight:600,border:'none',cursor:'pointer',fontFamily:'inherit',boxShadow:'0 2px 8px rgba(30,58,138,0.25)'}}>
          Get Started
        </button>
      </div>
    </nav>
  )
}
 
 
const APP_NAV = [
  { to: '/dashboard',  label: 'Dashboard',    icon: Ic.Grid,   role: 'landlord+tenant' },
  { to: '/rentals',    label: 'Find Rentals', icon: Ic.Search, role: 'all' },
  { to: '/analyse',    label: 'Analyse',      icon: Ic.Check,  role: 'landlord+agency' },
  { to: '/tenant',     label: 'Tenant Tools', icon: Ic.Tools,  role: 'all' },
  { to: '/rights',     label: 'Rights',       icon: Ic.Book,   role: 'all' },
  { to: '/standards',  label: 'Standards',    icon: Ic.Shield, role: 'all' },
  { to: '/chat',       label: 'Ask',          icon: Ic.Chat,   role: 'all' },
  { to: '/reports',    label: 'Reports',      icon: Ic.File,   role: 'landlord+agency' },
]
 
function AppShell({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
 
  const visibleNav = APP_NAV.filter((item) => {
    if (item.role === 'all') return true
    if (item.role === 'landlord+tenant') return true
    if (item.role === 'landlord+agency') return user?.role === 'landlord' || user?.role === 'agency'
    return true
  })
 
  const initials = (user?.full_name || user?.email || 'U').split(/[\s@]/).filter(Boolean).slice(0, 2).map(s => s[0]).join('').toUpperCase()
  const roleLabel = user?.role === 'landlord' ? 'Landlord' : user?.role === 'agency' ? 'Agency' : user?.role === 'admin' ? 'Admin' : 'Tenant'
 
  const handleLogout = () => {
    logout()
    setMenuOpen(false)
    navigate('/')
  }
 
  // Role-based gradient for the user/brand mark
  const brandGrad = user?.role === 'landlord' ? 'linear-gradient(135deg, #10B981, #059669)'
                  : user?.role === 'agency'   ? 'linear-gradient(135deg, #6366F1, #8B5CF6)'
                  :                              'linear-gradient(135deg, #1E3A8A, #6366F1)'
 
  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        .as-topbar { position: sticky; top: 0; z-index: 40; background: rgba(255,255,255,0.92); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(15,23,42,0.06); }
        .as-inner { max-width: 1400px; margin: 0 auto; padding: 12px 24px; display: flex; align-items: center; gap: 24px; }
        .as-brand { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .as-brand-mark { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #fff; box-shadow: 0 4px 8px rgba(15,23,42,0.10); }
        .as-brand h1 { margin: 0; font-size: 16px; font-weight: 700; color: #0F172A; }
        .as-brand p { margin: 0; font-size: 11px; color: #64748B; }
        .as-nav { display: flex; align-items: center; gap: 4px; flex: 1; justify-content: center; }
        .as-link { display: flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: 8px; color: #64748B; text-decoration: none; font-size: 13px; font-weight: 500; transition: all 150ms; white-space: nowrap; }
        .as-link:hover { color: #1E3A8A; background: rgba(30,58,138,0.05); }
        .as-link.active { color: #1E3A8A; background: rgba(30,58,138,0.08); }
        .as-right { display: flex; align-items: center; gap: 8px; }
        .as-iconbtn { background: transparent; border: none; padding: 8px; border-radius: 8px; cursor: pointer; color: #64748B; transition: all 150ms; position: relative; }
        .as-iconbtn:hover { background: rgba(15,23,42,0.05); color: #0F172A; }
        .as-bell-dot { position: absolute; top: 6px; right: 6px; width: 8px; height: 8px; background: #EF4444; border-radius: 50%; border: 2px solid white; }
        .as-userbtn { display: flex; align-items: center; gap: 8px; padding: 4px 10px 4px 4px; border-radius: 999px; background: transparent; border: 1px solid transparent; cursor: pointer; transition: all 150ms; }
        .as-userbtn:hover { background: rgba(15,23,42,0.05); border-color: rgba(15,23,42,0.08); }
        .as-avatar { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 600; font-size: 13px; }
        .as-username { font-size: 13px; font-weight: 600; color: #0F172A; line-height: 1.1; }
        .as-userrole { font-size: 11px; color: #64748B; line-height: 1.1; }
        .as-menu { position: absolute; top: 100%; right: 0; margin-top: 8px; background: #fff; border: 1px solid rgba(15,23,42,0.08); border-radius: 12px; box-shadow: 0 10px 30px rgba(15,23,42,0.10); min-width: 220px; padding: 8px; z-index: 50; }
        .as-menu-item { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 12px; background: transparent; border: none; border-radius: 8px; color: #0F172A; font-size: 13px; font-weight: 500; cursor: pointer; text-align: left; text-decoration: none; font-family: inherit; }
        .as-menu-item:hover { background: rgba(15,23,42,0.05); }
        .as-menu-item.danger { color: #EF4444; }
        .as-menu-item.danger:hover { background: rgba(239,68,68,0.06); }
        .as-menu-divider { height: 1px; background: rgba(15,23,42,0.08); margin: 4px 0; }
        .as-menu-header { padding: 10px 12px; border-bottom: 1px solid rgba(15,23,42,0.08); margin-bottom: 4px; }
        .as-menu-header-name { font-size: 13px; font-weight: 600; color: #0F172A; }
        .as-menu-header-email { font-size: 12px; color: #64748B; }
        .as-content { max-width: 1400px; margin: 0 auto; padding: 32px 24px 64px; }
        .as-cta { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; background: linear-gradient(135deg, #1E3A8A, #6366F1); color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 10px rgba(30,58,138,0.20); transition: all 150ms; text-decoration: none; font-family: inherit; }
        .as-cta:hover { transform: translateY(-1px); box-shadow: 0 6px 14px rgba(30,58,138,0.28); }
        @media (max-width: 1100px) {
          .as-nav { display: none; }
          .as-mobile-nav { display: block; }
        }
        @media (min-width: 1101px) {
          .as-mobile-nav { display: none; }
        }
        .as-mobile-nav { width: 100%; overflow-x: auto; padding: 8px 24px 12px; border-top: 1px solid rgba(15,23,42,0.04); background: #fff; }
        .as-mobile-nav-inner { display: flex; gap: 4px; min-width: max-content; }
        @media (max-width: 640px) {
          .as-username, .as-userrole { display: none; }
          .as-userbtn { padding: 4px; }
          .as-cta-label { display: none; }
        }
      `}</style>
 
      <header className="as-topbar">
        <div className="as-inner">
          <Link to="/dashboard" className="as-brand">
            <div className="as-brand-mark" style={{ background: brandGrad }}>
              <Ic.Home size={18} />
            </div>
            <div>
              <h1>VicRentalHub</h1>
              <p>{roleLabel} Dashboard</p>
            </div>
          </Link>
 
          <nav className="as-nav">
            {visibleNav.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `as-link ${isActive ? 'active' : ''}`}>
                <item.icon /> {item.label}
              </NavLink>
            ))}
          </nav>
 
          <div className="as-right">
            {(user?.role === 'landlord' || user?.role === 'agency') && (
              <Link to="/properties/new" className="as-cta">
                <Ic.Plus />
                <span className="as-cta-label">Add Property</span>
              </Link>
            )}
 
            <button className="as-iconbtn" aria-label="Notifications">
              <Ic.Bell />
              <span className="as-bell-dot" />
            </button>
 
            <div style={{ position: 'relative' }}>
              <button className="as-userbtn" onClick={() => setMenuOpen(!menuOpen)}>
                <div className="as-avatar" style={{ background: brandGrad }}>{initials}</div>
                <div style={{ textAlign: 'left' }}>
                  <div className="as-username">{user?.full_name || user?.email?.split('@')[0]}</div>
                  <div className="as-userrole">{roleLabel}</div>
                </div>
                <Ic.ChevronDown />
              </button>
 
              {menuOpen && (
                <>
                  <div
                    onClick={() => setMenuOpen(false)}
                    style={{ position: 'fixed', inset: 0, zIndex: 49 }}
                  />
                  <div className="as-menu">
                    <div className="as-menu-header">
                      <div className="as-menu-header-name">{user?.full_name || 'Account'}</div>
                      <div className="as-menu-header-email">{user?.email}</div>
                    </div>
                    <Link to="/dashboard" className="as-menu-item" onClick={() => setMenuOpen(false)}>
                      <Ic.Grid /> Dashboard
                    </Link>
                    <Link to="/reports" className="as-menu-item" onClick={() => setMenuOpen(false)}>
                      <Ic.File /> My Reports
                    </Link>
                    <button className="as-menu-item" onClick={() => setMenuOpen(false)}>
                      <Ic.Settings /> Settings
                    </button>
                    <div className="as-menu-divider" />
                    <button className="as-menu-item danger" onClick={handleLogout}>
                      <Ic.LogOut /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
 
        {/* Mobile nav strip — appears below the topbar on small screens */}
        <div className="as-mobile-nav">
          <div className="as-mobile-nav-inner">
            {visibleNav.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `as-link ${isActive ? 'active' : ''}`}>
                <item.icon /> {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </header>
 
      <main className="as-content">{children}</main>
    </div>
  )
}
 
// ─── Layout chooser ───────────────────────────────────────────────────
function Layout({ children }) {
  const { user } = useAuth()
  const location = useLocation()
  const path = location.pathname
 
  if (path === '/' || path === '/login' || path === '/register') {
    return <>{children}<FloatingChat /></>
  }
 
  if (user) {
    return <AppShell>{children}</AppShell>
  }
 
  return (
    <>
      <PublicNavbar />
      <main>{children}</main>
      <FloatingChat />
    </>
  )
}
 
 
export default function App() {
  return (
    <Routes>
      <Route path="/"          element={<Layout><HomePage /></Layout>} />
      <Route path="/login"     element={<Layout><LoginPage /></Layout>} />
      <Route path="/register"  element={<Layout><RegisterPage /></Layout>} />
      <Route path="/rentals"   element={<Layout><RentalsPage /></Layout>} />
      <Route path="/analyse"   element={<Layout><AnalysisPage /></Layout>} />
      <Route path="/tenant"    element={<Layout><TenantToolsPage /></Layout>} />
      <Route path="/rights"    element={<Layout><RightsPage /></Layout>} />
      <Route path="/standards" element={<Layout><StandardsReferencePage /></Layout>} />
      <Route path="/chat"      element={<Layout><ChatPage /></Layout>} />
      <Route path="/pricing"   element={<Layout><PricingPage /></Layout>} />
      <Route path="/features"     element={<Layout><FeaturesPage /></Layout>} />
      <Route path="/how-it-works" element={<Layout><HowItWorksPage /></Layout>} />
      <Route path="/testimonials" element={<Layout><TestimonialsPage /></Layout>} />
      <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
 
      <Route path="/dashboard" element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
      <Route path="/properties/new" element={<ProtectedRoute><Layout><PropertyFormPage /></Layout></ProtectedRoute>} />
      <Route path="/properties/:id/edit" element={<ProtectedRoute><Layout><PropertyFormPage /></Layout></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Layout><ReportsPage /></Layout></ProtectedRoute>} />
 
      <Route path="*" element={<Layout><div className="container mt-4"><h2>Page not found</h2><Link to="/">← back home</Link></div></Layout>} />
    </Routes>
  )
}