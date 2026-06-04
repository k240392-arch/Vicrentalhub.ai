import React, { useEffect, useRef, useState } from 'react'
import { api } from '../api'
import { Alert } from '../components/UI.jsx'

const STARTERS = [
  'What are my bond rights?',
  'How do rent increases work?',
  'Tell me about minimum standards',
  'What rebates are available?',
  'My rental has mould — what can I do?',
  'Can my landlord just evict me?',
]

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I can help with Victorian rental questions — bond, rent increases, repairs, mould, inspections, eviction, energy standards, rebates, and more. What\'s on your mind?' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [suggestions, setSuggestions] = useState(STARTERS)
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text) => {
    const content = (text ?? input).trim()
    if (!content) return
    setInput('')
    setError(null)
    const newMsgs = [...messages, { role: 'user', content }]
    setMessages(newMsgs)
    setLoading(true)
    try {
      const res = await api.chat({ messages: newMsgs })
      setMessages([...newMsgs, { role: 'assistant', content: res.reply }])
      setSuggestions(res.suggestions?.length ? res.suggestions : STARTERS)
    } catch (e) {
      setError(e.message)
      setMessages(newMsgs)
    } finally {
      setLoading(false)
    }
  }

  // Render bold markdown (**text**) inside chat messages.
  const renderMessage = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/)
    return parts.map((p, i) => {
      if (p.startsWith('**') && p.endsWith('**')) {
        return <strong key={i}>{p.slice(2, -2)}</strong>
      }
      return <React.Fragment key={i}>{p}</React.Fragment>
    })
  }

  return (
    <div className="container-narrow mt-4 mb-4">
      <div className="mb-3">
        <h1>Ask VicRentalHub</h1>
        <p className="text-secondary">Quick answers from our rental knowledge base. Always verify with Tenants Victoria for your specific situation.</p>
      </div>

      {error && <Alert type="danger">{error}</Alert>}

      <div className="card" style={{ padding: 0 }}>
        <div className="chat-wrap">
          <div className="chat-messages" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={`chat-message ${m.role}`}>{renderMessage(m.content)}</div>
            ))}
            {loading && (
              <div className="chat-message assistant">
                <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2, margin: 0, display: 'inline-block', verticalAlign: 'middle' }} />
              </div>
            )}
          </div>
          {suggestions.length > 0 && (
            <div className="chat-suggestions">
              {suggestions.map((s, i) => (
                <button key={i} className="chat-chip" onClick={() => send(s)} disabled={loading}>{s}</button>
              ))}
            </div>
          )}
          <div className="chat-input-row">
            <input
              className="input"
              placeholder="Type your question…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && send()}
              disabled={loading}
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary" onClick={() => send()} disabled={loading || !input.trim()}>Send</button>
          </div>
        </div>
      </div>
    </div>
  )
}
