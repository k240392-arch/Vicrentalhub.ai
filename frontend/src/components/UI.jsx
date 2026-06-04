import React from 'react'

export function Spinner({ label }) {
  return (
    <div className="text-center">
      <div className="spinner" />
      {label && <p className="text-secondary text-sm">{label}</p>}
    </div>
  )
}

export function Empty({ title = 'Nothing here yet', subtitle, action }) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      {subtitle && <p className="text-secondary">{subtitle}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export function Alert({ type = 'info', children, title }) {
  return (
    <div className={`alert alert-${type}`}>
      {title && <strong style={{ display: 'block', marginBottom: 4 }}>{title}</strong>}
      {children}
    </div>
  )
}

export function Badge({ children, color = 'gray' }) {
  return <span className={`badge badge-${color}`}>{children}</span>
}

export function ScoreCircle({ score, color = 'green' }) {
  return (
    <div className={`score-circle ${color}`}>
      <div>
        <div className="num">{score}</div>
        <div className="max">/100</div>
      </div>
    </div>
  )
}

export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between mb-3" style={{ flexWrap: 'wrap', gap: 12 }}>
      <div>
        <h2>{title}</h2>
        {subtitle && <p className="text-secondary mt-0">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
