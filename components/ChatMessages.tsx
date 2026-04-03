'use client'

import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import type { Message } from 'ai'

const C = {
  sand: '#F5ECD7',
  terra: '#C94A2B',
  saffron: '#E8850A',
  jade: '#2A7A5B',
  dark: '#1A1208',
}

interface ChatMessagesProps {
  messages: Message[]
  isLoading: boolean
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {messages.filter(m => m.content !== '__profile_complete__').map((message) => (
        <div
          key={message.id}
          className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
        >
          {message.role === 'assistant' && (
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-1"
              style={{ background: C.terra, color: C.sand, fontFamily: 'var(--font-playfair)' }}>
              w.
            </div>
          )}

          <div
            className="max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
            style={message.role === 'user'
              ? { background: C.terra, color: C.sand, borderTopRightRadius: '4px' }
              : { background: 'white', color: C.dark, borderTopLeftRadius: '4px', boxShadow: '0 1px 3px rgba(26,18,8,0.08)' }
            }
          >
            {message.role === 'assistant' ? (
              <div className="prose prose-sm max-w-none
                prose-p:my-2
                prose-headings:font-semibold
                prose-strong:font-semibold
                prose-li:my-0.5
                prose-a:underline"
                style={{ color: C.dark } as React.CSSProperties}>
                <ReactMarkdown>
                  {Array.isArray(message.content)
                    ? message.content.filter((p: {type: string}) => p.type === 'text').map((p: {type: string, text: string}) => p.text).join('')
                    : message.content}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="whitespace-pre-wrap">{message.content}</p>
            )}
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-1"
            style={{ background: C.terra, color: C.sand, fontFamily: 'var(--font-playfair)' }}>
            w.
          </div>
          <div className="rounded-2xl px-4 py-3" style={{ background: 'white', borderTopLeftRadius: '4px', boxShadow: '0 1px 3px rgba(26,18,8,0.08)' }}>
            <div className="flex gap-1 items-center h-5">
              <span className="w-2 h-2 rounded-full animate-bounce [animation-delay:-0.3s]" style={{ background: C.saffron }} />
              <span className="w-2 h-2 rounded-full animate-bounce [animation-delay:-0.15s]" style={{ background: C.saffron }} />
              <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: C.saffron }} />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
