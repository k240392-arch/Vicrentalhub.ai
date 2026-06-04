import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { Alert, Spinner, Badge } from '../components/UI.jsx'

export default function PricingPage() {
  const [pricing, setPricing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.getPricing().then(setPricing).catch((e) => setError(e.message)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="container mt-4"><Spinner /></div>
  if (error) return <div className="container mt-4"><Alert type="danger">{error}</Alert></div>

  const tierOrder = ['tenant', 'landlord_report', 'landlord_pro', 'agency']

  return (
    <div className="container mt-4 mb-4">
      <div className="text-center mb-4">
        <h1>Simple Pricing</h1>
        <p className="text-secondary">Free for tenants. Pay only when you need a landlord/agency report or unlimited access.</p>
      </div>

      <div className="grid-auto" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        {tierOrder.map((id) => {
          const tier = pricing[id]
          if (!tier) return null
          const isPro = id === 'landlord_pro'
          return (
            <div key={id} className={`card card-pad-lg ${isPro ? '' : ''}`} style={{ position: 'relative', border: isPro ? '2px solid var(--green)' : undefined }}>
              {isPro && <div style={{ position: 'absolute', top: -12, right: 16 }}><Badge color="green">Most popular</Badge></div>}
              <h2 className="mb-1">{tier.label}</h2>
              <div className="mb-2">
                {tier.price === 0 ? (
                  <div><span className="text-3xl font-bold">Free</span></div>
                ) : (
                  <div>
                    <span className="text-3xl font-bold">${tier.price}</span>
                    <span className="text-secondary"> {tier.currency}/{tier.interval}</span>
                  </div>
                )}
              </div>
              <ul style={{ paddingLeft: 0, listStyle: 'none', marginBottom: 16 }}>
                {tier.features.map((f, i) => (
                  <li key={i} className="text-sm" style={{ padding: '6px 0', borderTop: i ? '1px solid var(--border)' : 'none' }}>
                    <span style={{ color: 'var(--green)', marginRight: 6 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link to={tier.price === 0 ? '/register' : '/register'} className={`btn btn-block ${isPro ? 'btn-success' : 'btn-secondary'}`}>
                {tier.price === 0 ? 'Sign up free' : 'Get started'}
              </Link>
            </div>
          )
        })}
      </div>

      <div className="card mt-4 text-center">
        <h2 className="mb-2">Not sure which to pick?</h2>
        <p className="text-secondary mb-2">All paid plans include the same compliance analysis. Choose based on whether you need it once (One-Time Report), monthly (Pro), or for multiple properties (Agency).</p>
        <Link to="/analyse" className="btn btn-primary">Try the analysis tool free →</Link>
      </div>
    </div>
  )
}
