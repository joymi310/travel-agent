'use client'

import { useState } from 'react'

const C = {
  sand: '#F5ECD7',
  terra: '#C94A2B',
  saffron: '#E8850A',
  dark: '#1A1208',
}

export interface WizardAnswers {
  traveller: string
  destination: string
  origin: string
  dateMode: 'specific' | 'month' | 'flexible'
  startDate: string
  endDate: string
  dateText: string
  duration: number
  budget: string
  budgetType: string
  profileQ1: string
  profileQ2: string
  profileQ3: string
  profileQ4: string
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

const PROFILE_QUESTIONS: Record<string, [PQ, PQ, PQ, PQ]> = {
  'Solo traveller': [
    { label: 'Travel pace?', type: 'radio', options: ['Relaxed — a few things a day', 'Balanced — mix of activity and downtime', 'Packed — maximum sights, full days'] },
    { label: 'What do you care most about?', type: 'text', placeholder: 'e.g. food, culture, nature, adventure, nightlife...' },
    { label: 'Accommodation style?', type: 'radio', options: ['Hostel / dorm', 'Budget hotel', 'Mid-range hotel', 'Boutique guesthouse'] },
    { label: 'Been to this destination before?', type: 'radio', options: ['First time', 'Been before'] },
  ],
  'Solo female traveller': [
    { label: 'Any areas or situations you\'re nervous about?', type: 'text', placeholder: 'e.g. solo nights out, certain neighbourhoods, or none...' },
    { label: 'Accommodation preference?', type: 'radio', options: ['Female-only dorm', 'Private room in hostel', 'Boutique guesthouse', 'Hotel'] },
    { label: 'What do you care most about on this trip?', type: 'text', placeholder: 'e.g. food, culture, beaches, history...' },
    { label: 'Independent travel or open to group activities?', type: 'radio', options: ['Fully independent', 'Mix of both', 'Prefer group activities for some things'] },
  ],
  'Senior traveller': [
    { label: 'Any mobility considerations to plan around?', type: 'text', placeholder: 'e.g. limited walking, no steep stairs, or none...' },
    { label: 'Comfortable walking per day?', type: 'radio', options: ['Light (1–2km)', 'Moderate (3–5km)', 'Active (6km+)'] },
    { label: 'Accommodation comfort level?', type: 'radio', options: ['Mid-range minimum', 'Comfortable / 4-star', 'Luxury', 'Flexible'] },
    { label: 'Been to this destination before?', type: 'radio', options: ['First time', 'Been before'] },
  ],
  'Couple': [
    { label: 'Any competing interests to balance?', type: 'text', placeholder: 'e.g. one loves museums, one wants beaches, or none...' },
    { label: 'Accommodation style?', type: 'radio', options: ['Budget', 'Mid-range hotel', 'Boutique / design hotel', 'Luxury'] },
    { label: 'Travel pace?', type: 'radio', options: ['Relaxed', 'Balanced', 'Packed'] },
    { label: 'Is this a special occasion?', type: 'text', placeholder: 'e.g. anniversary, honeymoon, birthday trip, or leave blank...' },
  ],
  'Family with young kids': [
    { label: 'How old are the kids?', type: 'text', placeholder: 'e.g. 18 months and 3 years' },
    { label: 'Stroller or nap schedules to work around?', type: 'radio', options: ['Stroller + naps are essential', 'Naps only', 'Pretty flexible now', 'No constraints'] },
    { label: 'Any dietary restrictions?', type: 'text', placeholder: 'e.g. allergies, fussy eaters, or none...' },
    { label: 'Accommodation preference?', type: 'radio', options: ['Apartment / villa with kitchen', 'Family hotel room', 'Resort with kids\' facilities', 'Flexible'] },
  ],
  'Family with older kids': [
    { label: 'How old are the kids and what are they into?', type: 'text', placeholder: 'e.g. 8 and 10, love animals and swimming' },
    { label: 'How much walking before mutiny sets in?', type: 'radio', options: ['Short bursts only', 'A few hours', 'Happy all day'] },
    { label: 'Any dietary restrictions?', type: 'text', placeholder: 'e.g. allergies, vegetarian, or none...' },
    { label: 'Accommodation style?', type: 'radio', options: ['Budget family room', 'Mid-range hotel', 'Resort / pool essential', 'Apartment / villa'] },
  ],
  'Family with teens': [
    { label: 'How old are the teens and what are they into?', type: 'text', placeholder: 'e.g. 14 and 16, love food and adventure' },
    { label: 'Do the teens get input into the plan?', type: 'radio', options: ['Planning together', 'Some input', 'It\'s a surprise'] },
    { label: 'Any dietary restrictions?', type: 'text', placeholder: 'e.g. vegetarian, allergies, or none...' },
    { label: 'Accommodation style?', type: 'radio', options: ['Budget / hostel', 'Mid-range hotel', 'Apartment / villa', 'Resort'] },
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

export function TripWizard({ onComplete, onClose, initialDestination }: TripWizardProps) {
  const [step, setStep] = useState(1)

  // Step 1
  const [traveller, setTraveller] = useState('')
  // Step 2
  const [destination, setDestination] = useState(initialDestination ?? '')
  const [origin, setOrigin] = useState('')
  // Step 3
  const [dateMode, setDateMode] = useState<'specific' | 'month' | 'flexible'>('specific')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [monthText, setMonthText] = useState('')
  // Step 4
  const [budget, setBudget] = useState('')
  const [budgetType, setBudgetType] = useState<'flights-included' | 'land-only'>('flights-included')
  // Step 5 — profile-specific
  const [profileQ1, setProfileQ1] = useState('')
  const [profileQ2, setProfileQ2] = useState('')
  const [profileQ3, setProfileQ3] = useState('')
  const [profileQ4, setProfileQ4] = useState('')

  const [errors, setErrors] = useState<Record<string, string>>({})

  const days = tripDays(startDate, endDate)
  const TOTAL_STEPS = 5

  const profileQuestions = traveller ? PROFILE_QUESTIONS[traveller] ?? [] : []
  const profileValues = [profileQ1, profileQ2, profileQ3, profileQ4]
  const profileSetters = [setProfileQ1, setProfileQ2, setProfileQ3, setProfileQ4]

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (step === 1 && !traveller) e.traveller = 'Please select your traveller type'
    if (step === 2) {
      if (!destination.trim()) e.destination = 'Please enter a destination'
      if (!origin.trim()) e.origin = 'Please enter where you\'re flying from'
    }
    if (step === 3 && dateMode === 'specific') {
      if (!startDate) e.startDate = 'Please choose a departure date'
      if (!endDate) e.endDate = 'Please choose a return date'
      if (startDate && endDate && endDate <= startDate) e.endDate = 'Return must be after departure'
    }
    if (step === 3 && dateMode === 'month' && !monthText.trim()) {
      e.monthText = 'Please enter a month or time of year'
    }
    if (step === 4 && !budget) e.budget = 'Please select a budget'
    if (step === 5) {
      profileQuestions.forEach((q, i) => {
        if (q.type === 'radio' && !profileValues[i]) {
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
        dateMode, startDate, endDate,
        dateText: buildDateText(), duration: days,
        budget, budgetType,
        profileQ1, profileQ2, profileQ3, profileQ4,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
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
        <div className="px-6 py-6 space-y-4 overflow-y-auto" style={{ maxHeight: '65vh' }}>

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
                    placeholder="e.g. Vietnam, Japan, Morocco..."
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

          {/* STEP 3 — DATES */}
          {step === 3 && (
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
                  <div className="grid grid-cols-2 gap-3">
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
                <div>
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
                </div>
              )}

              {dateMode === 'flexible' && (
                <div className="py-4 text-center">
                  <p className="text-3xl mb-2">🗓️</p>
                  <p className="text-sm" style={{ color: C.dark, opacity: 0.55 }}>
                    No worries — we&apos;ll plan your trip without locking in dates.
                  </p>
                </div>
              )}
            </>
          )}

          {/* STEP 4 — BUDGET */}
          {step === 4 && (
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
                  Does that include flights?
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
                      {bt === 'flights-included' ? 'Flights included' : 'Land only'}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* STEP 5 — PROFILE-SPECIFIC QUESTIONS */}
          {step === 5 && traveller && (
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
                        value={profileValues[i]}
                        onChange={e => { profileSetters[i](e.target.value); setErrors({}) }}
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
                            onClick={() => { profileSetters[i](opt); setErrors({}) }}
                            className="w-full text-left rounded-xl px-4 py-2.5 text-sm transition-all"
                            style={{
                              background: profileValues[i] === opt ? `${C.terra}12` : 'white',
                              border: `1.5px solid ${profileValues[i] === opt ? C.terra : `${C.dark}15`}`,
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
