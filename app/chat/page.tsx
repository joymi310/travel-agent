'use client'

import { useChat } from 'ai/react'
import { useEffect, useState } from 'react'
import { ChatMessages } from '@/components/ChatMessages'
import { ChatInput } from '@/components/ChatInput'
import { ProfileWizard } from '@/components/ProfileWizard'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'

const STYLE_LABELS: Record<string, string> = {
  backpacker: '🎒 Backpacker',
  family_young_kids: '🧸 Family (young kids)',
  family_teens: '🏄 Family (teens)',
  senior: '🌿 Senior',
  off_beaten_track: '🗺️ Off the beaten track',
  other: '✈️ Other',
}

export default function ChatPage() {
  const { messages, input, setInput, handleSubmit, isLoading, append, error } = useChat({
    api: '/api/chat',
  })
  const [user, setUser] = useState<User | null>(null)
  const [travelStyle, setTravelStyle] = useState<string | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data.user
      setUser(u)
      if (u) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('travel_style')
          .eq('id', u.id)
          .single()
        const style = profile?.travel_style ?? null
        setTravelStyle(style)
        if (!style) setShowPicker(true)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setTravelStyle(null)
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white">
      {showPicker && user && (
        <ProfileWizard
          onSave={(style) => {
            setTravelStyle(style)
            setShowPicker(false)
            append({ role: 'user', content: '__profile_complete__' })
          }}
          onSkip={() => setShowPicker(false)}
        />
      )}

      {/* Header */}
      <header className="border-b border-slate-800 px-4 py-3 flex items-center gap-3 shrink-0">
        <Link href="/" className="text-slate-400 hover:text-white transition-colors text-sm">
          ← Back
        </Link>
        <div className="w-px h-4 bg-slate-700" />
        <div className="flex items-center gap-2 flex-1">
          <div className="w-7 h-7 rounded-full bg-sky-500 flex items-center justify-center text-xs font-bold">
            TA
          </div>
          <span className="font-medium text-sm">Travel Agent</span>
          {travelStyle && (
            <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full hidden sm:block">
              {STYLE_LABELS[travelStyle] ?? travelStyle}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              {travelStyle && (
                <button
                  onClick={() => setShowPicker(true)}
                  className="text-slate-400 hover:text-white transition-colors"
                  title="Change travel style"
                >
                  Change style
                </button>
              )}
              <button onClick={handleSignOut} className="text-slate-400 hover:text-white transition-colors">
                Sign out
              </button>
            </>
          ) : (
            <Link href="/login" className="text-sky-400 hover:text-sky-300 transition-colors">
              Sign in to save chats
            </Link>
          )}
        </div>
      </header>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-600 text-sm">Ask me anything about your next trip.</p>
          </div>
        ) : (
          <ChatMessages messages={messages} isLoading={isLoading} />
        )}
      </div>

      {/* Rate limit error */}
      {error && (
        <div className="bg-red-900/40 border-t border-red-800 px-4 py-2 text-center text-red-300 text-sm shrink-0">
          {error.message.includes('limit') ? 'Daily message limit reached. Please try again tomorrow.' : 'Something went wrong. Please try again.'}
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-slate-800 p-4 shrink-0">
        <ChatInput
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
        />
        <p className="text-center text-slate-600 text-xs mt-2">
          Planning only — no bookings made
        </p>
      </div>
    </div>
  )
}
