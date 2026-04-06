'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TripWizard, type WizardAnswers } from '@/components/TripWizard'
import { createClient } from '@/lib/supabase/client'

// ─── Colours ────────────────────────────────────────────────────────────────
const C = {
  sand: '#F5ECD7',
  terra: '#C94A2B',
  saffron: '#E8850A',
  jade: '#2A7A5B',
  dark: '#1A1208',
}

// ─── Hero SVG illustration ───────────────────────────────────────────────────
function HeroIllustration() {
  return (
    <svg viewBox="0 0 480 520" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-lg mx-auto">
      {/* Sky gradient */}
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F9C06A" />
          <stop offset="60%" stopColor="#F5A55A" />
          <stop offset="100%" stopColor="#E8850A" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="mtn1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2A7A5B" />
          <stop offset="100%" stopColor="#1A5040" />
        </linearGradient>
        <linearGradient id="mtn2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3A9A6B" />
          <stop offset="100%" stopColor="#2A7A5B" />
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect width="480" height="520" fill="url(#sky)" rx="24" />

      {/* Sun */}
      <circle cx="380" cy="80" r="45" fill="#F9C06A" opacity="0.9" />
      <circle cx="380" cy="80" r="35" fill="#FFDD88" />

      {/* Mountains */}
      <polygon points="0,340 120,180 240,340" fill="url(#mtn1)" />
      <polygon points="160,340 310,160 460,340" fill="url(#mtn2)" />
      <polygon points="280,340 400,220 480,340" fill="#1A5040" />

      {/* Ground */}
      <rect x="0" y="330" width="480" height="190" fill="#2A7A5B" rx="0" />
      <ellipse cx="240" cy="330" rx="240" ry="20" fill="#1A5040" />

      {/* Temple base */}
      <rect x="160" y="240" width="160" height="100" fill="#C94A2B" />
      <rect x="170" y="250" width="140" height="90" fill="#D4613A" />

      {/* Temple roof layers */}
      <polygon points="180,240 300,240 290,210 190,210" fill="#C94A2B" />
      <polygon points="190,210 290,210 280,185 200,185" fill="#B03A20" />
      <polygon points="200,185 280,185 272,162 208,162" fill="#C94A2B" />
      <polygon points="208,162 272,162 240,140 240,140" fill="#B03A20" />

      {/* Temple spire */}
      <rect x="236" y="120" width="8" height="24" fill="#E8850A" />
      <circle cx="240" cy="118" r="6" fill="#F9C06A" />

      {/* Temple door */}
      <rect x="220" y="290" width="40" height="50" rx="20" fill="#1A1208" opacity="0.6" />

      {/* Temple windows */}
      <rect x="185" y="265" width="20" height="20" rx="10" fill="#F9C06A" opacity="0.7" />
      <rect x="275" y="265" width="20" height="20" rx="10" fill="#F9C06A" opacity="0.7" />

      {/* Palm tree left */}
      <rect x="58" y="260" width="8" height="80" fill="#5A3A1A" />
      <ellipse cx="62" cy="255" rx="28" ry="12" fill="#2A7A5B" transform="rotate(-20 62 255)" />
      <ellipse cx="62" cy="255" rx="28" ry="12" fill="#3A9A6B" transform="rotate(10 62 255)" />
      <ellipse cx="62" cy="255" rx="28" ry="12" fill="#2A7A5B" transform="rotate(40 62 255)" />

      {/* Palm tree right */}
      <rect x="410" y="250" width="8" height="90" fill="#5A3A1A" />
      <ellipse cx="414" cy="245" rx="30" ry="12" fill="#3A9A6B" transform="rotate(15 414 245)" />
      <ellipse cx="414" cy="245" rx="30" ry="12" fill="#2A7A5B" transform="rotate(-15 414 245)" />
      <ellipse cx="414" cy="245" rx="28" ry="12" fill="#3A9A6B" transform="rotate(45 414 245)" />

      {/* Tropical flowers */}
      <circle cx="90" cy="340" r="8" fill="#C94A2B" />
      <circle cx="82" cy="333" r="6" fill="#E8850A" />
      <circle cx="98" cy="333" r="6" fill="#E8850A" />
      <circle cx="90" cy="340" r="4" fill="#F9C06A" />

      <circle cx="390" cy="345" r="8" fill="#C94A2B" />
      <circle cx="382" cy="338" r="6" fill="#E8850A" />
      <circle cx="398" cy="338" r="6" fill="#E8850A" />
      <circle cx="390" cy="345" r="4" fill="#F9C06A" />

      {/* Traveller 1 — backpack, hat, pointing */}
      <circle cx="130" cy="310" r="16" fill="#F5C5A3" /> {/* head */}
      <ellipse cx="130" cy="302" rx="10" ry="6" fill="#C94A2B" /> {/* hat brim */}
      <ellipse cx="130" cy="296" rx="7" ry="8" fill="#B03A20" /> {/* hat top */}
      <rect x="120" y="326" width="20" height="30" rx="4" fill="#E8850A" /> {/* body */}
      {/* backpack */}
      <rect x="138" y="328" width="14" height="22" rx="4" fill="#2A7A5B" />
      <rect x="140" y="332" width="10" height="6" rx="2" fill="#1A5040" />
      {/* pointing arm */}
      <line x1="120" y1="335" x2="96" y2="318" stroke="#F5C5A3" strokeWidth="5" strokeLinecap="round" />
      {/* legs */}
      <rect x="121" y="354" width="8" height="20" rx="4" fill="#4A3A2A" />
      <rect x="131" y="354" width="8" height="20" rx="4" fill="#4A3A2A" />

      {/* Traveller 2 — camera, sunglasses */}
      <circle cx="350" cy="315" r="16" fill="#D4A574" /> {/* head */}
      {/* sunglasses */}
      <rect x="338" y="311" width="10" height="7" rx="3" fill="#1A1208" />
      <rect x="352" y="311" width="10" height="7" rx="3" fill="#1A1208" />
      <line x1="348" y1="314" x2="352" y2="314" stroke="#1A1208" strokeWidth="1.5" />
      {/* hair */}
      <ellipse cx="350" cy="300" rx="14" ry="8" fill="#4A2A0A" />
      <rect x="350" y="330" width="18" height="28" rx="4" fill="#2A7A5B" /> {/* body */}
      {/* camera */}
      <rect x="330" y="332" width="16" height="12" rx="2" fill="#1A1208" />
      <circle cx="338" cy="338" r="4" fill="#4A4A4A" />
      <circle cx="338" cy="338" r="2.5" fill="#8A8A8A" />
      {/* arm holding camera */}
      <line x1="350" y1="338" x2="346" y2="338" stroke="#D4A574" strokeWidth="5" strokeLinecap="round" />
      {/* legs */}
      <rect x="351" y="357" width="8" height="20" rx="4" fill="#3A2A1A" />
      <rect x="361" y="357" width="8" height="20" rx="4" fill="#3A2A1A" />

      {/* Floating lanterns */}
      <g className="animate-float">
        <ellipse cx="200" cy="90" rx="10" ry="14" fill="#E8850A" />
        <rect x="196" y="76" width="8" height="4" rx="2" fill="#C94A2B" />
        <rect x="196" y="104" width="8" height="4" rx="2" fill="#C94A2B" />
        <line x1="200" y1="108" x2="200" y2="118" stroke="#C94A2B" strokeWidth="1.5" />
        <ellipse cx="200" cy="92" rx="6" ry="8" fill="#F9C06A" opacity="0.5" />
      </g>

      <g className="animate-float-slow" style={{ animationDelay: '1s' }}>
        <ellipse cx="310" cy="70" rx="9" ry="13" fill="#C94A2B" />
        <rect x="306" y="57" width="8" height="4" rx="2" fill="#B03A20" />
        <rect x="306" y="83" width="8" height="4" rx="2" fill="#B03A20" />
        <line x1="310" y1="87" x2="310" y2="98" stroke="#B03A20" strokeWidth="1.5" />
        <ellipse cx="310" cy="72" rx="5" ry="7" fill="#F9C06A" opacity="0.5" />
      </g>

      <g className="animate-float-fast" style={{ animationDelay: '0.5s' }}>
        <ellipse cx="260" cy="55" rx="8" ry="11" fill="#E8850A" opacity="0.9" />
        <rect x="256" y="44" width="8" height="3" rx="1.5" fill="#C94A2B" />
        <rect x="256" y="66" width="8" height="3" rx="1.5" fill="#C94A2B" />
        <line x1="260" y1="69" x2="260" y2="78" stroke="#C94A2B" strokeWidth="1.5" />
        <ellipse cx="260" cy="57" rx="4" ry="6" fill="#F9C06A" opacity="0.4" />
      </g>

      {/* Stars */}
      <circle cx="60" cy="50" r="2" fill="white" opacity="0.8" />
      <circle cx="140" cy="30" r="1.5" fill="white" opacity="0.6" />
      <circle cx="420" cy="45" r="2" fill="white" opacity="0.7" />
      <circle cx="450" cy="100" r="1.5" fill="white" opacity="0.5" />
      <circle cx="30" cy="110" r="1.5" fill="white" opacity="0.6" />
    </svg>
  )
}



