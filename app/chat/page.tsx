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
import type { WizardAnswers } from '@/components/TripWizard'

const C = {
  sand: '#F5ECD7',
  terra: '#C94A2B',
  saffron: '#E8850A',
  jade: '#2A7A5B',
  dark: '#1A1208',
}

const GUEST_LIMIT = 3

function toStr(v: unknown): string {
  if (typeof v === 'string') return v
  if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>
    return typeof o.text === 'string' ? o.text
      : typeof o.name === 'string' ? o.name
      : ''
  }
  return ''
}

function formatItineraryAsMarkdown(itinerary: Itinerary): string {
  const lines: string[] = [
    `# ${itinerary.destination} — ${itinerary.duration}`,
    `*${itinerary.tagline}*`,
    '',
  ]
  for (const d of itinerary.days) {
    lines.push(`## Day ${d.day} — ${d.title}`)
    lines.push('')
    lines.push('**Highlights**')
    for (const h of d.highlights) lines.push(`- ${toStr(h)}`)
    lines.push('')
    lines.push(`**Stay:** ${toStr(d.accommodation)}`)
    lines.push(`**Meals:** ${d.meals.map(toStr).join(' · ')}`)
    lines.push(`**Transport:** ${d.transport}`)
    lines.push(`**Est. cost:** ${d.estimatedCost}`)
    lines.push('')
  }
  return lines.join('\n')
}

function getPendingItinerary(): Itinerary | null {
  if (typeof window === 'undefined') return null
  try {
    // New generation about to start — don't load old trip
    if (localStorage.getItem('wandr_generating')) return null
    const raw = localStorage.getItem('wandr_pending_trip')
    if (!raw) return null
    const { itinerary } = JSON.parse(raw)
    return itinerary ?? null
  } catch { return null }
}

function getPendingInitialMessages() {
  if (typeof window === 'undefined') return []
  try {
    // New generation about to start — don't load old messages
    if (localStorage.getItem('wandr_generating')) return []
    const raw = localStorage.getItem('wandr_pending_trip')
    if (!raw) return []
    const { itinerary } = JSON.parse(raw)
    const questions: string[] = itinerary.follow_up_questions ?? []
    const followUpBlock = questions.length > 0
      ? `\n\n${questions.map((q: string) => `- ${q}`).join('\n')}`
      : ''
    return [{
      id: 'pending-itinerary',
      role: 'assistant' as const,
      content: `Here's your **${itinerary.duration}** itinerary for **${itinerary.destination}**! It's shown on the left.${followUpBlock}`,
    }]
  } catch { return [] }
}

const STATIC_CHIPS = [
  'Make it more relaxed',
  'Add a foodie focus',
  'Swap a hotel',
  'Add a day trip',
  "What should I pack?",
  'Show me the budget breakdown',
]

interface SavedConversation {
  id: string
  title: string
  created_at: string
  destination?: string
  duration?: string
  tagline?: string
}

