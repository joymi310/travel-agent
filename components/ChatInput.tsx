'use client'

import { useRef, useEffect } from 'react'
import type { FormEvent, ChangeEvent } from 'react'

const C = {
  sand: '#F5ECD7',
  terra: '#C94A2B',
  saffron: '#E8850A',
  dark: '#1A1208',
}

interface ChatInputProps {
  input: string
  setInput: (value: string) => void
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void
  isLoading: boolean
}

export function ChatInput({ input, setInput, handleSubmit, isLoading }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px'
  }, [input])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (input.trim() && !isLoading) {
        handleSubmit(e as unknown as FormEvent<HTMLFormElement>)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-3 items-end">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about destinations, itineraries, costs…"
        rows={1}
        className="flex-1 rounded-xl px-4 py-3 text-sm resize-none outline-none transition-all"
        style={{
          background: 'white',
          border: `1.5px solid ${C.saffron}44`,
          color: C.dark,
        }}
        onFocus={e => e.target.style.borderColor = C.terra}
        onBlur={e => e.target.style.borderColor = `${C.saffron}44`}
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={!input.trim() || isLoading}
        className="rounded-xl px-4 py-3 text-sm font-medium transition-opacity shrink-0 disabled:opacity-40"
        style={{ background: C.terra, color: C.sand }}
      >
        Send
      </button>
    </form>
  )
}
