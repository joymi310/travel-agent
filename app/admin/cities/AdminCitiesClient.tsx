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

const REGIONS = [
  'East Asia', 'Southeast Asia', 'South Asia', 'Middle East',
  'Europe', 'Africa', 'Americas', 'Oceania',
]

interface FactCheckIssue {
  severity: 'HIGH' | 'MEDIUM' | 'LOW'
  field: string
  claim: string
  concern: string
}

interface FactCheckResult {
  summary: string
  issues: FactCheckIssue[]
}

interface CityRequest {
  id: string
  city_name: string
  note: string | null
  email: string | null
  created_at: string
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

interface CityFull extends CityRow {
  hero_tagline: string
  overview: string
  best_time: string
  getting_around: string
  visa_notes: string
  neighbourhoods: unknown
  suggested_questions: unknown
}

const inputClass = 'w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all'
const inputStyle = (focus: boolean) => ({
  background: C.sand,
  border: `1.5px solid ${focus ? C.terra : `${C.saffron}44`}`,
  color: C.dark,
})

function Field({
  label, value, onChange, multiline = false, rows = 3, hint,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  multiline?: boolean
  rows?: number
  hint?: string
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: C.dark, opacity: 0.5 }}>
        {label}
      </label>
      {hint && <p className="text-xs" style={{ color: C.dark, opacity: 0.35 }}>{hint}</p>}
      {multiline ? (
        <textarea
          rows={rows}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`${inputClass} resize-y`}
          style={inputStyle(focused)}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={inputClass}
          style={inputStyle(focused)}
        />
      )}
    </div>
  )
}

