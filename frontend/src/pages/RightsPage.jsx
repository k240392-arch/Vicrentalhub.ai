import React, { useEffect, useState } from 'react'
import { api } from '../api'
import { Spinner, Alert, Badge } from '../components/UI.jsx'

export default function RightsPage() {
  const [rights, setRights] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.getTenantRights()
      .then(setRights)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="container mt-4"><Spinner /></div>
  if (error) return <div className="container mt-4"><Alert type="danger">{error}</Alert></div>
  if (!rights) return null

  const sections = [
    { key: 'urgent_repairs', icon: '🚨' },
    { key: 'non_urgent_repairs', icon: '🔧' },
    { key: 'rent_increases', icon: '💰' },
    { key: 'inspections', icon: '🔍' },
    { key: 'bond', icon: '🏛' },
    { key: 'eviction', icon: '⚖' },
  ]

  return (
    <div className="container mt-4 mb-4">
      <div className="mb-3">
        <h1>Know Your Rights</h1>
        <p className="text-secondary">Plain-English summary of Victorian tenant rights. Sourced from Consumer Affairs Victoria & Tenants Victoria.</p>
      </div>

      <div className="alert alert-info mb-3">
        <strong>This is general information.</strong> For free advice on your specific situation, contact <a href="https://www.tenantsvic.org.au" target="_blank" rel="noreferrer">Tenants Victoria</a> or Consumer Affairs Victoria on 1300 558 181.
      </div>

      <div className="grid-2">
        {sections.map(({ key, icon }) => {
          const item = rights[key]
          if (!item) return null
          return (
            <div key={key} className="card">
              <div className="text-2xl mb-1">{icon}</div>
              <h3 className="mb-2">{item.title}</h3>
              {item.definition && <p className="text-sm mb-2">{item.definition}</p>}

              <div className="kv mt-2">
                {Object.entries(item).map(([k, v]) => {
                  if (k === 'title' || k === 'definition' || k === 'examples') return null
                  return (
                    <React.Fragment key={k}>
                      <span className="k">{k.replace(/_/g, ' ')}</span>
                      <span className="v">{v}</span>
                    </React.Fragment>
                  )
                })}
              </div>

              {item.examples && (
                <div className="mt-2">
                  <div className="text-xs text-secondary mb-1">EXAMPLES</div>
                  <div className="property-features">
                    {item.examples.map((ex, i) => <Badge key={i} color="amber">{ex}</Badge>)}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="card mt-3">
        <h2 className="mb-2">Free Resources</h2>
        <div className="grid-2">
          {rights.resources.map((r, i) => (
            <a key={i} href={r.url} target="_blank" rel="noreferrer" className="property-card">
              <h3 className="mb-1" style={{ fontSize: '1rem' }}>{r.name}</h3>
              <div className="text-secondary text-sm">{r.url}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
