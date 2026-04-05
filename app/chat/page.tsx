'use client'

import { useChat } from 'ai/react'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
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

interface SavedConversation {
  id: string
  title: string
  created_at: string
}

export default function ChatPage() {
  const [itinerary, setItinerary] = useState<Itinerary | null>(() => getPendingItinerary())
  const [initialMessages] = useState(() => getPendingInitialMessages())
  const [conversationId, setConversationId] = useState<string | null>(null)
  const { messages, input, setInput, handleSubmit, isLoading, error, setMessages } = useChat({
    api: '/api/chat',
    initialMessages,
    body: { itinerary, conversationId },
  })
  const [user, setUser] = useState<User | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [mobileTab, setMobileTab] = useState<'chat' | 'itinerary'>('chat')
  const [showMyTrips, setShowMyTrips] = useState(false)
  const [savedConversations, setSavedConversations] = useState<SavedConversation[]>([])
  const myTripsRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const router = useRouter()

  // Parse itinerary updates — scan from most recent message backwards
  useEffect(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i]
      if (m.role !== 'assistant') continue
      const match = m.content.match(/<itinerary_update>([\s\S]*?)<\/itinerary_update>/)
      if (!match) continue
      try {
        setItinerary(JSON.parse(match[1].trim()))
      } catch {
        console.error('[wandr] Failed to parse itinerary update')
      }
      return
    }
  }, [messages])

  // Persist itinerary to DB whenever it changes
  useEffect(() => {
    if (!itinerary || !conversationId) return
    supabase
      .from('conversations')
      .update({ itinerary })
      .eq('id', conversationId)
      .then(() => {})
  }, [itinerary, conversationId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Close My Trips panel when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (myTripsRef.current && !myTripsRef.current.contains(e.target as Node)) {
        setShowMyTrips(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadSavedConversations = async (userId: string) => {
    const { data } = await supabase
      .from('conversations')
      .select('id, title, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (data) setSavedConversations(data)
  }

  const loadConversation = async (convId: string) => {
    const { data: conv } = await supabase
      .from('conversations')
      .select('id, itinerary')
      .eq('id', convId)
      .single()
    if (!conv) return
    setConversationId(conv.id)
    if (conv.itinerary) setItinerary(conv.itinerary)

    const { data: msgs } = await supabase
      .from('messages')
      .select('id, role, content')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })

    if (msgs && msgs.length > 0) {
      setMessages(msgs.map(m => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })))
    } else {
      setMessages([])
    }
    setShowMyTrips(false)
  }

  const deleteConversation = async (convId: string) => {
    await supabase.from('conversations').delete().eq('id', convId)
    setSavedConversations(prev => prev.filter(c => c.id !== convId))
    if (convId === conversationId) {
      setMessages([])
      setConversationId(null)
      setItinerary(null)
    }
  }

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
        const raw = localStorage.getItem('wandr_pending_trip')
        if (raw) {
          try {
            const { wizardAnswers, itinerary: pendingItinerary } = JSON.parse(raw)
            const { data: conv } = await supabase
              .from('conversations')
              .insert({ user_id: u.id, title: wizardAnswers.destination, itinerary: pendingItinerary })
              .select('id')
              .single()
            if (conv?.id) {
              setConversationId(conv.id)
              await supabase.from('messages').insert({
                conversation_id: conv.id,
                role: 'assistant',
                content: formatItineraryAsMarkdown(pendingItinerary),
              })
            }
            localStorage.removeItem('wandr_pending_trip')
          } catch (err) { console.error('[wandr] Pending trip save failed:', err) }
        } else {
          // No pending trip — restore most recent conversation
          const { data: conv } = await supabase
            .from('conversations')
            .select('id, itinerary')
            .eq('user_id', u.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          if (conv?.id) {
            setConversationId(conv.id)
            if (conv.itinerary) setItinerary(conv.itinerary)

            const { data: msgs } = await supabase
              .from('messages')
              .select('id, role, content')
              .eq('conversation_id', conv.id)
              .order('created_at', { ascending: true })

            if (msgs && msgs.length > 0) {
              setMessages(msgs.map(m => ({
                id: m.id,
                role: m.role as 'user' | 'assistant',
                content: m.content,
              })))
            }
          }
        }

        // Load all saved conversations for My Trips panel
        await loadSavedConversations(u.id)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [supabase]) // eslint-disable-line react-hooks/exhaustive-deps

  const startNewTrip = () => {
    setMessages([])
    setConversationId(null)
    setItinerary(null)
    setShowPicker(true)
  }

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
            router.push('/?wizard=1')
          }}
          onSkip={() => setShowPicker(false)}
        />
      )}

      {/* Header */}
      <header className="border-b px-4 py-3 flex items-center gap-3 shrink-0"
        style={{ background: C.dark, borderColor: `${C.sand}15` }}>
        <Link href="/" className="text-sm transition-opacity hover:opacity-70"
          aria-label="Back to home"
          style={{ color: C.sand, opacity: 0.6 }}>
          ← Back
        </Link>
        <div className="w-px h-4" style={{ background: `${C.sand}20` }} aria-hidden="true" />
        <div className="flex items-center gap-2 flex-1">
          <Link href="/" className="text-lg font-bold" style={{ fontFamily: 'var(--font-playfair)', color: C.terra }}
            aria-label="Wandr home">
            wandr.
          </Link>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              {messages.length > 0 && (
                <button onClick={startNewTrip}
                  className="text-sm font-medium px-3 py-1.5 rounded-full transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{ background: C.terra, color: C.sand, outlineColor: C.saffron }}>
                  + New trip
                </button>
              )}

              {/* My Trips */}
              <div className="relative" ref={myTripsRef}>
                <button
                  onClick={() => setShowMyTrips(v => !v)}
                  aria-expanded={showMyTrips}
                  aria-haspopup="true"
                  aria-controls="my-trips-panel"
                  className="text-sm font-medium transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 px-3 py-1.5 rounded-full border"
                  style={{ color: C.sand, borderColor: `${C.sand}40`, outlineColor: C.saffron }}>
                  My trips
                </button>

                {showMyTrips && (
                  <div
                    id="my-trips-panel"
                    role="dialog"
                    aria-label="My saved trips"
                    className="absolute top-full right-0 mt-2 w-72 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    style={{ background: C.sand, border: `1px solid ${C.dark}20` }}
                  >
                    <div className="px-4 py-3 border-b flex items-center justify-between"
                      style={{ borderColor: `${C.dark}10` }}>
                      <h2 className="font-semibold text-sm" style={{ color: C.dark }}>My trips</h2>
                      <button
                        onClick={() => setShowMyTrips(false)}
                        aria-label="Close my trips"
                        className="text-lg leading-none transition-opacity hover:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                        style={{ color: C.dark, outlineColor: C.terra }}>
                        ×
                      </button>
                    </div>

                    {savedConversations.length === 0 ? (
                      <p className="px-4 py-6 text-sm text-center" style={{ color: C.dark, opacity: 0.45 }}>
                        No saved trips yet.
                      </p>
                    ) : (
                      <ul role="list" className="max-h-72 overflow-y-auto divide-y"
                        style={{ borderColor: `${C.dark}08` }}>
                        {savedConversations.map(conv => (
                          <li key={conv.id} className="flex items-center gap-2 px-4 py-3 hover:bg-white transition-colors">
                            <button
                              onClick={() => loadConversation(conv.id)}
                              className="flex-1 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 rounded"
                              style={{ outlineColor: C.terra }}
                              aria-label={`Open trip: ${conv.title}`}>
                              <span className="block text-sm font-medium" style={{ color: C.dark }}>
                                {conv.title}
                              </span>
                              <span className="block text-xs" style={{ color: C.dark, opacity: 0.4 }}>
                                {new Date(conv.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </button>
                            <button
                              onClick={() => deleteConversation(conv.id)}
                              aria-label={`Delete trip to ${conv.title}`}
                              className="text-xs px-2 py-1 rounded-full transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 shrink-0"
                              style={{ color: C.terra, outlineColor: C.terra }}>
                              ✕
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              <button onClick={handleSignOut}
                className="transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 rounded"
                style={{ color: C.sand, opacity: 0.6, outlineColor: C.saffron }}>
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
        <div className="lg:hidden flex border-b shrink-0" style={{ borderColor: `${C.dark}15`, background: C.sand }}
          role="tablist" aria-label="View">
          {(['chat', 'itinerary'] as const).map(tab => (
            <button
              key={tab}
              role="tab"
              onClick={() => setMobileTab(tab)}
              aria-selected={mobileTab === tab}
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
          className={`flex flex-col overflow-hidden ${itinerary ? 'lg:w-[40%] lg:border-r' : 'w-full'} ${itinerary && mobileTab !== 'chat' ? 'hidden lg:flex' : 'flex'}`}
          style={{ borderColor: `${C.dark}10` }}
          role="main"
        >
          <div className="flex-1 overflow-y-auto" aria-live="polite" aria-label="Chat messages">
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
              <ChatMessages
                messages={messages.map(m => ({
                  ...m,
                  content: m.role === 'assistant'
                    ? m.content.replace(/<itinerary_update>[\s\S]*?<\/itinerary_update>/g, '').trim()
                    : m.content,
                }))}
                isLoading={isLoading}
              />
            )}
          </div>

          {error && (
            <div
              role="alert"
              className="px-4 py-2 text-center text-sm shrink-0 border-t"
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
            role="complementary"
            aria-label="Itinerary"
          >
            <ItineraryPanel itinerary={itinerary} />
          </div>
        )}

      </div>
    </div>
  )
}
