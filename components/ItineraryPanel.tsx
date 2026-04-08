'use client'

import { useState, useRef, Suspense } from 'react'
import dynamic from 'next/dynamic'
import type { TripLocation } from './TripMap'

const TripMap = dynamic(() => import('./TripMap').then(m => ({ default: m.TripMap })), { ssr: false })

const C = {
  sand: '#F5ECD7',
  terra: '#C94A2B',
  saffron: '#E8850A',
  jade: '#2A7A5B',
  dark: '#1A1208',
}

interface Highlight {
  text: string
  reason?: string
}

interface Meal {
  name: string
  dish?: string
  reason?: string
}

interface Accommodation {
  name: string
  reason?: string
}

interface ItineraryDay {
  day: number
  title: string
  highlights: (string | Highlight)[]
  accommodation: string | Accommodation
  meals: (string | Meal)[]
  transport: string
  estimatedCost: string
}

function highlightText(h: string | Highlight): string {
  return typeof h === 'string' ? h : h.text
}

function highlightReason(h: string | Highlight): string | undefined {
  return typeof h === 'string' ? undefined : h.reason
}

function mealName(m: string | Meal): string {
  return typeof m === 'string' ? m : m.name
}

function mealDish(m: string | Meal): string | undefined {
  return typeof m === 'string' ? undefined : m.dish
}

function mealReason(m: string | Meal): string | undefined {
  return typeof m === 'string' ? undefined : m.reason
}

function accommodationName(a: string | Accommodation): string {
  return typeof a === 'string' ? a : a.name
}

function accommodationReason(a: string | Accommodation): string | undefined {
  return typeof a === 'string' ? undefined : a.reason
}

export interface BudgetSummary {
  total_low: number
  total_high: number
  currency: string
  includes: string[]
  excludes: string[]
  per_day_avg: number
  breakdown: {
    accommodation: number
    food: number
    activities: number
    local_transport: number
  }
}

export interface Itinerary {
  destination: string
  duration: string
  tagline: string
  follow_up_questions?: string[]
  budget_summary?: BudgetSummary
  locations?: TripLocation[]
  days: ItineraryDay[]
}

function formatItineraryAsMarkdown(itinerary: Itinerary): string {
  const lines: string[] = [
    `# ${itinerary.destination} — ${itinerary.duration}`,
    itinerary.tagline,
    '',
  ]
  for (const d of itinerary.days) {
    lines.push(`## Day ${d.day} — ${d.title}`, '')
    lines.push('**Highlights**')
    for (const h of d.highlights) lines.push(`- ${highlightText(h)}`)
    lines.push('')
    lines.push(
      `**Stay:** ${accommodationName(d.accommodation)}`,
      `**Meals:** ${d.meals.map(mealName).join(' · ')}`,
      `**Transport:** ${d.transport}`,
      `**Est. cost:** ${d.estimatedCost}`,
      '',
    )
  }
  return lines.join('\n')
}

