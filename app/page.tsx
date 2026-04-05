'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TripWizard, type WizardAnswers } from '@/components/TripWizard'

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
    <div className="relative w-full max-w-md mx-auto select-none">
      <style>{`
        @keyframes wandr-unfurl {
          from { clip-path: inset(0 100% 0 0); }
          to   { clip-path: inset(0   0% 0 0); }
        }
        @keyframes wandr-rise {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .wandr-scroll   { animation: wandr-unfurl 2.4s cubic-bezier(0.4,0,0.2,1) 0.3s both; }
        .wandr-palms    { animation: wandr-rise   0.4s ease-out 0.55s both; }
        .wandr-pagoda   { animation: wandr-rise   0.4s ease-out 0.85s both; }
        .wandr-eiffel   { animation: wandr-rise   0.4s ease-out 1.25s both; }
        .wandr-pyramids { animation: wandr-rise   0.4s ease-out 1.85s both; }
      `}</style>
      <svg viewBox="0 0 500 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full drop-shadow-xl">
        <defs>
          <clipPath id="scrollShapeClip" clipPathUnits="userSpaceOnUse">
            <path d="M 100,85 Q 277,73 453,85 L 453,267 Q 277,279 100,267 Z"/>
          </clipPath>
        </defs>

        {/* Ground shadow */}
        <ellipse cx="278" cy="293" rx="198" ry="10" fill="#A87840" opacity="0.18"/>

        {/* Scroll paper body */}
        <path d="M 100,85 Q 277,73 453,85 L 453,267 Q 277,279 100,267 Z" fill="#F0E4C2"/>

        {/* Scroll content — CSS unfurl reveals L → R */}
        <g className="wandr-scroll">
          <g clipPath="url(#scrollShapeClip)">

            {/* Sky */}
            <rect x="96" y="70" width="362" height="104" fill="#E6DCBA"/>

            {/* Green ground */}
            <path d="M 96,172 Q 188,160 290,168 Q 372,174 456,166 L 456,280 L 96,280 Z" fill="#698D61"/>
            <ellipse cx="246" cy="170" rx="118" ry="17" fill="#78A870"/>

            {/* Palm trees */}
            <g className="wandr-palms">
              <rect x="187" y="170" width="5" height="32" fill="#6A4828"/>
              <ellipse cx="189" cy="167" rx="18" ry="7" fill="#517840" transform="rotate(-24 189 167)"/>
              <ellipse cx="189" cy="167" rx="18" ry="7" fill="#619050" transform="rotate(8 189 167)"/>
              <ellipse cx="189" cy="167" rx="16" ry="6" fill="#517840" transform="rotate(36 189 167)"/>

              <rect x="315" y="168" width="5" height="34" fill="#6A4828"/>
              <ellipse cx="317" cy="165" rx="20" ry="8" fill="#619050" transform="rotate(17 317 165)"/>
              <ellipse cx="317" cy="165" rx="20" ry="8" fill="#517840" transform="rotate(-15 317 165)"/>
              <ellipse cx="317" cy="165" rx="18" ry="7" fill="#619050" transform="rotate(43 317 165)"/>

              <rect x="411" y="172" width="4" height="26" fill="#6A4828"/>
              <ellipse cx="413" cy="169" rx="16" ry="6" fill="#517840" transform="rotate(19 413 169)"/>
              <ellipse cx="413" cy="169" rx="15" ry="6" fill="#619050" transform="rotate(-11 413 169)"/>
            </g>

            {/* Pagoda */}
            <g className="wandr-pagoda">
              <rect x="146" y="156" width="36" height="22" fill="#A85838"/>
              <rect x="148" y="158" width="32" height="20" fill="#BC6848"/>
              <polygon points="142,156 182,156 178,145 146,145" fill="#8A3E28"/>
              <polygon points="146,145 178,145 174,135 150,135" fill="#A85838"/>
              <polygon points="150,135 174,135 170,126 154,126" fill="#8A3E28"/>
              <polygon points="154,126 170,126 162,115 162,115" fill="#A85838"/>
              <rect x="159" y="107" width="6" height="10" fill="#A85838"/>
              <circle cx="162" cy="105" r="5" fill="#E8A820" opacity="0.9"/>
              <rect x="154" y="166" width="14" height="12" rx="7" fill="#6A3818" opacity="0.55"/>
            </g>

            {/* Eiffel Tower */}
            <g className="wandr-eiffel">
              <polygon points="224,210 230,188 234,188 228,210" fill="#C87050"/>
              <polygon points="252,210 258,188 262,188 256,210" fill="#C87050"/>
              <rect x="228" y="186" width="30" height="4.5" fill="#C87050" rx="0.5"/>
              <polygon points="230,186 236,170 250,170 256,186" fill="#C87050"/>
              <rect x="234" y="168" width="18" height="3.5" fill="#A86040" rx="0.5"/>
              <polygon points="236,168 243,146 250,168" fill="#C87050"/>
              <line x1="243" y1="144" x2="243" y2="136" stroke="#8A4028" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="243" cy="135" r="3" fill="#A86040"/>
              <rect x="222" y="209" width="42" height="4" fill="#8A4028" rx="1.5"/>
            </g>

            {/* Pyramids */}
            <g className="wandr-pyramids">
              <polygon points="354,210 378,160 402,210" fill="#C8A060"/>
              <polygon points="354,210 378,160 378,210" fill="#B89050"/>
              <polygon points="374,210 392,176 410,210" fill="#D4B070"/>
              <polygon points="350,210 362,186 374,210" fill="#B89050"/>
              <path d="M 340,210 Q 378,205 416,210 L 416,217 Q 378,213 340,217 Z" fill="#C8A060" opacity="0.45"/>
            </g>

          </g>
        </g>

        {/* Paper edges */}
        <path d="M 100,85 Q 277,73 453,85" fill="none" stroke="#DDD0A0" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M 100,267 Q 277,279 453,267" fill="none" stroke="#B8A870" strokeWidth="2" strokeLinecap="round"/>

        {/* Right roll */}
        <ellipse cx="453" cy="176" rx="23" ry="91" fill="#C87050"/>
        <ellipse cx="453" cy="176" rx="14" ry="62" fill="#A86040"/>
        <ellipse cx="453" cy="176" rx="6"  ry="35" fill="#C87050" opacity="0.55"/>

        {/* Sand dunes spilling out bottom-right */}
        <path d="M 326,267 Q 360,250 396,262 Q 430,250 464,263 L 492,300 L 306,300 Z" fill="#D4A860"/>
        <path d="M 370,268 Q 410,252 450,263 Q 472,255 494,266 L 494,300 L 350,300 Z" fill="#C49850"/>
        <polygon points="386,267 402,248 418,267" fill="#C4A060" opacity="0.68"/>
        <polygon points="428,265 440,251 452,265" fill="#B89050" opacity="0.6"/>

        {/* Left roll — always visible, drawn on top */}
        <ellipse cx="100" cy="176" rx="92" ry="94" fill="#C87050"/>
        <path d="M 60,126 Q 80,108 110,106 Q 128,105 144,118" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.18"/>
        <ellipse cx="100" cy="176" rx="66" ry="68" fill="#A86040"/>
        <ellipse cx="100" cy="176" rx="44" ry="46" fill="#C87050"/>
        <path d="M 74,148 Q 84,140 100,138" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.12"/>
        <ellipse cx="100" cy="176" rx="26" ry="27" fill="#A86040"/>
        <ellipse cx="100" cy="176" rx="12" ry="12" fill="#C87050"/>
        <circle  cx="100" cy="176" r="5"           fill="#8A3828"/>
      </svg>
    </div>
  )
}


