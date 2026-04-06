'use client'

import { useState } from 'react'

const C = {
  sand: '#F5ECD7',
  terra: '#C94A2B',
  saffron: '#E8850A',
  jade: '#2A7A5B',
  dark: '#1A1208',
}

export function RequestCityButton() {
  const [open, setOpen] = useState(false)
  const [cityName, setCityName] = useState('')
  const [note, setNote] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    if (!cityName.trim()) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/request-city', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cityName, note, email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const close = () => {
    setOpen(false)
    setTimeout(() => {
      setCityName('')
      setNote('')
      setEmail('')
      setDone(false)
      setError('')
    }, 300)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm font-medium px-4 py-2 rounded-full border transition-all hover:opacity-80"
        style={{ borderColor: `${C.dark}30`, color: C.dark }}
      >
        + Request a city
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(26,18,8,0.5)' }}
          onClick={e => e.target === e.currentTarget && close()}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl"
            style={{ background: C.sand }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="request-city-title"
          >
            {done ? (
              <div className="text-center space-y-3 py-4">
                <div className="text-3xl">🗺️</div>
                <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-playfair)', color: C.dark }}>
                  Request received!
                </h2>
                <p className="text-sm" style={{ color: C.dark, opacity: 0.6 }}>
                  We&apos;ll do our best to add <strong>{cityName}</strong> soon.
                </p>
                <button
                  onClick={close}
                  className="mt-2 text-sm font-medium px-5 py-2 rounded-full transition-opacity hover:opacity-80"
                  style={{ background: C.terra, color: C.sand }}
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <h2 id="request-city-title" className="text-lg font-bold" style={{ fontFamily: 'var(--font-playfair)', color: C.dark }}>
                    Request a city guide
                  </h2>
                  <button onClick={close} aria-label="Close" className="text-xl leading-none transition-opacity hover:opacity-50" style={{ color: C.dark }}>×</button>
                </div>
                <p className="text-sm" style={{ color: C.dark, opacity: 0.55 }}>
                  Don&apos;t see your destination? Let us know and we&apos;ll add it.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: C.dark, opacity: 0.5 }}>
                      City name <span style={{ color: C.terra }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={cityName}
                      onChange={e => setCityName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !submitting && submit()}
                      placeholder="e.g. Lisbon, Medellín, Kyoto…"
                      className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                      style={{ background: 'white', border: `1.5px solid ${C.saffron}44`, color: C.dark }}
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: C.dark, opacity: 0.5 }}>
                      Anything specific you&apos;d like covered? <span style={{ color: C.dark, opacity: 0.3 }}>(optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      placeholder="e.g. Family travel, budget tips, off the beaten track…"
                      className="w-full rounded-xl px-4 py-2.5 text-sm outline-none resize-none"
                      style={{ background: 'white', border: `1.5px solid ${C.saffron}44`, color: C.dark }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: C.dark, opacity: 0.5 }}>
                      Email <span style={{ color: C.dark, opacity: 0.3 }}>(optional — we&apos;ll notify you when it&apos;s live)</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                      style={{ background: 'white', border: `1.5px solid ${C.saffron}44`, color: C.dark }}
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-xs px-3 py-2 rounded-lg" style={{ background: `${C.terra}15`, color: C.terra }}>
                    {error}
                  </p>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={submit}
                    disabled={submitting || !cityName.trim()}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-40"
                    style={{ background: C.terra, color: C.sand }}
                  >
                    {submitting ? 'Sending…' : 'Submit request'}
                  </button>
                  <button
                    onClick={close}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-70"
                    style={{ color: C.dark, opacity: 0.5 }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
