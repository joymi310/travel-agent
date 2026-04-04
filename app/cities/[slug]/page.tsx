import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CityChat } from '@/components/CityChat'
import { CityGuide } from '@/components/CityGuide'
import Link from 'next/link'
import type { Metadata } from 'next'

export const revalidate = 86400

const C = {
  sand: '#F5ECD7',
  terra: '#C94A2B',
  saffron: '#E8850A',
  jade: '#2A7A5B',
  dark: '#1A1208',
}

const REGION_COLORS: Record<string, string> = {
  'East Asia': '#1E3A5F',
  'Southeast Asia': '#2A7A5B',
  'South Asia': '#C94A2B',
  'Middle East': '#B8740A',
  'Europe': '#4A5568',
  'Africa': '#6B4226',
  'Americas': '#2D5A3D',
  'Oceania': '#1A5F7A',
}

const PRICE_BADGE: Record<string, { bg: string; text: string }> = {
  Budget: { bg: `${C.jade}18`, text: C.jade },
  'Mid-range': { bg: `${C.saffron}18`, text: '#9A5800' },
  Luxury: { bg: `${C.terra}18`, text: C.terra },
}

// Profile travel_style → questionnaire companions mapping
const STYLE_TO_COMPANIONS: Record<string, string> = {
  backpacker: 'solo',
  off_beaten_track: 'solo',
  senior: 'solo',
  family_young_kids: 'family_young',
  family_teens: 'family_teens',
}

const BUDGET_MAP: Record<string, string> = {
  budget: 'budget',
  mid: 'mid_range',
  luxury: 'luxury',
}

interface Neighbourhood {
  name: string
  vibe: string
  best_for: string
  price_range: string
}

interface City {
  id: string
  slug: string
  name: string
  country: string
  region: string | null
  hero_tagline: string | null
  overview: string | null
  neighbourhoods: Neighbourhood[] | null
  best_time: string | null
  getting_around: string | null
  visa_notes: string | null
  suggested_questions: string[] | null
}

async function getCityBySlug(slug: string): Promise<City | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('cities')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()
  return data
}

