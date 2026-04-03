'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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

interface Itinerary {
  destination: string
  duration: string
  tagline: string
  days: ItineraryDay[]
}

interface PendingTrip {
  wizardAnswers: {
    destination: string
    duration: number
    who: string
    people: number
    budget: string
    pace: string
    startDate: string
    endDate: string
  }
  itinerary: Itinerary
}

const LockedField = ({ label }: { label: string }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs italic"
    style={{ background: `${C.dark}08`, color: `${C.dark}55` }}>
    <span>🔒</span>
    <span>{label}</span>
  </div>
)

function DayCard({ day, index, totalDays }: { day: ItineraryDay; index: number; totalDays: number }) {
  const isLast = index === totalDays - 1
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'white', boxShadow: '0 2px 12px rgba(26,18,8,0.07)' }}>
      {/* Day header */}
      <div className="px-5 py-4 flex items-center gap-3"
        style={{ borderBottom: `1px solid ${C.sand}` }}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
          style={{ background: isLast ? C.jade : C.terra, color: C.sand }}>
          {day.day}
        </div>
        <h3 className="font-semibold text-sm leading-tight" style={{ color: C.dark }}>
          {day.title}
        </h3>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Highlights */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: C.saffron }}>Highlights</p>
          <ul className="space-y-1">
            {day.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2 text-sm" style={{ color: C.dark }}>
                <span className="mt-1 shrink-0" style={{ color: C.terra }}>•</span>
                {h}
              </li>
            ))}
          </ul>
        </div>

        {/* Locked fields */}
        <div className="space-y-2">
          <LockedField label="Unlock to see recommended stays" />
          <LockedField label="Unlock for restaurant recommendations" />
          <LockedField label="Unlock for transport details" />
        </div>

        {/* Cost — always visible */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs" style={{ color: C.dark, opacity: 0.5 }}>Est. daily cost</span>
          <span className="text-sm font-semibold" style={{ color: C.jade }}>{day.estimatedCost}</span>
        </div>
      </div>
    </div>
  )
}

function InlineSignInCard() {
  return (
    <div className="rounded-2xl p-6 text-center space-y-4"
      style={{ background: C.dark, color: C.sand }}>
      <div className="text-2xl">✨</div>
      <div className="space-y-1">
        <h3 className="text-lg font-bold" style={{ fontFamily: 'var(--font-playfair)' }}>Loving this so far?</h3>
        <p className="text-sm opacity-60">
          Sign in to unlock every recommendation and chat with Wandr to customise any day.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        <Link href="/login"
          className="font-semibold px-5 py-2.5 rounded-xl text-sm transition-opacity hover:opacity-90"
          style={{ background: C.terra, color: C.sand }}>
          Create free account
        </Link>
        <Link href="/login"
          className="font-semibold px-5 py-2.5 rounded-xl text-sm border transition-opacity hover:opacity-70"
          style={{ borderColor: `${C.sand}40`, color: C.sand }}>
          Sign in
        </Link>
      </div>
    </div>
  )
}

export default function PreviewPage() {
  const [trip, setTrip] = useState<PendingTrip | null>(null)
  const [error, setError] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const raw = localStorage.getItem('wandr_pending_trip')
    if (!raw) { setError(true); return }
    try {
      setTrip(JSON.parse(raw))
    } catch {
      setError(true)
    }
  }, [])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: C.sand }}>
        <div className="text-center space-y-4">
          <p style={{ color: C.dark, opacity: 0.5 }}>No itinerary found.</p>
          <button onClick={() => router.push('/')}
            className="font-semibold px-6 py-3 rounded-xl text-sm"
            style={{ background: C.terra, color: C.sand }}>
            Back to home
          </button>
        </div>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.sand }}>
        <div className="text-center space-y-3">
          <p className="text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair)', color: C.terra }}>wandr.</p>
          <div className="flex gap-1 justify-center">
            {[0, 1, 2].map(i => (
              <span key={i} className="w-2 h-2 rounded-full animate-bounce"
                style={{ background: C.terra, animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const { itinerary, wizardAnswers } = trip
  const days = itinerary.days ?? []

  return (
    <div className="min-h-screen pb-28" style={{ background: C.sand }}>
      {/* Top nav */}
      <div className="sticky top-0 z-30 border-b px-4 py-3"
        style={{ background: C.dark, borderColor: `${C.sand}15` }}>
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg font-bold" style={{ fontFamily: 'var(--font-playfair)', color: C.terra }}>
            wandr.
          </Link>
          <Link href="/login"
            className="text-sm font-semibold px-4 py-2 rounded-full transition-opacity hover:opacity-90"
            style={{ background: C.terra, color: C.sand }}>
            Unlock full itinerary
          </Link>
        </div>
      </div>

      {/* Hero header */}
      <div className="px-4 py-10 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl lg:text-5xl font-bold mb-2"
          style={{ fontFamily: 'var(--font-playfair)', color: C.dark }}>
          {itinerary.destination}
        </h1>
        <p className="text-base mb-6" style={{ color: C.dark, opacity: 0.55 }}>{itinerary.tagline}</p>

        {/* Stat pills */}
        <div className="flex flex-wrap gap-2 justify-center text-sm">
          {[
            itinerary.duration,
            wizardAnswers.who,
            wizardAnswers.budget,
            `${wizardAnswers.pace} pace`,
          ].map(stat => (
            <span key={stat} className="px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: `${C.dark}10`, color: C.dark }}>
              {stat}
            </span>
          ))}
        </div>
      </div>

      {/* Day cards */}
      <div className="max-w-2xl mx-auto px-4 space-y-4">
        {days.map((day, i) => (
          <>
            <DayCard key={day.day} day={day} index={i} totalDays={days.length} />
            {/* Inline sign-in card between day 2 and day 3 */}
            {i === 1 && days.length > 2 && <InlineSignInCard key="inline-signin" />}
          </>
        ))}
      </div>

      {/* Sticky bottom banner */}
      <div className="fixed bottom-0 left-0 right-0 z-40 px-4 py-3 border-t"
        style={{ background: 'white', borderColor: `${C.sand}80` }}>
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <p className="text-sm flex-1" style={{ color: C.dark, opacity: 0.7 }}>
            Sign in free to unlock hotels, restaurants &amp; transport for every day
          </p>
          <Link href="/login"
            className="shrink-0 font-semibold px-6 py-2.5 rounded-xl text-sm transition-opacity hover:opacity-90 whitespace-nowrap"
            style={{ background: C.terra, color: C.sand }}>
            Unlock full itinerary
          </Link>
        </div>
      </div>
    </div>
  )
}
