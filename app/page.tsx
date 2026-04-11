'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TripWizard, type WizardAnswers } from '@/components/TripWizard'
import WandrMap from '@/components/WandrMap'
import { Navigation, MessageCircle, Map, SlidersHorizontal, Sparkles, DollarSign, CalendarDays, RefreshCw } from 'lucide-react'

// ─── Colours ────────────────────────────────────────────────────────────────
const C = {
  sand: '#F5ECD7',
  terra: '#C94A2B',
  saffron: '#E8850A',
  jade: '#2A7A5B',
  dark: '#1A1208',
}

// ─── Page ────────────────────────────────────────────────────────────────────
const LOADING_MESSAGES = [
  (dest: string) => `Building your trip to ${dest}...`,
  () => 'Finding the best routes...',
  () => 'Adding local secrets...',
  () => 'Checking the weather patterns...',
  () => 'Curating hidden gems...',
  () => 'Good things take time...',
]

export default function HomePage() {
  const [showWizard, setShowWizard] = useState(false)
  const [wizardInitialDest, setWizardInitialDest] = useState('')
  const [showLoading, setShowLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [loadingDest, setLoadingDest] = useState('')
  const [genError, setGenError] = useState(false)
  const [rateLimited, setRateLimited] = useState(false)
  const [pendingAnswers, setPendingAnswers] = useState<WizardAnswers | null>(null)
  const router = useRouter()

  // Auto-open wizard if ?destination= or ?wizard=1 param is present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const dest = params.get('destination')
    const forceWizard = params.get('wizard') === '1'
    if (dest) {
      setWizardInitialDest(dest)
      setShowWizard(true)
    } else if (forceWizard) {
      setShowWizard(true)
    }
  }, [])

  const handleStartPlanning = async () => {
    setShowWizard(true)
  }

  const generate = async (answers: WizardAnswers) => {
    setShowWizard(false)
    setShowLoading(true)
    setGenError(false)
    setRateLimited(false)
    setLoadingDest(answers.destination)
    setLoadingMsg(LOADING_MESSAGES[0](answers.destination))

    let msgIdx = 0
    const interval = setInterval(() => {
      msgIdx = (msgIdx + 1) % LOADING_MESSAGES.length
      setLoadingMsg(LOADING_MESSAGES[msgIdx](answers.destination))
    }, 2200)

    try {
      const res = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      })
      const data = await res.json()
      if (res.status === 429) { setRateLimited(true); return }
      if (!res.ok || data.error) throw new Error(data.error ?? 'Failed')
      localStorage.setItem('wandr_pending_trip', JSON.stringify({ wizardAnswers: answers, itinerary: data.itinerary }))
      router.push('/chat')
    } catch {
      setPendingAnswers(answers)
      setGenError(true)
    } finally {
      clearInterval(interval)
      setShowLoading(false)
    }
  }

  const handleWizardComplete = (answers: WizardAnswers) => generate(answers)
  const retryGenerate = () => pendingAnswers && generate(pendingAnswers)

  return (
    <>
      {/* Wizard modal */}
      {showWizard && (
        <TripWizard
          onComplete={handleWizardComplete}
          onClose={() => setShowWizard(false)}
          initialDestination={wizardInitialDest}
        />
      )}

      {/* Loading overlay */}
      {showLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6"
          role="status" aria-live="polite" aria-label="Loading your itinerary"
          style={{ background: C.dark }}>
          <p className="text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair)', color: C.terra }}>wandr.</p>
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <span key={i} className="w-2.5 h-2.5 rounded-full animate-bounce"
                style={{ background: C.saffron, animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          <p className="text-base text-center px-8 max-w-xs" style={{ color: C.sand, opacity: 0.7 }}>{loadingMsg}</p>
        </div>
      )}

      {/* Rate limit overlay */}
      {rateLimited && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 px-6 text-center"
          role="alert" aria-live="assertive"
          style={{ background: C.dark }}>
          <p className="text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair)', color: C.terra }}>wandr.</p>
          <p className="text-lg font-semibold" style={{ color: C.sand }}>You&apos;ve reached today&apos;s limit</p>
          <p className="text-sm max-w-xs" style={{ color: C.sand, opacity: 0.6 }}>
            Create a free account to get 5× more daily itineraries — or come back tomorrow.
          </p>
          <Link href="/login?mode=signup"
            className="font-semibold px-6 py-3 rounded-xl text-sm transition-opacity hover:opacity-90"
            style={{ background: C.terra, color: C.sand }}>
            Sign in free
          </Link>
          <button onClick={() => setRateLimited(false)}
            className="text-sm transition-opacity hover:opacity-60"
            style={{ color: C.sand, opacity: 0.4 }}>
            Dismiss
          </button>
        </div>
      )}

      {/* Error overlay */}
      {genError && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 px-6"
          role="alert" aria-live="assertive"
          style={{ background: C.dark }}>
          <p className="text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair)', color: C.terra }}>wandr.</p>
          <p className="text-sm text-center" style={{ color: C.sand, opacity: 0.6 }}>
            Something went wrong building your trip to {loadingDest}.
          </p>
          <button onClick={retryGenerate}
            className="font-semibold px-6 py-3 rounded-xl text-sm transition-opacity hover:opacity-90"
            style={{ background: C.terra, color: C.sand }}>
            Try again
          </button>
          <button onClick={() => setGenError(false)}
            className="text-sm transition-opacity hover:opacity-60"
            style={{ color: C.sand, opacity: 0.4 }}>
            Cancel
          </button>
        </div>
      )}

    <div style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif', background: C.sand, color: C.dark }}>

      {/* Skip to main content (WCAG 2.4.1) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-full focus:text-sm focus:font-semibold"
        style={{ background: C.terra, color: C.sand }}
      >
        Skip to main content
      </a>

      {/* ── NAV ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        aria-label="Main navigation"
        style={{ background: 'rgba(245,236,215,0.92)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${C.saffron}22` }}>
        <div className="flex items-center gap-2">
          <Link href="/" className="text-2xl font-bold tracking-tight" aria-label="Wandr home"
            style={{ fontFamily: 'var(--font-playfair)', color: C.terra }}>
            wandr.
          </Link>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: `${C.saffron}25`, color: C.saffron, border: `1px solid ${C.saffron}50` }}>
            Beta
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: C.dark }}>
          <a href="#how-it-works" className="hover:opacity-70 transition-opacity">How it works</a>
          <Link href="/cities" className="hover:opacity-70 transition-opacity">City Guides</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden sm:block text-sm font-medium px-4 py-2 rounded-full border transition-all hover:opacity-80"
            style={{ borderColor: C.terra, color: C.terra }}>
            Sign in
          </Link>
          <Link href="/login?mode=signup" className="text-sm font-semibold px-5 py-2 rounded-full transition-all hover:opacity-90"
            style={{ background: C.terra, color: C.sand }}>
            Get started free
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <main id="main-content">
      <section className="flex items-center pt-28 pb-16 px-6" aria-labelledby="hero-heading">
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
              style={{ background: `${C.saffron}22`, color: C.saffron, border: `1px solid ${C.saffron}44` }}>
              <span>✦</span> Your AI travel companion
            </div>
            <h1 id="hero-heading" className="text-5xl lg:text-6xl font-bold leading-tight tracking-tight"
              style={{ fontFamily: 'var(--font-playfair)' }}>
              Every trip should feel like{' '}
              <em style={{ color: C.terra, fontStyle: 'italic' }}>magic.</em>
            </h1>
            <p className="text-xl font-semibold tracking-wide"
              style={{ color: C.terra, letterSpacing: '0.01em' }}>
              Your pace.&nbsp; Your budget.&nbsp; Your vibe.
            </p>
            <p className="text-lg leading-relaxed opacity-80 max-w-lg">
              Tell Wandr where you&apos;re dreaming of and get a personalised itinerary built around you.
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={handleStartPlanning}
                className="font-semibold px-7 py-3.5 rounded-full text-base transition-all hover:opacity-90 shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ background: C.terra, color: C.sand, outlineColor: C.dark }}>
                Start planning
              </button>
              <Link href="/cities" className="font-semibold px-7 py-3.5 rounded-full text-base border-2 transition-all hover:opacity-70"
                style={{ borderColor: C.terra, color: C.terra }}>
                Explore city guides
              </Link>
            </div>
          </div>
          {/* Right — animated vintage world map */}
          <div className="relative" aria-hidden="true">
            <div className="absolute inset-0 rounded-3xl blur-3xl opacity-20" style={{ background: `radial-gradient(circle, ${C.saffron}, ${C.terra})` }} />
            <WandrMap />
          </div>
        </div>
      </section>


      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="pt-12 pb-24 px-6" aria-labelledby="how-it-works-heading">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium mb-3 uppercase tracking-widest" style={{ color: C.terra }}>Simple as a conversation</p>
            <h2 id="how-it-works-heading" className="text-4xl font-bold" style={{ fontFamily: 'var(--font-playfair)' }}>How it works</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {([
              { step: '01', Icon: Navigation, title: 'Sign in & tell us where', desc: 'Create a free account and share where you dream of going — or ask for ideas.' },
              { step: '02', Icon: MessageCircle, title: "Chat like it's a friend", desc: 'Talk naturally. Tell Wandr your budget, travel style, and what excites you.' },
              { step: '03', Icon: Map, title: 'Get your personalised plan', desc: 'Receive a detailed day-by-day itinerary built specifically for you.' },
              { step: '04', Icon: SlidersHorizontal, title: "Tweak until it's perfect", desc: "Adjust anything. Change a day, swap a hotel, add a detour. It's your trip." },
            ] as const).map((item) => (
              <div key={item.step}
                className="relative rounded-2xl p-6 cursor-default transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                style={{ background: 'white', border: `1px solid ${C.saffron}33` }}>
                <div className="absolute top-4 right-4 text-6xl font-bold opacity-[0.06] select-none"
                  style={{ fontFamily: 'var(--font-playfair)', color: C.terra }}>
                  {item.step}
                </div>
                <item.Icon size={24} className="mb-4" style={{ color: C.terra }} />
                <h3 className="font-bold text-base mb-2">{item.title}</h3>
                <p className="text-sm leading-relaxed opacity-70">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CHAT PREVIEW ── */}
      <section className="py-24 px-6" aria-labelledby="chat-preview-heading">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left — copy */}
          <div className="space-y-5">
            <p className="text-sm font-medium uppercase tracking-widest" style={{ color: C.terra }}>See how it feels</p>
            <h2 id="chat-preview-heading" className="text-4xl font-bold leading-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
              Just talk.<br />Wandr figures out the rest.
            </h2>
            <p className="text-base leading-relaxed opacity-70 max-w-sm">
              No forms. No dropdowns. Tell Wandr what kind of trip you want — in your own words — and it builds the plan around you.
            </p>
            <button onClick={handleStartPlanning}
              className="inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-full text-sm transition-all hover:opacity-90"
              style={{ background: C.terra, color: C.sand }}>
              Try it now →
            </button>
          </div>

          {/* Right — chat mockup */}
          <div className="rounded-3xl overflow-hidden shadow-2xl" style={{ background: '#FDFAF4', border: `1px solid ${C.saffron}22` }}>

            {/* Chrome bar */}
            <div className="px-5 py-3.5 flex items-center gap-3 border-b" style={{ borderColor: `${C.dark}0D`, background: 'white' }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: C.terra, color: C.sand, fontFamily: 'var(--font-playfair)' }}>w</div>
              <span className="text-sm font-semibold" style={{ color: C.dark }}>wandr.</span>
              <span className="ml-auto text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ background: `${C.jade}20`, color: C.jade }}>● Online</span>
            </div>

            {/* Messages */}
            <div className="px-5 py-6 space-y-5">

              {/* User bubble */}
              <div className="flex justify-end">
                <div className="max-w-[78%] rounded-2xl rounded-br-sm px-4 py-3 text-sm leading-relaxed"
                  style={{ background: C.terra, color: C.sand }}>
                  I want 10 days in Southeast Asia. Mid-range budget. I hate tourist traps and all-inclusive resorts.
                </div>
              </div>

              {/* Wandr response */}
              <div className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                  style={{ background: C.dark, color: C.sand, fontFamily: 'var(--font-playfair)' }}>w</div>
                <div className="max-w-[84%] rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed space-y-2"
                  style={{ background: 'white', color: C.dark, boxShadow: '0 1px 6px rgba(26,18,8,0.07)' }}>
                  <p>Good instincts — Southeast Asia rewards people who go slightly off-script.</p>
                  <p>I&apos;d start you in <strong>Hanoi for 3 days</strong> — stay in the Old Quarter, not near Hoan Kiem Lake where prices double and the vibe is purely tourist. Then a night in <strong>Ninh Binh</strong> (boats through the limestone karsts, almost nobody there mid-week). Fly down to <strong>Hoi An for 4 days</strong> — skip the lantern festival crowds, the town is better when it&apos;s quieter. Close out with <strong>2 days in Da Nang</strong> for the beach.</p>
                  <p style={{ color: C.terra }} className="font-medium">Want me to build out the day-by-day?</p>
                </div>
              </div>

              {/* User follow-up */}
              <div className="flex justify-end">
                <div className="max-w-[78%] rounded-2xl rounded-br-sm px-4 py-3 text-sm leading-relaxed"
                  style={{ background: C.terra, color: C.sand }}>
                  Yes — and can you find me a cooking class in Hoi An?
                </div>
              </div>

              {/* Typing indicator */}
              <div className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: C.dark, color: C.sand, fontFamily: 'var(--font-playfair)' }}>w</div>
                <div className="rounded-2xl rounded-tl-sm px-4 py-3"
                  style={{ background: 'white', boxShadow: '0 1px 6px rgba(26,18,8,0.07)' }}>
                  <div className="flex gap-1 items-center h-4">
                    {[0, 1, 2].map(i => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                        style={{ background: C.dark, opacity: 0.3, animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Input bar */}
            <div className="px-4 pb-4">
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm"
                style={{ borderColor: `${C.dark}18`, background: 'white', color: `${C.dark}55` }}>
                <span className="flex-1">Message wandr...</span>
                <div className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: C.terra }}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M6.5 11V2M2 6.5l4.5-4.5 4.5 4.5" stroke={C.sand} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── SAMPLE ITINERARY ── */}
      <section className="py-24 px-6" aria-labelledby="sample-heading">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="text-center mb-10">
            <p className="text-sm font-medium mb-3 uppercase tracking-widest" style={{ color: C.terra }}>See it in action</p>
            <h2 id="sample-heading" className="text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
              Here&apos;s what a Wandr plan looks like
            </h2>
            <p className="text-base opacity-60">A 3-day Tokyo itinerary, built in under a minute.</p>
          </div>

          {/* Itinerary panel mock */}
          <div className="rounded-3xl overflow-hidden shadow-xl" style={{ background: '#FDFAF4' }}>

            {/* Panel header */}
            <div className="px-6 py-5 border-b" style={{ borderColor: `${C.dark}10` }}>
              <h3 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair)', color: C.dark }}>Tokyo</h3>
              <p className="text-sm mt-0.5 italic" style={{ color: '#555' }}>
                Three days of temples, street food, and neon — at your own pace.
              </p>
              <span className="inline-block mt-2 text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ background: `${C.terra}15`, color: C.terra }}>
                3 days · 2 adults · Mid-range budget
              </span>
            </div>

            {/* Days */}
            <div className="px-4 py-4 space-y-3 pb-6">

              {/* Day 1 — expanded */}
              <div className="rounded-2xl overflow-hidden" style={{ background: 'white', boxShadow: '0 1px 8px rgba(26,18,8,0.06)' }}>
                <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: `1px solid ${C.sand}` }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: C.terra, color: C.sand }}>1</div>
                  <span className="font-semibold text-sm flex-1" style={{ color: C.dark }}>Day 1: Arrival &amp; Shinjuku Nights</span>
                </div>
                <div className="px-5 py-4 space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: C.saffron }}>Highlights</p>
                    <ul className="space-y-1.5">
                      {[
                        'Check in and explore your Shinjuku neighbourhood',
                        'Late afternoon at Shinjuku Gyoen — cherry blossoms in season',
                        'Dinner at Omoide Yokocho (Memory Lane) — yakitori and cold beer',
                        'Evening drinks at a rooftop bar with views of the city lights',
                      ].map(h => (
                        <li key={h} className="flex items-start gap-2 text-sm" style={{ color: C.dark }}>
                          <span className="mt-1 shrink-0" style={{ color: C.terra, fontSize: 10 }}>●</span>
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <dl className="space-y-2.5">
                    {[
                      { icon: '🏨', label: 'Stay', value: 'Keio Plaza Hotel, Shinjuku' },
                      { icon: '🍴', label: 'Meals', value: 'Hotel breakfast · Soba lunch · Yakitori at Omoide Yokocho' },
                      { icon: '🚌', label: 'Getting around', value: 'Narita Express from airport · IC card for metro' },
                    ].map(({ icon, label, value }) => (
                      <div key={label} className="flex items-start gap-2.5">
                        <span className="shrink-0 text-base">{icon}</span>
                        <div>
                          <dt className="text-xs font-medium mb-0.5" style={{ color: '#555' }}>{label}</dt>
                          <dd className="text-sm" style={{ color: C.dark }}>{value}</dd>
                        </div>
                      </div>
                    ))}
                  </dl>
                  <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: `${C.dark}08` }}>
                    <span className="text-xs" style={{ color: '#555' }}>Est. daily cost</span>
                    <span className="text-sm font-semibold" style={{ color: '#2A7A5B' }}>¥18,000 (~$120 USD)</span>
                  </div>
                </div>
              </div>

              {/* Day 2 — collapsed */}
              <div className="rounded-2xl overflow-hidden" style={{ background: 'white', boxShadow: '0 1px 8px rgba(26,18,8,0.06)' }}>
                <div className="px-5 py-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: C.terra, color: C.sand }}>2</div>
                  <span className="font-semibold text-sm flex-1" style={{ color: C.dark }}>Day 2: Temples, Markets &amp; Harajuku</span>
                  <span className="text-xs" style={{ color: C.dark, opacity: 0.3 }}>▼</span>
                </div>
              </div>

              {/* Day 3 — collapsed */}
              <div className="rounded-2xl overflow-hidden" style={{ background: 'white', boxShadow: '0 1px 8px rgba(26,18,8,0.06)' }}>
                <div className="px-5 py-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: '#2A7A5B', color: C.sand }}>3</div>
                  <span className="font-semibold text-sm flex-1" style={{ color: C.dark }}>Day 3: Tsukiji, TeamLab &amp; Departure</span>
                  <span className="text-xs" style={{ color: C.dark, opacity: 0.3 }}>▼</span>
                </div>
              </div>

            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-8">
            <button onClick={handleStartPlanning}
              className="font-semibold px-8 py-3.5 rounded-full text-base transition-all hover:opacity-90 shadow-lg"
              style={{ background: C.terra, color: C.sand }}>
              Get yours in minutes → Start planning
            </button>
          </div>

        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-6" aria-labelledby="features-heading">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium mb-3 uppercase tracking-widest" style={{ color: C.terra }}>Why Wandr</p>
            <h2 id="features-heading" className="text-4xl font-bold" style={{ fontFamily: 'var(--font-playfair)' }}>Built differently</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {([
              { Icon: Sparkles,     title: 'Remembers you',        desc: 'Your travel style, budget, and preferences are saved. Every conversation gets smarter.',                           dark: true },
              { Icon: DollarSign,   title: 'Honest costs',         desc: 'Real estimates for flights, hotels, food, and activities — no vague ranges that tell you nothing.',              dark: true },
              { Icon: CalendarDays, title: 'Day-by-day itinerary', desc: 'Not a list of ideas — a complete morning, afternoon, and evening plan ready to use.',                            dark: true },
              { Icon: RefreshCw,    title: 'Endlessly editable',   desc: "Change your mind? Just say so. Swap a city, cut a day, add a beach stop — Wandr adapts instantly.",              dark: true },
            ] as const).map(({ Icon, title, desc, dark }) => (
              <div key={title}
                className="rounded-2xl p-7 flex flex-col gap-3"
                style={{
                  minHeight: 220,
                  background: dark ? C.dark : 'white',
                  border: dark ? 'none' : `1px solid ${C.saffron}33`,
                  color: dark ? C.sand : C.dark,
                }}>
                <Icon size={24} style={{ color: dark ? C.sand : C.terra, opacity: dark ? 0.85 : 1 }} />
                <h3 className="font-bold text-lg" style={{ fontFamily: 'var(--font-playfair)' }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ opacity: 0.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA CALLOUT ── */}
      <section className="py-24 px-6" style={{ background: C.terra, color: C.sand }}>
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-4xl lg:text-5xl font-bold leading-tight" style={{ fontFamily: 'var(--font-playfair)', fontStyle: 'italic' }}>
            Your next adventure is one conversation away.
          </h2>
          <p className="text-lg opacity-80">
            Sign in free and tell us where you&apos;re dreaming of. Your personalised itinerary awaits.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button onClick={handleStartPlanning} className="font-semibold px-8 py-3.5 rounded-full text-base transition-all hover:opacity-90 shadow-md"
              style={{ background: '#FFFFFF', color: C.terra }}>
              Start planning free
            </button>
            <Link href="/login" className="font-semibold px-8 py-3.5 rounded-full text-base border-2 transition-all hover:bg-white/10"
              style={{ borderColor: 'rgba(255,255,255,0.5)', color: 'rgba(255,255,255,0.85)' }}>
              Sign in
            </Link>
          </div>
          <p className="text-xs opacity-50">No credit card required. No bookings made.</p>
        </div>
      </section>


      </main>

      {/* ── FOOTER ── */}
      <footer className="py-10 px-6" style={{ background: C.dark, color: C.sand }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-xl font-bold" style={{ fontFamily: 'var(--font-playfair)', color: C.terra }}>wandr.</span>
          <div className="flex flex-col items-center gap-1.5">
            <p className="text-xs opacity-50 text-center" style={{ color: C.terra }}>Your pace. Your budget. Your vibe.</p>
            <p className="text-xs opacity-40 text-center">© 2026 Wandr · No bookings made. Just brilliant plans.</p>
            <p className="text-xs opacity-30 text-center">Powered by Claude · Anthropic</p>
          </div>
          <div className="flex gap-6 text-xs opacity-50">
            <a href="#" className="hover:opacity-100 transition-opacity">Privacy</a>
            <a href="#" className="hover:opacity-100 transition-opacity">Terms</a>
            <a href="#" className="hover:opacity-100 transition-opacity">Contact</a>
          </div>
        </div>
      </footer>

    </div>
    </>
  )
}