// ─── Page ────────────────────────────────────────────────────────────────────
const LOADING_MESSAGES = [
  (dest: string) => `Building your trip to ${dest}...`,
  () => 'Finding the best routes...',
  () => 'Adding local secrets...',
  () => 'Checking the weather patterns...',
  () => 'Curating hidden gems...',
]

export default function HomePage() {
  const [showWizard, setShowWizard] = useState(false)
  const [wizardInitialDest, setWizardInitialDest] = useState('')
  const [showLoading, setShowLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [loadingDest, setLoadingDest] = useState('')
  const [genError, setGenError] = useState(false)
  const [pendingAnswers, setPendingAnswers] = useState<WizardAnswers | null>(null)
  const [cityPhotos, setCityPhotos] = useState<{ name: string; url: string }[]>([])
  const router = useRouter()

  // Fetch city photos for hero collage
  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('cities')
      .select('name, hero_image_url')
      .eq('is_published', true)
      .not('hero_image_url', 'is', null)
      .limit(4)
      .then(({ data }) => {
        if (data) {
          setCityPhotos(
            data
              .filter((c): c is { name: string; hero_image_url: string } => !!c.hero_image_url)
              .map(c => ({ name: c.name, url: c.hero_image_url }))
          )
        }
      })
  }, [])

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
      if (!res.ok || data.error) throw new Error(data.error ?? 'Failed')
      localStorage.setItem('wandr_pending_trip', JSON.stringify({ wizardAnswers: answers, itinerary: data.itinerary }))
      router.push('/preview')
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
        <Link href="/" className="text-2xl font-bold tracking-tight" aria-label="Wandr home"
          style={{ fontFamily: 'var(--font-playfair)', color: C.terra }}>
          wandr.
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: C.dark }}>
          <a href="#how-it-works" className="hover:opacity-70 transition-opacity">How it works</a>
          <Link href="/cities" className="hover:opacity-70 transition-opacity">City Guides</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden sm:block text-sm font-medium px-4 py-2 rounded-full border transition-all hover:opacity-80"
            style={{ borderColor: C.terra, color: C.terra }}>
            Sign in
          </Link>
          <Link href="/login" className="text-sm font-semibold px-5 py-2 rounded-full transition-all hover:opacity-90"
            style={{ background: C.terra, color: C.sand }}>
            Get started free
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <main id="main-content">
      <section className="min-h-screen flex items-center pt-24 pb-16 px-6" aria-labelledby="hero-heading">
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
            <p className="text-lg leading-relaxed opacity-80 max-w-lg">
              Tell Wandr where you&apos;re dreaming of. Get a personalised itinerary built around you — your pace, your budget, your vibe.
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
            <p className="text-sm opacity-50">Free to start · No bookings, just brilliant plans · Works anywhere</p>
            <Link href="/cities" className="inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
              style={{ color: C.dark, opacity: 0.55 }}>
              🏙️ Explore city guides →
            </Link>
          </div>
          {/* Right — photo collage or SVG fallback */}
          <div className="relative" aria-hidden="true">
            <div className="absolute inset-0 rounded-3xl blur-3xl opacity-30" style={{ background: `radial-gradient(circle, ${C.saffron}, ${C.terra})` }} />
            {cityPhotos.length >= 2 ? (
              <div className="grid grid-cols-2 gap-3 p-2">
                {cityPhotos.slice(0, 4).map((photo, i) => (
                  <div key={photo.name} className="relative overflow-hidden rounded-2xl"
                    style={{ aspectRatio: '4/3', transform: i % 2 === 1 ? 'translateY(16px)' : undefined }}>
                    <img
                      src={photo.url}
                      alt={photo.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />
                    <span className="absolute bottom-2 left-3 text-xs font-semibold" style={{ color: 'white', fontFamily: 'var(--font-playfair)', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                      {photo.name}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <HeroIllustration />
            )}</div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 px-6" aria-labelledby="how-it-works-heading">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium mb-3 uppercase tracking-widest" style={{ color: C.terra }}>Simple as a conversation</p>
            <h2 id="how-it-works-heading" className="text-4xl font-bold" style={{ fontFamily: 'var(--font-playfair)' }}>How it works</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', icon: '✈️', title: 'Sign in & tell us where', desc: 'Create a free account and share where you dream of going — or ask for ideas.' },
              { step: '02', icon: '💬', title: "Chat like it's a friend", desc: 'Talk naturally. Tell Wandr your budget, travel style, and what excites you.' },
              { step: '03', icon: '🗺️', title: 'Get your personalised plan', desc: 'Receive a detailed day-by-day itinerary built specifically for you.' },
              { step: '04', icon: '✨', title: "Tweak until it's perfect", desc: "Adjust anything. Change a day, swap a hotel, add a detour. It's your trip." },
            ].map((item) => (
              <div key={item.step}
                className="relative rounded-2xl p-6 cursor-default transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                style={{ background: 'white', border: `1px solid ${C.saffron}33` }}>
                <div className="absolute top-4 right-4 text-6xl font-bold opacity-[0.06] select-none"
                  style={{ fontFamily: 'var(--font-playfair)', color: C.terra }}>
                  {item.step}
                </div>
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="font-bold text-base mb-2">{item.title}</h3>
                <p className="text-sm leading-relaxed opacity-70">{item.desc}</p>
              </div>
            ))}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Dark card */}
            <div className="rounded-2xl p-6 space-y-3" style={{ background: C.dark, color: C.sand }}>
              <div className="text-2xl">🧠</div>
              <h3 className="font-bold text-lg" style={{ fontFamily: 'var(--font-playfair)' }}>Remembers you</h3>
              <p className="text-sm opacity-70 leading-relaxed">Your travel style, budget, and preferences are saved. Every conversation gets smarter.</p>
            </div>
            {/* Amber card */}
            <div className="rounded-2xl p-6 space-y-3" style={{ background: `${C.saffron}22`, border: `1px solid ${C.saffron}44` }}>
              <div className="text-2xl">💰</div>
              <h3 className="font-bold text-lg" style={{ fontFamily: 'var(--font-playfair)' }}>Honest costs</h3>
              <p className="text-sm opacity-70 leading-relaxed">Real estimates for flights, hotels, food, and activities — no vague ranges that tell you nothing.</p>
            </div>
            {/* Day by day card */}
            <div className="rounded-2xl p-6 space-y-3" style={{ background: 'white', border: `1px solid ${C.saffron}33` }}>
              <div className="text-2xl">📅</div>
              <h3 className="font-bold text-lg" style={{ fontFamily: 'var(--font-playfair)' }}>Day-by-day itinerary</h3>
              <p className="text-sm opacity-70 leading-relaxed">Not a list of ideas — a complete morning, afternoon, and evening plan ready to use.</p>
            </div>
            {/* Jade card */}
            <div className="rounded-2xl p-6 space-y-3" style={{ background: `${C.jade}22`, border: `1px solid ${C.jade}44` }}>
              <div className="text-2xl">🔄</div>
              <h3 className="font-bold text-lg" style={{ fontFamily: 'var(--font-playfair)' }}>Endlessly editable</h3>
              <p className="text-sm opacity-70 leading-relaxed">Change your mind? Just say so. Swap a city, cut a day, add a beach stop — Wandr adapts instantly.</p>
            </div>
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
            Sign in free and tell us where you&apos;re dreaming of. Your personalised itinerary waits.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button onClick={handleStartPlanning} className="font-semibold px-8 py-3.5 rounded-full text-base transition-all hover:opacity-90"
              style={{ background: C.sand, color: C.terra }}>
              Start planning free
            </button>
            <Link href="/login" className="font-semibold px-8 py-3.5 rounded-full text-base border-2 transition-all hover:opacity-70"
              style={{ borderColor: C.sand, color: C.sand }}>
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
          <p className="text-xs opacity-40 text-center">© 2026 Wandr · No bookings made. Just brilliant plans.</p>
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
