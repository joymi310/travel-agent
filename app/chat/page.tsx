'use client'

import { useChat } from 'ai/react'
import { useEffect, useState } from 'react'
import { ChatMessages } from '@/components/ChatMessages'
import { ChatInput } from '@/components/ChatInput'
import { ProfileWizard } from '@/components/ProfileWizard'
import { ItineraryPanel, type Itinerary } from '@/components/ItineraryPanel'
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


function formatItineraryAsMarkdown(itinerary: {
  destination: string; duration: string; tagline: string;
  days: Array<{ day: number; title: string; highlights: string[]; accommodation: string; meals: string[]; transport: string; estimatedCost: string }>
}): string {
  const lines: string[] = [
    `# ${itinerary.destination} — ${itinerary.duration}`,
    `*${itinerary.tagline}*`,
    '',
  ]
  for (const d of itinerary.days) {
    lines.push(`## Day ${d.day} — ${d.title}`)
    lines.push('')
    lines.push('**Highlights**')
    for (const h of d.highlights) lines.push(`- ${h}`)
    lines.push('')
    lines.push(`**Stay:** ${d.accommodation}`)
    lines.push(`**Meals:** ${d.meals.join(' · ')}`)
    lines.push(`**Transport:** ${d.transport}`)
    lines.push(`**Est. cost:** ${d.estimatedCost}`)
    lines.push('')
  }
  return lines.join('\n')
}

function getPendingItinerary(): Itinerary | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('wandr_pending_trip')
    if (!raw) return null
    const { itinerary } = JSON.parse(raw)
    return itinerary ?? null
  } catch { return null }
}

function getPendingInitialMessages() {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem('wandr_pending_trip')
    if (!raw) return []
    const { itinerary } = JSON.parse(raw)
    return [{
      id: 'pending-itinerary',
      role: 'assistant' as const,
      content: `Here's your **${itinerary.duration}** itinerary for **${itinerary.destination}**! It's shown on the right.\n\nAsk me to adjust any day, swap accommodation, change the pace, add activities — anything you like.`,
    }]
  } catch { return [] }
}

export default function ChatPage() {
  const [itinerary] = useState<Itinerary | null>(() => getPendingItinerary())
  const [initialMessages] = useState(() => getPendingInitialMessages())
  const { messages, input, setInput, handleSubmit, isLoading, append, error } = useChat({
    api: '/api/chat',
    initialMessages,
    body: { itinerary },
  })
  const [user, setUser] = useState<User | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [mobileTab, setMobileTab] = useState<'chat' | 'itinerary'>('chat')
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
        if (!style) setShowPicker(true)

        // Save pending trip from wizard flow
        try {
          const raw = localStorage.getItem('wandr_pending_trip')
          if (raw) {
            const { wizardAnswers, itinerary: pendingItinerary } = JSON.parse(raw)
            console.log('[wandr] Saving pending trip for user', u.id, 'destination:', wizardAnswers.destination)
            const { data: conv, error: convErr } = await supabase
              .from('conversations')
              .insert({ user_id: u.id, title: wizardAnswers.destination })
              .select('id')
              .single()
            console.log('[wandr] Conversation insert:', conv?.id, convErr?.message)
            if (conv?.id) {
              const { error: msgErr } = await supabase.from('messages').insert({
                conversation_id: conv.id,
                role: 'assistant',
                content: formatItineraryAsMarkdown(pendingItinerary),
              })
              console.log('[wandr] Message insert error:', msgErr?.message)
            }
            localStorage.removeItem('wandr_pending_trip')
            console.log('[wandr] Pending trip cleared from localStorage')
          }
        } catch (err) { console.error('[wandr] Pending trip save failed:', err) }
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
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: C.sand }}>
      {showPicker && user && (
        <ProfileWizard
          onSave={() => {
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
        </div>
        <div className="flex items-center gap-3 text-sm">
          {user ? (
            <>
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

      {/* Mobile tab bar — only shown when an itinerary is present */}
      {itinerary && (
        <div className="lg:hidden flex border-b shrink-0" style={{ borderColor: `${C.dark}15`, background: C.sand }}>
          {(['chat', 'itinerary'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setMobileTab(tab)}
              className="flex-1 py-2.5 text-sm font-medium capitalize transition-colors"
              style={{
                color: mobileTab === tab ? C.terra : `${C.dark}60`,
                borderBottom: mobileTab === tab ? `2px solid ${C.terra}` : '2px solid transparent',
              }}
            >
              {tab === 'chat' ? 'Chat' : 'Itinerary'}
            </button>
          ))}
        </div>
      )}

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left — Chat */}
        <div
          className={`flex flex-col overflow-hidden ${itinerary ? 'lg:w-[45%] lg:border-r' : 'w-full'} ${itinerary && mobileTab !== 'chat' ? 'hidden lg:flex' : 'flex'}`}
          style={{ borderColor: `${C.dark}10` }}
        >
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

          {error && (
            <div className="px-4 py-2 text-center text-sm shrink-0 border-t"
              style={{ background: `${C.terra}15`, color: C.terra, borderColor: `${C.terra}30` }}>
              {error.message.includes('limit') ? 'Daily message limit reached. Please try again tomorrow.' : 'Something went wrong. Please try again.'}
            </div>
          )}

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

        {/* Right — Itinerary panel */}
        {itinerary && (
          <div
            className={`flex-1 overflow-hidden ${mobileTab !== 'itinerary' ? 'hidden lg:block' : 'block'}`}
          >
            <ItineraryPanel itinerary={itinerary} />
          </div>
        )}

      </div>
    </div>
  )
}
