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

export function ItineraryPanel({ itinerary }: { itinerary: Itinerary }) {
  const [expandedDay, setExpandedDay] = useState<number | null>(0)

  return (
    <div className="h-full overflow-y-auto" style={{ background: '#FDFAF4' }}>
      {/* Header */}
      <div className="px-6 py-5 border-b sticky top-0 z-10"
        style={{ background: '#FDFAF4', borderColor: `${C.dark}10` }}>
        <h2 className="text-2xl font-bold leading-tight"
          style={{ fontFamily: 'var(--font-playfair)', color: C.dark }}>
          {itinerary.destination}
        </h2>
        {itinerary.tagline && (
          <p className="text-sm mt-0.5" style={{ color: C.dark, opacity: 0.55, fontStyle: 'italic' }}>
            {itinerary.tagline}
          </p>
        )}
        <span className="inline-block mt-2 text-xs px-2.5 py-1 rounded-full font-medium"
          style={{ background: `${C.terra}15`, color: C.terra }}>
          {itinerary.duration}
        </span>
      </div>

      {/* Days */}
      <div className="px-4 py-4 space-y-3 pb-8">
        {itinerary.days.map((day, i) => {
          const isExpanded = expandedDay === i
          const isLast = i === itinerary.days.length - 1
          return (
            <div key={day.day} className="rounded-2xl overflow-hidden"
              style={{ background: 'white', boxShadow: '0 1px 8px rgba(26,18,8,0.06)' }}>
              <button
                className="w-full px-5 py-4 flex items-center gap-3 text-left"
                style={{ borderBottom: isExpanded ? `1px solid ${C.sand}` : 'none' }}
                onClick={() => setExpandedDay(isExpanded ? null : i)}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: isLast ? C.jade : C.terra, color: C.sand }}>
                  {day.day}
                </div>
                <span className="font-semibold text-sm flex-1 leading-tight" style={{ color: C.dark }}>
                  {day.title}
                </span>
                <span className="text-xs shrink-0" style={{ color: C.dark, opacity: 0.3 }}>
                  {isExpanded ? '▲' : '▼'}
                </span>
              </button>

              {isExpanded && (
                <div className="px-5 py-4 space-y-4">
                  {/* Highlights */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: C.saffron }}>
                      Highlights
                    </p>
                    <ul className="space-y-1.5">
                      {day.highlights.map((h, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm" style={{ color: C.dark }}>
                          <span className="mt-1 shrink-0" style={{ color: C.terra, fontSize: '10px' }}>●</span>
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Details */}
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <span className="shrink-0 text-base">🏨</span>
                      <div>
                        <p className="text-xs font-medium mb-0.5" style={{ color: C.dark, opacity: 0.4 }}>Stay</p>
                        <p className="text-sm" style={{ color: C.dark }}>{day.accommodation}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="shrink-0 text-base">🍴</span>
                      <div>
                        <p className="text-xs font-medium mb-0.5" style={{ color: C.dark, opacity: 0.4 }}>Meals</p>
                        <p className="text-sm" style={{ color: C.dark }}>{day.meals.join(' · ')}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="shrink-0 text-base">🚌</span>
                      <div>
                        <p className="text-xs font-medium mb-0.5" style={{ color: C.dark, opacity: 0.4 }}>Getting around</p>
                        <p className="text-sm" style={{ color: C.dark }}>{day.transport}</p>
                      </div>
                    </div>
                  </div>

                  {/* Cost */}
                  <div className="flex items-center justify-between pt-3 border-t"
                    style={{ borderColor: `${C.dark}08` }}>
                    <span className="text-xs" style={{ color: C.dark, opacity: 0.4 }}>Est. daily cost</span>
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
