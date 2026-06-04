import React, { useEffect, useState } from 'react'
import { api } from '../api'
import { Alert, Badge, Empty, Spinner } from '../components/UI.jsx'

export default function ReportsPage() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.myReports().then(setReports).catch((e) => setError(e.message)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="container mt-4"><Spinner /></div>

  return (
    <div className="container mt-4 mb-4">
      <div className="mb-3">
        <h1>Your Reports</h1>
        <p className="text-secondary">All compliance and tenant reports generated under your account.</p>
      </div>

      {error && <Alert type="danger">{error}</Alert>}

      {reports.length === 0 ? (
        <Empty title="No reports yet" subtitle="Run an analysis from the Analyse tab to create your first report." />
      ) : (
        <div className="card">
          <table className="table">
            <thead><tr><th>Date</th><th>Type</th><th>Property</th><th>Score</th><th>Grade</th></tr></thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id}>
                  <td>{new Date(r.created_at).toLocaleString()}</td>
                  <td><Badge color={r.report_type === 'landlord' ? 'blue' : 'green'}>{r.report_type}</Badge></td>
                  <td>{r.summary?.address || '—'}</td>
                  <td>{r.summary?.score != null ? `${r.summary.score}/100` : '—'}</td>
                  <td>{r.summary?.grade || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
