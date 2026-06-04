import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'
 
const C = { blue: '#1E3A8A', indigo: '#6366F1', text: '#0F172A', muted: '#64748B', border: '#E2E8F0', bg: '#F8FAFC', red: '#EF4444', green: '#10B981', yellow: '#F59E0B' }
 
const api = (path, opts = {}) => fetch(path, { headers: { Authorization: `Bearer ${localStorage.getItem('vrh_token')}`, 'Content-Type': 'application/json', ...opts.headers }, ...opts }).then(r => r.json())
 
function StatCard({ icon, label, value, color = C.blue }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 800, color: C.text }}>{value}</div>
        <div style={{ fontSize: 13, color: C.muted }}>{label}</div>
      </div>
    </div>
  )
}
 
function Badge({ text, color }) {
  const colors = {
    green: { bg: '#ECFDF5', text: '#059669' },
    red: { bg: '#FEF2F2', text: '#DC2626' },
    blue: { bg: '#EFF6FF', text: '#1E3A8A' },
    purple: { bg: '#F5F3FF', text: '#7C3AED' },
    yellow: { bg: '#FFFBEB', text: '#D97706' },
    gray: { bg: '#F1F5F9', text: '#475569' },
  }
  const c = colors[color] || colors.gray
  return <span style={{ background: c.bg, color: c.text, padding: '3px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600 }}>{text}</span>
}
 
function UserRow({ user, onAction }) {
  const roleColor = { tenant: 'blue', landlord: 'green', agency: 'purple', admin: 'yellow' }
  return (
    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
      <td style={{ padding: '12px 16px' }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: C.text }}>{user.full_name || '—'}</div>
        <div style={{ fontSize: 12, color: C.muted }}>{user.email}</div>
      </td>
      <td style={{ padding: '12px 16px' }}><Badge text={user.role} color={roleColor[user.role] || 'gray'} /></td>
      <td style={{ padding: '12px 16px' }}><Badge text={user.is_active ? 'Active' : 'Suspended'} color={user.is_active ? 'green' : 'red'} /></td>
      <td style={{ padding: '12px 16px', color: C.muted, fontSize: 13 }}>{user.property_count} props · {user.report_count} reports</td>
      <td style={{ padding: '12px 16px', color: C.muted, fontSize: 13 }}>{user.created_at?.slice(0, 10)}</td>
      <td style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => onAction('view', user)} style={btnStyle('#EFF6FF', C.blue)}>View</button>
          {user.is_active
            ? <button onClick={() => onAction('suspend', user)} style={btnStyle('#FEF2F2', C.red)}>Suspend</button>
            : <button onClick={() => onAction('activate', user)} style={btnStyle('#ECFDF5', C.green)}>Activate</button>
          }
          <button onClick={() => onAction('delete', user)} style={btnStyle('#FEF2F2', C.red)}>Delete</button>
        </div>
      </td>
    </tr>
  )
}
 
