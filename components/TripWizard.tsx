'use client'

import { useState, useRef, useEffect } from 'react'

const C = {
  sand: '#F5ECD7',
  terra: '#C94A2B',
  saffron: '#E8850A',
  dark: '#1A1208',
}

export type ExplorationStyle = 'classics' | 'mixed' | 'off_beaten_track'

export interface WizardAnswers {
  traveller: string
  destination: string
  origin: string
  explorationStyle: ExplorationStyle
  dateMode: 'specific' | 'month' | 'flexible'
  startDate: string
  endDate: string
  dateText: string
  duration: number
  budget: string
  budgetType: string
  profileAnswers: string[]
}

interface TripWizardProps {
  onComplete: (answers: WizardAnswers) => void
  onClose: () => void
  initialDestination?: string
}

// ─── Traveller profiles ───────────────────────────────────────────────────────

const TRAVELLER_PROFILES = [
  { id: 'Solo traveller', icon: '🎒', desc: 'Travelling alone' },
  { id: 'Solo female traveller', icon: '👩', desc: 'Solo, safety-aware planning' },
  { id: 'Senior traveller', icon: '🌿', desc: 'Comfort-focused, relaxed pace' },
  { id: 'Couple', icon: '❤️', desc: 'Two adults' },
  { id: 'Family with young kids', icon: '🧸', desc: 'Children under 5' },
  { id: 'Family with older kids', icon: '🎮', desc: 'Children aged 6–11' },
  { id: 'Family with teens', icon: '🏄', desc: 'Teenagers in the group' },
]

// ─── Profile-specific questions ───────────────────────────────────────────────

interface PQ {
  label: string
  type: 'text' | 'radio'
  placeholder?: string
  options?: string[]
}

const ACCESSIBILITY_Q: PQ = {
  label: 'Any accessibility needs we should plan around?',
  type: 'text',
  placeholder: 'e.g. wheelchair access, limited walking, dietary requirements — or leave blank',
}

