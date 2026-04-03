'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const TRAVEL_STYLES = [
  {
    id: 'backpacker',
    label: 'Backpacker',
    desc: 'Budget-conscious, hostels, flexibility, off-the-beaten-path',
    icon: '🎒',
  },
  {
    id: 'family_young_kids',
    label: 'Family with young kids',
    desc: 'Toddlers and under-5s — pacing, naps, kid-friendly everything',
    icon: '🧸',
  },
  {
    id: 'family_teens',
    label: 'Family with teens',
    desc: 'Older kids who want adventure, not just museums',
    icon: '🏄',
  },
  {
    id: 'senior',
    label: 'Senior travel',
    desc: 'Comfort, accessibility, slower pace, premium experiences',
    icon: '🌿',
  },
  {
    id: 'off_beaten_track',
    label: 'Off the beaten track',
    desc: 'Avoiding crowds, unusual destinations, genuine experiences',
    icon: '🗺️',
  },
  {
    id: 'other',
    label: 'Something else',
    desc: 'Tell the agent your style in the chat',
    icon: '✈️',
  },
]

interface TravelStylePickerProps {
  onSave: (style: string) => void
  onSkip: () => void
}

export function TravelStylePicker({ onSave, onSkip }: TravelStylePickerProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const handleSave = async () => {
    if (!selected) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('profiles')
        .update({ travel_style: selected })
        .eq('id', user.id)
    }
    onSave(selected)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">What kind of traveller are you?</h2>
          <p className="text-slate-400 text-sm">This helps tailor recommendations to your situation.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {TRAVEL_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => setSelected(style.id)}
              className={`text-left rounded-xl border p-3 transition-colors ${
                selected === style.id
                  ? 'border-sky-500 bg-sky-500/10'
                  : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{style.icon}</span>
                <span className="font-medium text-sm">{style.label}</span>
              </div>
              <p className="text-slate-400 text-xs leading-snug">{style.desc}</p>
            </button>
          ))}
        </div>

        <div className="flex gap-3 justify-end pt-1">
          <button
            onClick={onSkip}
            className="text-slate-400 hover:text-white text-sm transition-colors"
          >
            Skip for now
          </button>
          <button
            onClick={handleSave}
            disabled={!selected || saving}
            className="bg-sky-500 hover:bg-sky-400 disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {saving ? 'Saving…' : 'Save & start planning'}
          </button>
        </div>
      </div>
    </div>
  )
}
