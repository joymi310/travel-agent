'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

const C = {
  sand: '#F5ECD7',
  terra: '#C94A2B',
  saffron: '#E8850A',
  jade: '#2A7A5B',
  dark: '#1A1208',
}

// ─── Quiz data ────────────────────────────────────────────────────────────────

const VIBES = [
  { id: 'beach & relax', label: 'Beach & relax', emoji: '🏖️' },
  { id: 'culture & history', label: 'Culture & history', emoji: '🏛️' },
  { id: 'adventure', label: 'Adventure', emoji: '🧗' },
  { id: 'food-focused', label: 'Food-focused', emoji: '🍜' },
  { id: 'city break', label: 'City break', emoji: '🌆' },
  { id: 'nature & hiking', label: 'Nature & hiking', emoji: '🌿' },
  { id: 'wellness & retreat', label: 'Wellness & retreat', emoji: '🧘' },
  { id: 'luxury & indulgence', label: 'Luxury & indulgence', emoji: '✨' },
]

const DURATIONS = [
  { id: 'a long weekend (3–4 days)', label: 'Long weekend', sub: '3–4 days' },
  { id: '1 week', label: '1 week', sub: '7 days' },
  { id: '2 weeks', label: '2 weeks', sub: '14 days' },
  { id: '3+ weeks', label: '3+ weeks', sub: 'Extended trip' },
]

const BUDGETS = [
  { id: 'budget (hostels, street food, public transport)', label: 'Budget', sub: 'Hostels & street food', emoji: '🎒' },
  { id: 'mid-range (3-star hotels, local restaurants)', label: 'Mid-range', sub: '3-star hotels, local dining', emoji: '🧳' },
  { id: 'luxury (5-star, fine dining, private transfers)', label: 'Luxury', sub: '5-star & fine dining', emoji: '💎' },
]

const WHEN_OPTIONS = [
  { id: 'next month', label: 'Next month', sub: "I'm ready to book" },
  { id: 'in 1–3 months', label: '1–3 months away', sub: 'Planning ahead' },
  { id: 'in 3–6 months', label: '3–6 months away', sub: 'Future dreaming' },
  { id: 'flexible', label: 'Flexible', sub: 'No fixed date' },
]

const FLIGHT_TIMES = [
  { id: 'up to 3 hours', label: 'Up to 3 hours', sub: 'Short haul only', emoji: '🛫' },
  { id: 'up to 6 hours', label: 'Up to 6 hours', sub: 'Regional & medium haul', emoji: '✈️' },
  { id: 'up to 12 hours', label: 'Up to 12 hours', sub: 'Long haul is fine', emoji: '🌏' },
  { id: 'no limit', label: 'No limit', sub: "I'll fly as long as it takes", emoji: '🌍' },
]

const GROUPS = [
  { id: 'just me', label: 'Just me', sub: 'Solo trip', emoji: '🙋' },
  { id: 'just adults', label: 'Just adults', sub: 'No kids on this one', emoji: '🍷' },
  { id: 'with a baby or toddler (under 5)', label: 'Baby or toddler', sub: 'Under 5', emoji: '🧸' },
  { id: 'with young kids (ages 5–10)', label: 'Young kids', sub: 'Ages 5–10', emoji: '🎡' },
  { id: 'with teenagers', label: 'Teenagers', sub: 'Ages 11–17', emoji: '🎮' },
  { id: 'mixed ages — kids and adults', label: 'Mixed ages', sub: 'Kids and adults', emoji: '👨‍👩‍👧‍👦' },
]

// ─── Types ────────────────────────────────────────────────────────────────────

interface Destination {
  city: string
  country: string
  tagline: string
  pitch: string
  why_you: string
  best_time: string
  est_cost: string
  vibe_tags: string[]
  emoji: string
  image_url?: string
  photographer_name?: string
  photographer_url?: string
}

// ─── Chip component ───────────────────────────────────────────────────────────

