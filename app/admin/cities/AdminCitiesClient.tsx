'use client'

import { useState } from 'react'
import Link from 'next/link'

const C = {
  sand: '#F5ECD7',
  terra: '#C94A2B',
  saffron: '#E8850A',
  jade: '#2A7A5B',
  dark: '#1A1208',
}

interface CityRow {
  id: string
  slug: string
  name: string
  country: string
  region: string | null
  is_published: boolean
  reviewed: boolean
  created_at: string
}

export function AdminCitiesClient({ initialCities }: { initialCities: CityRow[] }) {
  const [cities, setCities] = useState<CityRow[]>(initialCities)
  const [cityInput, setCityInput] = useState('')
  const [generating, setGenerating] = useState(false)
  const [genResult, setGenResult] = useState<{ slug: string; name: string } | null>(null)
  const [genError, setGenError] = useState('')
  const [toggling, setToggling] = useState<string | null>(null)

  const generate = async () => {
    if (!cityInput.trim()) return
    setGenerating(true)
    setGenError('')
    setGenResult(null)
    try {
      const res = await fetch('/api/admin/generate-city', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cityName: cityInput.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      setGenResult(data.city)
      setCityInput('')
      // Add to list
      setCities(prev => [{
        id: data.city.id ?? '',
        slug: data.city.slug,
        name: data.city.name,
        country: '',
        region: null,
        is_published: false,
        reviewed: false,
        created_at: new Date().toISOString(),
      }, ...prev])
    } catch (err) {
      setGenError(String(err))
    } finally {
      setGenerating(false)
    }
  }

  const toggle = async (id: string, field: 'is_published' | 'reviewed', current: boolean) => {
    setToggling(`${id}-${field}`)
    try {
      const res = await fetch('/api/admin/toggle-city', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, field, value: !current }),
      })
      if (!res.ok) throw new Error('Failed')
      setCities(prev => prev.map(c => c.id === id ? { ...c, [field]: !current } : c))
    } catch (err) {
      alert(`Error: ${err}`)
    } finally {
      setToggling(null)
    }
  }

  return (
    <div className="min-h-screen p-6" style={{ background: C.sand }}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair)', color: C.dark }}>
            City Guides Admin
          </h1>
          <Link href="/" className="text-sm transition-opacity hover:opacity-70"
            style={{ color: C.dark, opacity: 0.5 }}>← Back to site</Link>
        </div>

        {/* Generate form */}
        <div className="rounded-2xl p-6 space-y-4" style={{ background: 'white', boxShadow: '0 2px 12px rgba(26,18,8,0.08)' }}>
          <h2 className="font-semibold text-sm uppercase tracking-wide" style={{ color: C.dark, opacity: 0.5 }}>
            Generate new city guide
          </h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={cityInput}
              onChange={e => setCityInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !generating && generate()}
              placeholder="e.g. Hanoi, Lisbon, Mexico City…"
              className="flex-1 rounded-xl px-4 py-3 text-sm outline-none transition-all"
              style={{ background: C.sand, border: `1.5px solid ${C.saffron}44`, color: C.dark }}
              onFocus={e => e.target.style.borderColor = C.terra}
              onBlur={e => e.target.style.borderColor = `${C.saffron}44`}
            />
            <button
              onClick={generate}
              disabled={generating || !cityInput.trim()}
              className="rounded-xl px-5 py-3 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-40 shrink-0"
              style={{ background: C.terra, color: C.sand }}
            >
              {generating ? 'Generating…' : 'Generate guide'}
            </button>
          </div>
          {genError && (
            <p className="text-xs px-3 py-2 rounded-lg" style={{ background: `${C.terra}15`, color: C.terra }}>
              {genError}
            </p>
          )}
          {genResult && (
            <p className="text-xs" style={{ color: C.jade }}>
              ✓ Generated <strong>{genResult.name}</strong> ·{' '}
              <Link href={`/cities/${genResult.slug}`} target="_blank"
                className="underline" style={{ color: C.terra }}>
                Preview draft →
              </Link>
              {' '}(unpublished)
            </p>
          )}
        </div>

        {/* Cities list */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'white', boxShadow: '0 2px 12px rgba(26,18,8,0.08)' }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: C.sand }}>
            <h2 className="font-semibold text-sm" style={{ color: C.dark }}>
              All cities ({cities.length})
            </h2>
          </div>
          {cities.length === 0 ? (
            <p className="px-6 py-8 text-sm text-center" style={{ color: C.dark, opacity: 0.4 }}>
              No cities yet. Generate one above.
            </p>
          ) : (
            <div className="divide-y" style={{ borderColor: C.sand }}>
              {cities.map(city => (
                <div key={city.id} className="px-6 py-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link href={`/cities/${city.slug}`} target="_blank"
                        className="font-medium text-sm hover:opacity-70 transition-opacity"
                        style={{ color: C.dark }}>
                        {city.name}
                      </Link>
                      {city.country && (
                        <span className="text-xs" style={{ color: C.dark, opacity: 0.4 }}>
                          {city.country}
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: C.dark, opacity: 0.35 }}>
                      /{city.slug} · {new Date(city.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <ToggleButton
                      label="Published"
                      active={city.is_published}
                      loading={toggling === `${city.id}-is_published`}
                      onClick={() => toggle(city.id, 'is_published', city.is_published)}
                      activeColor={C.jade}
                    />
                    <ToggleButton
                      label="Reviewed"
                      active={city.reviewed}
                      loading={toggling === `${city.id}-reviewed`}
                      onClick={() => toggle(city.id, 'reviewed', city.reviewed)}
                      activeColor={C.saffron}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ToggleButton({ label, active, loading, onClick, activeColor }: {
  label: string; active: boolean; loading: boolean; onClick: () => void; activeColor: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="text-xs px-3 py-1.5 rounded-full font-medium transition-all disabled:opacity-50"
      style={{
        background: active ? `${activeColor}18` : 'rgba(26,18,8,0.05)',
        color: active ? activeColor : 'rgba(26,18,8,0.4)',
        border: `1px solid ${active ? activeColor : 'rgba(26,18,8,0.1)'}`,
      }}
    >
      {loading ? '…' : (active ? `✓ ${label}` : label)}
    </button>
  )
}