export function AdminCitiesClient({ initialCities, initialRequests }: { initialCities: CityRow[], initialRequests: CityRequest[] }) {
  const [cities, setCities] = useState<CityRow[]>(initialCities)
  const [requests] = useState<CityRequest[]>(initialRequests)
  const [cityInput, setCityInput] = useState('')
  const [generating, setGenerating] = useState(false)
  const [genResult, setGenResult] = useState<{ slug: string; name: string } | null>(null)
  const [genError, setGenError] = useState('')
  const [toggling, setToggling] = useState<string | null>(null)

  // Fact-check state
  const [checkingId, setCheckingId] = useState<string | null>(null)
  const [checkResults, setCheckResults] = useState<Record<string, FactCheckResult>>({})

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<CityFull>>({})
  const [loadingEdit, setLoadingEdit] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

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
      setCities(prev => [{
        id: data.city.id ?? '',
        slug: data.city.slug,
        name: data.city.name,
        country: data.city.country ?? '',
        region: data.city.region ?? null,
        is_published: false,
        reviewed: false,
        created_at: new Date().toISOString(),
      }, ...prev])
    } catch (err) {
      setGenError(err instanceof Error ? err.message : String(err))
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

  const openEdit = async (city: CityRow) => {
    if (editingId === city.id) {
      setEditingId(null)
      return
    }
    setEditingId(city.id)
    setSaveError('')
    setSaveSuccess(false)
    setLoadingEdit(true)
    try {
      // Fetch full city data from Supabase via a quick API call
      const res = await fetch(`/api/admin/get-city?id=${city.id}`)
      const data = await res.json()
      if (data.city) {
        setEditData({
          ...data.city,
          neighbourhoods: JSON.stringify(data.city.neighbourhoods ?? [], null, 2),
          suggested_questions: JSON.stringify(data.city.suggested_questions ?? [], null, 2),
        })
      }
    } catch {
      setEditData({
        ...city,
        neighbourhoods: '[]',
        suggested_questions: '[]',
      })
    } finally {
      setLoadingEdit(false)
    }
  }

  const saveEdit = async () => {
    if (!editingId) return
    setSaving(true)
    setSaveError('')
    setSaveSuccess(false)
    try {
      const res = await fetch('/api/admin/update-city', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, ...editData }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      setSaveSuccess(true)
      // Update name in list if changed
      if (editData.name) {
        setCities(prev => prev.map(c => c.id === editingId ? { ...c, name: editData.name! } : c))
      }
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  const factCheck = async (id: string) => {
    setCheckingId(id)
    try {
      const res = await fetch('/api/admin/fact-check-city', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      setCheckResults(prev => ({ ...prev, [id]: data.result }))
    } catch (err) {
      setCheckResults(prev => ({
        ...prev,
        [id]: { summary: `Error: ${err instanceof Error ? err.message : String(err)}`, issues: [] },
      }))
    } finally {
      setCheckingId(null)
    }
  }

  const set = (key: keyof CityFull) => (value: string) =>
    setEditData(prev => ({ ...prev, [key]: value }))

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

        {/* City requests */}
        {requests.length > 0 && (
          <div className="rounded-2xl overflow-hidden" style={{ background: 'white', boxShadow: '0 2px 12px rgba(26,18,8,0.08)' }}>
            <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: C.sand }}>
              <h2 className="font-semibold text-sm" style={{ color: C.dark }}>
                City requests
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${C.terra}15`, color: C.terra }}>
                {requests.length}
              </span>
            </div>
            <div className="divide-y" style={{ borderColor: C.sand }}>
              {requests.map(r => (
                <div key={r.id} className="px-6 py-4 flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm" style={{ color: C.dark }}>{r.city_name}</p>
                    {r.note && <p className="text-xs mt-0.5" style={{ color: C.dark, opacity: 0.55 }}>{r.note}</p>}
                    {r.email && <p className="text-xs mt-0.5" style={{ color: C.jade }}>{r.email}</p>}
                  </div>
                  <p className="text-xs shrink-0" style={{ color: C.dark, opacity: 0.35 }}>
                    {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

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
                <div key={city.id}>
                  {/* Row */}
                  <div className="px-6 py-4 flex items-center gap-4">
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
                      <button
                        onClick={() => factCheck(city.id)}
                        disabled={checkingId === city.id}
                        className="text-xs px-3 py-1.5 rounded-full font-medium transition-all hover:opacity-80 disabled:opacity-40"
                        style={{
                          background: checkResults[city.id] ? `${C.saffron}15` : 'transparent',
                          color: C.saffron,
                          border: `1px solid ${C.saffron}40`,
                        }}
                      >
                        {checkingId === city.id ? 'Checking…' : checkResults[city.id] ? 'Re-check' : 'Fact-check'}
                      </button>
                      <button
                        onClick={() => openEdit(city)}
                        className="text-xs px-3 py-1.5 rounded-full font-medium transition-all hover:opacity-80"
                        style={{
                          background: editingId === city.id ? `${C.dark}10` : 'transparent',
                          color: C.dark,
                          border: `1px solid ${C.dark}20`,
                        }}
                      >
                        {editingId === city.id ? 'Close' : 'Edit'}
                      </button>
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

                  {/* Fact-check results */}
                  {checkResults[city.id] && (
                    <div className="px-6 py-5 border-t space-y-3" style={{ borderColor: C.sand, background: '#FFFDF7' }}>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.saffron }}>
                          GPT-4o Fact-check
                        </p>
                        <button
                          onClick={() => setCheckResults(prev => { const n = { ...prev }; delete n[city.id]; return n })}
                          className="text-xs opacity-40 hover:opacity-70 transition-opacity"
                          style={{ color: C.dark }}
                        >
                          Dismiss
                        </button>
                      </div>
                      <p className="text-sm" style={{ color: C.dark }}>{checkResults[city.id].summary}</p>
                      {checkResults[city.id].issues.length > 0 && (
                        <div className="space-y-2">
                          {checkResults[city.id].issues.map((issue, i) => (
                            <div key={i} className="rounded-xl p-3 space-y-1" style={{
                              background: issue.severity === 'HIGH' ? `${C.terra}10` : issue.severity === 'MEDIUM' ? `${C.saffron}12` : `${C.dark}06`,
                              border: `1px solid ${issue.severity === 'HIGH' ? `${C.terra}30` : issue.severity === 'MEDIUM' ? `${C.saffron}30` : `${C.dark}10`}`,
                            }}>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold" style={{
                                  color: issue.severity === 'HIGH' ? C.terra : issue.severity === 'MEDIUM' ? C.saffron : C.dark,
                                }}>
                                  {issue.severity}
                                </span>
                                <span className="text-xs opacity-50" style={{ color: C.dark }}>{issue.field}</span>
                              </div>
                              <p className="text-xs font-medium" style={{ color: C.dark }}>&ldquo;{issue.claim}&rdquo;</p>
                              <p className="text-xs" style={{ color: C.dark, opacity: 0.65 }}>{issue.concern}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Edit panel */}
                  {editingId === city.id && (
                    <div className="px-6 pb-6 border-t space-y-5" style={{ borderColor: C.sand, background: '#FDFAF4' }}>
                      {loadingEdit ? (
                        <p className="py-6 text-sm text-center" style={{ color: C.dark, opacity: 0.4 }}>Loading…</p>
                      ) : (
                        <>
                          <div className="pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Name" value={editData.name ?? ''} onChange={set('name')} />
                            <Field label="Country" value={editData.country ?? ''} onChange={set('country')} />
                            <div className="space-y-1">
                              <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: C.dark, opacity: 0.5 }}>
                                Region
                              </label>
                              <select
                                value={editData.region ?? ''}
                                onChange={e => set('region')(e.target.value)}
                                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                                style={{ background: C.sand, border: `1.5px solid ${C.saffron}44`, color: C.dark }}
                              >
                                <option value="">— select —</option>
                                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                              </select>
                            </div>
                            <Field label="Hero tagline" value={editData.hero_tagline ?? ''} onChange={set('hero_tagline')} />
                          </div>

                          <Field label="Overview" value={editData.overview ?? ''} onChange={set('overview')} multiline rows={4} />
                          <Field label="Best time to visit" value={editData.best_time ?? ''} onChange={set('best_time')} multiline rows={3} />
                          <Field label="Getting around" value={editData.getting_around ?? ''} onChange={set('getting_around')} multiline rows={3} />
                          <Field label="Visa notes" value={editData.visa_notes ?? ''} onChange={set('visa_notes')} multiline rows={2} />
                          <Field
                            label="Neighbourhoods (JSON)"
                            value={typeof editData.neighbourhoods === 'string' ? editData.neighbourhoods : JSON.stringify(editData.neighbourhoods ?? [], null, 2)}
                            onChange={set('neighbourhoods')}
                            multiline rows={8}
                            hint='Array of { name, vibe, best_for, price_range }'
                          />
                          <Field
                            label="Suggested questions (JSON)"
                            value={typeof editData.suggested_questions === 'string' ? editData.suggested_questions : JSON.stringify(editData.suggested_questions ?? [], null, 2)}
                            onChange={set('suggested_questions')}
                            multiline rows={5}
                            hint="Array of question strings"
                          />

                          <div className="flex items-center gap-3 pt-2">
                            <button
                              onClick={saveEdit}
                              disabled={saving}
                              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-40"
                              style={{ background: C.terra, color: C.sand }}
                            >
                              {saving ? 'Saving…' : 'Save changes'}
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-5 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-70"
                              style={{ color: C.dark, opacity: 0.5 }}
                            >
                              Cancel
                            </button>
                            {saveSuccess && (
                              <span className="text-sm" style={{ color: C.jade }}>✓ Saved</span>
                            )}
                            {saveError && (
                              <span className="text-sm" style={{ color: C.terra }}>{saveError}</span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
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
