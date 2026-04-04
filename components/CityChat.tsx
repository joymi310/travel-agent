'use client'

import { useChat } from 'ai/react'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'

const C = {
  sand: '#F5ECD7',
  terra: '#C94A2B',
  saffron: '#E8850A',
  jade: '#2A7A5B',
  dark: '#1A1208',
}

const GUEST_LIMIT = 3

interface CityChatProps {
  city: string
  country: string
  suggestedQuestions: string[]
}

export function CityChat({ city, country, suggestedQuestions }: CityChatProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [guestCount, setGuestCount] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)

  const { messages, input, setInput, handleSubmit, isLoading } = useChat({
    api: '/api/city-chat',
    body: { city, country },
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setIsAuthenticated(!!data.user))
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const hitLimit = !isAuthenticated && guestCount >= GUEST_LIMIT

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (hitLimit || !input.trim()) return
    handleSubmit(e)
    if (!isAuthenticated) setGuestCount(c => c + 1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (input.trim() && !isLoading && !hitLimit) {
        onSubmit(e as unknown as React.FormEvent<HTMLFormElement>)
      }
    }
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-playfair)', color: C.dark }}>
            Ask our AI travel expert
          </h2>
          <p className="text-sm" style={{ color: C.dark, opacity: 0.55 }}>
            Get specific answers about {city} — no generic advice.
          </p>
        </div>

        {/* Suggested question chips */}
        {suggestedQuestions.length > 0 && messages.length === 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => setInput(q)}
                className="text-xs px-3 py-1.5 rounded-full border transition-all hover:opacity-80"
                style={{ borderColor: `${C.terra}33`, color: C.terra, background: `${C.terra}08` }}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Messages */}
        {messages.length > 0 && (
          <div className="overflow-y-auto mb-4 rounded-2xl p-4 space-y-4"
            style={{ maxHeight: '400px', background: 'white', boxShadow: '0 2px 12px rgba(26,18,8,0.07)' }}>
            {messages.map(m => (
              <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                    style={{ background: C.terra, color: C.sand, fontFamily: 'var(--font-playfair)' }}>
                    w.
                  </div>
                )}
                <div className="max-w-[85%] rounded-xl px-3 py-2.5 text-sm leading-relaxed"
                  style={m.role === 'user'
                    ? { background: C.terra, color: C.sand, borderTopRightRadius: '4px' }
                    : { background: C.sand, color: C.dark, borderTopLeftRadius: '4px' }
                  }>
                  {m.role === 'assistant'
                    ? <div className="prose prose-sm max-w-none prose-p:my-1" style={{ color: C.dark } as React.CSSProperties}>
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    : <p className="whitespace-pre-wrap">{m.content}</p>
                  }
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: C.terra, color: C.sand, fontFamily: 'var(--font-playfair)' }}>w.</div>
                <div className="rounded-xl px-3 py-3" style={{ background: C.sand }}>
                  <div className="flex gap-1">
                    {[0,1,2].map(i => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                        style={{ background: C.saffron, animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}

        {/* Guest limit prompt */}
        {hitLimit ? (
          <div className="rounded-2xl p-5 text-center space-y-3"
            style={{ background: C.dark, color: C.sand }}>
            <p className="text-sm font-medium">
              Sign in free to keep chatting with our {city} expert →
            </p>
            <Link href="/login"
              className="inline-block font-semibold px-5 py-2.5 rounded-xl text-sm transition-opacity hover:opacity-90"
              style={{ background: C.terra, color: C.sand }}>
              Sign in free
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex gap-2 items-end">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask anything about ${city}…`}
              rows={1}
              disabled={isLoading}
              className="flex-1 rounded-xl px-4 py-3 text-sm resize-none outline-none transition-all"
              style={{ background: 'white', border: `1.5px solid ${C.saffron}44`, color: C.dark }}
              onFocus={e => e.target.style.borderColor = C.terra}
              onBlur={e => e.target.style.borderColor = `${C.saffron}44`}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="rounded-xl px-4 py-3 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-40 shrink-0"
              style={{ background: C.terra, color: C.sand }}
            >
              Ask
            </button>
          </form>
        )}

        {!isAuthenticated && !hitLimit && guestCount > 0 && (
          <p className="text-xs mt-2 text-center" style={{ color: C.dark, opacity: 0.4 }}>
            {GUEST_LIMIT - guestCount} free message{GUEST_LIMIT - guestCount !== 1 ? 's' : ''} remaining ·{' '}
            <Link href="/login" style={{ color: C.terra }}>Sign in for unlimited</Link>
          </p>
        )}
      </div>
    </section>
  )
}
