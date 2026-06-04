import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api, downloadPdf } from '../api'
import { Alert, Badge, ScoreCircle, Spinner } from '../components/UI.jsx'

const STANDARD_OPTIONS = [
  'Yes – Compliant',
  'No – Non-Compliant',
  'Uncertain',
]

const DEFAULT_PROP = {
  address: '',
  suburb: '',
  postcode: '',
  year_built: 2000,
  bedrooms: 2,
  bathrooms: 1,
  heating: 'None',
  cooling: 'None',
  hot_water: 'Gas Storage',
  insulation: 'None',
  mould: false,
  draughts: false,
  solar: false,
  water_efficient: false,
  property_value: '',
  weekly_rent: '',
  notes: '',
  standards_responses: {},
}

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'standards', label: 'Standards' },
  { id: 'energy', label: 'Energy' },
  { id: 'roi', label: 'ROI' },
  { id: 'rebates', label: 'Rebates' },
  { id: 'safety', label: 'Safety' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'audit', label: 'Pre-Ad Audit' },
  { id: 'esg', label: 'ESG' },
  { id: 'listing', label: 'Listing' },
]

export default function AnalysisPage() {
  const [searchParams] = useSearchParams()
  const propId = searchParams.get('property')

  const [prop, setProp] = useState(DEFAULT_PROP)
  const [responses, setResponses] = useState({})
  const [catalogue, setCatalogue] = useState(null)
  const [standardsRef, setStandardsRef] = useState([])
  const [samples, setSamples] = useState({})
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('overview')
  const [downloadingPdf, setDownloadingPdf] = useState(false)

  useEffect(() => {
    Promise.all([
      api.getCatalogue(),
      api.getStandards(),
      api.getSampleProperties(),
      propId ? api.getProperty(propId).catch(() => null) : Promise.resolve(null),
    ])
      .then(([cat, std, samp, propData]) => {
        setCatalogue(cat)
        setStandardsRef(std)
        setSamples(samp)
        if (propData) {
          setProp({ ...DEFAULT_PROP, ...propData })
          setResponses(propData.standards_responses || {})
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [propId])

  const update = (field) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setProp({ ...prop, [field]: v })
  }

  const setResponse = (id, value) => {
    setResponses({ ...responses, [id]: value })
  }

  const loadSample = (key) => {
    const sample = samples[key]
    if (sample) {
      setProp({ ...DEFAULT_PROP, ...sample, standards_responses: {} })
      setResponses({})
      setReport(null)
    }
  }

  const buildPropertyPayload = () => {
    return {
      ...prop,
      year_built: prop.year_built ? parseInt(prop.year_built) : null,
      bedrooms: parseInt(prop.bedrooms),
      bathrooms: parseInt(prop.bathrooms),
      property_value: prop.property_value ? parseFloat(prop.property_value) : null,
      weekly_rent: prop.weekly_rent ? parseFloat(prop.weekly_rent) : null,
    }
  }

  const runAnalysis = async () => {
    if (!prop.address) {
      setError('Please enter the property address.')
      return
    }
    setError(null)
    setRunning(true)
    try {
      const result = await api.fullReport({
        property: buildPropertyPayload(),
        responses,
      })
      setReport(result)
      setTab('overview')
      // Scroll to results smoothly
      setTimeout(() => {
        document.getElementById('analysis-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 80)
    } catch (e) {
      setError(e.message)
    } finally {
      setRunning(false)
    }
  }

  const downloadReportPdf = async () => {
    setDownloadingPdf(true)
    try {
      const res = await api.landlordPdf({
        property: buildPropertyPayload(),
        responses,
      })
      await downloadPdf(res, 'VicRentalHub_Compliance.pdf')
    } catch (e) {
      setError(e.message)
    } finally {
      setDownloadingPdf(false)
    }
  }

  if (loading) return <div className="container mt-4"><Spinner label="Loading…" /></div>

  return (
    <div className="container mt-4 mb-4">
      <div className="mb-3">
        <h1>Property Compliance Analysis</h1>
        <p className="text-secondary">Enter your property details, answer the 15 minimum standards check, and run a full compliance report.</p>
      </div>

      {error && <Alert type="danger">{error}</Alert>}

      <div className="card mb-3">
        <div className="flex items-center justify-between mb-2" style={{ flexWrap: 'wrap', gap: 8 }}>
          <h3 className="mb-0">Try a sample property</h3>
          <div className="flex gap-1">
            <button className="btn btn-sm btn-secondary" onClick={() => loadSample('sunshine')}>1975 Sunshine (problematic)</button>
            <button className="btn btn-sm btn-secondary" onClick={() => loadSample('compliant')}>2018 Camberwell (compliant)</button>
          </div>
        </div>
      </div>

      <div className="card mb-3">
        <h2 className="mb-2">Property Details</h2>
        <div className="form-group">
          <label className="form-label">Address *</label>
          <input className="input" value={prop.address} onChange={update('address')} placeholder="e.g. 123 Smith St, Brunswick VIC 3056" />
        </div>
        <div className="form-row-3">
          <div className="form-group">
            <label className="form-label">Year built</label>
            <input type="number" className="input" value={prop.year_built || ''} onChange={update('year_built')} />
          </div>
          <div className="form-group">
            <label className="form-label">Bedrooms</label>
            <input type="number" className="input" value={prop.bedrooms} onChange={update('bedrooms')} />
          </div>
          <div className="form-group">
            <label className="form-label">Bathrooms</label>
            <input type="number" className="input" value={prop.bathrooms} onChange={update('bathrooms')} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Heating</label>
            <select className="select" value={prop.heating} onChange={update('heating')}>
              {catalogue?.heating.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Cooling</label>
            <select className="select" value={prop.cooling} onChange={update('cooling')}>
              {catalogue?.cooling.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Hot water</label>
            <select className="select" value={prop.hot_water} onChange={update('hot_water')}>
              {catalogue?.hot_water.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Insulation</label>
            <select className="select" value={prop.insulation} onChange={update('insulation')}>
              {catalogue?.insulation.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
        </div>
        <div className="grid-2">
          <label className="checkbox-row"><input type="checkbox" checked={prop.mould} onChange={update('mould')} /> Mould present</label>
          <label className="checkbox-row"><input type="checkbox" checked={prop.draughts} onChange={update('draughts')} /> Draughts present</label>
          <label className="checkbox-row"><input type="checkbox" checked={prop.solar} onChange={update('solar')} /> Solar panels installed</label>
          <label className="checkbox-row"><input type="checkbox" checked={prop.water_efficient} onChange={update('water_efficient')} /> 4-star water-efficient fixtures</label>
        </div>
        <div className="form-row mt-2">
          <div className="form-group">
            <label className="form-label">Property value (AUD)</label>
            <input type="number" className="input" value={prop.property_value} onChange={update('property_value')} />
          </div>
          <div className="form-group">
            <label className="form-label">Weekly rent (AUD)</label>
            <input type="number" className="input" value={prop.weekly_rent} onChange={update('weekly_rent')} />
          </div>
        </div>
      </div>

      <div className="card mb-3">
        <h2 className="mb-2">15 Minimum Standards Check</h2>
        <p className="text-secondary text-sm mb-2">Answer for each standard. Effective from 25 November 2025 — failure may make the property unable to be advertised.</p>
        <div>
          {standardsRef.map((std) => (
            <div key={std.id} className="std-row">
              <div className="std-icon uncertain">{std.id}</div>
              <div>
                <div className="std-title">{std.standard}</div>
                <div className="std-desc">{std.description}</div>
              </div>
              <select
                className="select"
                style={{ width: 'auto', minWidth: 200 }}
                value={responses[std.id] || 'Uncertain'}
                onChange={(e) => setResponse(String(std.id), e.target.value)}
              >
                {STANDARD_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center mb-4">
        <button className="btn btn-success btn-lg" onClick={runAnalysis} disabled={running}>
          {running ? 'Analysing…' : '▶ Run full analysis'}
        </button>
      </div>

      {report && (
        <div id="analysis-results">
          <SummaryCard report={report} onDownload={downloadReportPdf} downloading={downloadingPdf} />

          <div className="tabs">
            {TABS.map((t) => (
              <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'overview' && <OverviewPanel report={report} />}
          {tab === 'standards' && <StandardsPanel report={report} />}
          {tab === 'energy' && <EnergyPanel report={report} />}
          {tab === 'roi' && <ROIPanel report={report} />}
          {tab === 'rebates' && <RebatesPanel report={report} />}
          {tab === 'safety' && <SafetyPanel report={report} />}
          {tab === 'timeline' && <TimelinePanel report={report} />}
          {tab === 'audit' && <AuditPanel report={report} />}
          {tab === 'esg' && <ESGPanel report={report} />}
          {tab === 'listing' && <ListingPanel report={report} />}
        </div>
      )}
    </div>
  )
}

function gradeColor(grade) {
  if (!grade) return 'gray'
  if (grade.startsWith('A')) return 'green'
  if (grade.startsWith('B')) return 'lime'
  if (grade.startsWith('C')) return 'amber'
  if (grade.startsWith('D')) return 'orange'
  return 'red'
}

function SummaryCard({ report, onDownload, downloading }) {
  const { score } = report
  const color = score.grade_color || gradeColor(score.grade)

  return (
    <div className="card card-pad-lg mb-3">
      <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
        <ScoreCircle score={score.total} color={color} />
        <div style={{ flex: 1, minWidth: 240 }}>
          <h2 className="mb-1">Smart Compliance Score</h2>
          <div className="text-xl font-semibold mb-1" style={{ color: `var(--${color === 'lime' ? 'lime' : color})` }}>
            {score.grade}
          </div>
          <p className="text-secondary">{score.summary}</p>
        </div>
        <div>
          <button className="btn btn-primary btn-lg" onClick={onDownload} disabled={downloading}>
            {downloading ? 'Generating PDF…' : '⬇ Download PDF Report'}
          </button>
        </div>
      </div>

      <div className="mt-3">
        <div className="grid-auto" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          {Object.entries(score.breakdown).map(([k, v]) => (
            <div key={k}>
              <div className="text-xs text-secondary mb-1">{k}</div>
              <div className="bar"><div className={`fill ${v.pct >= 70 ? 'green' : v.pct >= 50 ? 'amber' : 'red'}`} style={{ width: `${v.pct}%` }} /></div>
              <div className="text-sm mt-1">{v.score} / {v.max} ({v.pct}%)</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function OverviewPanel({ report }) {
  return (
    <div className="grid-2">
      <div className="card">
        <h3 className="mb-2">Standards check</h3>
        <div className="kv">
          <span className="k">Passing</span><span className="v text-success">{report.standards.pass_count}</span>
          <span className="k">Failing</span><span className="v text-danger">{report.standards.fail_count}</span>
          <span className="k">Uncertain</span><span className="v">{report.standards.uncertain_count}</span>
          <span className="k">Compliance</span><span className="v">{report.standards.compliance_pct}%</span>
          <span className="k">Can advertise?</span><span className="v">{report.standards.can_advertise ? '✅ Yes' : '❌ No'}</span>
        </div>
      </div>
      <div className="card">
        <h3 className="mb-2">Energy</h3>
        <div className="kv">
          <span className="k">Energy score</span><span className="v">{report.energy.energy_score}/100</span>
          <span className="k">Heating</span><span className="v">{report.energy.heating_status.type} {report.energy.heating_status.efficient ? '✓' : ''}</span>
          <span className="k">Hot water</span><span className="v">{report.energy.hot_water_status.type} {report.energy.hot_water_status.efficient ? '✓' : ''}</span>
          <span className="k">Insulation</span><span className="v">{report.energy.insulation_status.type}</span>
          <span className="k">Upgrade cost</span><span className="v">${report.energy.estimated_total_upgrade.low.toLocaleString()} – ${report.energy.estimated_total_upgrade.high.toLocaleString()}</span>
        </div>
      </div>
      <div className="card">
        <h3 className="mb-2">ROI on upgrades</h3>
        <div className="kv">
          <span className="k">Annual savings</span><span className="v text-success">${report.roi.annual_savings}</span>
          <span className="k">Payback</span><span className="v">{report.roi.payback_years} yrs</span>
          <span className="k">CO₂ saved/yr</span><span className="v">{report.roi.co2_savings_kg} kg</span>
          <span className="k">10-year net</span><span className="v">${report.roi.ten_year_savings.toLocaleString()}</span>
        </div>
      </div>
      <div className="card">
        <h3 className="mb-2">Rebates</h3>
        <div className="kv">
          <span className="k">Eligible</span><span className="v">{report.rebates.matches.filter((m) => m.eligible).length} of {report.rebates.matches.length}</span>
          <span className="k">Total potential</span><span className="v text-success">up to ${report.rebates.total_potential_value.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}

function StandardsPanel({ report }) {
  return (
    <div>
      {!report.standards.can_advertise && (
        <Alert type="danger" title="⚠ Cannot legally advertise">
          {report.standards.fail_count} failing standards. Advertising a non-compliant property is a criminal offence in Victoria.
        </Alert>
      )}
      {report.standards.results.map((r) => (
        <div key={r.id} className="std-row">
          <div className={`std-icon ${r.status}`}>{r.id}</div>
          <div>
            <div className="std-title">{r.standard}</div>
            <div className="std-desc">{r.description}</div>
            <div className="text-xs text-muted mt-1">Effective {r.effective_date}</div>
          </div>
          <Badge color={r.status === 'pass' ? 'green' : r.status === 'fail' ? 'red' : 'gray'}>
            {r.status === 'pass' ? '✓ Pass' : r.status === 'fail' ? '✗ Fail' : 'Unknown'}
          </Badge>
        </div>
      ))}
    </div>
  )
}

function EnergyPanel({ report }) {
  return (
    <div>
      <div className="card mb-2">
        <h3 className="mb-2">Recommendations</h3>
        <ul style={{ paddingLeft: 22 }}>
          {report.energy.recommendations.map((r, i) => <li key={i} style={{ marginBottom: 6 }}>{r}</li>)}
        </ul>
      </div>
      <div className="card">
        <h3 className="mb-2">Standards Timeline</h3>
        <table className="table">
          <thead><tr><th>Requirement</th><th>Effective</th><th>Affected?</th><th>Cost</th></tr></thead>
          <tbody>
            {report.energy.timeline.map((t) => (
              <tr key={t.id}>
                <td><strong>{t.requirement}</strong><div className="text-xs text-secondary">{t.description}</div></td>
                <td>{t.effective_date}</td>
                <td>{t.affected ? <Badge color="amber">Yes</Badge> : <Badge color="gray">No</Badge>}</td>
                <td>{t.cost_estimate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ROIPanel({ report }) {
  const { roi } = report
  const max = Math.max(...roi.chart_data.map((d) => Math.abs(d.cumulative_savings)), 1)

  return (
    <div className="grid-2">
      <div className="card">
        <h3 className="mb-2">10-Year Cumulative Savings</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 200, paddingTop: 10 }}>
          {roi.chart_data.map((d) => {
            const heightPct = Math.abs(d.cumulative_savings) / max * 90
            const positive = d.cumulative_savings >= 0
            return (
              <div key={d.year} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: '100%',
                  height: `${heightPct}%`,
                  background: positive ? 'var(--green)' : 'var(--red)',
                  borderRadius: 4,
                  minHeight: 2,
                }} title={`Year ${d.year}: $${d.cumulative_savings.toLocaleString()}`} />
                <div className="text-xs text-secondary">Y{d.year}</div>
              </div>
            )
          })}
        </div>
        <p className="text-secondary text-sm mt-2">Hover bars for exact values. Negative bars (red) reflect upfront upgrade cost.</p>
      </div>
      <div className="card">
        <h3 className="mb-2">Summary</h3>
        <div className="kv">
          <span className="k">Current annual cost</span><span className="v">${roi.current_annual_cost}</span>
          <span className="k">After upgrades</span><span className="v">${roi.upgraded_annual_cost}</span>
          <span className="k">Annual savings</span><span className="v text-success">${roi.annual_savings}</span>
          <span className="k">Upgrade cost</span><span className="v">${roi.upgrade_cost_low.toLocaleString()} – ${roi.upgrade_cost_high.toLocaleString()}</span>
          <span className="k">Payback period</span><span className="v">{roi.payback_years} years</span>
          <span className="k">CO₂ saved / year</span><span className="v">{roi.co2_savings_kg} kg</span>
          <span className="k">10-year net benefit</span><span className="v text-success">${roi.ten_year_savings.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}

function RebatesPanel({ report }) {
  return (
    <div>
      <div className="alert alert-success">
        <strong>Total potential rebate value: up to ${report.rebates.total_potential_value.toLocaleString()}</strong>
      </div>
      <div className="grid-auto">
        {report.rebates.matches.map((m) => (
          <div key={m.rebate.id} className="card">
            <div className="flex items-center justify-between mb-1">
              <h3 className="mb-0" style={{ fontSize: '1rem' }}>{m.rebate.name}</h3>
              <Badge color={m.eligible ? 'green' : 'gray'}>{m.eligible ? 'Eligible' : 'Not eligible'}</Badge>
            </div>
            <div className="text-secondary text-sm mb-2">{m.rebate.amount}</div>
            <div className="text-sm">
              {m.reasons.map((r, i) => <div key={i} className="text-secondary mb-1">• {r}</div>)}
            </div>
            <a href={m.rebate.url} target="_blank" rel="noreferrer" className="btn btn-sm btn-secondary mt-2">Visit {m.rebate.source} →</a>
          </div>
        ))}
      </div>
    </div>
  )
}

function SafetyPanel({ report }) {
  const { safety } = report
  const color = safety.safety_score >= 80 ? 'green' : safety.safety_score >= 60 ? 'amber' : 'red'
  return (
    <div>
      <div className="card mb-2">
        <div className="flex items-center gap-3">
          <ScoreCircle score={safety.safety_score} color={color} />
          <div>
            <h3>Risk Level: {safety.risk_level}</h3>
            <p className="text-secondary">{safety.risks.length} risk(s) identified, {safety.actions.length} recommended action(s).</p>
          </div>
        </div>
      </div>
      {safety.risks.length > 0 && (
        <div className="card mb-2">
          <h3 className="mb-2">Identified Risks</h3>
          {safety.risks.map((r, i) => (
            <div key={i} className="mb-2">
              <div className="flex items-center gap-1">
                <Badge color={r.severity === 'high' ? 'red' : r.severity === 'medium' ? 'amber' : 'gray'}>{r.severity}</Badge>
                <strong>{r.type}</strong>
              </div>
              <p className="text-secondary text-sm mt-1">{r.description}</p>
            </div>
          ))}
        </div>
      )}
      <div className="card">
        <h3 className="mb-2">Recommended Actions</h3>
        <ul style={{ paddingLeft: 22 }}>
          {safety.actions.map((a, i) => <li key={i} style={{ marginBottom: 6 }}>{a}</li>)}
        </ul>
      </div>
    </div>
  )
}

function TimelinePanel({ report }) {
  const { timeline } = report
  return (
    <div>
      {timeline.next_action && (
        <Alert type="warning" title="Next action">
          <strong>{timeline.next_action.title}</strong> — due {timeline.next_action.date}
          <div className="text-sm mt-1">{timeline.next_action.description}</div>
        </Alert>
      )}
      <div className="card">
        <table className="table">
          <thead><tr><th>Date</th><th>Requirement</th><th>Priority</th><th>Cost</th></tr></thead>
          <tbody>
            {timeline.events.map((e, i) => (
              <tr key={i}>
                <td><strong>{e.date}</strong></td>
                <td>{e.title}<div className="text-xs text-secondary">{e.description}</div></td>
                <td><Badge color={e.priority === 'high' ? 'red' : e.priority === 'medium' ? 'amber' : 'gray'}>{e.priority}</Badge></td>
                <td>{e.cost_estimate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AuditPanel({ report }) {
  const { audit } = report
  return (
    <div>
      {audit.can_advertise ? (
        <Alert type="success" title="✅ Property appears advertisable">
          Risk score: {audit.risk_score}/100. Review warnings below.
        </Alert>
      ) : (
        <Alert type="danger" title="❌ Cannot legally advertise">
          {audit.blocking_issues.length} blocking issue(s). Advertising a non-compliant property is a criminal offence in Victoria.
        </Alert>
      )}
      {audit.blocking_issues.length > 0 && (
        <div className="card mb-2" style={{ borderLeft: '4px solid var(--red)' }}>
          <h3 className="mb-2 text-danger">Blocking Issues</h3>
          {audit.blocking_issues.map((b, i) => <div key={i} className="mb-1">• {b}</div>)}
        </div>
      )}
      {audit.warnings.length > 0 && (
        <div className="card mb-2" style={{ borderLeft: '4px solid var(--amber)' }}>
          <h3 className="mb-2 text-warn">Warnings</h3>
          {audit.warnings.map((w, i) => <div key={i} className="mb-1">• {w}</div>)}
        </div>
      )}
      <div className="card">
        <h3 className="mb-2">Recommendations</h3>
        {audit.recommendations.map((r, i) => <div key={i} className="mb-1">• {r}</div>)}
      </div>
    </div>
  )
}

function ESGPanel({ report }) {
  const { esg } = report
  return (
    <div className="grid-2">
      <div className="card text-center">
        <h3 className="mb-2">Overall ESG Rating</h3>
        <div style={{ fontSize: '5rem', fontWeight: 800, color: 'var(--blue)', lineHeight: 1 }}>{esg.overall_grade}</div>
        <div className="text-secondary mt-1">Score: {esg.overall_score}/100</div>
      </div>
      <div className="card">
        <h3 className="mb-2">Breakdown</h3>
        {[
          { label: 'Environmental', data: esg.environmental, desc: 'Energy efficiency, solar, insulation' },
          { label: 'Social', data: esg.social, desc: 'Tenant health & comfort impact' },
          { label: 'Governance', data: esg.governance, desc: 'Compliance with regulations' },
        ].map((row) => (
          <div key={row.label} className="mb-2">
            <div className="flex items-center justify-between">
              <strong>{row.label}</strong>
              <Badge color={row.data.grade === 'A' ? 'green' : row.data.grade === 'B' ? 'green' : row.data.grade === 'C' ? 'amber' : 'red'}>
                {row.data.grade} ({row.data.score})
              </Badge>
            </div>
            <div className="text-xs text-secondary">{row.desc}</div>
            <div className="bar mt-1"><div className={`fill ${row.data.score >= 70 ? 'green' : row.data.score >= 50 ? 'amber' : 'red'}`} style={{ width: `${row.data.score}%` }} /></div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ListingPanel({ report }) {
  const { listing } = report
  return (
    <div className="card">
      <div className="mb-3">
        <div className="text-xs text-secondary mb-1">SUGGESTED HEADLINE</div>
        <h2 style={{ fontSize: '1.5rem' }}>{listing.headline}</h2>
      </div>
      <div className="mb-3">
        <div className="text-xs text-secondary mb-1">DESCRIPTION</div>
        <p>{listing.description}</p>
      </div>
      <div className="mb-3">
        <div className="text-xs text-secondary mb-1">KEY FEATURES</div>
        <ul style={{ paddingLeft: 22 }}>
          {listing.bullet_points.map((b, i) => <li key={i}>{b}</li>)}
        </ul>
      </div>
      <div>
        <div className="text-xs text-secondary mb-1">SEO KEYWORDS</div>
        <div className="property-features">
          {listing.seo_keywords.map((k, i) => <Badge key={i} color="blue">{k}</Badge>)}
        </div>
      </div>
    </div>
  )
}