export default function ChatPage() {
  const [itinerary, setItinerary] = useState<Itinerary | null>(() => getPendingItinerary())
  const [initialMessages] = useState(() => getPendingInitialMessages())
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [showChips, setShowChips] = useState(false)
  const { messages, input, setInput, handleSubmit, isLoading, error, setMessages, append } = useChat({
    api: '/api/chat',
    initialMessages,
    body: { itinerary, conversationId },
  })
  const [user, setUser] = useState<User | null>(null)
  const [guestCount, setGuestCount] = useState(0)
  const [showPicker, setShowPicker] = useState(false)
  const [mobileTab, setMobileTab] = useState<'chat' | 'itinerary'>('chat')
  const [showMyTrips, setShowMyTrips] = useState(false)
  const [savedConversations, setSavedConversations] = useState<SavedConversation[]>([])
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [authChecked, setAuthChecked] = useState(false)
  const [pendingAnswers] = useState<WizardAnswers | null>(() => {
    if (typeof window === 'undefined') return null
    try {
      const raw = localStorage.getItem('wandr_generating')
      if (!raw) return null
      localStorage.removeItem('wandr_generating')
      return (JSON.parse(raw) as { wizardAnswers: WizardAnswers }).wizardAnswers
    } catch { return null }
  })
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState(false)
  const [pendingTripToSave, setPendingTripToSave] = useState<{ wizardAnswers: WizardAnswers; itinerary: Itinerary } | null>(null)
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
        console.error('[wayfindr] Failed to parse itinerary update')
      }
      return
    }
  }, [messages])

  // Hide chips once user sends their first message
  useEffect(() => {
    if (messages.some(m => m.role === 'user')) setShowChips(false)
  }, [messages])

  const hitGuestLimit = !user && authChecked && guestCount >= GUEST_LIMIT

  const handleChatSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (hitGuestLimit) return
    handleSubmit(e)
    if (!user) setGuestCount(c => c + 1)
  }

  const handleChipClick = (chip: string) => {
    if (hitGuestLimit) return
    setShowChips(false)
    append({ role: 'user', content: chip })
    if (!user) setGuestCount(c => c + 1)
  }

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
      .select('id, title, created_at, itinerary')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (data) setSavedConversations(data.map(c => ({
      id: c.id,
      title: c.title,
      created_at: c.created_at,
      destination: c.itinerary?.destination,
      duration: c.itinerary?.duration,
      tagline: c.itinerary?.tagline,
    })))
  }

  const loadConversation = async (convId: string) => {
    const { data: conv } = await supabase
      .from('conversations')
      .select('id, itinerary')
      .eq('id', convId)
      .single()
    if (!conv) return
    setConversationId(conv.id)
    setItinerary(conv.itinerary ?? null)

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
    setConfirmDeleteId(null)
    if (convId === conversationId) {
      setMessages([])
      setConversationId(null)
      setItinerary(null)
    }
  }

  const renameConversation = async (convId: string, newTitle: string) => {
    const trimmed = newTitle.trim()
    if (!trimmed) return
    await supabase.from('conversations').update({ title: trimmed }).eq('id', convId)
    setSavedConversations(prev => prev.map(c => c.id === convId ? { ...c, title: trimmed } : c))
    setEditingId(null)
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

        if (!pendingAnswers) {
        // Save pending trip from wizard flow
        const raw = localStorage.getItem('wandr_pending_trip')
        // Only show profile picker if no travel style AND no pending trip
        // (users coming from the trip wizard don't need to answer questions again)
        if (!style && !raw) setShowPicker(true)
        if (raw) {
          try {
            const { wizardAnswers, itinerary: pendingItinerary } = JSON.parse(raw)
            // Save exploration style to profile for future trips
            if (wizardAnswers.explorationStyle) {
              supabase.from('profiles')
                .update({ exploration_style: wizardAnswers.explorationStyle })
                .eq('id', u.id)
                .then(() => {})
            }

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
            setShowChips(true)
          } catch (err) { console.error('[wayfindr] Pending trip save failed:', err) }
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
            } else if (conv.itinerary) {
              setShowChips(true)
            }
          }
        }
        } // end if (!pendingAnswers)

        // Load all saved conversations for My Trips panel
        await loadSavedConversations(u.id)
      }
      setAuthChecked(true)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [supabase]) // eslint-disable-line react-hooks/exhaustive-deps

  // Redirect to home only if auth resolved, not generating, no itinerary, and no saved trips
  useEffect(() => {
    if (authChecked && !generating && !pendingAnswers && !itinerary && savedConversations.length === 0) router.replace('/')
  }, [authChecked, generating, pendingAnswers, itinerary, savedConversations, router])

  const startGeneration = async (answers: WizardAnswers) => {
    setGenerating(true)
    setGenError(false)
    try {
      const res = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      })
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
      }
      const match = accumulated.match(/<wandr_data>([\s\S]*?)<\/wandr_data>/)
      if (!match) throw new Error('No itinerary data found in response')
      const parsed: Itinerary = JSON.parse(match[1].trim())
      const questions: string[] = parsed.follow_up_questions ?? []
      const followUpBlock = questions.length > 0
        ? `\n\n${questions.map((q: string) => `- ${q}`).join('\n')}`
        : ''
      setItinerary(parsed)
      setMessages([{
        id: 'pending-itinerary',
        role: 'assistant' as const,
        content: `Here's your **${parsed.duration}** itinerary for **${parsed.destination}**! It's shown on the left.${followUpBlock}`,
      }])
      setShowChips(true)
      localStorage.setItem('wandr_pending_trip', JSON.stringify({ wizardAnswers: answers, itinerary: parsed }))
      setPendingTripToSave({ wizardAnswers: answers, itinerary: parsed })
    } catch (err) {
      console.error('[wayfindr] Generation failed:', err)
      setGenError(true)
    } finally {
      setGenerating(false)
    }
  }

  // Trigger generation on mount if wizard just completed
  useEffect(() => {
    if (pendingAnswers) startGeneration(pendingAnswers)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Save generated trip to DB when user becomes available
  useEffect(() => {
    if (!pendingTripToSave || !user || conversationId) return
    const { wizardAnswers: answers, itinerary: itin } = pendingTripToSave
    setPendingTripToSave(null)
    ;(async () => {
      try {
        if (answers.explorationStyle) {
          supabase.from('profiles')
            .update({ exploration_style: answers.explorationStyle })
            .eq('id', user.id)
            .then(() => {})
        }
        const { data: conv } = await supabase
          .from('conversations')
          .insert({ user_id: user.id, title: answers.destination, itinerary: itin })
          .select('id')
          .single()
        if (conv?.id) {
          setConversationId(conv.id)
          await supabase.from('messages').insert({
            conversation_id: conv.id,
            role: 'assistant',
            content: formatItineraryAsMarkdown(itin),
          })
        }
        localStorage.removeItem('wandr_pending_trip')
      } catch (err) {
        console.error('[wayfindr] Failed to save generated trip to DB:', err)
      }
    })()
  }, [pendingTripToSave, user, conversationId]) // eslint-disable-line react-hooks/exhaustive-deps

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
    <div className="flex flex-col h-[100dvh]" style={{ background: C.sand }}>
      {showPicker && user && (
        <ProfileWizard
          onSave={() => {
            setShowPicker(false)
            if (!itinerary) router.push('/?wizard=1')
          }}
          onSkip={() => setShowPicker(false)}
        />
      )}

      {/* Header */}
      <header className="border-b px-4 py-3 flex items-center gap-3 shrink-0"
        style={{ background: C.dark, borderColor: `${C.sand}15`, paddingTop: 'calc(0.75rem + env(safe-area-inset-top))' }}>
        <Link href="/" className="text-sm transition-opacity hover:opacity-70"
          aria-label="Back to home"
          style={{ color: C.sand, opacity: 0.6 }}>
          ← Back
        </Link>
        <div className="w-px h-4" style={{ background: `${C.sand}20` }} aria-hidden="true" />
        <div className="flex items-center gap-2 flex-1">
          <Link href="/" className="text-lg font-bold" style={{ fontFamily: 'var(--font-playfair)', color: C.terra }}
            aria-label="Wayfindr home">
            wayfindr.
          </Link>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              {messages.length > 0 && (
                <button onClick={startNewTrip}
                  className="text-sm font-medium px-3 py-1.5 rounded-full transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{ background: C.terra, color: C.sand, outlineColor: C.saffron }}>
                  <span className="sm:hidden">+ New</span>
                  <span className="hidden sm:inline">+ New trip</span>
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
                      <ul role="list" className="max-h-96 overflow-y-auto divide-y"
                        style={{ borderColor: `${C.dark}08` }}>
                        {savedConversations.map(conv => (
                          <li key={conv.id} className="px-4 py-3 hover:bg-white transition-colors"
                            style={{ background: confirmDeleteId === conv.id ? '#fff5f3' : undefined }}>

                            {confirmDeleteId === conv.id ? (
                              /* Delete confirmation */
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-xs" style={{ color: C.dark, opacity: 0.7 }}>Delete this trip?</p>
                                <div className="flex gap-2 shrink-0">
                                  <button
                                    onClick={() => deleteConversation(conv.id)}
                                    className="text-xs px-2.5 py-1 rounded-full font-medium"
                                    style={{ background: C.terra, color: C.sand }}>
                                    Delete
                                  </button>
                                  <button
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="text-xs px-2.5 py-1 rounded-full border"
                                    style={{ borderColor: `${C.dark}20`, color: C.dark }}>
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : editingId === conv.id ? (
                              /* Inline rename */
                              <input
                                autoFocus
                                value={editTitle}
                                onChange={e => setEditTitle(e.target.value)}
                                onBlur={() => renameConversation(conv.id, editTitle)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') renameConversation(conv.id, editTitle)
                                  if (e.key === 'Escape') setEditingId(null)
                                }}
                                className="w-full text-sm rounded-lg px-2 py-1 outline-none"
                                style={{ border: `1.5px solid ${C.terra}`, color: C.dark, background: 'white' }}
                              />
                            ) : (
                              /* Normal view */
                              <div className="flex items-start gap-2">
                                {/* Avatar */}
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                                  style={{ background: `${C.terra}18`, color: C.terra, fontFamily: 'var(--font-playfair)' }}>
                                  {(conv.destination ?? conv.title).charAt(0).toUpperCase()}
                                </div>

                                <button
                                  onClick={() => loadConversation(conv.id)}
                                  className="flex-1 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 rounded min-w-0"
                                  style={{ outlineColor: C.terra }}
                                  aria-label={`Open trip: ${conv.title}`}>
                                  <span className="block text-sm font-medium truncate" style={{ color: C.dark }}>
                                    {conv.title}
                                  </span>
                                  {conv.tagline && (
                                    <span className="block text-xs truncate italic" style={{ color: C.dark, opacity: 0.5 }}>
                                      {conv.tagline}
                                    </span>
                                  )}
                                  <span className="block text-xs mt-0.5" style={{ color: C.dark, opacity: 0.35 }}>
                                    {conv.duration && `${conv.duration} · `}
                                    {new Date(conv.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </span>
                                </button>

                                <div className="flex flex-col gap-1 shrink-0">
                                  <button
                                    onClick={() => { setEditingId(conv.id); setEditTitle(conv.title) }}
                                    aria-label="Rename trip"
                                    className="text-xs transition-opacity hover:opacity-80"
                                    style={{ color: C.dark, opacity: 0.3 }}>
                                    ✎
                                  </button>
                                  <button
                                    onClick={() => setConfirmDeleteId(conv.id)}
                                    aria-label="Delete trip"
                                    className="text-xs transition-opacity hover:opacity-80"
                                    style={{ color: C.terra, opacity: 0.5 }}>
                                    ✕
                                  </button>
                                </div>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              <button onClick={handleSignOut}
                className="transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 rounded"
                aria-label="Sign out"
                style={{ color: C.sand, opacity: 0.6, outlineColor: C.saffron }}>
                <span className="hidden sm:inline">Sign out</span>
                <svg className="sm:hidden" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
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

      {/* Generating progress bar */}
      {generating && (
        <div className="shrink-0 h-1 w-full overflow-hidden" style={{ background: `${C.terra}20` }} aria-hidden="true">
          <div
            className="h-full animate-generating"
            style={{ background: C.terra, width: '40%' }}
          />
        </div>
      )}

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left — Generating skeleton */}
        {generating && !itinerary && (
          <div
            className="flex-1 overflow-hidden border-r hidden lg:flex flex-col p-8 gap-5"
            style={{ borderColor: `${C.dark}10` }}
            aria-label="Generating itinerary"
            aria-busy="true"
          >
            <div className="animate-pulse space-y-3">
              <div className="h-7 rounded-xl w-3/4" style={{ background: `${C.dark}12` }} />
              <div className="h-4 rounded-lg w-1/2" style={{ background: `${C.dark}08` }} />
            </div>
            {[0, 1, 2].map(i => (
              <div key={i} className="animate-pulse space-y-2 pt-5 border-t" style={{ borderColor: `${C.dark}08` }}>
                <div className="h-5 rounded-lg w-2/5" style={{ background: `${C.dark}10` }} />
                <div className="h-3 rounded w-full" style={{ background: `${C.dark}07` }} />
                <div className="h-3 rounded w-5/6" style={{ background: `${C.dark}07` }} />
                <div className="h-3 rounded w-4/6" style={{ background: `${C.dark}07` }} />
              </div>
            ))}
            <p className="text-sm mt-auto text-center" style={{ color: `${C.dark}40` }}>
              Building your itinerary…
            </p>
          </div>
        )}

        {/* Left — Itinerary panel */}
        {itinerary && (
          <div
            className={`flex-1 overflow-hidden border-r flex flex-col ${mobileTab !== 'itinerary' ? 'hidden lg:flex' : 'flex'}`}
            style={{ borderColor: `${C.dark}10` }}
            role="complementary"
            aria-label="Itinerary"
          >
            {/* Guest save prompt */}
            {!user && authChecked && (
              <div className="shrink-0 flex items-center justify-between gap-3 px-5 py-3"
                style={{ background: C.terra }}>
                <p className="text-sm font-medium" style={{ color: C.sand }}>
                  Sign in to save your itinerary
                </p>
                <Link
                  href="/login?mode=signup"
                  className="shrink-0 text-xs font-semibold px-4 py-1.5 rounded-full transition-opacity hover:opacity-90"
                  style={{ background: C.sand, color: C.terra }}
                >
                  Sign up free →
                </Link>
              </div>
            )}
            <div className="flex-1 overflow-hidden">
              <ItineraryPanel itinerary={itinerary} />
            </div>
          </div>
        )}

        {/* Right — Chat */}
        <div
          className={`flex flex-col overflow-hidden ${(itinerary || generating) ? 'lg:w-[40%]' : 'w-full'} ${itinerary && mobileTab !== 'chat' ? 'hidden lg:flex' : 'flex'}`}
          style={{ borderColor: `${C.dark}10` }}
          role="main"
        >
          <div className="flex-1 overflow-y-auto" aria-live="polite" aria-label="Chat messages">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-2">
                  {generating ? (
                    <>
                      <p className="text-2xl" style={{ fontFamily: 'var(--font-playfair)', color: C.dark, opacity: 0.5 }}>
                        Building your trip…
                      </p>
                      <p className="text-sm" style={{ color: C.dark, opacity: 0.35 }}>
                        Your itinerary will appear on the left.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-2xl" style={{ fontFamily: 'var(--font-playfair)', color: C.dark, opacity: 0.3 }}>
                        Where to next?
                      </p>
                      <p className="text-sm" style={{ color: C.dark, opacity: 0.4 }}>
                        Ask me anything about your next adventure.
                      </p>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <ChatMessages
                messages={messages.map(m => ({
                  ...m,
                  content: m.role === 'assistant'
                    ? m.content
                        .replace(/<itinerary_update>[\s\S]*?<\/itinerary_update>/g, '') // complete block
                        .replace(/<itinerary_update>[\s\S]*/g, '')                      // partial block while streaming
                        .trim()
                    : m.content,
                }))}
                isLoading={isLoading}
                loadingMessage={isLoading && itinerary ? 'Working on updating your itinerary now...' : undefined}
              />
            )}
          </div>

          {/* Quick-reply chips — shown only after itinerary generation, disappear on first send */}
          {showChips && itinerary && !isLoading && (
            <div className="px-5 pt-2 pb-3 shrink-0 border-t" style={{ borderColor: `${C.dark}10`, background: C.sand }}>
              <p className="text-xs mb-2 font-medium" style={{ color: `${C.dark}50` }}>Quick replies</p>
              <div className="relative">
                <div
                  className="flex gap-2 overflow-x-auto pb-1"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {STATIC_CHIPS.map(chip => (
                    <button
                      key={chip}
                      onClick={() => handleChipClick(chip)}
                      className="shrink-0 text-xs font-medium px-3.5 py-2 rounded-full border transition-all hover:opacity-80 active:scale-95"
                      style={{ borderColor: C.terra, color: C.terra, background: `${C.terra}08`, whiteSpace: 'nowrap' }}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
                {/* Fade + chevron to signal horizontal scroll */}
                <div className="pointer-events-none absolute right-0 top-0 bottom-1 w-12 flex items-center justify-end"
                  style={{ background: `linear-gradient(to right, transparent, ${C.sand})` }}>
                  <span className="text-lg leading-none pr-0.5" style={{ color: C.terra, opacity: 0.6 }}>›</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="px-4 py-2 text-center text-sm shrink-0 border-t"
              style={{ background: `${C.terra}15`, color: C.terra, borderColor: `${C.terra}30` }}>
              {error.message.includes('limit') ? 'Daily message limit reached. Please try again tomorrow.' : 'Something went wrong. Please try again.'}
            </div>
          )}

          {genError && (
            <div
              role="alert"
              className="px-4 py-3 text-center text-sm shrink-0 border-t"
              style={{ background: `${C.terra}15`, color: C.terra, borderColor: `${C.terra}30` }}>
              Couldn&apos;t build your itinerary —{' '}
              <Link href="/" style={{ textDecoration: 'underline' }}>try again from home</Link>.
            </div>
          )}

          {hitGuestLimit ? (
            <div className="border-t px-5 pt-4 pb-5 shrink-0 text-center space-y-3"
              style={{ borderColor: `${C.dark}15`, background: C.dark, paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}>
              <p className="text-sm font-medium" style={{ color: C.sand }}>
                Sign in free to keep refining your trip →
              </p>
              <Link href="/login"
                className="inline-block font-semibold px-5 py-2.5 rounded-xl text-sm transition-opacity hover:opacity-90"
                style={{ background: C.terra, color: C.sand }}>
                Sign in to save &amp; continue
              </Link>
            </div>
          ) : (
            <div className="border-t px-5 pt-3 pb-4 shrink-0" style={{ borderColor: `${C.dark}15`, background: C.sand, paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
              <ChatInput
                input={input}
                setInput={setInput}
                handleSubmit={handleChatSubmit}
                isLoading={isLoading}
              />
              {!user && (
                <p className="text-center text-xs mt-2" style={{ color: C.dark, opacity: 0.35 }}>
                  {GUEST_LIMIT - guestCount} free message{GUEST_LIMIT - guestCount !== 1 ? 's' : ''} remaining ·{' '}
                  <Link href="/login" style={{ color: C.terra }}>Sign in for unlimited</Link>
                </p>
              )}
              {user && (
                <p className="text-center text-xs mt-2" style={{ color: C.dark, opacity: 0.35 }}>
                  Planning only — no bookings made
                </p>
              )}
            </div>
          )}
        </div>


      </div>
    </div>
  )
}
