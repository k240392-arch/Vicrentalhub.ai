import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../state/AuthContext.jsx'
import { Alert, Badge, Empty, SectionHeader, Spinner } from '../components/UI.jsx'

function gradeColor(grade) {
  if (!grade) return 'gray'
  if (grade.startsWith('A')) return 'green'
  if (grade.startsWith('B')) return 'green'
  if (grade.startsWith('C')) return 'amber'
  if (grade.startsWith('D')) return 'amber'
  return 'red'
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [properties, setProperties] = useState([])
  const [reports, setReports] = useState([])
  const [savedSearches, setSavedSearches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([
      api.listProperties(),
      api.myReports(),
      api.listSavedSearches(),
    ])
      .then(([p, r, s]) => {
        setProperties(p)
        setReports(r)
        setSavedSearches(s)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this property?')) return
    try {
      await api.deleteProperty(id)
      setProperties(properties.filter((p) => p.id !== id))
    } catch (e) {
      alert(e.message)
    }
  }

  if (loading) return <div className="container mt-4"><Spinner label="Loading dashboard…" /></div>

  const portfolioAvg = properties.length
    ? Math.round(properties.reduce((sum, p) => sum + (p.last_compliance_score || 0), 0) / properties.length)
    : 0

  return (
    <div className="container mt-4 mb-4">
      <div className="mb-3">
        <h1>Welcome back, {user?.full_name || user?.email}</h1>
        <p className="text-secondary">{user?.role === 'tenant' ? 'Manage your saved searches and reports.' : 'Manage your portfolio, reports, and compliance status.'}</p>
      </div>

      {error && <Alert type="danger">{error}</Alert>}

      {user?.role !== 'tenant' && (
        <>
          <div className="grid-3 mb-3">
            <div className="card">
              <div className="text-secondary text-sm">Properties</div>
              <div className="text-3xl font-bold mt-1" style={{ color: 'var(--blue)' }}>{properties.length}</div>
            </div>
            <div className="card">
              <div className="text-secondary text-sm">Portfolio Avg Score</div>
              <div className="text-3xl font-bold mt-1" style={{ color: portfolioAvg >= 70 ? 'var(--green)' : portfolioAvg >= 55 ? 'var(--amber)' : 'var(--red)' }}>{portfolioAvg}/100</div>
            </div>
            <div className="card">
              <div className="text-secondary text-sm">Reports Generated</div>
              <div className="text-3xl font-bold mt-1" style={{ color: 'var(--navy)' }}>{reports.length}</div>
            </div>
          </div>

          <SectionHeader
            title="Your Properties"
            subtitle="Each property shows its latest compliance score and grade."
            action={<Link to="/properties/new" className="btn btn-success">+ Add Property</Link>}
          />

          {properties.length === 0 ? (
            <Empty
              title="No properties yet"
              subtitle="Add your first property to run compliance analysis and generate reports."
              action={<Link to="/properties/new" className="btn btn-success">+ Add Property</Link>}
            />
          ) : (
            <div className="grid-auto mb-4">
              {properties.map((p) => (
                <div key={p.id} className="property-card">
                  <div className="property-card-head">
                    <div>
                      <h3 className="mb-0">{p.address}</h3>
                      <div className="property-card-meta mt-1">
                        {p.bedrooms} bed · {p.bathrooms} bath · {p.year_built ? `built ${p.year_built}` : 'year n/a'}
                      </div>
                    </div>
                    {p.last_grade && <Badge color={gradeColor(p.last_grade)}>{p.last_grade}</Badge>}
                  </div>
                  {p.last_compliance_score != null && (
                    <div>
                      <div className="text-secondary text-xs mb-1">Compliance</div>
                      <div className="bar"><div className={`fill ${gradeColor(p.last_grade)}`} style={{ width: `${p.last_compliance_score}%` }} /></div>
                      <div className="text-sm mt-1">{p.last_compliance_score}/100</div>
                    </div>
                  )}
                  <div className="property-features">
                    <Badge color="gray">{p.heating}</Badge>
                    <Badge color="gray">{p.hot_water}</Badge>
                    {p.solar && <Badge color="green">Solar</Badge>}
                    {p.mould && <Badge color="red">Mould</Badge>}
                  </div>
                  <div className="flex gap-1">
                    <Link to={`/properties/${p.id}/edit`} className="btn btn-sm btn-secondary flex-1">Edit</Link>
                    <Link to={`/analyse?property=${p.id}`} className="btn btn-sm btn-primary flex-1">Analyse</Link>
                    <button className="btn btn-sm btn-ghost" onClick={() => handleDelete(p.id)} title="Delete" style={{ color: 'var(--red)' }}>×</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <SectionHeader title="Recent Reports" />
      {reports.length === 0 ? (
        <Empty title="No reports yet" subtitle="Run an analysis and download a PDF to see it here." />
      ) : (
        <div className="card">
          <table className="table">
            <thead><tr><th>Date</th><th>Type</th><th>Property</th><th>Score</th></tr></thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id}>
                  <td>{new Date(r.created_at).toLocaleDateString()}</td>
                  <td><Badge color={r.report_type === 'landlord' ? 'blue' : 'green'}>{r.report_type}</Badge></td>
                  <td>{r.summary?.address || '—'}</td>
                  <td>{r.summary?.score != null ? `${r.summary.score}/100` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {savedSearches.length > 0 && (
        <>
          <SectionHeader title="Saved Searches" />
          <div className="grid-auto">
            {savedSearches.map((s) => (
              <div key={s.id} className="card">
                <h3 className="mb-1">{s.name}</h3>
                <div className="text-secondary text-sm">{s.suburb || 'Any suburb'} · {s.bedrooms} bed · ${s.max_rent}/wk max</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
