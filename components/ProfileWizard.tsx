'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PROFILE_TREE } from '@/lib/profile-tree'

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
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('profiles')
        .update({ travel_style: travelStyle, profile_data: profileData })
        .eq('id', user.id)
    }
    onSave(travelStyle, profileData)
    setSaving(false)
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
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5">

        {style && questions.length > 0 && (
          <div className="w-full bg-slate-800 rounded-full h-1">
            <div
              className="bg-sky-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {saving ? (
          <div className="text-center py-8 text-slate-400 text-sm">Saving your profile…</div>

        ) : step === 0 ? (
          <>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">What kind of traveller are you?</h2>
              <p className="text-slate-400 text-sm">This tailors every recommendation to your situation.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TRAVEL_STYLES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleStyleSelect(s.id)}
                  className="text-left rounded-xl border border-slate-700 hover:border-sky-500 hover:bg-sky-500/10 bg-slate-800/50 p-3 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{s.icon}</span>
                    <span className="font-medium text-sm">{s.label}</span>
                  </div>
                  <p className="text-slate-400 text-xs leading-snug">{s.desc}</p>
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <button onClick={onSkip} className="text-slate-400 hover:text-white text-sm transition-colors">
                Skip for now
              </button>
            </div>
          </>

        ) : currentQuestion ? (
          <>
            <div className="space-y-1">
              <p className="text-xs text-slate-500 uppercase tracking-wide">
                Question {step} of {questions.length}
              </p>
              <h2 className="text-lg font-semibold">{currentQuestion.question}</h2>
            </div>

            {isTextQuestion ? (
              <div className="space-y-3">
                <textarea
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  placeholder={currentQuestion.placeholder}
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 resize-none focus:outline-none focus:border-sky-500 transition-colors"
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleTextAnswer() } }}
                />
                <button
                  onClick={handleTextAnswer}
                  className="w-full bg-sky-500 hover:bg-sky-400 text-white text-sm font-medium py-3 rounded-xl transition-colors"
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
                    className="w-full text-left rounded-xl border border-slate-700 hover:border-sky-500 hover:bg-sky-500/10 bg-slate-800/50 px-4 py-3 transition-colors"
                  >
                    <span className="font-medium text-sm">{opt.label}</span>
                    {opt.desc && <p className="text-slate-400 text-xs mt-0.5">{opt.desc}</p>}
                  </button>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center pt-1">
              <button onClick={handleBack} className="text-slate-400 hover:text-white text-sm transition-colors">
                ← Back
              </button>
              {!isTextQuestion && (
                <button onClick={onSkip} className="text-slate-400 hover:text-white text-sm transition-colors">
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
