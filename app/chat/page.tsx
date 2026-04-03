'use client'

import { useChat } from 'ai/react'
import { useEffect, useState } from 'react'
import { ChatMessages } from '@/components/ChatMessages'
import { ChatInput } from '@/components/ChatInput'
import { ProfileWizard } from '@/components/ProfileWizard'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'

const C = {
  sand: '#F5ECD7',
  terra: '#C94A2B',
  saffron: '#E8850A',
  jade: '#2A7A5B',
  dark: '#1A1208',
}

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
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setTravelStyle(null)
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: C.sand }}>
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
      <header className="border-b px-4 py-3 flex items-center gap-3 shrink-0"
        style={{ background: C.dark, borderColor: `${C.sand}15` }}>
        <Link href="/" className="text-sm transition-opacity hover:opacity-70"
          style={{ color: C.sand, opacity: 0.6 }}>
          ← Back
        </Link>
        <div className="w-px h-4" style={{ background: `${C.sand}20` }} />
        <div className="flex items-center gap-2 flex-1">
          <Link href="/" className="text-lg font-bold" style={{ fontFamily: 'var(--font-playfair)', color: C.terra }}>
            wandr.
          </Link>
          {travelStyle && (
            <span className="text-xs px-2 py-0.5 rounded-full hidden sm:block"
              style={{ background: `${C.sand}12`, color: C.sand, border: `1px solid ${C.sand}20` }}>
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
                  className="transition-opacity hover:opacity-70"
                  style={{ color: C.saffron }}
                >
                  Change style
                </button>
              )}
              <button onClick={handleSignOut} className="transition-opacity hover:opacity-70"
                style={{ color: C.sand, opacity: 0.6 }}>
                Sign out
              </button>
            </>
          ) : (
            <Link href="/login" className="font-medium transition-opacity hover:opacity-70"
              style={{ color: C.saffron }}>
              Sign in to save chats
            </Link>
          )}
        </div>
      </header>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <p className="text-2xl" style={{ fontFamily: 'var(--font-playfair)', color: C.dark, opacity: 0.3 }}>
                Where to next?
              </p>
              <p className="text-sm" style={{ color: C.dark, opacity: 0.4 }}>
                Ask me anything about your next adventure.
              </p>
            </div>
          </div>
        ) : (
          <ChatMessages messages={messages} isLoading={isLoading} />
        )}
      </div>

      {/* Rate limit error */}
      {error && (
        <div className="px-4 py-2 text-center text-sm shrink-0 border-t"
          style={{ background: `${C.terra}15`, color: C.terra, borderColor: `${C.terra}30` }}>
          {error.message.includes('limit') ? 'Daily message limit reached. Please try again tomorrow.' : 'Something went wrong. Please try again.'}
        </div>
      )}

      {/* Input area */}
      <div className="border-t p-4 shrink-0" style={{ borderColor: `${C.dark}15`, background: C.sand }}>
        <ChatInput
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
        />
        <p className="text-center text-xs mt-2" style={{ color: C.dark, opacity: 0.35 }}>
          Planning only — no bookings made
        </p>
      </div>
    </div>
  )
}