// ─── Destination SVGs ────────────────────────────────────────────────────────
function DestinationScene({ country }: { country: string }) {
  const scenes: Record<string, JSX.Element> = {
    Vietnam: (
      <svg viewBox="0 0 200 260" fill="none" className="w-full h-full">
        <rect width="200" height="260" fill="#1A5040" />
        <rect x="0" y="160" width="200" height="100" fill="#2A7A5B" />
        <polygon points="60,160 100,80 140,160" fill="#C94A2B" />
        <polygon points="70,160 100,95 130,160" fill="#D4613A" />
        <polygon points="78,160 100,108 122,160" fill="#C94A2B" />
        <rect x="88" y="145" width="24" height="15" fill="#1A1208" opacity="0.5" />
        <rect x="40" y="185" width="6" height="40" fill="#5A3A1A" />
        <ellipse cx="43" cy="180" rx="18" ry="8" fill="#2A7A5B" transform="rotate(-15 43 180)" />
        <ellipse cx="43" cy="180" rx="18" ry="8" fill="#3A9A6B" transform="rotate(20 43 180)" />
        <rect x="154" y="190" width="6" height="35" fill="#5A3A1A" />
        <ellipse cx="157" cy="185" rx="16" ry="7" fill="#3A9A6B" transform="rotate(10 157 185)" />
        <ellipse cx="157" cy="185" rx="16" ry="7" fill="#2A7A5B" transform="rotate(-20 157 185)" />
        <ellipse cx="100" cy="225" rx="60" ry="8" fill="#1A5040" opacity="0.5" />
        <rect x="20" y="145" width="30" height="8" rx="4" fill="#E8850A" opacity="0.6" />
        <rect x="150" y="138" width="30" height="8" rx="4" fill="#E8850A" opacity="0.6" />
      </svg>
    ),
    Thailand: (
      <svg viewBox="0 0 200 260" fill="none" className="w-full h-full">
        <rect width="200" height="260" fill="#E8850A" opacity="0.3" />
        <rect width="200" height="260" fill="#1A1208" opacity="0.5" />
        <rect x="0" y="180" width="200" height="80" fill="#2A7A5B" />
        <rect x="70" y="100" width="60" height="90" fill="#C94A2B" />
        <polygon points="60,100 100,50 140,100" fill="#B03A20" />
        <polygon points="65,90 100,55 135,90" fill="#C94A2B" />
        <polygon points="72,80 100,60 128,80" fill="#B03A20" />
        <rect x="86" y="150" width="28" height="30" rx="14" fill="#1A1208" opacity="0.6" />
        <circle cx="100" cy="48" r="5" fill="#F9C06A" />
        <rect x="30" y="170" width="8" height="50" fill="#5A3A1A" />
        <ellipse cx="34" cy="165" rx="22" ry="9" fill="#3A9A6B" transform="rotate(-10 34 165)" />
        <ellipse cx="34" cy="165" rx="22" ry="9" fill="#2A7A5B" transform="rotate(25 34 165)" />
        <rect x="162" y="175" width="8" height="45" fill="#5A3A1A" />
        <ellipse cx="166" cy="170" rx="20" ry="8" fill="#2A7A5B" transform="rotate(15 166 170)" />
        <circle cx="50" cy="60" r="12" fill="#F9C06A" opacity="0.8" />
        <circle cx="160" cy="45" r="3" fill="white" opacity="0.7" />
        <circle cx="30" cy="40" r="2" fill="white" opacity="0.6" />
      </svg>
    ),
    Japan: (
      <svg viewBox="0 0 200 260" fill="none" className="w-full h-full">
        <rect width="200" height="260" fill="#8B1A4A" opacity="0.4" />
        <rect width="200" height="260" fill="#1A1208" opacity="0.4" />
        <rect x="0" y="190" width="200" height="70" fill="#1A3A2A" />
        <rect x="75" y="130" width="50" height="70" fill="#1A1208" opacity="0.8" />
        <polygon points="55,130 100,80 145,130" fill="#C94A2B" />
        <polygon points="62,118 100,92 138,118" fill="#B03A20" />
        <polygon points="70,108 100,102 130,108" fill="#C94A2B" />
        <rect x="88" y="168" width="24" height="25" fill="#1A1208" opacity="0.9" />
        <rect x="82" y="160" width="14" height="8" rx="2" fill="#F9C06A" opacity="0.7" />
        <rect x="104" y="160" width="14" height="8" rx="2" fill="#F9C06A" opacity="0.7" />
        {/* Cherry blossoms */}
        <circle cx="40" cy="120" r="20" fill="#FFB7C5" opacity="0.8" />
        <circle cx="28" cy="110" r="15" fill="#FFB7C5" opacity="0.7" />
        <circle cx="52" cy="108" r="12" fill="#FF90A0" opacity="0.6" />
        <rect x="37" y="138" width="6" height="55" fill="#5A3A1A" />
        <circle cx="165" cy="115" r="18" fill="#FFB7C5" opacity="0.7" />
        <circle cx="178" cy="108" r="12" fill="#FF90A0" opacity="0.6" />
        <rect x="160" y="130" width="6" height="65" fill="#5A3A1A" />
        <circle cx="100" cy="40" r="18" fill="#FF6B6B" opacity="0.9" />
        <circle cx="100" cy="40" r="10" fill="#FF9999" />
      </svg>
    ),
    Bali: (
      <svg viewBox="0 0 200 260" fill="none" className="w-full h-full">
        <rect width="200" height="260" fill="#E8850A" opacity="0.5" />
        <rect width="200" height="260" fill="#1A5040" opacity="0.3" />
        <rect x="0" y="185" width="200" height="75" fill="#2A5A8A" opacity="0.8" />
        <rect x="0" y="200" width="200" height="60" fill="#3A7AB0" opacity="0.6" />
        <rect x="70" y="100" width="60" height="95" fill="#C94A2B" opacity="0.9" />
        <polygon points="58,100 100,40 142,100" fill="#B03A20" />
        <polygon points="65,88 100,52 135,88" fill="#C94A2B" />
        <polygon points="72,78 100,62 128,78" fill="#B03A20" />
        <polygon points="80,70 100,72 120,70" fill="#C94A2B" />
        <rect x="86" y="152" width="28" height="33" rx="2" fill="#1A1208" opacity="0.5" />
        <rect x="30" y="165" width="8" height="55" fill="#5A3A1A" />
        <ellipse cx="34" cy="158" rx="24" ry="9" fill="#3A9A6B" transform="rotate(-10 34 158)" />
        <ellipse cx="34" cy="158" rx="24" ry="9" fill="#2A7A5B" transform="rotate(20 34 158)" />
        <rect x="162" y="170" width="8" height="50" fill="#5A3A1A" />
        <ellipse cx="166" cy="163" rx="22" ry="9" fill="#2A7A5B" transform="rotate(15 166 163)" />
        <circle cx="160" cy="55" r="20" fill="#F9C06A" opacity="0.9" />
        <circle cx="160" cy="55" r="14" fill="#FFE080" />
      </svg>
    ),
    Morocco: (
      <svg viewBox="0 0 200 260" fill="none" className="w-full h-full">
        <rect width="200" height="260" fill="#E8850A" opacity="0.6" />
        <rect width="200" height="260" fill="#C94A2B" opacity="0.2" />
        <rect x="0" y="170" width="200" height="90" fill="#D4A055" />
        <rect x="20" y="90" width="45" height="90" fill="#F5ECD7" opacity="0.9" />
        <path d="M20,90 Q42,60 65,90" fill="#C94A2B" />
        <rect x="80" y="70" width="55" height="110" fill="#F5ECD7" />
        <path d="M80,70 Q107,35 135,70" fill="#B03A20" />
        <rect x="150" y="100" width="35" height="80" fill="#F5ECD7" opacity="0.9" />
        <path d="M150,100 Q167,75 185,100" fill="#C94A2B" />
        <rect x="96" y="120" width="22" height="45" rx="11" fill="#C94A2B" opacity="0.7" />
        <rect x="28" y="130" width="14" height="30" rx="7" fill="#E8850A" opacity="0.6" />
        <rect x="157" y="138" width="14" height="30" rx="7" fill="#E8850A" opacity="0.6" />
        <circle cx="107" cy="55" r="12" fill="#F9C06A" />
        <circle cx="40" cy="70" r="4" fill="white" opacity="0.8" />
        <circle cx="170" cy="80" r="3" fill="white" opacity="0.7" />
        <rect x="0" y="168" width="200" height="4" fill="#C94A2B" opacity="0.4" />
      </svg>
    ),
    India: (
      <svg viewBox="0 0 200 260" fill="none" className="w-full h-full">
        <rect width="200" height="260" fill="#E8850A" opacity="0.4" />
        <rect width="200" height="260" fill="#8B1A4A" opacity="0.2" />
        <rect x="0" y="180" width="200" height="80" fill="#D4A055" opacity="0.6" />
        <rect x="55" y="100" width="90" height="90" fill="#F5ECD7" opacity="0.9" />
        <rect x="55" y="85" width="90" height="18" fill="#E8850A" />
        <ellipse cx="100" cy="72" rx="35" ry="22" fill="#F5ECD7" />
        <ellipse cx="100" cy="65" rx="22" ry="20" fill="#F0E0C0" />
        <ellipse cx="100" cy="58" rx="12" ry="14" fill="#F5ECD7" />
        <ellipse cx="100" cy="52" rx="6" ry="8" fill="#E8850A" />
        <circle cx="100" cy="44" r="5" fill="#C94A2B" />
        <rect x="96" y="156" width="8" height="4" fill="#C94A2B" />
        <rect x="80" y="155" width="40" height="3" fill="#E8850A" opacity="0.5" />
        <rect x="64" y="130" width="16" height="22" rx="8" fill="#E8850A" opacity="0.5" />
        <rect x="120" y="130" width="16" height="22" rx="8" fill="#E8850A" opacity="0.5" />
        <rect x="20" y="155" width="8" height="60" fill="#5A3A1A" />
        <ellipse cx="24" cy="148" rx="20" ry="8" fill="#3A9A6B" transform="rotate(-15 24 148)" />
        <ellipse cx="24" cy="148" rx="20" ry="8" fill="#2A7A5B" transform="rotate(20 24 148)" />
        <rect x="172" y="158" width="8" height="55" fill="#5A3A1A" />
        <ellipse cx="176" cy="152" rx="18" ry="8" fill="#2A7A5B" transform="rotate(10 176 152)" />
        <circle cx="155" cy="50" r="22" fill="#F9C06A" opacity="0.9" />
        <circle cx="155" cy="50" r="14" fill="#FFE080" />
      </svg>
    ),
  }
  return scenes[country] ?? <rect width="200" height="260" fill="#2A7A5B" />
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

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ background: 'rgba(245,236,215,0.92)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${C.saffron}22` }}>
        <span className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-playfair)', color: C.terra }}>
          wandr.
        </span>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: C.dark }}>
          <a href="#how-it-works" className="hover:opacity-70 transition-opacity">How it works</a>
          <a href="#destinations" className="hover:opacity-70 transition-opacity">Destinations</a>
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
      <section className="min-h-screen flex items-center pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
              style={{ background: `${C.saffron}22`, color: C.saffron, border: `1px solid ${C.saffron}44` }}>
              <span>✦</span> Your AI travel companion
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight tracking-tight"
              style={{ fontFamily: 'var(--font-playfair)' }}>
              Every trip should feel like{' '}
              <em style={{ color: C.terra, fontStyle: 'italic' }}>magic.</em>
            </h1>
            <p className="text-lg leading-relaxed opacity-80 max-w-lg">
              Tell Wandr where you&apos;re dreaming of. Get a personalised itinerary built around you — your pace, your budget, your vibe.
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={handleStartPlanning} className="font-semibold px-7 py-3.5 rounded-full text-base transition-all hover:opacity-90 shadow-lg"
                style={{ background: C.terra, color: C.sand }}>
                Start planning
              </button>
              <a href="#how-it-works" className="font-semibold px-7 py-3.5 rounded-full text-base border-2 transition-all hover:opacity-70"
                style={{ borderColor: C.terra, color: C.terra }}>
                See how it works
              </a>
            </div>
            <p className="text-sm opacity-50">Free to start · No bookings, just brilliant plans · Works anywhere</p>
            <Link href="/cities" className="inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
              style={{ color: C.dark, opacity: 0.55 }}>
              🏙️ Explore city guides →
            </Link>
          </div>
          {/* Right */}
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl blur-3xl opacity-30" style={{ background: `radial-gradient(circle, ${C.saffron}, ${C.terra})` }} />
            <HeroIllustration />
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <section style={{ background: C.dark, color: C.sand }}>
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { stat: '50,000+', label: 'trips planned' },
              { stat: '120+', label: 'countries covered' },
              { stat: 'Weeks', label: 'of research saved' },
              { stat: 'Free', label: 'to start' },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="text-2xl font-bold" style={{ color: C.saffron, fontFamily: 'var(--font-playfair)' }}>{item.stat}</div>
                <div className="text-sm opacity-60">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium mb-3 uppercase tracking-widest" style={{ color: C.terra }}>Simple as a conversation</p>
            <h2 className="text-4xl font-bold" style={{ fontFamily: 'var(--font-playfair)' }}>How it works</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', icon: '✈️', title: 'Sign in & tell us where', desc: 'Create a free account and share where you dream of going — or ask for ideas.' },
              { step: '02', icon: '💬', title: 'Chat like it\'s a friend', desc: 'Talk naturally. Tell Wandr your budget, travel style, and what excites you.' },
              { step: '03', icon: '🗺️', title: 'Get your personalised plan', desc: 'Receive a detailed day-by-day itinerary built specifically for you.' },
              { step: '04', icon: '✨', title: 'Tweak until it&apos;s perfect', desc: 'Adjust anything. Change a day, swap a hotel, add a detour. It&apos;s your trip.' },
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

      {/* ── DESTINATIONS ── */}
      <section id="destinations" className="py-24 px-6" style={{ background: C.dark }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16" style={{ color: C.sand }}>
            <p className="text-sm font-medium mb-3 uppercase tracking-widest" style={{ color: C.saffron }}>Wander further</p>
            <h2 className="text-4xl font-bold" style={{ fontFamily: 'var(--font-playfair)' }}>Dream destinations</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { name: 'Vietnam', sub: 'Ancient temples & misty mountains' },
              { name: 'Thailand', sub: 'Golden spires & turquoise waters' },
              { name: 'Japan', sub: 'Quiet rituals & cherry blossom' },
              { name: 'Bali', sub: 'Sacred rice fields & ocean sunsets' },
              { name: 'Morocco', sub: 'Spiced souks & desert stargazing' },
              { name: 'India', sub: 'Colours, chaos & pure magic' },
            ].map((dest) => (
              <Link href="/chat" key={dest.name}
                className="group relative overflow-hidden rounded-2xl cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
                style={{ aspectRatio: '3/4' }}>
                <DestinationScene country={dest.name} />
                <div className="absolute inset-0 rounded-2xl"
                  style={{ background: 'linear-gradient(to top, rgba(26,18,8,0.85) 0%, rgba(26,18,8,0.1) 60%, transparent 100%)' }} />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="font-bold text-lg" style={{ color: C.sand, fontFamily: 'var(--font-playfair)' }}>{dest.name}</p>
                  <p className="text-xs opacity-70" style={{ color: C.sand }}>{dest.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium mb-3 uppercase tracking-widest" style={{ color: C.terra }}>Why Wandr</p>
            <h2 className="text-4xl font-bold" style={{ fontFamily: 'var(--font-playfair)' }}>Built differently</h2>
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
            {/* Full width testimonial */}
            <div className="md:col-span-2 lg:col-span-2 rounded-2xl p-8" style={{ background: C.terra, color: C.sand }}>
              <div className="text-3xl mb-4">👨‍👩‍👧‍👦</div>
              <blockquote className="text-xl font-medium leading-relaxed mb-4" style={{ fontFamily: 'var(--font-playfair)', fontStyle: 'italic' }}>
                &quot;We were travelling with a toddler and had no idea where to start. Wandr planned our whole Japan trip around nap times, kid-friendly restaurants, and slow mornings. It was genuinely perfect.&quot;
              </blockquote>
              <p className="text-sm opacity-70">Sarah & Mike — Wellington → Osaka</p>
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

      {/* ── REVIEWS ── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold" style={{ fontFamily: 'var(--font-playfair)' }}>Travellers love it</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                stars: 5,
                quote: "I've used every travel planning tool out there. Wandr is the first one that actually feels like talking to someone who knows what they're doing.",
                initials: 'JT',
                name: 'James T.',
                route: 'Auckland → Tokyo',
              },
              {
                stars: 5,
                quote: "The itinerary it built for Morocco was better than anything I'd have come up with in weeks of research. Specific hotels, riads, the lot.",
                initials: 'PK',
                name: 'Priya K.',
                route: 'Sydney → Marrakech',
              },
              {
                stars: 5,
                quote: "Backpacking Southeast Asia solo for the first time. Wandr helped me figure out routing, budget, and which places were actually worth it.",
                initials: 'AL',
                name: 'Alex L.',
                route: 'London → Hanoi',
              },
            ].map((review) => (
              <div key={review.name} className="rounded-2xl p-6 space-y-4" style={{ background: 'white', border: `1px solid ${C.saffron}33` }}>
                <div className="flex gap-0.5">
                  {Array.from({ length: review.stars }).map((_, i) => (
                    <span key={i} style={{ color: C.saffron }}>★</span>
                  ))}
                </div>
                <blockquote className="text-sm leading-relaxed opacity-80" style={{ fontFamily: 'var(--font-playfair)', fontStyle: 'italic' }}>
                  &quot;{review.quote}&quot;
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: C.terra, color: C.sand }}>
                    {review.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{review.name}</p>
                    <p className="text-xs opacity-50">{review.route}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