function Chip({
  label,
  sub,
  emoji,
  selected,
  onClick,
}: {
  label: string
  sub?: string
  emoji?: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl px-5 py-4 text-left transition-all hover:shadow-md"
      style={{
        background: selected ? C.terra : 'white',
        color: selected ? C.sand : C.dark,
        border: `2px solid ${selected ? C.terra : `${C.saffron}44`}`,
        transform: selected ? 'scale(1.02)' : 'scale(1)',
      }}
    >
      {emoji && <div className="text-2xl mb-1">{emoji}</div>}
      <div className="font-semibold text-sm">{label}</div>
      {sub && <div className="text-xs mt-0.5 opacity-70">{sub}</div>}
    </button>
  )
}

// ─── Result card ──────────────────────────────────────────────────────────────

function DestinationCard({
  dest,
  onPick,
}: {
  dest: Destination
  onPick: (dest: Destination) => void
}) {
  const tagColors: Record<string, string> = {
    beach: '#0891b2', culture: '#7c3aed', food: '#d97706', adventure: '#dc2626',
    nature: '#16a34a', city: '#2563eb', luxury: '#9333ea', budget: '#16a34a',
    history: '#92400e', wellness: '#0f766e',
  }

  return (
    <div
      className="rounded-3xl overflow-hidden flex flex-col"
      style={{ background: 'white', border: `1px solid ${C.saffron}33` }}
    >
      {/* Header — photo or dark fallback */}
      <div className="relative h-48 overflow-hidden" style={{ background: C.dark }}>
        {dest.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dest.image_url}
            alt={`${dest.city}, ${dest.country}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-6xl">{dest.emoji}</div>
        )}
        {/* Gradient overlay for text legibility */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(26,18,8,0.85) 40%, rgba(26,18,8,0.2) 100%)' }} />
        {/* City name over photo */}
        <div className="absolute bottom-0 left-0 px-6 pb-4">
          <h3 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair)', color: C.sand }}>
            {dest.city}
          </h3>
          <p className="text-sm font-medium mt-0.5" style={{ color: `${C.sand}bb` }}>{dest.country}</p>
        </div>
        {/* Photographer credit */}
        {dest.photographer_name && dest.photographer_url && (
          <a
            href={dest.photographer_url}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-1 right-2 text-[10px] hover:opacity-80 transition-opacity"
            style={{ color: `${C.sand}66` }}
          >
            📷 {dest.photographer_name}
          </a>
        )}
      </div>
      {/* Tagline below header */}
      <div className="px-6 py-3" style={{ background: C.dark }}>
        <p className="text-sm leading-snug font-medium italic" style={{ color: C.saffron }}>
          &ldquo;{dest.tagline}&rdquo;
        </p>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 px-7 py-5 gap-4">
        <p className="text-sm leading-relaxed opacity-80">{dest.pitch}</p>

        {/* Why you */}
        <div className="rounded-xl px-4 py-3 text-sm" style={{ background: `${C.saffron}14`, color: C.dark }}>
          <span className="font-semibold" style={{ color: C.terra }}>Why this for you: </span>
          {dest.why_you}
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl px-3 py-2.5" style={{ background: `${C.sand}` }}>
            <div className="font-semibold opacity-50 uppercase tracking-wide mb-0.5">Best time</div>
            <div className="font-medium">{dest.best_time}</div>
          </div>
          <div className="rounded-xl px-3 py-2.5" style={{ background: `${C.sand}` }}>
            <div className="font-semibold opacity-50 uppercase tracking-wide mb-0.5">Est. cost</div>
            <div className="font-medium">{dest.est_cost}</div>
          </div>
        </div>

        {/* Vibe tags */}
        <div className="flex flex-wrap gap-1.5">
          {dest.vibe_tags.map(tag => (
            <span
              key={tag}
              className="text-xs px-2.5 py-1 rounded-full font-medium capitalize"
              style={{ background: `${tagColors[tag] ?? C.jade}18`, color: tagColors[tag] ?? C.jade }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => onPick(dest)}
          className="mt-auto w-full font-semibold py-3.5 rounded-2xl text-sm transition-all hover:opacity-90"
          style={{ background: C.terra, color: C.sand }}
        >
          Plan this trip →
        </button>
      </div>
    </div>
  )
}

// ─── Loading state ────────────────────────────────────────────────────────────

function LoadingCards() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-10 space-y-3">
        <div className="flex justify-center gap-1.5">
          {[0, 1, 2].map(i => (
            <span key={i} className="w-2.5 h-2.5 rounded-full animate-bounce"
              style={{ background: C.saffron, animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
        <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair)' }}>
          Finding your perfect destinations…
        </h2>
        <p className="text-sm opacity-60">This takes a few seconds</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[0, 1, 2].map(i => (
          <div key={i} className="rounded-3xl overflow-hidden animate-pulse" style={{ background: 'white', border: `1px solid ${C.saffron}33` }}>
            <div className="h-40" style={{ background: `${C.dark}` }} />
            <div className="p-6 space-y-3">
              <div className="h-3 rounded-full w-3/4" style={{ background: `${C.dark}15` }} />
              <div className="h-3 rounded-full w-full" style={{ background: `${C.dark}10` }} />
              <div className="h-3 rounded-full w-5/6" style={{ background: `${C.dark}10` }} />
              <div className="h-10 rounded-2xl mt-4" style={{ background: `${C.dark}08` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function InspirePage() {
  const router = useRouter()
  const [step, setStep] = useState(0) // 0=vibes 1=duration 2=when 3=budget 4=flightTime 5=group 6=origin
  const [vibes, setVibes] = useState<string[]>([])
  const [duration, setDuration] = useState('')
  const [when, setWhen] = useState('')
  const [budget, setBudget] = useState('')
  const [flightTime, setFlightTime] = useState('')
  const [group, setGroup] = useState('')
  const [origin, setOrigin] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Destination[] | null>(null)
  const [error, setError] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState(false)
  const [generatingDest, setGeneratingDest] = useState('')
  const [streamedText, setStreamedText] = useState('')

  const TOTAL_STEPS = 7

  const toggleVibe = (id: string) => {
    setVibes(prev =>
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    )
  }

  const canNext = () => {
    if (step === 0) return vibes.length > 0
    if (step === 1) return !!duration
    if (step === 2) return !!when
    if (step === 3) return !!budget
    if (step === 4) return !!flightTime
    if (step === 5) return !!group
    if (step === 6) return true // origin is optional
    return false
  }

  const next = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep(s => s + 1)
    } else {
      submit()
    }
  }

  const submit = async () => {
    setLoading(true)
    setError(false)
    setResults(null)
    try {
      const res = await fetch('/api/inspire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vibes, duration, when, budget, flightTime, group, origin }),
      })
      const data = await res.json()
      if (!res.ok || !data.destinations) throw new Error('Failed')
      setResults(data.destinations)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const handlePick = async (dest: Destination) => {
    const destination = dest.city === dest.country ? dest.city : `${dest.city}, ${dest.country}`

    // Map quiz answers → generate-itinerary params
    const durationDays =
      duration.startsWith('a long weekend') ? 4 :
      duration.startsWith('1 week') ? 7 :
      duration.startsWith('2 weeks') ? 14 :
      21

    const traveller =
      group === 'just me' ? 'Solo traveller' :
      group.includes('baby') || group.includes('toddler') ? 'Family with young kids' :
      group.includes('young kids') ? 'Family with older kids' :
      group.includes('teenagers') ? 'Family with teens' :
      group.includes('mixed') ? 'Family with young kids' :
      'Couple'

    const budgetSimple =
      budget.startsWith('budget') ? 'budget' :
      budget.startsWith('luxury') ? 'luxury' :
      'mid-range'

    const profileAnswers = [
      vibes.length > 0 ? `Trip vibe: ${vibes.join(', ')}` : '',
      when ? `Timing: ${when}` : '',
      flightTime ? `Maximum flight time: ${flightTime}` : '',
    ].filter(Boolean)

    const answers = {
      destination,
      origin: origin || 'New Zealand',
      traveller,
      duration: durationDays,
      budget: budgetSimple,
      budgetType: 'land-only',
      dateMode: 'flexible' as const,
      startDate: '',
      endDate: '',
      dateText: '',
      explorationStyle: 'mixed' as const,
      profileAnswers,
    }

    setGeneratingDest(destination)
    setGenerating(true)
    setGenerateError(false)
    setStreamedText('')

    try {
      const res = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed')
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setStreamedText(accumulated)
      }

      const marker = '<wandr_data>'
      const closeMarker = '</wandr_data>'
      const markerIdx = accumulated.indexOf(marker)
      if (markerIdx === -1) throw new Error('No itinerary data received')
      const afterMarker = accumulated.slice(markerIdx + marker.length)
      const closeIdx = afterMarker.indexOf(closeMarker)
      if (closeIdx === -1) throw new Error('Malformed itinerary data')
      const jsonStr = afterMarker.slice(0, closeIdx).replace(/[\r\n]/g, '').trim()
      const itinerary = JSON.parse(jsonStr)

      localStorage.setItem('wandr_pending_trip', JSON.stringify({ wizardAnswers: answers, itinerary }))
      router.push('/chat')
    } catch {
      setGenerateError(true)
      setGenerating(false)
    }
  }

  const progressPct = ((step + 1) / TOTAL_STEPS) * 100

  // ── Generating itinerary overlay ──
  const inspireMarkdownPart = streamedText.includes('<wandr_data>')
    ? streamedText.split('<wandr_data>')[0]
    : streamedText
  const inspireStreamComplete = streamedText.includes('</wandr_data>')

  if (generating) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: C.dark }}>
        <div className="shrink-0 py-6 text-center">
          <p className="text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair)', color: C.terra }}>wayfindr.</p>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-10">
          <div className="max-w-xl mx-auto">
            {!inspireMarkdownPart ? (
              <div className="animate-pulse space-y-4">
                <div className="h-7 rounded-lg w-3/4" style={{ background: `${C.sand}18` }} />
                <div className="h-4 rounded-lg w-1/2 mb-4" style={{ background: `${C.sand}12` }} />
                {[0, 1, 2].map(i => (
                  <div key={i} className="rounded-2xl p-5" style={{ background: `${C.sand}08` }}>
                    <div className="h-4 rounded w-2/5 mb-4" style={{ background: `${C.sand}18` }} />
                    <div className="space-y-2 mb-4">
                      <div className="h-3 rounded w-full" style={{ background: `${C.sand}10` }} />
                      <div className="h-3 rounded w-5/6" style={{ background: `${C.sand}10` }} />
                    </div>
                    <div className="flex gap-3">
                      <div className="h-3 rounded flex-1" style={{ background: `${C.sand}10` }} />
                      <div className="h-3 rounded flex-1" style={{ background: `${C.sand}10` }} />
                    </div>
                  </div>
                ))}
                <p className="text-center text-sm pt-4" style={{ color: `${C.sand}50` }}>
                  Building your trip to {generatingDest}…
                </p>
              </div>
            ) : (
              <>
                <style>{`
                  .wayfindr-stream h1{font-size:1.4rem;font-weight:700;color:${C.sand};margin-bottom:.4rem;font-family:var(--font-playfair)}
                  .wayfindr-stream em{color:${C.saffron};font-style:italic}
                  .wayfindr-stream h2{font-size:.95rem;font-weight:600;color:${C.terra};margin:1.2rem 0 .4rem;border-bottom:1px solid rgba(245,236,215,.1);padding-bottom:.35rem}
                  .wayfindr-stream p{font-size:.87rem;color:${C.sand};opacity:.8;margin:.2rem 0;line-height:1.6}
                  .wayfindr-stream ul{margin:.2rem 0 .4rem 1.1rem}
                  .wayfindr-stream li{font-size:.87rem;color:${C.sand};opacity:.8;margin-bottom:.15rem;line-height:1.5}
                  .wayfindr-stream strong{color:${C.saffron};font-weight:600;opacity:1!important}
                  .wayfindr-stream hr{border-color:rgba(245,236,215,.1);margin:.75rem 0}
                `}</style>
                <div className="wayfindr-stream">
                  <ReactMarkdown>{inspireMarkdownPart}</ReactMarkdown>
                  {!inspireStreamComplete && (
                    <span className="animate-pulse font-mono text-sm" style={{ color: C.saffron }}>|</span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (generateError) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 px-6" style={{ background: C.dark }}>
        <p className="text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair)', color: C.terra }}>wayfindr.</p>
        <p className="text-sm text-center" style={{ color: C.sand, opacity: 0.6 }}>
          Something went wrong building your trip to {generatingDest}.
        </p>
        <button
          onClick={() => setGenerateError(false)}
          className="font-semibold px-6 py-3 rounded-xl text-sm transition-opacity hover:opacity-90"
          style={{ background: C.terra, color: C.sand }}
        >
          Back to results
        </button>
      </div>
    )
  }

  // ── Results view ──
  if (loading) {
    return (
      <div className="min-h-screen py-24 px-6" style={{ background: C.sand }}>
        <LoadingCards />
      </div>
    )
  }

  if (results) {
    return (
      <div className="min-h-screen py-16 px-6" style={{ background: C.sand }}>
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 space-y-3">
            <p className="text-sm font-medium uppercase tracking-widest" style={{ color: C.terra }}>
              Your perfect destinations
            </p>
            <h2 className="text-4xl font-bold" style={{ fontFamily: 'var(--font-playfair)' }}>
              We found 3 trips you&apos;ll love
            </h2>
            <p className="text-sm opacity-60">Pick one to start building your itinerary</p>
          </div>

          {error && (
            <div className="text-center mb-8">
              <p className="text-sm mb-3" style={{ color: C.terra }}>Something went wrong. Try again?</p>
              <button onClick={submit} className="font-semibold px-5 py-2 rounded-full text-sm" style={{ background: C.terra, color: C.sand }}>
                Retry
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {results.map(dest => (
              <DestinationCard
                key={`${dest.city}-${dest.country}`}
                dest={dest}
                onPick={handlePick}
              />
            ))}
          </div>

          <div className="text-center mt-10">
            <button
              onClick={() => { setResults(null); setStep(0); setVibes([]); setDuration(''); setWhen(''); setBudget(''); setFlightTime(''); setGroup(''); setOrigin('') }}
              className="text-sm font-medium hover:opacity-70 transition-opacity"
              style={{ color: C.terra }}
            >
              ← Start over
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Quiz view ──
  const steps = [
    {
      question: "What kind of trip are you after?",
      hint: "Pick everything that sounds good — you can choose more than one",
      content: (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {VIBES.map(v => (
            <Chip
              key={v.id}
              label={v.label}
              emoji={v.emoji}
              selected={vibes.includes(v.id)}
              onClick={() => toggleVibe(v.id)}
            />
          ))}
        </div>
      ),
    },
    {
      question: "How long can you get away for?",
      hint: null,
      content: (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {DURATIONS.map(d => (
            <Chip
              key={d.id}
              label={d.label}
              sub={d.sub}
              selected={duration === d.id}
              onClick={() => setDuration(d.id)}
            />
          ))}
        </div>
      ),
    },
    {
      question: "When are you thinking of going?",
      hint: null,
      content: (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {WHEN_OPTIONS.map(w => (
            <Chip
              key={w.id}
              label={w.label}
              sub={w.sub}
              selected={when === w.id}
              onClick={() => setWhen(w.id)}
            />
          ))}
        </div>
      ),
    },
    {
      question: "What's your budget?",
      hint: null,
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {BUDGETS.map(b => (
            <Chip
              key={b.id}
              label={b.label}
              sub={b.sub}
              emoji={b.emoji}
              selected={budget === b.id}
              onClick={() => setBudget(b.id)}
            />
          ))}
        </div>
      ),
    },
    {
      question: "How long are you happy to fly?",
      hint: null,
      content: (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {FLIGHT_TIMES.map(f => (
            <Chip
              key={f.id}
              label={f.label}
              sub={f.sub}
              emoji={f.emoji}
              selected={flightTime === f.id}
              onClick={() => setFlightTime(f.id)}
            />
          ))}
        </div>
      ),
    },
    {
      question: "Who's coming with you?",
      hint: null,
      content: (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {GROUPS.map(g => (
            <Chip
              key={g.id}
              label={g.label}
              sub={g.sub}
              emoji={g.emoji}
              selected={group === g.id}
              onClick={() => setGroup(g.id)}
            />
          ))}
        </div>
      ),
    },
    {
      question: "Where are you flying from?",
      hint: "Helps us get the costs right and find the best routes",
      content: (
        <div className="max-w-sm">
          <input
            type="text"
            placeholder="e.g. Auckland, Sydney, London..."
            value={origin}
            onChange={e => setOrigin(e.target.value)}
            autoFocus
            onKeyDown={e => e.key === 'Enter' && next()}
            className="w-full rounded-2xl px-5 py-4 text-sm outline-none transition-all"
            style={{
              background: 'white',
              border: `2px solid ${C.saffron}44`,
              color: C.dark,
            }}
            onFocus={e => (e.target.style.borderColor = C.terra)}
            onBlur={e => (e.target.style.borderColor = `${C.saffron}44`)}
          />
          <p className="text-xs mt-2 opacity-50">Optional — skip if you&apos;re not sure yet</p>
        </div>
      ),
    },
  ]

  const currentStep = steps[step]

  return (
    <div className="min-h-screen" style={{ background: C.sand }}>
      {/* Nav */}
      <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: `1px solid ${C.saffron}22` }}>
        <Link href="/" className="flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: C.dark }}>
          <ArrowLeft size={16} />
          Back
        </Link>
        <span className="text-xl font-bold" style={{ fontFamily: 'var(--font-playfair)', color: C.terra }}>
          wayfindr.
        </span>
        <span className="text-sm opacity-40" style={{ color: C.dark }}>{step + 1} of {TOTAL_STEPS}</span>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full" style={{ background: `${C.saffron}22` }}>
        <div
          className="h-1 transition-all duration-500"
          style={{ width: `${progressPct}%`, background: C.terra }}
        />
      </div>

      {/* Quiz body */}
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="space-y-8">
          {/* Question */}
          <div className="space-y-2">
            {step === 0 && (
              <p className="text-base font-medium" style={{ color: C.terra }}>
                Need a holiday but not sure where to go? Let me help you.
              </p>
            )}
            <h1 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: 'var(--font-playfair)', color: C.dark }}>
              {currentStep.question}
            </h1>
            {currentStep.hint && (
              <p className="text-sm opacity-55">{currentStep.hint}</p>
            )}
          </div>

          {/* Options */}
          {currentStep.content}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => setStep(s => s - 1)}
              className="text-sm font-medium hover:opacity-70 transition-opacity"
              style={{ color: C.dark, opacity: step === 0 ? 0 : 1, pointerEvents: step === 0 ? 'none' : 'auto' }}
            >
              ← Back
            </button>
            <button
              onClick={next}
              disabled={!canNext()}
              className="font-semibold px-8 py-3 rounded-full text-sm transition-all hover:opacity-90 disabled:opacity-30"
              style={{ background: C.terra, color: C.sand }}
            >
              {step === TOTAL_STEPS - 1 ? 'Find my destinations ✦' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