function formatItineraryAsHtml(itinerary: Itinerary): string {
  const days = itinerary.days.map(d => `
    <h2>Day ${d.day} — ${d.title}</h2>
    <h3>Highlights</h3>
    <ul>${d.highlights.map(h => `<li>${highlightText(h)}</li>`).join('')}</ul>
    <p><strong>Stay:</strong> ${accommodationName(d.accommodation)}</p>
    <p><strong>Meals:</strong> ${d.meals.map(mealName).join(' · ')}</p>
    <p><strong>Transport:</strong> ${d.transport}</p>
    <p><strong>Estimated daily cost:</strong> ${d.estimatedCost}</p>
    <hr>
  `).join('')
  return `<html><head><meta charset="utf-8">
<style>
  body { font-family: Georgia, serif; max-width: 800px; margin: 40px auto; color: #1A1208; line-height: 1.6; }
  h1 { color: #C94A2B; }
  h2 { margin-top: 2em; color: #2A7A5B; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
  h3 { color: #555; font-size: 0.9em; text-transform: uppercase; letter-spacing: 0.05em; }
  hr { border: none; border-top: 1px solid #eee; margin: 2em 0; }
  ul { padding-left: 1.5em; }
  li { margin-bottom: 0.3em; }
</style>
</head><body>
<h1>${itinerary.destination} — ${itinerary.duration}</h1>
<p><em>${itinerary.tagline}</em></p>
${days}
</body></html>`
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function formatMoney(amount: number, currency: string): string {
  const symbol = currency === 'NZD' ? 'NZ$' : currency === 'AUD' ? 'A$' : currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : '$'
  return `${symbol}${amount.toLocaleString()}`
}

export function ItineraryPanel({ itinerary }: { itinerary: Itinerary }) {
  const [expandedDay, setExpandedDay] = useState<number | null>(null)   // IT-01: collapsed by default
  const dayRefs = useRef<(HTMLDivElement | null)[]>([])
  const [expandedMeals, setExpandedMeals] = useState<Set<string>>(new Set()) // IT-02
  const [shareLabel, setShareLabel] = useState('Share')
  const [budgetOpen, setBudgetOpen] = useState(false)
  const [view, setView] = useState<'list' | 'map'>('list')
  const [menuOpen, setMenuOpen] = useState(false)

  const toggleMeal = (key: string) => {
    setExpandedMeals(prev => {
      const next = new Set(prev)
      if (next.has(key)) { next.delete(key) } else { next.add(key) }
      return next
    })
  }

  const hasMap = (itinerary.locations?.length ?? 0) > 0

  const safeName = itinerary.destination.replace(/\s+/g, '-').toLowerCase()

  const handlePrint = () => window.print()

  const handleCsv = () => {
    const header = ['Day', 'Title', 'Highlights', 'Accommodation', 'Meals', 'Transport', 'Est. Cost']
    const rows = itinerary.days.map(d => [
      String(d.day),
      d.title,
      d.highlights.map(highlightText).join('; '),
      accommodationName(d.accommodation),
      d.meals.map(mealName).join('; '),
      d.transport,
      d.estimatedCost,
    ])
    const csv = [header, ...rows]
      .map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(','))
      .join('\r\n')
    downloadFile(csv, `${safeName}-itinerary.csv`, 'text/csv')
  }

  const handleWordDoc = () => {
    const html = formatItineraryAsHtml(itinerary)
    downloadFile(html, `${safeName}-itinerary.doc`, 'application/msword')
  }

  const handleShare = async () => {
    const text = formatItineraryAsMarkdown(itinerary)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: `${itinerary.destination} itinerary`, text })
        return
      } catch { /* user cancelled */ }
    }
    await navigator.clipboard.writeText(text)
    setShareLabel('Copied!')
    setTimeout(() => setShareLabel('Share'), 2000)
  }

  const actions = [
    { label: 'Print / PDF', icon: '🖨️', onClick: handlePrint },
    { label: 'Spreadsheet', icon: '📊', onClick: handleCsv },
    { label: 'Word doc',    icon: '📄', onClick: handleWordDoc },
    { label: shareLabel,   icon: '🔗', onClick: handleShare },
  ]

  return (
    <div className="h-full flex flex-col overflow-hidden wandr-itinerary-panel" style={{ background: '#FDFAF4' }}>

      {/* Header */}
      <div className="shrink-0 px-6 py-5 border-b" style={{ background: '#FDFAF4', borderColor: `${C.dark}10` }}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-2xl font-bold leading-tight"
              style={{ fontFamily: 'var(--font-playfair)', color: C.dark }}>
              {itinerary.destination}
            </h2>
            {itinerary.tagline && (
              <p className="text-sm mt-0.5" style={{ color: '#555', fontStyle: 'italic' }}>
                {itinerary.tagline}
              </p>
            )}
          </div>

          {/* Actions menu */}
          <div className="relative shrink-0">
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-black/[0.06]"
              style={{ color: C.dark }}
              aria-label="Itinerary actions"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="8" cy="2.5" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="8" cy="13.5" r="1.5"/>
              </svg>
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div
                  className="absolute right-0 top-10 z-50 rounded-2xl overflow-hidden py-1.5 min-w-[160px]"
                  style={{ background: 'white', boxShadow: '0 4px 20px rgba(26,18,8,0.14)', border: `1px solid ${C.dark}10` }}
                >
                  {actions.map(({ label, icon, onClick }) => (
                    <button
                      key={label}
                      onClick={() => { onClick(); setMenuOpen(false) }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left hover:bg-black/[0.04] transition-colors"
                      style={{ color: C.dark }}
                    >
                      <span>{icon}</span>
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <span className="inline-block text-xs px-2.5 py-1 rounded-full font-medium"
            style={{ background: `${C.terra}15`, color: C.terra }}>
            {itinerary.duration}
          </span>
          {hasMap && (
            <div className="flex rounded-full overflow-hidden border text-xs font-medium"
              style={{ borderColor: `${C.dark}20` }}>
              {(['list', 'map'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className="px-3 py-1 transition-colors capitalize"
                  style={{
                    background: view === v ? C.terra : 'transparent',
                    color: view === v ? C.sand : `${C.dark}60`,
                  }}
                >
                  {v === 'map' ? '🗺 Map' : '☰ List'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>



      {/* Map view */}
      {view === 'map' && hasMap && (
        <div className="flex-1 min-h-0 relative">
          <Suspense fallback={
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: '#e8e0d4' }}>
              <div className="text-sm" style={{ color: '#888' }}>Loading map…</div>
            </div>
          }>
            <TripMap locations={itinerary.locations!} className="absolute inset-0 w-full h-full" />
          </Suspense>
          {/* Location legend */}
          <div
            className="absolute bottom-3 left-3 right-3 z-[1000] rounded-xl px-3 py-2.5 overflow-x-auto"
            style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(4px)', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
          >
            <div className="flex gap-3 items-start" style={{ minWidth: 'max-content' }}>
              {itinerary.locations!.map((loc, i) => {
                const isLast = i === itinerary.locations!.length - 1
                return (
                  <div key={i} className="flex items-center gap-1.5 text-xs shrink-0">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: isLast ? C.jade : C.terra, color: C.sand, fontSize: '9px' }}
                    >
                      {loc.day}
                    </div>
                    <span style={{ color: C.dark }}>{loc.city}</span>
                    {i < itinerary.locations!.length - 1 && (
                      <span style={{ color: `${C.dark}30` }}>→</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Days accordion */}
      {view === 'list' && <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-2 pb-4">
        {itinerary.days.map((day, i) => {
          const isExpanded = expandedDay === i
          const isLast = i === itinerary.days.length - 1
          const panelId = `day-panel-${i}`
          const headingId = `day-heading-${i}`
          return (
            <div
              key={day.day}
              ref={(el) => { dayRefs.current[i] = el }}
              className="rounded-2xl overflow-hidden"
              style={{ background: 'white', boxShadow: '0 1px 6px rgba(26,18,8,0.05)' }}
            >
              {/* IT-01: header always visible; IT-04: cost in header */}
              <button
                id={headingId}
                className="w-full px-4 py-3.5 flex items-center gap-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  borderBottom: isExpanded ? `1px solid ${C.sand}` : 'none',
                  outlineColor: C.terra,
                }}
                onClick={() => {
                  const next = isExpanded ? null : i
                  setExpandedDay(next)
                  if (next !== null) {
                    setTimeout(() => {
                      dayRefs.current[next]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                    }, 50)
                  }
                }}
                aria-expanded={isExpanded}
                aria-controls={panelId}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  aria-hidden="true"
                  style={{ background: isLast ? C.jade : C.terra, color: C.sand }}
                >
                  {day.day}
                </div>
                <span className="font-semibold text-sm flex-1 leading-tight min-w-0 truncate" style={{ color: C.dark }}>
                  {day.title}
                </span>
                {/* IT-04: per-day cost on header row */}
                <span className="text-xs shrink-0 font-medium" style={{ color: C.jade }}>{day.estimatedCost}</span>
                <span className="text-xs shrink-0 ml-1" aria-hidden="true" style={{ color: C.dark, opacity: 0.25 }}>
                  {isExpanded ? '▲' : '▼'}
                </span>
              </button>

              {isExpanded && (
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={headingId}
                  className="px-4 py-4 space-y-4"
                >
                  {/* Highlights */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: C.saffron }}>
                      Highlights
                    </p>
                    <ul className="space-y-2">
                      {day.highlights.map((h, j) => {
                        const reason = highlightReason(h)
                        return (
                          <li key={j} className="flex items-start gap-2" style={{ color: C.dark }}>
                            <span className="mt-1.5 shrink-0" aria-hidden="true" style={{ color: C.terra, fontSize: '9px' }}>●</span>
                            <div>
                              <span className="text-sm">{highlightText(h)}</span>
                              {reason && <p className="text-xs mt-0.5 italic" style={{ color: '#999' }}>{reason}</p>}
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </div>

                  {/* IT-05: Stay — typography hierarchy, no competing icon */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#999' }}>Stay</p>
                    <p className="text-sm font-medium" style={{ color: C.dark }}>{accommodationName(day.accommodation)}</p>
                    {accommodationReason(day.accommodation) && (
                      <p className="text-xs mt-0.5 italic" style={{ color: '#999' }}>{accommodationReason(day.accommodation)}</p>
                    )}
                  </div>

                  {/* IT-02: Restaurants — name only at scan level, detail on tap */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#999' }}>Restaurants</p>
                    <div className="space-y-1.5">
                      {day.meals.map((m, j) => {
                        const name = mealName(m)
                        const dish = mealDish(m)
                        const reason = mealReason(m)
                        const mealKey = `${i}-${j}`
                        const mealExpanded = expandedMeals.has(mealKey)
                        const hasDetail = !!(dish || reason)
                        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' ' + itinerary.destination)}`
                        return (
                          <div key={j} className="rounded-xl px-3 py-2"
                            style={{ background: `${C.saffron}08`, border: `1px solid ${C.saffron}18` }}>
                            <div className="flex items-center gap-2">
                              {hasDetail && (
                                <button
                                  onClick={() => toggleMeal(mealKey)}
                                  className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                                  aria-label={mealExpanded ? 'Hide details' : 'Show details'}
                                  style={{ background: `${C.saffron}30`, color: C.dark, fontSize: '9px' }}
                                >
                                  {mealExpanded ? '▲' : '▼'}
                                </button>
                              )}
                              <span className="text-sm font-medium flex-1 leading-snug" style={{ color: C.dark }}>{name}</span>
                              <a
                                href={mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs shrink-0 transition-opacity hover:opacity-70"
                                style={{ color: C.terra }}
                                aria-label={`Find ${name} on Google Maps`}
                              >
                                Maps ↗
                              </a>
                            </div>
                            {mealExpanded && (
                              <div className="mt-1.5 pl-4 space-y-0.5">
                                {dish && <p className="text-xs" style={{ color: C.dark, opacity: 0.6 }}>Order: {dish}</p>}
                                {reason && <p className="text-xs italic" style={{ color: '#999' }}>{reason}</p>}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* IT-03: Getting around as footnote */}
                  <p className="text-xs" style={{ color: '#aaa' }}>
                    <span style={{ color: '#bbb' }}>Getting around —</span> {day.transport}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>}

      {/* Budget summary footer — list view only */}
      {view === 'list' && itinerary.budget_summary && (() => {
        const b = itinerary.budget_summary!
        const low = formatMoney(b.total_low, b.currency)
        const high = formatMoney(b.total_high, b.currency)
        const includesText = b.includes.join(', ')
        const excludesText = b.excludes.join(', ')
        return (
          <div className="shrink-0 border-t" style={{ borderColor: `${C.dark}08`, background: '#FDFAF4' }}>
            {budgetOpen && (
              <div className="px-5 pt-4 pb-2 space-y-3">
                <p className="text-xs leading-relaxed" style={{ color: '#777' }}>
                  <span style={{ color: C.jade }}>✓</span> Includes {includesText}
                  {excludesText && <> &nbsp;·&nbsp; <span style={{ color: '#aaa' }}>✗</span> Excludes {excludesText}</>}
                </p>
                <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.dark}08` }}>
                  {([
                    { label: 'Accommodation', value: b.breakdown.accommodation },
                    { label: 'Food & drink',  value: b.breakdown.food },
                    { label: 'Activities',    value: b.breakdown.activities },
                    { label: 'Local transport', value: b.breakdown.local_transport },
                  ] as const).map(({ label, value }, i, arr) => (
                    <div
                      key={label}
                      className="flex items-center justify-between px-4 py-2.5 text-xs"
                      style={{
                        background: i % 2 === 0 ? 'white' : '#FAFAF8',
                        borderBottom: i < arr.length - 1 ? `1px solid ${C.dark}06` : 'none',
                        color: C.dark,
                      }}
                    >
                      <span style={{ opacity: 0.65 }}>{label}</span>
                      <span className="font-medium">{formatMoney(value, b.currency)}</span>
                    </div>
                  ))}
                  <div
                    className="flex items-center justify-between px-4 py-2.5 text-xs font-semibold"
                    style={{ background: `${C.terra}08`, color: C.terra }}
                  >
                    <span>~{formatMoney(b.per_day_avg, b.currency)} per day avg</span>
                    <span>{low}–{high}</span>
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={() => setBudgetOpen(o => !o)}
              className="w-full px-5 py-3 flex items-center gap-2 text-left hover:bg-black/[0.02] transition-colors"
              aria-expanded={budgetOpen}
            >
              <span className="text-base shrink-0" aria-hidden="true" style={{ opacity: 0.5 }}>💰</span>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold" style={{ color: C.dark }}>
                  {low}–{high} <span className="font-normal text-xs" style={{ color: '#666' }}>{b.currency}</span>
                </span>
                <span className="hidden sm:inline text-xs ml-2" style={{ color: '#888' }}>estimated total</span>
              </div>
              <span className="text-xs shrink-0" aria-hidden="true" style={{ color: C.dark, opacity: 0.3 }}>
                {budgetOpen ? '▼' : '▲'}
              </span>
            </button>
          </div>
        )
      })()}
    </div>
  )
}
