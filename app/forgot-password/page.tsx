'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const C = {
  sand: '#F5ECD7',
  terra: '#C94A2B',
  saffron: '#E8850A',
  jade: '#2A7A5B',
  dark: '#1A1208',
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const redirectTo = `${window.location.origin}/auth/callback?next=/reset-password`
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })

    if (error) {
      setError(error.message)
    } else {
      setDone(true)
    }
    setLoading(false)
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: C.sand }}>
        <div className="max-w-sm w-full text-center space-y-4">
          <div className="text-4xl">✉️</div>
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair)', color: C.dark }}>Check your email</h2>
          <p className="text-sm opacity-70" style={{ color: C.dark }}>
            If an account exists for <strong>{email}</strong>, we sent a link to reset your password. The link expires in one hour.
          </p>
          <Link href="/login" className="inline-block text-sm font-medium hover:opacity-70 transition-opacity"
            style={{ color: C.terra }}>
            ← Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: C.sand }}>
      <div className="w-full max-w-sm space-y-8">
        <Link href="/" className="block text-center text-2xl font-bold"
          style={{ fontFamily: 'var(--font-playfair)', color: C.terra }}>
          wayfindr.
        </Link>

        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair)', color: C.dark }}>
            Reset your password
          </h1>
          <p className="text-sm opacity-60" style={{ color: C.dark }}>
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
            style={{ background: 'white', border: `1.5px solid ${C.saffron}44`, color: C.dark }}
            onFocus={e => e.target.style.borderColor = C.terra}
            onBlur={e => e.target.style.borderColor = `${C.saffron}44`}
          />
          {error && (
            <p className="text-sm px-3 py-2 rounded-lg" role="alert" style={{ background: `${C.terra}15`, color: C.terra }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full font-semibold py-3 rounded-xl text-sm transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: C.terra, color: C.sand }}
          >
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>

        <p className="text-center text-sm" style={{ color: C.dark }}>
          <Link href="/login" className="font-medium hover:opacity-70 transition-opacity"
            style={{ color: C.terra }}>
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
