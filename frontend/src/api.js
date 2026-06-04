// API client — wraps fetch with auth + JSON.

const API_BASE = '/api'

function getToken() {
  return localStorage.getItem('vrh_token')
}

export function setToken(token) {
  if (token) localStorage.setItem('vrh_token', token)
  else localStorage.removeItem('vrh_token')
}

async function request(path, { method = 'GET', body, raw = false } = {}) {
  const headers = {
    'Content-Type': 'application/json',
  }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    let detail
    try {
      const data = await res.json()
      detail = data.detail || data.message || res.statusText
    } catch {
      detail = res.statusText
    }
    const err = new Error(typeof detail === 'string' ? detail : JSON.stringify(detail))
    err.status = res.status
    throw err
  }

  if (raw) return res
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  // Auth
  register: (data) => request('/auth/register', { method: 'POST', body: data }),
  login: (data) => request('/auth/login', { method: 'POST', body: data }),
  me: () => request('/auth/me'),

  // Properties
  listProperties: () => request('/properties'),
  getProperty: (id) => request(`/properties/${id}`),
  createProperty: (data) => request('/properties', { method: 'POST', body: data }),
  updateProperty: (id, data) => request(`/properties/${id}`, { method: 'PATCH', body: data }),
  deleteProperty: (id) => request(`/properties/${id}`, { method: 'DELETE' }),

  // Analyse
  fullReport: (data) => request('/analyse/full-report', { method: 'POST', body: data }),
  standards: (data) => request('/analyse/standards', { method: 'POST', body: data }),
  score: (data) => request('/analyse/score', { method: 'POST', body: data }),
  energy: (data) => request('/analyse/energy', { method: 'POST', body: data }),
  roi: (data) => request('/analyse/roi', { method: 'POST', body: data }),
  rebates: (data) => request('/analyse/rebates', { method: 'POST', body: data }),
  safety: (data) => request('/analyse/safety', { method: 'POST', body: data }),
  timeline: (data) => request('/analyse/timeline', { method: 'POST', body: data }),
  preAdAudit: (data) => request('/analyse/pre-ad-audit', { method: 'POST', body: data }),
  listingOptimiser: (data) => request('/analyse/listing-optimiser', { method: 'POST', body: data }),
  healthCheck: (data) => request('/analyse/health-check', { method: 'POST', body: data }),
  bills: (data) => request('/analyse/bills', { method: 'POST', body: data }),
  negotiation: (data) => request('/analyse/negotiation', { method: 'POST', body: data }),
  affordability: (data) => request('/analyse/affordability', { method: 'POST', body: data }),
  esg: (data) => request('/analyse/esg', { method: 'POST', body: data }),

  // Rentals
  searchRentals: (data) => request('/rentals/search', { method: 'POST', body: data }),
  scoreListing: (data) => request('/rentals/score-listing', { method: 'POST', body: data }),
  listSuburbs: () => request('/rentals/suburbs'),
  listUniversities: () => request('/rentals/universities'),
  listSavedSearches: () => request('/rentals/saved-searches'),
  createSavedSearch: (data) => request('/rentals/saved-searches', { method: 'POST', body: data }),
  deleteSavedSearch: (id) => request(`/rentals/saved-searches/${id}`, { method: 'DELETE' }),

  // Reports
  myReports: () => request('/reports/my-reports'),
  landlordPdf: (data) => request('/reports/landlord-pdf', { method: 'POST', body: data, raw: true }),
  tenantPdf: (data) => request('/reports/tenant-pdf', { method: 'POST', body: data, raw: true }),

  // Reference
  getStandards: () => request('/reference/standards'),
  getEnergyStandards: () => request('/reference/energy-standards'),
  getReferenceRebates: () => request('/reference/rebates'),
  getTenantRights: () => request('/reference/tenant-rights'),
  getPricing: () => request('/reference/pricing'),
  getCatalogue: () => request('/reference/catalogue'),
  getSampleProperties: () => request('/reference/sample-properties'),
  getDisclaimer: () => request('/reference/disclaimer'),

  // Chat
  chat: (data) => request('/chat', { method: 'POST', body: data }),
}

// Helper: trigger PDF download from a raw response
export async function downloadPdf(response, fallbackName = 'report.pdf') {
  const blob = await response.blob()
  const cd = response.headers.get('content-disposition') || ''
  const match = cd.match(/filename="([^"]+)"/)
  const filename = match ? match[1] : fallbackName
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}