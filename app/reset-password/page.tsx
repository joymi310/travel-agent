'use client'

import { useState, useEffect } from 'react'
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

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [checking, setChecking] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/login')
      } else {
        setChecking(false)
      }
    })
  }, [router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
    } else {
      setDone(true)
      setTimeout(() => router.push('/chat'), 1500)
    }
    setLoading(false)
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.sand }}>
        <p className="text-sm opacity-60" style={{ color: C.dark }}>Loading…</p>
      </div>
    )
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: C.sand }}>
        <div className="max-w-sm w-full text-center space-y-4">
          <div className="text-4xl">✓</div>
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair)', color: C.dark }}>Password updated</h2>
          <p className="text-sm opacity-70" style={{ color: C.dark }}>
            Redirecting you to your trips…
          </p>
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
            Set a new password
          </h1>
          <p className="text-sm opacity-60" style={{ color: C.dark }}>
            Choose something you&apos;ll remember.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
            style={{ background: 'white', border: `1.5px solid ${C.saffron}44`, color: C.dark }}
            onFocus={e => e.target.style.borderColor = C.terra}
            onBlur={e => e.target.style.borderColor = `${C.saffron}44`}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
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
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  )
}
