import React, { useState } from 'react'
import { api, downloadPdf } from '../api'
import { Alert, Badge, Spinner } from '../components/UI.jsx'

const TABS = [
  { id: 'health', label: 'Health Check' },
  { id: 'bills', label: 'Bill Predictor' },
  { id: 'negotiation', label: 'Negotiation' },
  { id: 'affordability', label: 'Affordability' },
]

export default function TenantToolsPage() {
  const [tab, setTab] = useState('health')

  return (
    <div className="container mt-4 mb-4">
      <div className="mb-3">
        <h1>Tenant Tools</h1>
        <p className="text-secondary">Property health checks, bill predictions, negotiation templates, and affordability analysis — all free.</p>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'health' && <HealthTool />}
      {tab === 'bills' && <BillsTool />}
      {tab === 'negotiation' && <NegotiationTool />}
      {tab === 'affordability' && <AffordabilityTool />}
    </div>
  )
}

function HealthTool() {
  const [issues, setIssues] = useState('')
  const [prop, setProp] = useState({
    address: '',
    bedrooms: 2,
    bathrooms: 1,
    heating: 'None',
    cooling: 'None',
    hot_water: 'Gas Storage',
    insulation: 'None',
    mould: false,
    draughts: false,
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const update = (f) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setProp({ ...prop, [f]: v })
  }

  const run = async () => {
    setLoading(true)
    setError(null)
    try {
      const issueList = issues.split('\n').filter((x) => x.trim())
      const res = await api.healthCheck({ property: prop, issues: issueList })
      setResult(res)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const downloadReport = async () => {
    try {
      const issueList = issues.split('\n').filter((x) => x.trim())
      const res = await api.tenantPdf({ property: prop, issues: issueList })
      await downloadPdf(res, 'VicRentalHub_Tenant.pdf')
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="card">
      <h2 className="mb-2">Property Health Check</h2>
      <p className="text-secondary mb-2">Tell us what's wrong with your rental — we'll explain what your landlord must fix and what to do.</p>

      {error && <Alert type="danger">{error}</Alert>}

      <div className="form-group">
        <label className="form-label">Address (optional)</label>
        <input className="input" value={prop.address} onChange={update('address')} placeholder="e.g. 1/12 Main St, Sunshine VIC" />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Heating</label>
          <select className="select" value={prop.heating} onChange={update('heating')}>
            <option>None</option><option>Ducted Gas</option><option>Split System (Electric)</option><option>Reverse Cycle AC</option>
            <option>Gas Space Heater</option><option>Electric Radiant/Panel</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Hot water</label>
          <select className="select" value={prop.hot_water} onChange={update('hot_water')}>
            <option>Gas Storage</option><option>Gas Continuous Flow</option><option>Electric Storage</option><option>Heat Pump</option><option>Solar Hot Water</option>
          </select>
        </div>
      </div>
      <div className="grid-2">
        <label className="checkbox-row"><input type="checkbox" checked={prop.mould} onChange={update('mould')} /> Mould present</label>
        <label className="checkbox-row"><input type="checkbox" checked={prop.draughts} onChange={update('draughts')} /> Draughts</label>
      </div>

      <div className="form-group">
        <label className="form-label">Other issues (one per line)</label>
        <textarea className="textarea" value={issues} onChange={(e) => setIssues(e.target.value)} rows={4} placeholder="No hot water&#10;Broken locks on front door&#10;Smoke alarm beeping" />
      </div>

      <button className="btn btn-success btn-lg" onClick={run} disabled={loading}>
        {loading ? 'Analysing…' : '▶ Run health check'}
      </button>

      {result && (
        <div className="mt-3">
          <Alert type={result.severity_score > 50 ? 'danger' : result.severity_score > 25 ? 'warning' : 'success'}>
            Severity score: {result.severity_score}/100 — {result.issues_found.length} issue(s) identified.
          </Alert>

          {result.landlord_must_fix.length > 0 && (
            <div className="card mb-2" style={{ borderLeft: '4px solid var(--blue)' }}>
              <h3 className="mb-2">Landlord Must Fix</h3>
              {result.landlord_must_fix.map((item, i) => (
                <div key={i} className="mb-2">
                  <div className="flex items-center gap-1">
                    <Badge color={item.severity === 'high' ? 'red' : 'amber'}>{item.severity}</Badge>
                    <strong>{item.issue}</strong>
                  </div>
                  <div className="text-secondary text-sm mt-1"><strong>Your right:</strong> {item.tenant_right}</div>
                  <div className="text-secondary text-sm mt-1"><strong>Action:</strong> {item.action}</div>
                </div>
              ))}
            </div>
          )}

          <div className="card mb-2">
            <h3 className="mb-2">What you should do</h3>
            <ul style={{ paddingLeft: 22 }}>{result.tenant_actions.map((a, i) => <li key={i}>{a}</li>)}</ul>
          </div>

          <button className="btn btn-primary" onClick={downloadReport}>⬇ Download tenant report PDF</button>
        </div>
      )}
    </div>
  )
}

function BillsTool() {
  const [prop, setProp] = useState({
    address: '',
    bedrooms: 2,
    bathrooms: 1,
    heating: 'Ducted Gas',
    cooling: 'None',
    hot_water: 'Gas Storage',
    insulation: 'None',
    mould: false,
    draughts: false,
    solar: false,
  })
  const [occupants, setOccupants] = useState(2)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const update = (f) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setProp({ ...prop, [f]: v })
  }

  const run = async () => {
    setLoading(true); setError(null)
    try {
      const res = await api.bills({ property: prop, occupants: parseInt(occupants) })
      setResult(res)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="card">
      <h2 className="mb-2">Estimated Annual Bills</h2>
      <p className="text-secondary mb-2">See what your bills are likely to be based on the property's heating, hot water, and insulation.</p>

      {error && <Alert type="danger">{error}</Alert>}

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Heating</label>
          <select className="select" value={prop.heating} onChange={update('heating')}>
            <option>None</option><option>Ducted Gas</option><option>Split System (Electric)</option><option>Reverse Cycle AC</option><option>Gas Space Heater</option><option>Electric Radiant/Panel</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Hot water</label>
          <select className="select" value={prop.hot_water} onChange={update('hot_water')}>
            <option>Gas Storage</option><option>Gas Continuous Flow</option><option>Electric Storage</option><option>Heat Pump</option><option>Solar Hot Water</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Insulation</label>
          <select className="select" value={prop.insulation} onChange={update('insulation')}>
            <option>None</option><option>Basic (R1.5–R2.5)</option><option>Standard (R2.5–R4.0)</option><option>Good (R4.0–R5.0)</option><option>Excellent (R5.0+)</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Occupants</label>
          <input type="number" className="input" value={occupants} onChange={(e) => setOccupants(e.target.value)} min="1" max="10" />
        </div>
      </div>
      <div className="grid-2">
        <label className="checkbox-row"><input type="checkbox" checked={prop.draughts} onChange={update('draughts')} /> Draughts</label>
        <label className="checkbox-row"><input type="checkbox" checked={prop.solar} onChange={update('solar')} /> Solar panels</label>
      </div>

      <button className="btn btn-success btn-lg mt-2" onClick={run} disabled={loading}>{loading ? 'Calculating…' : '▶ Predict bills'}</button>

      {result && (
        <div className="mt-3 grid-2">
          <div className="card text-center">
            <div className="text-secondary text-sm">Annual estimate</div>
            <div className="text-3xl font-bold mt-1" style={{ color: 'var(--navy)' }}>${result.annual_estimate.toLocaleString()}</div>
            <div className="text-secondary text-sm mt-1">${result.monthly_estimate}/month</div>
            {result.comparison_to_efficient > 0 && (
              <div className="text-sm mt-2 text-warn">
                ${result.comparison_to_efficient.toLocaleString()} more than an efficient property
              </div>
            )}
          </div>
          <div className="card">
            <h3 className="mb-2">Breakdown</h3>
            <div className="kv">
              <span className="k">Heating</span><span className="v">${result.breakdown.heating}</span>
              <span className="k">Hot water</span><span className="v">${result.breakdown.hot_water}</span>
              <span className="k">Other electricity</span><span className="v">${result.breakdown.electricity_other}</span>
            </div>
            <h3 className="mb-1 mt-2">Tips</h3>
            <ul style={{ paddingLeft: 22 }}>{result.tips.map((t, i) => <li key={i} className="text-sm">{t}</li>)}</ul>
          </div>
        </div>
      )}
    </div>
  )
}

const SCENARIOS = [
  { id: 'rent_increase', label: 'Rent Increase' },
  { id: 'repairs', label: 'Repair Request' },
  { id: 'bond_dispute', label: 'Bond Dispute' },
  { id: 'non_renewal', label: 'Notice to Vacate' },
]

function NegotiationTool() {
  const [scenario, setScenario] = useState('rent_increase')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const run = async () => {
    setLoading(true); setError(null)
    try {
      const res = await api.negotiation({ scenario })
      setResult(res)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  React.useEffect(() => {
    run()
    // eslint-disable-next-line
  }, [scenario])

  return (
    <div className="card">
      <h2 className="mb-2">Negotiation Templates</h2>
      <p className="text-secondary mb-2">Pre-written talking points, sample emails, and escalation paths for common rental disputes.</p>

      {error && <Alert type="danger">{error}</Alert>}

      <div className="form-group">
        <label className="form-label">Scenario</label>
        <select className="select" value={scenario} onChange={(e) => setScenario(e.target.value)}>
          {SCENARIOS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>

      {loading && <Spinner />}

      {result && !loading && (
        <div className="mt-3">
          <div className="card mb-2">
            <h3 className="mb-2">Talking Points</h3>
            <ul style={{ paddingLeft: 22 }}>{result.talking_points.map((t, i) => <li key={i} style={{ marginBottom: 6 }}>{t}</li>)}</ul>
          </div>

          <div className="card mb-2">
            <h3 className="mb-2">Sample Email</h3>
            <pre style={{
              background: 'var(--surface-2)',
              padding: 16, borderRadius: 8,
              whiteSpace: 'pre-wrap', fontSize: '0.9rem', fontFamily: 'inherit',
              border: '1px solid var(--border)',
            }}>{result.sample_email}</pre>
            <button className="btn btn-sm btn-secondary mt-2" onClick={() => navigator.clipboard.writeText(result.sample_email)}>📋 Copy to clipboard</button>
          </div>

          <div className="card">
            <h3 className="mb-2">Escalation Path</h3>
            <ol style={{ paddingLeft: 22 }}>{result.escalation_path.map((p, i) => <li key={i} style={{ marginBottom: 6 }}>{p}</li>)}</ol>
          </div>
        </div>
      )}
    </div>
  )
}

function AffordabilityTool() {
  const [income, setIncome] = useState(1500)
  const [rent, setRent] = useState(450)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const run = async () => {
    setError(null)
    try {
      const res = await api.affordability({ weekly_income: parseFloat(income), weekly_rent: parseFloat(rent) })
      setResult(res)
    } catch (e) { setError(e.message) }
  }

  React.useEffect(() => { run() /* eslint-disable-next-line */ }, [income, rent])

  const stressColor = result?.stress_level === 'safe' ? 'green' : result?.stress_level === 'moderate' ? 'amber' : 'red'

  return (
    <div className="card">
      <h2 className="mb-2">Affordability Stress Index</h2>
      <p className="text-secondary mb-2">A standard rule: rent over 30% of income = housing stress, over 40% = severe.</p>

      {error && <Alert type="danger">{error}</Alert>}

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Weekly income (after tax)</label>
          <input type="number" className="input" value={income} onChange={(e) => setIncome(e.target.value)} step="50" />
        </div>
        <div className="form-group">
          <label className="form-label">Weekly rent</label>
          <input type="number" className="input" value={rent} onChange={(e) => setRent(e.target.value)} step="10" />
        </div>
      </div>

      {result && (
        <div className="mt-3">
          <div className="card text-center" style={{ background: `var(--${stressColor === 'green' ? 'green-soft' : stressColor === 'amber' ? 'amber-soft' : 'red-soft'})` }}>
            <div className="text-secondary text-sm">Rent-to-income ratio</div>
            <div className="text-3xl font-bold mt-1">{result.rent_to_income_pct}%</div>
            <Badge color={stressColor}>{result.stress_level.toUpperCase()}</Badge>
          </div>

          <div className="grid-2 mt-2">
            <div className="card">
              <div className="text-secondary text-sm">Recommended max rent (30% rule)</div>
              <div className="text-xl font-bold">${result.recommended_max_rent}/week</div>
            </div>
            <div className="card">
              <div className="text-secondary text-sm">Monthly disposable</div>
              <div className="text-xl font-bold">${result.monthly_disposable.toLocaleString()}</div>
            </div>
          </div>

          <div className="card mt-2">
            <h3 className="mb-2">Advice</h3>
            <ul style={{ paddingLeft: 22 }}>{result.advice.map((a, i) => <li key={i} style={{ marginBottom: 4 }}>{a}</li>)}</ul>
          </div>
        </div>
      )}
    </div>
  )
}
