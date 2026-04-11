import { createClient } from '@/lib/supabase/server'
import { CitySearchGrid } from '@/components/CitySearchGrid'
import { RequestCityButton } from '@/components/RequestCityButton'
import Link from 'next/link'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'City Guides — Local Tips, Neighbourhoods & Travel Advice | Wayfindr',
  description: 'Explore in-depth travel guides for cities around the world. Real neighbourhood advice, local tips and AI-powered Q&A.',
}

const C = {
  sand: '#F5ECD7',
  terra: '#C94A2B',
  dark: '#1A1208',
}

export default async function CitiesPage() {
  const supabase = createClient()
  const { data: cities } = await supabase
    .from('cities')
    .select('slug, name, country, region, hero_tagline, hero_image_url')
    .eq('is_published', true)
    .order('name')

  return (
    <div className="min-h-screen" style={{ background: C.sand }}>
      {/* Nav */}
      <nav className="border-b px-6 py-4" style={{ background: C.dark, borderColor: 'rgba(245,236,215,0.1)' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold" style={{ fontFamily: 'var(--font-playfair)', color: C.terra }}>
            wayfindr.
          </Link>
          <Link href="/login" className="text-sm transition-opacity hover:opacity-70"
            style={{ color: C.sand, opacity: 0.6 }}>
            Sign in
          </Link>
        </div>
      </nav>

      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="mb-2 text-xs font-medium" style={{ color: C.terra }}>
          <Link href="/" className="hover:opacity-70 transition-opacity">Home</Link>
          <span className="mx-2" style={{ color: C.dark, opacity: 0.3 }}>›</span>
          <span style={{ color: C.dark, opacity: 0.6 }}>City Guides</span>
        </div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-3"
              style={{ fontFamily: 'var(--font-playfair)', color: C.dark }}>
              City Guides
            </h1>
            <p className="text-base max-w-xl" style={{ color: C.dark, opacity: 0.6 }}>
              In-depth guides written by AI, refined by real travellers. Neighbourhoods, transport, food and an AI travel expert you can chat to.
            </p>
          </div>
          <div className="pt-1">
            <RequestCityButton />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <CitySearchGrid cities={cities ?? []} />
      </div>
    </div>
  )
}
