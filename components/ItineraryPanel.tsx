'use client'

import { useState } from 'react'

const C = {
  sand: '#F5ECD7',
  terra: '#C94A2B',
  saffron: '#E8850A',
  jade: '#2A7A5B',
  dark: '#1A1208',
}

interface ItineraryDay {
  day: number
  title: string
  highlights: string[]
  accommodation: string
  meals: string[]
  transport: string
  estimatedCost: string
}

export interface Itinerary {
  destination: string
  duration: string
  tagline: string
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
    for (const h of d.highlights) lines.push(`- ${h}`)
    lines.push('')
    lines.push(
      `**Stay:** ${d.accommodation}`,
      `**Meals:** ${d.meals.join(' · ')}`,
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
    <ul>${d.highlights.map(h => `<li>${h}</li>`).join('')}</ul>
    <p><strong>Stay:</strong> ${d.accommodation}</p>
    <p><strong>Meals:</strong> ${d.meals.join(' · ')}</p>
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

export function ItineraryPanel({ itinerary }: { itinerary: Itinerary }) {
  const [expandedDay, setExpandedDay] = useState<number | null>(0)
  const [shareLabel, setShareLabel] = useState('Share')

  const safeName = itinerary.destination.replace(/\s+/g, '-').toLowerCase()

  const handlePrint = () => window.print()

  const handleCsv = () => {
    const header = ['Day', 'Title', 'Highlights', 'Accommodation', 'Meals', 'Transport', 'Est. Cost']
    const rows = itinerary.days.map(d => [
      String(d.day),
      d.title,
      d.highlights.join('; '),
      d.accommodation,
      d.meals.join('; '),
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
    <div className="h-full overflow-y-auto wandr-itinerary-panel" style={{ background: '#FDFAF4' }}>

      {/* Header */}
      <div className="px-6 py-5 border-b sticky top-0 z-10"
        style={{ background: '#FDFAF4', borderColor: `${C.dark}10` }}>
        <h2 className="text-2xl font-bold leading-tight"
          style={{ fontFamily: 'var(--font-playfair)', color: C.dark }}>
          {itinerary.destination}
        </h2>
        {itinerary.tagline && (
          <p className="text-sm mt-0.5" style={{ color: '#555', fontStyle: 'italic' }}>
            {itinerary.tagline}
          </p>
        )}
        <span className="inline-block mt-2 text-xs px-2.5 py-1 rounded-full font-medium"
          style={{ background: `${C.terra}15`, color: C.terra }}>
          {itinerary.duration}
        </span>
      </div>

      {/* Export / share toolbar */}
      <div
        className="px-4 py-3 border-b flex flex-wrap gap-2"
        style={{ borderColor: `${C.dark}08`, background: '#FDFAF4' }}
        role="toolbar"
        aria-label="Itinerary actions"
      >
        {actions.map(({ label, icon, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ borderColor: `${C.dark}25`, color: C.dark, background: 'white', outlineColor: C.terra }}
          >
            <span aria-hidden="true">{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Days accordion */}
      <div className="px-4 py-4 space-y-3 pb-8">
        {itinerary.days.map((day, i) => {
          const isExpanded = expandedDay === i
          const isLast = i === itinerary.days.length - 1
          const panelId = `day-panel-${i}`
          const headingId = `day-heading-${i}`
          return (
            <div
              key={day.day}
              className="rounded-2xl overflow-hidden"
              style={{ background: 'white', boxShadow: '0 1px 8px rgba(26,18,8,0.06)' }}
            >
              <button
                id={headingId}
                className="w-full px-5 py-4 flex items-center gap-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  borderBottom: isExpanded ? `1px solid ${C.sand}` : 'none',
                  outlineColor: C.terra,
                }}
                onClick={() => setExpandedDay(isExpanded ? null : i)}
                aria-expanded={isExpanded}
                aria-controls={panelId}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  aria-hidden="true"
                  style={{ background: isLast ? C.jade : C.terra, color: C.sand }}
                >
                  {day.day}
                </div>
                <span className="font-semibold text-sm flex-1 leading-tight" style={{ color: C.dark }}>
                  Day {day.day}: {day.title}
                </span>
                <span className="text-xs shrink-0" aria-hidden="true" style={{ color: C.dark, opacity: 0.3 }}>
                  {isExpanded ? '▲' : '▼'}
                </span>
              </button>

              {isExpanded && (
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={headingId}
                  className="px-5 py-4 space-y-4"
                >
                  {/* Highlights */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: C.saffron }}>
                      Highlights
                    </p>
                    <ul className="space-y-1.5">
                      {day.highlights.map((h, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm" style={{ color: C.dark }}>
                          <span className="mt-1 shrink-0" aria-hidden="true" style={{ color: C.terra, fontSize: '10px' }}>●</span>
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Details */}
                  <dl className="space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <span className="shrink-0 text-base" aria-hidden="true">🏨</span>
                      <div>
                        <dt className="text-xs font-medium mb-0.5" style={{ color: '#555' }}>Stay</dt>
                        <dd className="text-sm" style={{ color: C.dark }}>{day.accommodation}</dd>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="shrink-0 text-base" aria-hidden="true">🍴</span>
                      <div>
                        <dt className="text-xs font-medium mb-0.5" style={{ color: '#555' }}>Meals</dt>
                        <dd className="text-sm" style={{ color: C.dark }}>{day.meals.join(' · ')}</dd>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="shrink-0 text-base" aria-hidden="true">🚌</span>
                      <div>
                        <dt className="text-xs font-medium mb-0.5" style={{ color: '#555' }}>Getting around</dt>
                        <dd className="text-sm" style={{ color: C.dark }}>{day.transport}</dd>
                      </div>
                    </div>
                  </dl>

                  {/* Cost */}
                  <div className="flex items-center justify-between pt-3 border-t"
                    style={{ borderColor: `${C.dark}08` }}>
                    <span className="text-xs" style={{ color: '#555' }}>Est. daily cost</span>
                    <span className="text-sm font-semibold" style={{ color: C.jade }}>{day.estimatedCost}</span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