const PROFILE_QUESTIONS: Record<string, PQ[]> = {
  'Solo traveller': [
    { label: 'Travel pace?', type: 'radio', options: ['Relaxed — a few things a day', 'Balanced — mix of activity and downtime', 'Packed — maximum sights, full days'] },
    { label: 'What\'s the one thing you most want to do or experience?', type: 'text', placeholder: 'e.g. eat my way through the street food scene, find hidden temples...' },
    { label: 'Anything you want to avoid?', type: 'text', placeholder: 'e.g. big tour groups, early mornings, overly touristy spots...' },
    ACCESSIBILITY_Q,
    { label: 'Been to this destination before?', type: 'radio', options: ['First time', 'Been before'] },
  ],
  'Solo female traveller': [
    { label: 'Any safety or comfort considerations to plan around?', type: 'text', placeholder: 'e.g. solo nights out, certain neighbourhoods, or none...' },
    { label: 'What\'s the one thing you most want to do or experience?', type: 'text', placeholder: 'e.g. food, culture, beaches, history...' },
    { label: 'Anything you want to avoid?', type: 'text', placeholder: 'e.g. overly touristy areas, long solo drives, or none...' },
    ACCESSIBILITY_Q,
    { label: 'Been to this destination before?', type: 'radio', options: ['First time', 'Been before'] },
  ],
  'Senior traveller': [
    { label: 'Comfortable walking per day?', type: 'radio', options: ['Light (1–2km)', 'Moderate (3–5km)', 'Active (6km+)'] },
    { label: 'What\'s the one thing you most want to do or experience?', type: 'text', placeholder: 'e.g. local food, historical sites, coastal scenery...' },
    ACCESSIBILITY_Q,
    { label: 'Been to this destination before?', type: 'radio', options: ['First time', 'Been before'] },
  ],
  'Couple': [
    { label: 'Any competing interests to balance?', type: 'text', placeholder: 'e.g. one loves museums, one wants beaches, or none...' },
    { label: 'What\'s the one thing you both most want to do?', type: 'text', placeholder: 'e.g. great food, getting off the beaten track, relaxing by a pool...' },
    { label: 'Travel pace?', type: 'radio', options: ['Relaxed', 'Balanced', 'Packed'] },
    ACCESSIBILITY_Q,
    { label: 'Been to this destination before?', type: 'radio', options: ['First time', 'Been before'] },
  ],
  'Family with young kids': [
    { label: 'How old are the kids?', type: 'text', placeholder: 'e.g. 18 months and 3 years' },
    { label: 'Stroller or nap schedules to work around?', type: 'radio', options: ['Stroller + naps are essential', 'Naps only', 'Pretty flexible now', 'No constraints'] },
    { label: 'What would the kids like to do?', type: 'text', placeholder: 'e.g. see animals, go to the beach, visit a theme park…' },
    { label: 'Three key things you want to see or do?', type: 'text', placeholder: 'e.g. Eiffel Tower, a cooking class, a local market…' },
    { label: 'Accommodation preference?', type: 'radio', options: ['Apartment / villa with kitchen', 'Family hotel room', 'Resort with kids\' facilities', 'Flexible'] },
    ACCESSIBILITY_Q,
    { label: 'Been to this destination before?', type: 'radio', options: ['First time', 'Been before'] },
  ],
  'Family with older kids': [
    { label: 'How old are the kids and what are they into?', type: 'text', placeholder: 'e.g. 8 and 10, love animals and swimming' },
    { label: 'How much walking before mutiny sets in?', type: 'radio', options: ['Short bursts only', 'A few hours', 'Happy all day'] },
    { label: 'Accommodation style?', type: 'radio', options: ['Budget family room', 'Mid-range hotel', 'Resort / pool essential', 'Apartment / villa', 'A mix — happy to vary it'] },
    ACCESSIBILITY_Q,
    { label: 'Been to this destination before?', type: 'radio', options: ['First time', 'Been before'] },
  ],
  'Family with teens': [
    { label: 'How old are the teens and what are they into?', type: 'text', placeholder: 'e.g. 14 and 16, love food and adventure' },
    { label: 'What does everyone want to get out of this trip?', type: 'text', placeholder: 'e.g. adventure, relaxation, culture, trying new food...' },
    { label: 'Accommodation style?', type: 'radio', options: ['Budget / hostel', 'Mid-range hotel', 'Apartment / villa', 'Resort', 'A mix — happy to vary it'] },
    ACCESSIBILITY_Q,
    { label: 'Been to this destination before?', type: 'radio', options: ['First time', 'Been before'] },
  ],
}

const BUDGET_OPTIONS = [
  { id: 'Budget', icon: '🎒', label: 'Budget', desc: 'Hostels, street food, local transport' },
  { id: 'Mid-range', icon: '✈️', label: 'Mid-range', desc: 'Comfortable hotels, mix of dining' },
  { id: 'Luxury', icon: '🥂', label: 'Luxury', desc: 'Great hotels, experiences, no compromises' },
]

function tripDays(start: string, end: string): number {
  if (!start || !end) return 0
  const diff = new Date(end).getTime() - new Date(start).getTime()
  return Math.round(diff / (1000 * 60 * 60 * 24))
}

const EXPLORATION_OPTIONS: { id: ExplorationStyle; label: string; desc: string }[] = [
  {
    id: 'classics',
    label: 'I want the classics',
    desc: 'The iconic sights are iconic for a reason',
  },
  {
    id: 'mixed',
    label: 'A bit of both',
    desc: 'Some highlights, some hidden gems',
  },
  {
    id: 'off_beaten_track',
    label: 'Off the beaten track',
    desc: "If it's in every guidebook, I'm probably not interested",
  },
]

const DURATION_OPTIONS = [3, 5, 7, 10, 14, 21]

function DurationPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <p className="text-xs font-medium mb-2" style={{ color: C.dark, opacity: 0.5 }}>How many days?</p>
      <div className="flex flex-wrap gap-2">
        {DURATION_OPTIONS.map(d => (
          <button
            key={d}
            type="button"
            onClick={() => onChange(d)}
            className="rounded-xl px-4 py-2 text-sm font-medium transition-all"
            style={{
              background: value === d ? C.terra : 'white',
              color: value === d ? C.sand : C.dark,
              border: `1.5px solid ${value === d ? C.terra : `${C.saffron}44`}`,
            }}
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  )
}

export function TripWizard({ onComplete, onClose, initialDestination }: TripWizardProps) {
  const [step, setStep] = useState(1)

  // Step 1
  const [traveller, setTraveller] = useState('')
  // Step 2
  const [destination, setDestination] = useState(initialDestination ?? '')
  const [origin, setOrigin] = useState('')
  // Step 3 — exploration style
  const [explorationStyle, setExplorationStyle] = useState<ExplorationStyle | ''>('')
  // Step 4
  const [dateMode, setDateMode] = useState<'specific' | 'month' | 'flexible'>('specific')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [monthText, setMonthText] = useState('')
  const [flexibleDays, setFlexibleDays] = useState(7)
  // Step 5
  const [budget, setBudget] = useState('')
  const [budgetType, setBudgetType] = useState<'flights-included' | 'land-only'>('flights-included')
  // Step 6 — profile-specific (dynamic, any number of questions)
  const [profileAnswers, setProfileAnswers] = useState<string[]>([])

  const [errors, setErrors] = useState<Record<string, string>>({})
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isScrollable, setIsScrollable] = useState(false)
  const [thumbTop, setThumbTop] = useState(0)
  const [thumbHeight, setThumbHeight] = useState(0)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = el
      const scrollable = scrollHeight > clientHeight + 4
      setIsScrollable(scrollable)
      if (scrollable) {
        const trackH = clientHeight - 16
        const th = Math.max((clientHeight / scrollHeight) * trackH, 32)
        const tt = 8 + (scrollTop / (scrollHeight - clientHeight)) * (trackH - th)
        setThumbHeight(th)
        setThumbTop(tt)
      }
    }
    update()
    el.addEventListener('scroll', update)
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => { el.removeEventListener('scroll', update); ro.disconnect() }
  }, [step])

  const days = tripDays(startDate, endDate)
  const TOTAL_STEPS = 6

  const profileQuestions = traveller ? PROFILE_QUESTIONS[traveller] ?? [] : []

  const setProfileAnswer = (i: number, value: string) => {
    setProfileAnswers(prev => {
      const next = [...prev]
      next[i] = value
      return next
    })
  }

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (step === 1 && !traveller) e.traveller = 'Please select your traveller type'
    if (step === 2) {
      if (!destination.trim()) e.destination = 'Please enter a destination'
      if (!origin.trim()) e.origin = 'Please enter where you\'re flying from'
    }
    if (step === 3 && !explorationStyle) e.explorationStyle = 'Please choose how you like to explore'
    if (step === 4 && dateMode === 'specific') {
      if (!startDate) e.startDate = 'Please choose a departure date'
      if (!endDate) e.endDate = 'Please choose a return date'
      if (startDate && endDate && endDate <= startDate) e.endDate = 'Return must be after departure'
    }
    if (step === 4 && dateMode === 'month' && !monthText.trim()) {
      e.monthText = 'Please enter a month or time of year'
    }
    if (step === 5 && !budget) e.budget = 'Please select a budget'
    if (step === 6) {
      profileQuestions.forEach((q, i) => {
        if (q.type === 'radio' && !profileAnswers[i]) {
          e[`q${i}`] = 'Please select an option'
        }
      })
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const buildDateText = () => {
    if (dateMode === 'flexible') return 'Flexible'
    if (dateMode === 'month') return monthText
    return `${startDate} to ${endDate}`
  }

  const next = () => {
    if (!validate()) return
    if (step === TOTAL_STEPS) {
      onComplete({
        traveller, destination, origin,
        explorationStyle: explorationStyle as ExplorationStyle,
        dateMode, startDate, endDate,
        dateText: buildDateText(), duration: dateMode === 'specific' ? days : flexibleDays,
        budget, budgetType,
        profileAnswers: profileQuestions.map((q, i) =>
          profileAnswers[i] ? `${q.label}: ${profileAnswers[i]}` : ''
        ).filter(Boolean),
      })
    } else {
      setStep(s => s + 1)
    }
  }

  const back = () => {
    setErrors({})
    setStep(s => s - 1)
  }

  const cardStyle = (selected: boolean) => ({
    background: selected ? `${C.terra}12` : 'white',
    border: `2px solid ${selected ? C.terra : `${C.saffron}33`}`,
    cursor: 'pointer',
    transition: 'all 0.15s',
  })

  const inputStyle = (hasError?: boolean) => ({
    background: 'white',
    border: `1.5px solid ${hasError ? C.terra : `${C.saffron}44`}`,
    color: C.dark,
  })

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ background: 'rgba(26,18,8,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: 'white', boxShadow: '0 32px 80px rgba(26,18,8,0.3)' }}>

        {/* Progress bar + close */}
        <div className="px-6 pt-5 pb-4" style={{ borderBottom: `1px solid ${C.sand}` }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium" style={{ color: C.terra }}>Step {step} of {TOTAL_STEPS}</span>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full transition-opacity hover:opacity-60"
              style={{ color: C.dark, opacity: 0.4, fontSize: '18px' }}>
              ✕
            </button>
          </div>
          <div className="w-full rounded-full h-1.5" style={{ background: `${C.dark}10` }}>
            <div className="h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%`, background: C.terra }} />
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex" style={{ maxHeight: '65vh' }}>
        <style>{`
          .wayfindr-wizard-scroll::-webkit-scrollbar { display: none; }
          .wayfindr-wizard-scroll { scrollbar-width: none; }
        `}</style>
        <div ref={scrollRef} className="wayfindr-wizard-scroll flex-1 px-6 py-6 space-y-4 overflow-y-auto">

          {/* STEP 1 — TRAVELLER PROFILE */}
          {step === 1 && (
            <>
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair)', color: C.dark }}>
                Who&apos;s travelling?
              </h2>
              <div className="space-y-2">
                {TRAVELLER_PROFILES.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { setTraveller(p.id); setErrors({}) }}
                    className="w-full text-left rounded-xl p-3.5 transition-all flex items-center gap-3"
                    style={cardStyle(traveller === p.id)}
                  >
                    <span className="text-xl shrink-0">{p.icon}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-sm" style={{ color: C.dark }}>{p.id}</p>
                      <p className="text-xs mt-0.5" style={{ color: C.dark, opacity: 0.5 }}>{p.desc}</p>
                    </div>
                    {traveller === p.id && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0"
                        style={{ background: C.terra, color: C.sand }}>✓</div>
                    )}
                  </button>
                ))}
              </div>
              {errors.traveller && <p className="text-xs" style={{ color: C.terra }}>{errors.traveller}</p>}
            </>
          )}

          {/* STEP 2 — DESTINATION + ORIGIN */}
          {step === 2 && (
            <>
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair)', color: C.dark }}>
                Where are you going?
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: C.dark, opacity: 0.5 }}>
                    Destination
                  </label>
                  <input
                    type="text"
                    value={destination}
                    onChange={e => { setDestination(e.target.value); setErrors({}) }}
                    placeholder="e.g. Paris, China, Europe..."
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                    style={inputStyle(!!errors.destination)}
                    onFocus={e => e.target.style.borderColor = C.terra}
                    onBlur={e => e.target.style.borderColor = errors.destination ? C.terra : `${C.saffron}44`}
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && next()}
                  />
                  {errors.destination && <p className="mt-1.5 text-xs" style={{ color: C.terra }}>{errors.destination}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: C.dark, opacity: 0.5 }}>
                    Where are you flying from?
                  </label>
                  <input
                    type="text"
                    value={origin}
                    onChange={e => { setOrigin(e.target.value); setErrors({}) }}
                    placeholder="e.g. Auckland, Sydney, London..."
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                    style={inputStyle(!!errors.origin)}
                    onFocus={e => e.target.style.borderColor = C.terra}
                    onBlur={e => e.target.style.borderColor = errors.origin ? C.terra : `${C.saffron}44`}
                    onKeyDown={e => e.key === 'Enter' && next()}
                  />
                  {errors.origin && <p className="mt-1.5 text-xs" style={{ color: C.terra }}>{errors.origin}</p>}
                </div>
              </div>
            </>
          )}

          {/* STEP 3 — EXPLORATION STYLE */}
          {step === 3 && (
            <>
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair)', color: C.dark }}>
                How do you like to explore?
              </h2>
              <div className="space-y-2">
                {EXPLORATION_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => { setExplorationStyle(opt.id); setErrors({}) }}
                    className="w-full text-left rounded-xl p-4 transition-all"
                    style={cardStyle(explorationStyle === opt.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="font-semibold text-sm" style={{ color: C.dark }}>{opt.label}</p>
                        <p className="text-xs mt-0.5" style={{ color: C.dark, opacity: 0.5 }}>{opt.desc}</p>
                      </div>
                      {explorationStyle === opt.id && (
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0"
                          style={{ background: C.terra, color: C.sand }}>✓</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              {errors.explorationStyle && <p className="text-xs" style={{ color: C.terra }}>{errors.explorationStyle}</p>}
            </>
          )}

          {/* STEP 4 — DATES */}
          {step === 4 && (
            <>
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair)', color: C.dark }}>
                When are you travelling?
              </h2>

              <div className="flex gap-1 p-1 rounded-xl" style={{ background: `${C.dark}08` }}>
                {(['specific', 'month', 'flexible'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => { setDateMode(mode); setErrors({}) }}
                    className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: dateMode === mode ? 'white' : 'transparent',
                      color: dateMode === mode ? C.terra : C.dark,
                      boxShadow: dateMode === mode ? '0 1px 4px rgba(26,18,8,0.1)' : 'none',
                      opacity: dateMode === mode ? 1 : 0.5,
                    }}
                  >
                    {mode === 'specific' ? 'Exact dates' : mode === 'month' ? 'A month' : "I'm flexible"}
                  </button>
                ))}
              </div>

              {dateMode === 'specific' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: C.dark, opacity: 0.5 }}>Departure</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={e => { setStartDate(e.target.value); setErrors({}) }}
                        className="w-full rounded-xl px-3 py-3 text-sm outline-none transition-all"
                        style={inputStyle(!!errors.startDate)}
                        onFocus={e => e.target.style.borderColor = C.terra}
                        onBlur={e => e.target.style.borderColor = errors.startDate ? C.terra : `${C.saffron}44`}
                      />
                      {errors.startDate && <p className="mt-1 text-xs" style={{ color: C.terra }}>{errors.startDate}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: C.dark, opacity: 0.5 }}>Return</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={e => { setEndDate(e.target.value); setErrors({}) }}
                        className="w-full rounded-xl px-3 py-3 text-sm outline-none transition-all"
                        style={inputStyle(!!errors.endDate)}
                        onFocus={e => e.target.style.borderColor = C.terra}
                        onBlur={e => e.target.style.borderColor = errors.endDate ? C.terra : `${C.saffron}44`}
                      />
                      {errors.endDate && <p className="mt-1 text-xs" style={{ color: C.terra }}>{errors.endDate}</p>}
                    </div>
                  </div>
                  {days > 0 && (
                    <p className="text-sm font-medium" style={{ color: C.terra }}>
                      That&apos;s {days} day{days !== 1 ? 's' : ''} ✈️
                    </p>
                  )}
                </>
              )}

              {dateMode === 'month' && (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={monthText}
                    onChange={e => { setMonthText(e.target.value); setErrors({}) }}
                    placeholder="e.g. March 2027, next summer, Christmas..."
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                    style={inputStyle(!!errors.monthText)}
                    onFocus={e => e.target.style.borderColor = C.terra}
                    onBlur={e => e.target.style.borderColor = errors.monthText ? C.terra : `${C.saffron}44`}
                    autoFocus
                  />
                  {errors.monthText && <p className="mt-1.5 text-xs" style={{ color: C.terra }}>{errors.monthText}</p>}
                  <DurationPicker value={flexibleDays} onChange={setFlexibleDays} />
                </div>
              )}

              {dateMode === 'flexible' && (
                <div className="space-y-3">
                  <div className="py-2 text-center">
                    <p className="text-3xl mb-2">🗓️</p>
                    <p className="text-sm" style={{ color: C.dark, opacity: 0.55 }}>
                      No worries — we&apos;ll plan your trip without locking in dates.
                    </p>
                  </div>
                  <DurationPicker value={flexibleDays} onChange={setFlexibleDays} />
                </div>
              )}
            </>
          )}

          {/* STEP 5 — BUDGET */}
          {step === 5 && (
            <>
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair)', color: C.dark }}>
                What&apos;s your budget?
              </h2>
              <div className="space-y-2">
                {BUDGET_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => { setBudget(opt.id); setErrors({}) }}
                    className="w-full text-left rounded-xl p-4 transition-all"
                    style={cardStyle(budget === opt.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{opt.icon}</span>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: C.dark }}>{opt.label}</p>
                        <p className="text-xs mt-0.5" style={{ color: C.dark, opacity: 0.5 }}>{opt.desc}</p>
                      </div>
                      {budget === opt.id && (
                        <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center text-xs"
                          style={{ background: C.terra, color: C.sand }}>✓</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              {errors.budget && <p className="text-xs" style={{ color: C.terra }}>{errors.budget}</p>}

              <div>
                <p className="text-xs font-medium mb-2" style={{ color: C.dark, opacity: 0.5 }}>
                  Does your budget include flights?
                </p>
                <div className="flex gap-2">
                  {(['flights-included', 'land-only'] as const).map(bt => (
                    <button
                      key={bt}
                      onClick={() => setBudgetType(bt)}
                      className="flex-1 py-2.5 rounded-xl text-xs font-medium transition-all"
                      style={{
                        background: budgetType === bt ? `${C.terra}12` : 'white',
                        border: `1.5px solid ${budgetType === bt ? C.terra : `${C.dark}15`}`,
                        color: budgetType === bt ? C.terra : C.dark,
                      }}
                    >
                      {bt === 'flights-included' ? 'Yes, flights included' : 'No, just accommodation & activities'}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* STEP 6 — PROFILE-SPECIFIC QUESTIONS */}
          {step === 6 && traveller && (
            <>
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair)', color: C.dark }}>
                A few more details
              </h2>
              <p className="text-sm" style={{ color: C.dark, opacity: 0.5 }}>
                Help us tailor your itinerary as a {traveller.toLowerCase()}.
              </p>
              <div className="space-y-5">
                {profileQuestions.map((q, i) => (
                  <div key={i}>
                    <p className="text-sm font-medium mb-2" style={{ color: C.dark }}>{q.label}</p>
                    {q.type === 'text' ? (
                      <input
                        type="text"
                        value={profileAnswers[i] ?? ''}
                        onChange={e => { setProfileAnswer(i, e.target.value); setErrors({}) }}
                        placeholder={q.placeholder}
                        className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                        style={inputStyle()}
                        onFocus={e => e.target.style.borderColor = C.terra}
                        onBlur={e => e.target.style.borderColor = `${C.saffron}44`}
                      />
                    ) : (
                      <div className="space-y-1.5">
                        {q.options!.map(opt => (
                          <button
                            key={opt}
                            onClick={() => { setProfileAnswer(i, opt); setErrors({}) }}
                            className="w-full text-left rounded-xl px-4 py-2.5 text-sm transition-all"
                            style={{
                              background: profileAnswers[i] === opt ? `${C.terra}12` : 'white',
                              border: `1.5px solid ${profileAnswers[i] === opt ? C.terra : `${C.dark}15`}`,
                              color: C.dark,
                            }}
                          >
                            {opt}
                          </button>
                        ))}
                        {errors[`q${i}`] && <p className="text-xs mt-1" style={{ color: C.terra }}>{errors[`q${i}`]}</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        {/* Custom scrollbar — flex sibling, always visible when content overflows */}
        {isScrollable && (
          <div className="w-1.5 mr-2 py-3 flex-shrink-0 relative" aria-hidden="true">
            <div className="absolute inset-y-3 inset-x-0 rounded-full" style={{ background: 'rgba(26,18,8,0.08)' }} />
            <div
              className="absolute inset-x-0 rounded-full transition-[top] duration-75"
              style={{ background: C.terra, opacity: 0.4, top: thumbTop, height: thumbHeight }}
            />
          </div>
        )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2 flex items-center justify-between gap-3"
          style={{ borderTop: `1px solid ${C.sand}` }}>
          {step > 1 ? (
            <button onClick={back} className="text-sm font-medium transition-opacity hover:opacity-60"
              style={{ color: C.dark, opacity: 0.45 }}>
              ← Back
            </button>
          ) : (
            <div />
          )}
          <button
            onClick={next}
            className="font-semibold px-7 py-3 rounded-xl text-sm transition-opacity hover:opacity-90"
            style={{ background: C.terra, color: C.sand }}
          >
            {step === TOTAL_STEPS ? 'Build my itinerary →' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}
