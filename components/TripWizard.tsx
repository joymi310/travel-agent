'use client'

import { useState } from 'react'

const C = {
  sand: '#F5ECD7',
  terra: '#C94A2B',
  saffron: '#E8850A',
  dark: '#1A1208',
}

export interface WizardAnswers {
  destination: string
  dateMode: 'specific' | 'month' | 'flexible'
  startDate: string
  endDate: string
  dateText: string   // free text or "Flexible"
  duration: number
  who: string
  people: number
  budget: string
  pace: string
}

interface TripWizardProps {
  onComplete: (answers: WizardAnswers) => void
  onClose: () => void
  initialDestination?: string
}

const WHO_OPTIONS = ['Just me', 'Couple', 'Family with young kids', 'Family with older kids', 'Group of friends']

const BUDGET_OPTIONS = [
  { id: 'Budget', icon: '🎒', label: 'Budget', desc: 'Hostels, street food, local transport' },
  { id: 'Mid-range', icon: '✈️', label: 'Mid-range', desc: 'Comfortable hotels, mix of dining' },
  { id: 'Luxury', icon: '🥂', label: 'Luxury', desc: 'Great hotels, experiences, no compromises' },
]

const PACE_OPTIONS = [
  { id: 'Relaxed', icon: '🐢', label: 'Relaxed', desc: 'A few things a day, lots of wandering' },
  { id: 'Balanced', icon: '⚖️', label: 'Balanced', desc: 'Good mix of activities and downtime' },
  { id: 'Packed', icon: '⚡', label: 'Packed', desc: 'Maximum sights, early starts, full days' },
]

function tripDays(start: string, end: string): number {
  if (!start || !end) return 0
  const diff = new Date(end).getTime() - new Date(start).getTime()
  return Math.round(diff / (1000 * 60 * 60 * 24))
}

export function TripWizard({ onComplete, onClose, initialDestination }: TripWizardProps) {
  const [step, setStep] = useState(1)
  const [destination, setDestination] = useState(initialDestination ?? '')
  const [dateMode, setDateMode] = useState<'specific' | 'month' | 'flexible'>('specific')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [monthText, setMonthText] = useState('')
  const [who, setWho] = useState('')
  const [people, setPeople] = useState(2)
  const [budget, setBudget] = useState('')
  const [pace, setPace] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const days = tripDays(startDate, endDate)
  const TOTAL_STEPS = 5

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (step === 1 && !destination.trim()) e.destination = 'Please enter a destination'
    if (step === 2 && dateMode === 'specific') {
      if (!startDate) e.startDate = 'Please choose a departure date'
      if (!endDate) e.endDate = 'Please choose a return date'
      if (startDate && endDate && endDate <= startDate) e.endDate = 'Return must be after departure'
    }
    if (step === 2 && dateMode === 'month' && !monthText.trim()) {
      e.monthText = 'Please enter a month or time of year'
    }
    if (step === 3 && !who) e.who = 'Please select who is coming'
    if (step === 4 && !budget) e.budget = 'Please select a budget'
    if (step === 5 && !pace) e.pace = 'Please select a travel pace'
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
        destination, dateMode, startDate, endDate,
        dateText: buildDateText(), duration: days,
        who, people, budget, pace,
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

        {/* Content */}
        <div className="px-6 py-6 space-y-5">

          {/* STEP 1 — WHERE */}
          {step === 1 && (
            <>
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair)', color: C.dark }}>
                Where do you want to go?
              </h2>
              <div>
                <input
                  type="text"
                  value={destination}
                  onChange={e => { setDestination(e.target.value); setErrors({}) }}
                  placeholder="e.g. Vietnam, Japan, Morocco..."
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  style={{ background: 'white', border: `1.5px solid ${errors.destination ? C.terra : `${C.saffron}44`}`, color: C.dark }}
                  onFocus={e => e.target.style.borderColor = C.terra}
                  onBlur={e => e.target.style.borderColor = errors.destination ? C.terra : `${C.saffron}44`}
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && next()}
                />
                {errors.destination && <p className="mt-1.5 text-xs" style={{ color: C.terra }}>{errors.destination}</p>}
              </div>
            </>
          )}

          {/* STEP 2 — WHEN */}
          {step === 2 && (
            <>
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair)', color: C.dark }}>
                When are you travelling?
              </h2>

              {/* Mode tabs */}
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
                        style={{ background: 'white', border: `1.5px solid ${errors.startDate ? C.terra : `${C.saffron}44`}`, color: C.dark }}
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
                        style={{ background: 'white', border: `1.5px solid ${errors.endDate ? C.terra : `${C.saffron}44`}`, color: C.dark }}
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
                    style={{ background: 'white', border: `1.5px solid ${errors.monthText ? C.terra : `${C.saffron}44`}`, color: C.dark }}
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

          {/* STEP 3 — WHO */}
          {step === 3 && (
            <>
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair)', color: C.dark }}>
                Who&apos;s coming?
              </h2>
              <div className="flex flex-wrap gap-2">
                {WHO_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    onClick={() => { setWho(opt); setErrors({}) }}
                    className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                    style={{
                      background: who === opt ? C.terra : 'white',
                      color: who === opt ? C.sand : C.dark,
                      border: `1.5px solid ${who === opt ? C.terra : `${C.dark}20`}`,
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {errors.who && <p className="text-xs" style={{ color: C.terra }}>{errors.who}</p>}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: C.dark, opacity: 0.5 }}>
                  How many people total?
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={people}
                  onChange={e => setPeople(Number(e.target.value))}
                  className="w-24 rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
                  style={{ background: 'white', border: `1.5px solid ${C.saffron}44`, color: C.dark }}
                  onFocus={e => e.target.style.borderColor = C.terra}
                  onBlur={e => e.target.style.borderColor = `${C.saffron}44`}
                />
              </div>
            </>
          )}

          {/* STEP 4 — BUDGET */}
          {step === 4 && (
            <>
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair)', color: C.dark }}>
                What&apos;s your budget vibe?
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
            </>
          )}

          {/* STEP 5 — PACE */}
          {step === 5 && (
            <>
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair)', color: C.dark }}>
                How do you like to travel?
              </h2>
              <div className="space-y-2">
                {PACE_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => { setPace(opt.id); setErrors({}) }}
                    className="w-full text-left rounded-xl p-4 transition-all"
                    style={cardStyle(pace === opt.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{opt.icon}</span>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: C.dark }}>{opt.label}</p>
                        <p className="text-xs mt-0.5" style={{ color: C.dark, opacity: 0.5 }}>{opt.desc}</p>
                      </div>
                      {pace === opt.id && (
                        <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center text-xs"
                          style={{ background: C.terra, color: C.sand }}>✓</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              {errors.pace && <p className="text-xs" style={{ color: C.terra }}>{errors.pace}</p>}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex items-center justify-between gap-3">
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
