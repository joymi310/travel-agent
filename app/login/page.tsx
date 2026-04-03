'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const C = {
  sand: '#F5ECD7',
  terra: '#C94A2B',
  saffron: '#E8850A',
  jade: '#2A7A5B',
  dark: '#1A1208',
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) { setError(error.message) } else { setDone(true) }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message) } else { router.push('/chat'); router.refresh() }
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
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then sign in.
          </p>
          <button
            onClick={() => { setDone(false); setMode('signin') }}
            className="text-sm font-medium hover:opacity-70 transition-opacity"
            style={{ color: C.terra }}
          >
            ← Back to sign in
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex" style={{ background: C.sand }}>
      {/* Left panel — decorative */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden"
        style={{ background: C.dark }}>
        <Link href="/" className="text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair)', color: C.terra }}>
          wandr.
        </Link>
        {/* Decorative circles */}
        <div className="absolute top-1/3 -left-20 w-80 h-80 rounded-full opacity-10" style={{ background: C.saffron }} />
        <div className="absolute bottom-1/4 -right-10 w-60 h-60 rounded-full opacity-10" style={{ background: C.terra }} />
        <div className="relative z-10 space-y-6">
          <blockquote className="text-2xl font-medium leading-relaxed"
            style={{ fontFamily: 'var(--font-playfair)', fontStyle: 'italic', color: C.sand }}>
            &ldquo;Every great trip starts with a single conversation.&rdquo;
          </blockquote>
          <div className="flex gap-3 flex-wrap">
            {['🇯🇵 Japan', '🇲🇦 Morocco', '🇻🇳 Vietnam', '🇮🇩 Bali', '🇮🇳 India'].map(d => (
              <span key={d} className="text-xs px-3 py-1.5 rounded-full"
                style={{ background: `${C.sand}15`, color: C.sand, border: `1px solid ${C.sand}20` }}>
                {d}
              </span>
            ))}
          </div>
          <p className="text-sm opacity-40" style={{ color: C.sand }}>Free to start · No bookings made · Works anywhere</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden block text-center text-2xl font-bold"
            style={{ fontFamily: 'var(--font-playfair)', color: C.terra }}>
            wandr.
          </Link>

          <div className="space-y-1">
            <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-playfair)', color: C.dark }}>
              {mode === 'signin' ? 'Welcome back.' : 'Start your journey.'}
            </h1>
            <p className="text-sm opacity-60" style={{ color: C.dark }}>
              {mode === 'signin' ? 'Sign in to continue planning.' : 'Create a free account to save your plans.'}
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
              style={{
                background: 'white',
                border: `1.5px solid ${C.saffron}44`,
                color: C.dark,
              }}
              onFocus={e => e.target.style.borderColor = C.terra}
              onBlur={e => e.target.style.borderColor = `${C.saffron}44`}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
              style={{
                background: 'white',
                border: `1.5px solid ${C.saffron}44`,
                color: C.dark,
              }}
              onFocus={e => e.target.style.borderColor = C.terra}
              onBlur={e => e.target.style.borderColor = `${C.saffron}44`}
            />
            {error && (
              <p className="text-sm px-3 py-2 rounded-lg" style={{ background: `${C.terra}15`, color: C.terra }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full font-semibold py-3 rounded-xl text-sm transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: C.terra, color: C.sand }}
            >
              {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm" style={{ color: C.dark }}>
            <span className="opacity-60">{mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}</span>
            <button
              onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError('') }}
              className="font-medium hover:opacity-70 transition-opacity"
              style={{ color: C.terra }}
            >
              {mode === 'signin' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
