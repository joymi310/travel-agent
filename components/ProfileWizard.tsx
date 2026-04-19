'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PROFILE_TREE } from '@/lib/profile-tree'

const C = {
  sand: '#F5ECD7',
  terra: '#C94A2B',
  saffron: '#E8850A',
  jade: '#2A7A5B',
  dark: '#1A1208',
}

const TRAVEL_STYLES = [
  { id: 'backpacker', label: 'Backpacker', desc: 'Budget-conscious, hostels, flexibility', icon: '🎒' },
  { id: 'family_young_kids', label: 'Family — young kids', desc: 'Toddlers and under-5s', icon: '🧸' },
  { id: 'family_teens', label: 'Family — teens', desc: 'Older kids who want adventure', icon: '🏄' },
  { id: 'senior', label: 'Senior travel', desc: 'Comfort, accessibility, slower pace', icon: '🌿' },
  { id: 'off_beaten_track', label: 'Off the beaten track', desc: 'Avoiding crowds, unusual destinations', icon: '🗺️' },
  { id: 'other', label: 'Something else', desc: 'Tell the agent your style in the chat', icon: '✈️' },
]

interface ProfileWizardProps {
  onSave: (style: string, data: Record<string, string>) => void
  onSkip: () => void
}

export function ProfileWizard({ onSave, onSkip }: ProfileWizardProps) {
  const [style, setStyle] = useState<string | null>(null)
  const [step, setStep] = useState(0) // 0 = style picker, 1+ = tree questions
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [textInput, setTextInput] = useState('')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const questions = style ? PROFILE_TREE[style] ?? [] : []
  const currentQuestion = questions[step - 1]

  const handleStyleSelect = (id: string) => {
    setStyle(id)
    setAnswers({})
    setTextInput('')
    const tree = PROFILE_TREE[id] ?? []
    if (tree.length === 0) {
      handleSave(id, {})
    } else {
      setStep(1)
    }
  }

  const handleOptionAnswer = (questionId: string, answerId: string) => {
    const newAnswers = { ...answers, [questionId]: answerId }
    setAnswers(newAnswers)
    advanceStep(newAnswers)
  }

  const handleTextAnswer = () => {
    const newAnswers = { ...answers }
    if (textInput.trim()) newAnswers[currentQuestion.id] = textInput.trim()
    setAnswers(newAnswers)
    setTextInput('')
    advanceStep(newAnswers)
  }

  const advanceStep = (currentAnswers: Record<string, string>) => {
    const nextStep = step + 1
    if (nextStep > questions.length) {
      handleSave(style!, currentAnswers)
    } else {
      setStep(nextStep)
    }
  }

  const handleSave = async (travelStyle: string, profileData: Record<string, string>) => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('profiles')
          .update({ travel_style: travelStyle, profile_data: profileData })
          .eq('id', user.id)
      }
      onSave(travelStyle, profileData)
    } catch (err) {
      console.error('[wayfindr] Profile save failed:', err)
      onSave(travelStyle, profileData)
    } finally {
      setSaving(false)
    }
  }

  const handleBack = () => {
    setTextInput('')
    if (step === 1) {
      setStyle(null)
      setStep(0)
    } else {
      setStep(step - 1)
    }
  }

  const progress = style ? Math.round((step / (questions.length + 1)) * 100) : 0
  const isTextQuestion = currentQuestion?.type === 'text'

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      style={{ background: `${C.dark}CC` }}>
      <div className="max-w-lg w-full rounded-2xl p-6 space-y-5"
        style={{ background: C.sand, boxShadow: '0 24px 64px rgba(26,18,8,0.35)' }}>

        {/* Progress bar */}
        {style && questions.length > 0 && (
          <div className="w-full rounded-full h-1" style={{ background: `${C.dark}15` }}>
            <div
              className="h-1 rounded-full transition-all duration-300"
              style={{ width: `${progress}%`, background: C.terra }}
            />
          </div>
        )}

        {saving ? (
          <div className="text-center py-8 text-sm" style={{ color: C.dark, opacity: 0.5 }}>
            Saving your profile…
          </div>

        ) : step === 0 ? (
          <>
            <div className="space-y-1">
              <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-playfair)', color: C.dark }}>
                What kind of traveller are you?
              </h2>
              <p className="text-sm" style={{ color: C.dark, opacity: 0.55 }}>
                This tailors every recommendation to your situation.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TRAVEL_STYLES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleStyleSelect(s.id)}
                  className="text-left rounded-xl p-3 transition-all hover:scale-[1.02]"
                  style={{
                    background: 'white',
                    border: `1.5px solid ${C.saffron}33`,
                    boxShadow: '0 1px 3px rgba(26,18,8,0.06)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = C.terra)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = `${C.saffron}33`)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{s.icon}</span>
                    <span className="font-medium text-sm" style={{ color: C.dark }}>{s.label}</span>
                  </div>
                  <p className="text-xs leading-snug" style={{ color: C.dark, opacity: 0.5 }}>{s.desc}</p>
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <button onClick={onSkip} className="text-sm transition-opacity hover:opacity-70"
                style={{ color: C.dark, opacity: 0.45 }}>
                Skip for now
              </button>
            </div>
          </>

        ) : currentQuestion ? (
          <>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide font-medium" style={{ color: C.terra }}>
                Question {step} of {questions.length}
              </p>
              <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-playfair)', color: C.dark }}>
                {currentQuestion.question}
              </h2>
            </div>

            {isTextQuestion ? (
              <div className="space-y-3">
                <textarea
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  placeholder={currentQuestion.placeholder}
                  rows={3}
                  className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none transition-all"
                  style={{
                    background: 'white',
                    border: `1.5px solid ${C.saffron}44`,
                    color: C.dark,
                  }}
                  onFocus={e => e.target.style.borderColor = C.terra}
                  onBlur={e => e.target.style.borderColor = `${C.saffron}44`}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleTextAnswer() } }}
                />
                <button
                  onClick={handleTextAnswer}
                  className="w-full text-sm font-semibold py-3 rounded-xl transition-opacity hover:opacity-90"
                  style={{ background: C.terra, color: C.sand }}
                >
                  {textInput.trim() ? 'Save & finish' : 'Skip & finish'}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {currentQuestion.options?.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleOptionAnswer(currentQuestion.id, opt.id)}
                    className="w-full text-left rounded-xl px-4 py-3 transition-all"
                    style={{
                      background: 'white',
                      border: `1.5px solid ${C.saffron}33`,
                      boxShadow: '0 1px 3px rgba(26,18,8,0.06)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = C.terra)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = `${C.saffron}33`)}
                  >
                    <span className="font-medium text-sm" style={{ color: C.dark }}>{opt.label}</span>
                    {opt.desc && <p className="text-xs mt-0.5" style={{ color: C.dark, opacity: 0.5 }}>{opt.desc}</p>}
                  </button>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center pt-1">
              <button onClick={handleBack} className="text-sm transition-opacity hover:opacity-70"
                style={{ color: C.dark, opacity: 0.5 }}>
                ← Back
              </button>
              {!isTextQuestion && (
                <button onClick={onSkip} className="text-sm transition-opacity hover:opacity-70"
                  style={{ color: C.dark, opacity: 0.45 }}>
                  Skip
                </button>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
