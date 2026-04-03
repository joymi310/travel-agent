'use client'

import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import type { Message } from 'ai'

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
            <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-xs font-bold shrink-0 mt-1">
              TA
            </div>
          )}

          <div
            className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              message.role === 'user'
                ? 'bg-sky-600 text-white rounded-tr-sm'
                : 'bg-slate-800 text-slate-100 rounded-tl-sm'
            }`}
          >
            {message.role === 'assistant' ? (
              <div className="prose prose-invert prose-sm max-w-none prose-p:my-2 prose-headings:text-white prose-headings:font-semibold prose-strong:text-white prose-li:my-0.5">
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
          <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-xs font-bold shrink-0 mt-1">
            TA
          </div>
          <div className="bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3">
            <div className="flex gap-1 items-center h-5">
              <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
