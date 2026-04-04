'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
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
