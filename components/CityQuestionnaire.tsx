'use client'

import { useState } from 'react'

const C = {
  sand: '#F5ECD7',
  terra: '#C94A2B',
  saffron: '#E8850A',
  jade: '#2A7A5B',
  dark: '#1A1208',
}

export interface QuestionnaireAnswers {
  companions: string
  budget: string
  interests: string[]
  duration: string
}

interface Props {
  cityName: string
  initialAnswers?: Partial<QuestionnaireAnswers>
  onSubmit: (answers: QuestionnaireAnswers) => void
  onClose?: () => void
}

const COMPANIONS = [
  { id: 'solo', label: 'Solo' },
  { id: 'couple', label: 'Couple' },
  { id: 'friends', label: 'Friends' },
  { id: 'family_young', label: 'Family (young kids)' },
  { id: 'family_teens', label: 'Family (teens)' },
]

const BUDGETS = [
  { id: 'budget', label: 'Budget', desc: 'Hostels, street food, local transport' },
  { id: 'mid_range', label: 'Mid-range', desc: 'Comfortable hotels, mix of dining' },
  { id: 'luxury', label: 'Luxury', desc: 'High-end stays, fine dining' },
]

const INTERESTS = [
  { id: 'food', label: 'Food & drink' },
  { id: 'nightlife', label: 'Nightlife' },
  { id: 'culture', label: 'Art & culture' },
  { id: 'shopping', label: 'Shopping' },
  { id: 'outdoors', label: 'Outdoors & nature' },
  { id: 'wellness', label: 'Wellness & spa' },
]

const DURATIONS = [
  { id: 'weekend', label: 'Weekend', desc: '2–3 days' },
  { id: 'short', label: 'Short trip', desc: '4–6 days' },
  { id: 'one_week', label: 'One week', desc: '7 days' },
  { id: 'two_weeks', label: 'Two weeks+', desc: '14+ days' },
]

export function CityQuestionnaire({ cityName, initialAnswers = {}, onSubmit, onClose }: Props) {
  const [companions, setCompanions] = useState(initialAnswers.companions ?? '')
  const [budget, setBudget] = useState(initialAnswers.budget ?? '')
  const [interests, setInterests] = useState<string[]>(initialAnswers.interests ?? [])
  const [duration, setDuration] = useState(initialAnswers.duration ?? '')

  const toggleInterest = (id: string) => {
    setInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const canSubmit = companions && budget && interests.length > 0 && duration

  const handleSubmit = () => {
    if (!canSubmit) return
    onSubmit({ companions, budget, interests, duration })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(26,18,8,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-lg rounded-3xl overflow-y-auto max-h-[90vh]"
        style={{ background: C.sand }}>

        {/* Header */}
        <div className="px-8 pt-8 pb-6 relative" style={{ borderBottom: `1px solid ${C.dark}15` }}>
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full transition-opacity hover:opacity-60"
              style={{ background: `${C.dark}10`, color: C.dark }}
            >
              ✕
            </button>
          )}
          <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: C.terra }}>
            Personalise your guide
          </p>
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair)', color: C.dark }}>
            Tell us about your {cityName} trip
          </h2>
          <p className="text-sm mt-1" style={{ color: C.dark, opacity: 0.55 }}>
            Your answers shape every recommendation.
          </p>
        </div>

        <div className="px-8 py-6 space-y-7">

          {/* Who are you travelling with */}
          <div>
            <p className="text-sm font-semibold mb-3" style={{ color: C.dark }}>
              Who are you travelling with?
            </p>
            <div className="flex flex-wrap gap-2">
              {COMPANIONS.map(c => (
                <button
                  key={c.id}
                  onClick={() => setCompanions(c.id)}
                  className="px-4 py-2 rounded-full text-sm font-medium border transition-all"
                  style={companions === c.id
                    ? { background: C.terra, color: C.sand, borderColor: C.terra }
                    : { background: 'white', color: C.dark, borderColor: `${C.dark}20` }
                  }
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div>
            <p className="text-sm font-semibold mb-3" style={{ color: C.dark }}>
              What&apos;s your budget style?
            </p>
            <div className="grid grid-cols-3 gap-2">
              {BUDGETS.map(b => (
                <button
                  key={b.id}
                  onClick={() => setBudget(b.id)}
                  className="p-3 rounded-2xl text-left border transition-all"
                  style={budget === b.id
                    ? { background: C.terra, color: C.sand, borderColor: C.terra }
                    : { background: 'white', color: C.dark, borderColor: `${C.dark}20` }
                  }
                >
                  <p className="text-sm font-semibold">{b.label}</p>
                  <p className="text-xs mt-0.5 leading-tight" style={{ opacity: 0.7 }}>{b.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div>
            <p className="text-sm font-semibold mb-3" style={{ color: C.dark }}>
              What matters most? <span style={{ opacity: 0.5, fontWeight: 400 }}>(pick all that apply)</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map(i => (
                <button
                  key={i.id}
                  onClick={() => toggleInterest(i.id)}
                  className="px-4 py-2 rounded-full text-sm font-medium border transition-all"
                  style={interests.includes(i.id)
                    ? { background: C.jade, color: C.sand, borderColor: C.jade }
                    : { background: 'white', color: C.dark, borderColor: `${C.dark}20` }
                  }
                >
                  {i.label}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <p className="text-sm font-semibold mb-3" style={{ color: C.dark }}>
              How long are you staying?
            </p>
            <div className="grid grid-cols-4 gap-2">
              {DURATIONS.map(d => (
                <button
                  key={d.id}
                  onClick={() => setDuration(d.id)}
                  className="p-3 rounded-2xl text-left border transition-all"
                  style={duration === d.id
                    ? { background: C.saffron, color: C.dark, borderColor: C.saffron }
                    : { background: 'white', color: C.dark, borderColor: `${C.dark}20` }
                  }
                >
                  <p className="text-sm font-semibold">{d.label}</p>
                  <p className="text-xs mt-0.5" style={{ opacity: 0.6 }}>{d.desc}</p>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Submit */}
        <div className="px-8 pb-8">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full py-4 rounded-2xl text-base font-semibold transition-all"
            style={canSubmit
              ? { background: C.terra, color: C.sand }
              : { background: `${C.dark}20`, color: `${C.dark}50`, cursor: 'not-allowed' }
            }
          >
            Build my {cityName} guide →
          </button>
        </div>

      </div>
    </div>
  )
}