const btnStyle = (bg, color) => ({ padding: '5px 12px', background: bg, color, border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer' })
 
function UserModal({ user, onClose, onAction }) {
  if (!user) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 600, maxHeight: '80vh', overflow: 'auto' }}>
        <div style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.indigo})`, padding: '24px 28px', borderRadius: '20px 20px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>{user.full_name || user.email}</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>User ID: {user.id}</div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: '6px 12px', color: '#fff', cursor: 'pointer', fontSize: 18 }}>×</button>
        </div>
        <div style={{ padding: 28 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            {[['Email', user.email], ['Role', user.role], ['Plan', user.plan], ['Status', user.is_active ? 'Active' : 'Suspended'], ['Properties', user.property_count], ['Reports', user.report_count], ['Searches', user.saved_search_count], ['Joined', user.created_at?.slice(0, 10)]].map(([k, v]) => (
              <div key={k} style={{ background: C.bg, borderRadius: 10, padding: '12px 16px' }}>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{k}</div>
                <div style={{ fontWeight: 600, color: C.text, fontSize: 14 }}>{v}</div>
              </div>
            ))}
          </div>
 
          {user.properties?.length > 0 && (
            <>
              <div style={{ fontWeight: 700, marginBottom: 10, color: C.text }}>Properties</div>
              {user.properties.map(p => (
                <div key={p.id} style={{ background: C.bg, borderRadius: 10, padding: '10px 14px', marginBottom: 8, fontSize: 13 }}>
                  <span style={{ fontWeight: 600 }}>{p.address}</span>
                  {p.last_grade && <span style={{ marginLeft: 8, color: C.indigo }}>Grade: {p.last_grade}</span>}
                </div>
              ))}
            </>
          )}
 
          <div style={{ display: 'flex', gap: 10, marginTop: 24, flexWrap: 'wrap' }}>
            <button onClick={() => onAction('export_json', user)} style={{ padding: '9px 16px', background: C.bg, color: C.text, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>⬇ Export JSON</button>
            <button onClick={() => onAction('export_pdf', user)} style={{ padding: '9px 16px', background: C.bg, color: C.text, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>⬇ Export PDF</button>
            {user.is_active
              ? <button onClick={() => { onAction('suspend', user); onClose() }} style={{ padding: '9px 16px', background: '#FEF2F2', color: C.red, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>⏸ Suspend</button>
              : <button onClick={() => { onAction('activate', user); onClose() }} style={{ padding: '9px 16px', background: '#ECFDF5', color: C.green, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>▶ Activate</button>
            }
            <button onClick={() => { onAction('delete', user); onClose() }} style={{ padding: '9px 16px', background: '#FEF2F2', color: C.red, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>🗑 Delete</button>
          </div>
        </div>
      </div>
    </div>
  )
}
 
export default function AdminPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('dashboard')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
 
  useEffect(() => {
    if (user === undefined) return // still loading
    if (!user) { navigate('/login'); return }
    if (user.role !== 'admin') { navigate('/dashboard'); return }
    loadStats()
  }, [user])
 
  useEffect(() => {
    if (tab === 'users') loadUsers()
  }, [tab, search, roleFilter, statusFilter, page])
 
  const loadStats = async () => { try {
    const data = await api('/api/admin/stats')
    if (data && data.total_users !== undefined) setStats(data)
  } catch(e) { console.error(e) } }
 
  const loadUsers = async () => {
    setLoading(true)
    const params = new URLSearchParams({ page, per_page: 20 })
    if (search) params.set('search', search)
    if (roleFilter) params.set('role', roleFilter)
    if (statusFilter !== '') params.set('is_active', statusFilter)
    const data = await api(`/api/admin/users?${params}`)
    setUsers(data.users || [])
    setTotal(data.total || 0)
    setLoading(false)
  }
 
  const showToast = (msg, color = C.green) => {
    setToast({ msg, color })
    setTimeout(() => setToast(null), 3000)
  }
 
  const handleAction = async (action, u) => {
    const token = localStorage.getItem('vrh_token')
    if (action === 'view') {
      const full = await api(`/api/admin/users/${u.id}`)
      setSelectedUser(full)
    } else if (action === 'suspend') {
      await api(`/api/admin/users/${u.id}/suspend`, { method: 'POST' })
      showToast(`${u.email} suspended`)
      loadUsers(); loadStats()
    } else if (action === 'activate') {
      await api(`/api/admin/users/${u.id}/activate`, { method: 'POST' })
      showToast(`${u.email} activated`)
      loadUsers(); loadStats()
    } else if (action === 'delete') {
      if (!confirm(`Permanently delete ${u.email}? This cannot be undone.`)) return
      await api(`/api/admin/users/${u.id}`, { method: 'DELETE' })
      showToast(`${u.email} deleted`, C.red)
      loadUsers(); loadStats()
    } else if (action === 'export_json') {
      window.open(`/api/admin/users/${u.id}/export/json`, '_blank')
    } else if (action === 'export_pdf') {
      window.open(`/api/admin/users/${u.id}/export/pdf`, '_blank')
    }
  }
 
  if (!user || user.role !== 'admin') return null
 
  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, background: toast.color, color: '#fff', padding: '12px 20px', borderRadius: 10, zIndex: 9999, fontWeight: 600, fontSize: 14, boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
          {toast.msg}
        </div>
      )}
 
      {/* Top bar */}
      <header style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.indigo})`, padding: '0 32px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🛡️</div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>VicRentalHub Admin</div>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11 }}>Super Admin Panel</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>👤 {user.email}</span>
            <button onClick={() => navigate('/dashboard')} style={{ padding: '7px 16px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>← Back to App</button>
          </div>
        </div>
      </header>
 
      {/* Tabs */}
      <div style={{ background: '#fff', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 32px', display: 'flex', gap: 4 }}>
          {[['dashboard', '📊 Dashboard'], ['users', '👥 Users'], ['export', '⬇ Export All']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{ padding: '14px 20px', border: 'none', background: 'none', color: tab === id ? C.blue : C.muted, fontWeight: tab === id ? 700 : 500, fontSize: 14, cursor: 'pointer', borderBottom: tab === id ? `2px solid ${C.blue}` : '2px solid transparent', fontFamily: 'inherit' }}>
              {label}
            </button>
          ))}
        </div>
      </div>
 
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: 32 }}>
 
        {/* Dashboard tab */}
        {tab === 'dashboard' && stats && (
          <>
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 24px', color: C.text }}>Platform Overview</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 32 }}>
              <StatCard icon="👥" label="Total Users" value={stats.total_users} color={C.blue} />
              <StatCard icon="✅" label="Active Users" value={stats.active_users} color={C.green} />
              <StatCard icon="⏸" label="Suspended" value={stats.suspended_users} color={C.red} />
              <StatCard icon="🏠" label="Properties" value={stats.total_properties} color={C.indigo} />
              <StatCard icon="📄" label="Reports" value={stats.total_reports} color={C.yellow} />
            </div>
 
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {/* By role */}
              <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${C.border}`, padding: 24 }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: C.text }}>Users by Role</h3>
                {Object.entries(stats.by_role || {}).map(([role, count]) => (
                  <div key={role} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 14, color: C.muted, textTransform: 'capitalize' }}>{role}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 120, height: 8, background: C.bg, borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${stats.total_users ? (count / stats.total_users * 100) : 0}%`, height: '100%', background: `linear-gradient(135deg, ${C.blue}, ${C.indigo})`, borderRadius: 4 }} />
                      </div>
                      <span style={{ fontWeight: 700, fontSize: 14, color: C.text, minWidth: 24 }}>{count}</span>
                    </div>
                  </div>
                ))}
              </div>
 
              {/* Recent signups */}
              <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${C.border}`, padding: 24 }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: C.text }}>Recent Signups</h3>
                {stats.recent_signups.map(u => (
                  <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${C.border}` }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{u.full_name || u.email}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>{u.email} · {u.role}</div>
                    </div>
                    <div style={{ fontSize: 12, color: C.muted }}>{u.created_at?.slice(0, 10)}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
 
        {/* Users tab */}
        {tab === 'users' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: C.text }}>All Users ({total})</h2>
            </div>
 
            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search name or email..." style={{ flex: 1, minWidth: 200, padding: '9px 14px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 14, outline: 'none' }} />
              <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1) }} style={{ padding: '9px 14px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 14, background: '#fff' }}>
                <option value="">All roles</option>
                <option value="tenant">Tenant</option>
                <option value="landlord">Landlord</option>
                <option value="agency">Agency</option>
                <option value="admin">Admin</option>
              </select>
              <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} style={{ padding: '9px 14px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 14, background: '#fff' }}>
                <option value="">All statuses</option>
                <option value="true">Active</option>
                <option value="false">Suspended</option>
              </select>
            </div>
 
            {/* Table */}
            <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: C.bg }}>
                    {['User', 'Role', 'Status', 'Activity', 'Joined', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: C.muted }}>Loading...</td></tr>
                  ) : users.length === 0 ? (
                    <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: C.muted }}>No users found</td></tr>
                  ) : (
                    users.map(u => <UserRow key={u.id} user={u} onAction={handleAction} />)
                  )}
                </tbody>
              </table>
            </div>
 
            {/* Pagination */}
            {total > 20 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '8px 16px', border: `1px solid ${C.border}`, borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 13 }}>← Prev</button>
                <span style={{ padding: '8px 16px', fontSize: 13, color: C.muted }}>Page {page} of {Math.ceil(total / 20)}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 20)} style={{ padding: '8px 16px', border: `1px solid ${C.border}`, borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 13 }}>Next →</button>
              </div>
            )}
          </>
        )}
 
        {/* Export tab */}
        {tab === 'export' && (
          <>
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 24px', color: C.text }}>Export All Data</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${C.border}`, padding: 32 }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>📦</div>
                <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>All Users — JSON</h3>
                <p style={{ color: C.muted, margin: '0 0 24px', lineHeight: 1.6 }}>Export complete user database including all profiles, properties, and activity as a JSON file.</p>
                <button onClick={() => window.open('/api/admin/export/users/json', '_blank')} style={{ padding: '12px 24px', background: `linear-gradient(135deg, ${C.blue}, ${C.indigo})`, color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>⬇ Download JSON</button>
              </div>
              <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${C.border}`, padding: 32 }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>👤</div>
                <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>Individual User PDF/JSON</h3>
                <p style={{ color: C.muted, margin: '0 0 24px', lineHeight: 1.6 }}>Go to the Users tab, click View on any user, then use the Export PDF or Export JSON buttons to download their full history.</p>
                <button onClick={() => setTab('users')} style={{ padding: '12px 24px', background: C.bg, color: C.text, border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Go to Users →</button>
              </div>
            </div>
          </>
        )}
      </div>
 
      {/* User detail modal */}
      {selectedUser && <UserModal user={selectedUser} onClose={() => setSelectedUser(null)} onAction={handleAction} />}
    </div>
  )
}
 