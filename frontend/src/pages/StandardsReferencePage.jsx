import React, { useEffect, useState } from 'react'
import { api } from '../api'
import { Spinner, Alert, Badge } from '../components/UI.jsx'

export default function StandardsReferencePage() {
  const [standards, setStandards] = useState([])
  const [energyStandards, setEnergyStandards] = useState([])
  const [rebates, setRebates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([api.getStandards(), api.getEnergyStandards(), api.getReferenceRebates()])
      .then(([s, e, r]) => { setStandards(s); setEnergyStandards(e); setRebates(r) })
      .catch((er) => setError(er.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="container mt-4"><Spinner /></div>
  if (error) return <div className="container mt-4"><Alert type="danger">{error}</Alert></div>

  return (
    <div className="container mt-4 mb-4">
      <div className="mb-3">
        <h1>Victorian Rental Standards Reference</h1>
        <p className="text-secondary">All current and upcoming standards, plus available rebates. Sourced from consumer.vic.gov.au and energy.vic.gov.au.</p>
      </div>

      <div className="card mb-3">
        <h2 className="mb-2">15 Minimum Rental Standards</h2>
        <p className="text-secondary text-sm mb-2">In force since 25 November 2025. Failure to meet these makes a property unable to be advertised — and is a criminal offence.</p>
        <div>
          {standards.map((s) => (
            <div key={s.id} className="std-row">
              <div className="std-icon pass">{s.id}</div>
              <div>
                <div className="std-title">{s.standard}</div>
                <div className="std-desc">{s.description}</div>
                <div className="text-xs text-muted mt-1">
                  Effective {s.effective_date}
                  {s.criminal_offence_if_breached && ' · Criminal offence if breached'}
                </div>
              </div>
              <Badge color={s.criminal_offence_if_breached ? 'red' : 'amber'}>
                {s.criminal_offence_if_breached ? 'Criminal offence' : 'Required'}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      <div className="card mb-3">
        <h2 className="mb-2">Upcoming Energy Efficiency Standards</h2>
        <p className="text-secondary text-sm mb-2">Phased in 2027–2030. Plan your upgrades early to avoid emergency replacement costs.</p>
        <table className="table">
          <thead><tr><th>Standard</th><th>Effective</th><th>Applies to</th><th>Cost estimate</th></tr></thead>
          <tbody>
            {energyStandards.map((s) => (
              <tr key={s.id}>
                <td>
                  <strong>{s.requirement}</strong>
                  <div className="text-xs text-secondary">{s.description}</div>
                </td>
                <td><Badge color="amber">{s.effective_date}</Badge></td>
                <td className="text-sm">{s.applies_to}</td>
                <td className="text-sm">{s.cost_estimate_text}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2 className="mb-2">Available Rebates</h2>
        <div className="grid-auto">
          {rebates.map((r) => (
            <div key={r.id} className="card">
              <h3 className="mb-1" style={{ fontSize: '1rem' }}>{r.name}</h3>
              <div className="text-success font-semibold mb-2">{r.amount}</div>
              <p className="text-secondary text-sm mb-2">{r.description}</p>
              <div className="text-xs text-muted">Source: {r.source}</div>
              <a href={r.url} target="_blank" rel="noreferrer" className="btn btn-sm btn-secondary mt-2">Learn more →</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
