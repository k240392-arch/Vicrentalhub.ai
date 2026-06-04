import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import { Alert, Spinner } from '../components/UI.jsx'

const DEFAULT = {
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
}

export default function PropertyFormPage() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const [form, setForm] = useState(DEFAULT)
  const [catalogue, setCatalogue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const tasks = [api.getCatalogue()]
    if (isEdit) tasks.push(api.getProperty(id))
    Promise.all(tasks)
      .then(([cat, prop]) => {
        setCatalogue(cat)
        if (prop) {
          setForm({
            ...DEFAULT,
            ...prop,
            property_value: prop.property_value ?? '',
            weekly_rent: prop.weekly_rent ?? '',
          })
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const update = (field) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm({ ...form, [field]: v })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload = {
        ...form,
        year_built: form.year_built ? parseInt(form.year_built) : null,
        bedrooms: parseInt(form.bedrooms),
        bathrooms: parseInt(form.bathrooms),
        property_value: form.property_value ? parseFloat(form.property_value) : null,
        weekly_rent: form.weekly_rent ? parseFloat(form.weekly_rent) : null,
      }
      if (isEdit) await api.updateProperty(id, payload)
      else await api.createProperty(payload)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="container mt-4"><Spinner /></div>

  return (
    <div className="container-narrow mt-4 mb-4">
      <div className="card card-pad-lg">
        <h1 className="mb-1">{isEdit ? 'Edit Property' : 'Add Property'}</h1>
        <p className="text-secondary mb-3">Provide what you know — you can update later. The compliance score will be computed automatically.</p>

        {error && <Alert type="danger">{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Address *</label>
            <input className="input" value={form.address} onChange={update('address')} required placeholder="e.g. 123 Smith St, Brunswick VIC 3056" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Suburb</label>
              <input className="input" value={form.suburb || ''} onChange={update('suburb')} />
            </div>
            <div className="form-group">
              <label className="form-label">Postcode</label>
              <input className="input" value={form.postcode || ''} onChange={update('postcode')} />
            </div>
          </div>
          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">Year built</label>
              <input type="number" className="input" value={form.year_built || ''} onChange={update('year_built')} min="1800" max="2030" />
            </div>
            <div className="form-group">
              <label className="form-label">Bedrooms</label>
              <input type="number" className="input" value={form.bedrooms} onChange={update('bedrooms')} min="0" max="10" />
            </div>
            <div className="form-group">
              <label className="form-label">Bathrooms</label>
              <input type="number" className="input" value={form.bathrooms} onChange={update('bathrooms')} min="0" max="10" />
            </div>
          </div>

          <h3 className="mt-2 mb-1">Energy & Systems</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Heating</label>
              <select className="select" value={form.heating} onChange={update('heating')}>
                {catalogue?.heating.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Cooling</label>
              <select className="select" value={form.cooling} onChange={update('cooling')}>
                {catalogue?.cooling.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Hot water</label>
              <select className="select" value={form.hot_water} onChange={update('hot_water')}>
                {catalogue?.hot_water.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Insulation</label>
              <select className="select" value={form.insulation} onChange={update('insulation')}>
                {catalogue?.insulation.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>

          <h3 className="mt-2 mb-1">Condition Flags</h3>
          <div className="grid-2">
            <label className="checkbox-row"><input type="checkbox" checked={form.mould} onChange={update('mould')} /> Mould present</label>
            <label className="checkbox-row"><input type="checkbox" checked={form.draughts} onChange={update('draughts')} /> Draughts present</label>
            <label className="checkbox-row"><input type="checkbox" checked={form.solar} onChange={update('solar')} /> Solar panels installed</label>
            <label className="checkbox-row"><input type="checkbox" checked={form.water_efficient} onChange={update('water_efficient')} /> 4-star water-efficient fixtures</label>
          </div>

          <h3 className="mt-2 mb-1">Financials (optional)</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Property value (AUD)</label>
              <input type="number" className="input" value={form.property_value} onChange={update('property_value')} placeholder="e.g. 850000" />
              <div className="form-hint">Used for solar rebate eligibility ($3M cap).</div>
            </div>
            <div className="form-group">
              <label className="form-label">Weekly rent (AUD)</label>
              <input type="number" className="input" value={form.weekly_rent} onChange={update('weekly_rent')} placeholder="e.g. 480" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="textarea" value={form.notes || ''} onChange={update('notes')} rows={3} />
          </div>

          <div className="flex gap-1 mt-3">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard')}>Cancel</button>
            <button type="submit" className="btn btn-success" disabled={saving}>{saving ? 'Saving…' : (isEdit ? 'Save changes' : 'Add property')}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