export async function generateStaticParams() {
  const admin = createAdminClient()
  const { data } = await admin
    .from('cities')
    .select('slug')
    .eq('is_published', true)
  return (data ?? []).map(c => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const city = await getCityBySlug(params.slug)
  if (!city) return {}

  const description = (city.overview ?? '').slice(0, 155)
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://travel-agent-chi-ten.vercel.app'
  const url = `${base}/cities/${city.slug}`

  return {
    title: `${city.name} Travel Guide — Where to Stay, Local Tips & Neighbourhoods | Wandr`,
    description,
    openGraph: {
      title: `${city.name} Travel Guide | Wandr`,
      description,
      url,
      type: 'website',
    },
  }
}

export default async function CityPage({ params }: { params: { slug: string } }) {
  const city = await getCityBySlug(params.slug)
  if (!city) notFound()

  const regionColor = REGION_COLORS[city.region ?? ''] ?? '#374151'
  const neighbourhoods = city.neighbourhoods ?? []
  const suggestedQuestions = city.suggested_questions ?? []

  // Fetch user profile to pre-fill questionnaire
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const initialAnswers: { companions?: string; budget?: string } = {}
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('travel_style, profile_data')
      .eq('id', user.id)
      .single()

    if (profile?.travel_style) {
      const companions = STYLE_TO_COMPANIONS[profile.travel_style]
      if (companions) initialAnswers.companions = companions
    }
    if (profile?.profile_data?.budget) {
      const budget = BUDGET_MAP[profile.profile_data.budget]
      if (budget) initialAnswers.budget = budget
    }
  }

  return (
    <div className="min-h-screen" style={{ background: C.sand }}>
      {/* Nav */}
      <nav className="border-b px-6 py-4" style={{ background: C.dark, borderColor: 'rgba(245,236,215,0.1)' }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold" style={{ fontFamily: 'var(--font-playfair)', color: C.terra }}>
            wandr.
          </Link>
          <Link href="/login" className="text-sm transition-opacity hover:opacity-70"
            style={{ color: C.sand, opacity: 0.6 }}>
            Sign in
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div className="px-6 py-16 text-center" style={{ background: regionColor }}>
        <div className="max-w-3xl mx-auto">
          <p className="text-xs mb-6" style={{ color: 'rgba(255,255,255,0.5)' }}>
            <Link href="/" className="hover:opacity-80 transition-opacity">Home</Link>
            <span className="mx-2">›</span>
            <Link href="/cities" className="hover:opacity-80 transition-opacity">Cities</Link>
            <span className="mx-2">›</span>
            <span style={{ opacity: 0.8 }}>{city.name}</span>
          </p>

          <h1 className="text-5xl lg:text-7xl font-bold mb-3"
            style={{ fontFamily: 'var(--font-playfair)', fontStyle: 'italic', color: 'white' }}>
            {city.name}
          </h1>
          <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {city.country}{city.region ? ` · ${city.region}` : ''}
          </p>
          {city.hero_tagline && (
            <p className="text-lg" style={{ color: 'rgba(255,255,255,0.8)', fontStyle: 'italic' }}>
              &ldquo;{city.hero_tagline}&rdquo;
            </p>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6">

        {/* ── OVERVIEW ── */}
        <section className="py-12 border-b" style={{ borderColor: `${C.dark}12` }}>
          {city.overview && (
            <p className="text-base leading-relaxed mb-8 max-w-2xl" style={{ color: C.dark, opacity: 0.85 }}>
              {city.overview}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {city.best_time && (
              <div className="rounded-2xl p-5" style={{ background: 'white', boxShadow: '0 2px 12px rgba(26,18,8,0.07)' }}>
                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: C.saffron }}>
                  Best time to visit
                </p>
                <p className="text-sm leading-relaxed" style={{ color: C.dark, opacity: 0.8 }}>
                  {city.best_time}
                </p>
              </div>
            )}
            {city.getting_around && (
              <div className="rounded-2xl p-5" style={{ background: 'white', boxShadow: '0 2px 12px rgba(26,18,8,0.07)' }}>
                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: C.jade }}>
                  Getting around
                </p>
                <p className="text-sm leading-relaxed" style={{ color: C.dark, opacity: 0.8 }}>
                  {city.getting_around}
                </p>
              </div>
            )}
          </div>

          {city.visa_notes && (
            <div className="flex gap-3 items-start rounded-xl p-4"
              style={{ background: `${C.saffron}12`, border: `1px solid ${C.saffron}33` }}>
              <span className="text-base shrink-0 mt-0.5">ℹ️</span>
              <div>
                <p className="text-xs font-semibold mb-0.5" style={{ color: '#9A5800' }}>Visa notes</p>
                <p className="text-sm leading-relaxed" style={{ color: C.dark, opacity: 0.8 }}>
                  {city.visa_notes}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* ── NEIGHBOURHOODS ── */}
        {neighbourhoods.length > 0 && (
          <section className="py-12 border-b" style={{ borderColor: `${C.dark}12` }}>
            <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'var(--font-playfair)', color: C.dark }}>
              Where to stay
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {neighbourhoods.map((n, i) => {
                const badge = PRICE_BADGE[n.price_range] ?? { bg: `${C.dark}10`, text: C.dark }
                return (
                  <div key={i} className="rounded-2xl p-5"
                    style={{ background: 'white', boxShadow: '0 2px 12px rgba(26,18,8,0.07)' }}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-base" style={{ color: C.dark }}>
                        {n.name}
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                        style={{ background: badge.bg, color: badge.text }}>
                        {n.price_range}
                      </span>
                    </div>
                    <p className="text-sm mb-2 leading-relaxed" style={{ color: C.dark, opacity: 0.75 }}>
                      {n.vibe}
                    </p>
                    <p className="text-xs" style={{ color: C.dark, opacity: 0.45 }}>
                      Best for: {n.best_for}
                    </p>
                  </div>
                )
              })}
            </div>
          </section>
        )}

      </div>

      {/* ── PERSONALISED GUIDE ── */}
      <CityGuide
        city={{
          slug: city.slug,
          name: city.name,
          country: city.country,
          overview: city.overview ?? '',
          neighbourhoods: neighbourhoods,
          best_time: city.best_time ?? '',
          getting_around: city.getting_around ?? '',
          suggested_questions: suggestedQuestions,
        }}
        initialAnswers={initialAnswers}
      />

      {/* ── CITY CHAT ── */}
      <div style={{ background: C.sand }}>
        <div className="max-w-4xl mx-auto border-b" style={{ borderColor: `${C.dark}12` }}>
          <CityChat
            city={city.name}
            country={city.country}
            suggestedQuestions={suggestedQuestions}
          />
        </div>
      </div>

      {/* ── PLANNER CTA ── */}
      <div className="px-6 py-16" style={{ background: regionColor }}>
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <h2 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-playfair)', fontStyle: 'italic', color: 'white' }}>
            Planning a trip to {city.name}?
          </h2>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Get a personalised day-by-day itinerary in minutes.
          </p>
          <Link href={`/?destination=${city.slug}`}
            className="inline-block font-semibold px-7 py-3.5 rounded-full text-sm transition-opacity hover:opacity-90"
            style={{ background: 'white', color: regionColor }}>
            Build my {city.name} itinerary →
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-6 text-center" style={{ background: C.dark }}>
        <Link href="/" className="text-xl font-bold" style={{ fontFamily: 'var(--font-playfair)', color: C.terra }}>
          wandr.
        </Link>
        <p className="text-xs mt-2" style={{ color: C.sand, opacity: 0.3 }}>
          © 2026 Wandr · No bookings made. Just brilliant plans.
        </p>
      </footer>
    </div>
  )
}
