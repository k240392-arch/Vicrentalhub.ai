import React, { useEffect, useState } from 'react'
import { api } from '../api'
import { useAuth } from '../state/AuthContext.jsx'
import { Alert, Badge, ScoreCircle, Spinner } from '../components/UI.jsx'

const TABS = [
  { id: 'search', label: 'Search Rentals' },
  { id: 'score', label: 'Score a Listing' },
]

export default function RentalsPage() {
  const [tab, setTab] = useState('search')

  return (
    <div className="container mt-4 mb-4">
      <div className="mb-3">
        <h1>Find a Rental</h1>
        <p className="text-secondary">
          We don't list properties ourselves — Domain and realestate.com.au already do that better
          than anyone could. Instead, we send you straight to the right searches with the right filters,
          arm you with what to look for, and let you score any listing you find.
        </p>
      </div>

      <Alert type="info">
        <strong>Why no listings here?</strong> The major Australian rental sites don't allow third-party apps
        to display their listings. So we do the next-best thing: send you to the real listings with smart
        pre-filters, then help you evaluate what you find.
      </Alert>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'search' && <SearchPanel switchToScore={() => setTab('score')} />}
      {tab === 'score' && <ScorePanel />}
    </div>
  )
}

// ─── SEARCH PANEL ────────────────────────────────────────────────────
function SearchPanel({ switchToScore }) {
  const { user } = useAuth()
  const [suburbs, setSuburbs] = useState([])
  const [unis, setUnis] = useState({})
  const [form, setForm] = useState({ suburb: '', bedrooms: 2, max_rent: 500, university: '' })
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState(null)
  const [savingSearch, setSavingSearch] = useState(false)

  useEffect(() => {
    Promise.all([api.listSuburbs(), api.listUniversities()])
      .then(([s, u]) => { setSuburbs(s || []); setUnis(u || {}) })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSearch = async (e) => {
    e?.preventDefault()
    setSearching(true)
    setError(null)
    try {
      const res = await api.searchRentals({
        ...form,
        bedrooms: parseInt(form.bedrooms),
        max_rent: parseInt(form.max_rent),
      })
      setResults(res || {})
    } catch (err) {
      setError(err.message)
    } finally {
      setSearching(false)
    }
  }

  const handleSaveSearch = async () => {
    if (!user) {
      alert('Please sign in to save a search.')
      return
    }
    const name = prompt('Name this search:', `${form.suburb || 'Anywhere'} – ${form.bedrooms}bd – $${form.max_rent}/wk`)
    if (!name) return
    setSavingSearch(true)
    try {
      await api.createSavedSearch({ name, ...form, bedrooms: parseInt(form.bedrooms), max_rent: parseInt(form.max_rent) })
      alert('Saved.')
    } catch (e) {
      alert(e.message)
    } finally {
      setSavingSearch(false)
    }
  }

  if (loading) return <Spinner />

  // Safe fallbacks — if the backend hasn't been updated yet, results may
  // still have the old shape. Default everything to empty arrays/objects
  // so the page can never crash, and show a warning if the new fields are missing.
  const searchLinks = results?.search_links || []
  const greenFlags = results?.green_flags || []
  const redFlags = results?.red_flags || []
  const inspectionChecklist = results?.inspection_checklist || []
  const suggestedSuburbs = results?.suggested_suburbs || []
  const suburbData = results?.suburb_data
  const resultSuburb = results?.suburb
  const isStaleBackend = results && searchLinks.length === 0 && !greenFlags.length

  return (
    <>
      {error && <Alert type="danger">{error}</Alert>}

      <div className="card mb-3">
        <h2 className="mb-2">What are you looking for?</h2>
        <form onSubmit={handleSearch}>
          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">Suburb</label>
              <select className="select" value={form.suburb} onChange={update('suburb')}>
                <option value="">Any suburb (we'll suggest)</option>
                {suburbs.map((s) => <option key={s.name} value={s.name}>{s.name} ({s.region})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Bedrooms</label>
              <select className="select" value={form.bedrooms} onChange={update('bedrooms')}>
                <option value="1">1 bedroom</option>
                <option value="2">2 bedrooms</option>
                <option value="3">3 bedrooms</option>
                <option value="4">4+ bedrooms</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Max weekly rent (AUD)</label>
              <input type="number" className="input" value={form.max_rent} onChange={update('max_rent')} step="10" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Near university (optional)</label>
              <select className="select" value={form.university} onChange={update('university')}>
                <option value="">No preference</option>
                {Object.keys(unis).map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              <button type="submit" className="btn btn-primary btn-lg flex-1" disabled={searching}>
                {searching ? 'Loading…' : 'Find rentals →'}
              </button>
              {user && results && (
                <button type="button" className="btn btn-secondary btn-lg" onClick={handleSaveSearch} disabled={savingSearch}>
                  {savingSearch ? 'Saving…' : '★ Save'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {isStaleBackend && (
        <Alert type="warning" title="Backend out of sync">
          Your backend is returning the old response shape. Make sure you've replaced
          <code> backend/app/services/rental_finder_service.py</code>,
          <code> backend/app/routers/rentals.py</code>, and
          <code> backend/app/schemas.py</code>, then restart uvicorn.
        </Alert>
      )}

      {results && !isStaleBackend && (
        <>
          {suburbData && resultSuburb && (
            <div className="card mb-3">
              <h3 className="mb-2">Market data: {resultSuburb}</h3>
              <div className="grid-3">
                <div>
                  <div className="text-xs text-secondary">1 bedroom avg</div>
                  <div className="text-xl font-bold">${suburbData.avg_1br}/wk</div>
                </div>
                <div>
                  <div className="text-xs text-secondary">2 bedroom avg</div>
                  <div className="text-xl font-bold">${suburbData.avg_2br}/wk</div>
                </div>
                <div>
                  <div className="text-xs text-secondary">3 bedroom avg</div>
                  <div className="text-xl font-bold">${suburbData.avg_3br}/wk</div>
                </div>
              </div>
              <div className="mt-2">
                <Badge color={suburbData.trend === 'rising' ? 'amber' : 'green'}>
                  Trend: {suburbData.trend}
                </Badge>
                <span className="text-secondary text-sm" style={{ marginLeft: 8 }}>
                  Region: {suburbData.region}
                </span>
              </div>
            </div>
          )}

          {searchLinks.length > 0 && (
            <div className="card mb-3">
              <h2 className="mb-1">Browse listings on:</h2>
              <p className="text-secondary text-sm mb-3">
                Each link opens a real search on the major Australian rental sites with your filters applied.
              </p>
              <div className="flex flex-col gap-2">
                {searchLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="property-card"
                    style={{ textDecoration: 'none' }}
                  >
                    <div className="flex items-center justify-between gap-2" style={{ flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 240 }}>
                        <div className="flex items-center gap-1 mb-1">
                          <Badge color="blue">{link.site}</Badge>
                        </div>
                        <strong>{link.label}</strong>
                        <div className="text-secondary text-sm mt-1">{link.note}</div>
                      </div>
                      <div className="btn btn-primary btn-sm">Open →</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {suggestedSuburbs.length > 0 && (
            <div className="card mb-3">
              <h3 className="mb-2">Other suburbs matching your budget</h3>
              <p className="text-secondary text-sm mb-2">
                Click to switch and re-run the search with the new suburb.
              </p>
              <div className="property-features">
                {suggestedSuburbs.map((s) => (
                  <button
                    key={s}
                    className="btn btn-sm btn-secondary"
                    onClick={() => { setForm({ ...form, suburb: s }); setTimeout(handleSearch, 50) }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(greenFlags.length > 0 || redFlags.length > 0) && (
            <div className="grid-2 mb-3">
              {greenFlags.length > 0 && (
                <div className="card" style={{ borderTop: '3px solid var(--green)' }}>
                  <h3 className="mb-2">✓ Green flags to look for</h3>
                  <p className="text-secondary text-sm mb-2">Indicators of an energy-efficient, well-maintained rental.</p>
                  {greenFlags.map((f, i) => (
                    <div key={i} className="mb-2">
                      <strong className="text-sm">{f.flag}</strong>
                      <div className="text-secondary text-sm">{f.why}</div>
                    </div>
                  ))}
                </div>
              )}
              {redFlags.length > 0 && (
                <div className="card" style={{ borderTop: '3px solid var(--red)' }}>
                  <h3 className="mb-2">⚠ Red flags to watch for</h3>
                  <p className="text-secondary text-sm mb-2">Warning signs of a problematic or expensive rental.</p>
                  {redFlags.map((f, i) => (
                    <div key={i} className="mb-2">
                      <strong className="text-sm">{f.flag}</strong>
                      <div className="text-secondary text-sm">{f.why}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="card card-pad-lg mb-3" style={{ background: 'linear-gradient(135deg, var(--blue) 0%, #1746C4 100%)', color: 'white', border: 'none' }}>
            <div className="flex items-center justify-between gap-2" style={{ flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 240 }}>
                <h2 style={{ color: 'white', marginBottom: 4 }}>Found a listing? Score it.</h2>
                <p style={{ color: 'rgba(255,255,255,0.9)' }}>
                  Paste any rental listing description and we'll score it against Victorian compliance criteria.
                </p>
              </div>
              <button className="btn btn-success btn-lg" onClick={switchToScore}>
                Score a listing →
              </button>
            </div>
          </div>

          {inspectionChecklist.length > 0 && (
            <div className="card">
              <h3 className="mb-2">Inspection checklist</h3>
              <p className="text-secondary text-sm mb-2">Print this and use it on every inspection.</p>
              <ul style={{ paddingLeft: 22, columnCount: 2, columnGap: 24 }}>
                {inspectionChecklist.map((item, i) => (
                  <li key={i} style={{ marginBottom: 6 }}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </>
  )
}

// ─── SCORE PANEL ─────────────────────────────────────────────────────
function ScorePanel() {
  const [suburbs, setSuburbs] = useState([])
  const [form, setForm] = useState({
    description: '',
    weekly_rent: '',
    bedrooms: 2,
    suburb: '',
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.listSuburbs().then((s) => setSuburbs(s || [])).catch(() => {})
  }, [])

  const update = (f) => (e) => setForm({ ...form, [f]: e.target.value })

  const run = async () => {
    if (!form.description.trim()) {
      setError('Please paste the listing description first.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const res = await api.scoreListing({
        description: form.description,
        weekly_rent: form.weekly_rent ? parseFloat(form.weekly_rent) : null,
        bedrooms: parseInt(form.bedrooms) || null,
        suburb: form.suburb || null,
      })
      setResult(res)
      setTimeout(() => {
        document.getElementById('score-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 80)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const detectedGreen = result?.detected_green || []
  const detectedRed = result?.detected_red || []
  const questions = result?.questions_to_ask || []

  return (
    <>
      {error && <Alert type="danger">{error}</Alert>}

      <div className="card mb-3">
        <h2 className="mb-1">Score a Listing</h2>
        <p className="text-secondary mb-2">
          Find a rental on Domain or realestate.com.au, then paste the listing description here.
          We'll scan it for compliance and energy-efficiency signals and tell you what to ask at inspection.
        </p>

        <div className="form-group">
          <label className="form-label">Listing description / details *</label>
          <textarea
            className="textarea"
            value={form.description}
            onChange={update('description')}
            rows={8}
            placeholder="Paste the full listing text here. Include the property description, features list, and any details about heating, hot water, insulation, etc."
          />
          <div className="form-hint">
            Paste as much as you can — the more text, the more accurate the score.
          </div>
        </div>

        <div className="form-row-3">
          <div className="form-group">
            <label className="form-label">Weekly rent (AUD)</label>
            <input
              type="number"
              className="input"
              value={form.weekly_rent}
              onChange={update('weekly_rent')}
              placeholder="e.g. 480"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Bedrooms</label>
            <select className="select" value={form.bedrooms} onChange={update('bedrooms')}>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4+</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Suburb</label>
            <select className="select" value={form.suburb} onChange={update('suburb')}>
              <option value="">— select —</option>
              {suburbs.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
            </select>
          </div>
        </div>

        <button className="btn btn-success btn-lg" onClick={run} disabled={loading}>
          {loading ? 'Scoring…' : '▶ Score this listing'}
        </button>
      </div>

      {result && (
        <div id="score-result">
          <div className="card card-pad-lg mb-3">
            <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
              <ScoreCircle score={result.score} color={result.verdict_color} />
              <div style={{ flex: 1, minWidth: 240 }}>
                <h2 className="mb-1">{result.verdict}</h2>
                {result.value_rating && (
                  <p className="text-secondary mb-1">
                    <strong>Price:</strong> {result.value_rating}
                    {result.suburb_avg_rent && ` (suburb avg: $${result.suburb_avg_rent}/wk)`}
                  </p>
                )}
                <p className="text-secondary text-sm">
                  Score is based on detected energy-efficiency signals, compliance flags, and (if provided) value vs market.
                </p>
              </div>
            </div>
          </div>

          <div className="grid-2 mb-3">
            <div className="card" style={{ borderTop: '3px solid var(--green)' }}>
              <h3 className="mb-2">✓ Detected positives</h3>
              {detectedGreen.length === 0 ? (
                <p className="text-secondary text-sm">
                  No clear positive signals found. This doesn't mean the property is bad —
                  just that the listing didn't highlight efficient features. Ask about them at inspection.
                </p>
              ) : (
                <ul style={{ paddingLeft: 22 }}>
                  {detectedGreen.map((g, i) => <li key={i} className="mb-1">{g}</li>)}
                </ul>
              )}
            </div>

            <div className="card" style={{ borderTop: '3px solid var(--red)' }}>
              <h3 className="mb-2">⚠ Detected concerns</h3>
              {detectedRed.length === 0 ? (
                <p className="text-secondary text-sm">
                  No major red flags detected. Still worth inspecting carefully — listings often omit problems.
                </p>
              ) : (
                <ul style={{ paddingLeft: 22 }}>
                  {detectedRed.map((r, i) => <li key={i} className="mb-1">{r}</li>)}
                </ul>
              )}
            </div>
          </div>

          {questions.length > 0 && (
            <div className="card">
              <h3 className="mb-2">Questions to ask at inspection</h3>
              <p className="text-secondary text-sm mb-2">
                Tailored to what's missing or unclear in the listing.
              </p>
              <ol style={{ paddingLeft: 22 }}>
                {questions.map((q, i) => (
                  <li key={i} style={{ marginBottom: 8 }}>{q}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </>
  )
}