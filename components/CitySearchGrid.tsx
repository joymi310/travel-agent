'use client'

import { useState } from 'react'
import Link from 'next/link'

const C = {
  sand: '#F5ECD7',
  terra: '#C94A2B',
  saffron: '#E8850A',
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

const REGION_ORDER = [
  'Europe',
  'East Asia',
  'Southeast Asia',
  'South Asia',
  'Middle East',
  'Africa',
  'Americas',
  'Oceania',
]

interface City {
  slug: string
  name: string
  country: string
  region: string | null
  hero_tagline: string | null
  hero_image_url?: string | null
}

export function CitySearchGrid({ cities }: { cities: City[] }) {
  const [query, setQuery] = useState('')

  const isSearching = query.trim().length > 0

  const filtered = isSearching
    ? cities.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.country.toLowerCase().includes(query.toLowerCase())
      )
    : cities

  // Group by region for the non-search view
  const grouped: { region: string; cities: City[] }[] = []
  if (!isSearching) {
    const map = new Map<string, City[]>()
    for (const city of cities) {
      const r = city.region ?? 'Other'
      if (!map.has(r)) map.set(r, [])
      map.get(r)!.push(city)
    }
    const knownOrder = REGION_ORDER.filter(r => map.has(r))
    const rest = [...map.keys()].filter(r => !REGION_ORDER.includes(r)).sort()
    for (const r of [...knownOrder, ...rest]) {
      grouped.push({ region: r, cities: map.get(r)! })
    }
  }

  const CityCard = ({ city }: { city: City }) => {
    const bg = REGION_COLORS[city.region ?? ''] ?? '#374151'
    return (
      <Link key={city.slug} href={`/cities/${city.slug}`}
        className="group block rounded-2xl overflow-hidden transition-transform hover:scale-[1.02]"
        style={{ boxShadow: '0 4px 20px rgba(26,18,8,0.12)' }}>
        <div className="relative overflow-hidden" style={{ aspectRatio: '3/2' }}>
          {city.hero_image_url ? (
            <img
              src={city.hero_image_url}
              alt={`${city.name}, ${city.country}`}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full" style={{ background: bg }} />
          )}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)' }} />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="text-xs font-medium mb-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {city.country}
            </p>
            <h3 className="text-xl font-bold leading-tight" style={{ fontFamily: 'var(--font-playfair)', color: 'white' }}>
              {city.name}
            </h3>
          </div>
        </div>
        <div className="px-5 py-3 flex items-center justify-between" style={{ background: 'white' }}>
          {city.hero_tagline ? (
            <p className="text-xs italic truncate mr-2" style={{ color: C.dark, opacity: 0.55 }}>
              &ldquo;{city.hero_tagline}&rdquo;
            </p>
          ) : (
            <span className="text-xs font-medium" style={{ color: C.dark, opacity: 0.5 }}>View guide</span>
          )}
          <span className="text-sm shrink-0" style={{ color: C.terra }}>→</span>
        </div>
      </Link>
    )
  }

  return (
    <div>
      {/* Search */}
      <div className="max-w-sm mx-auto mb-10">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search cities or countries…"
          className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
          style={{ background: 'white', border: `1.5px solid ${C.saffron}44`, color: C.dark }}
          onFocus={e => e.target.style.borderColor = C.terra}
          onBlur={e => e.target.style.borderColor = `${C.saffron}44`}
        />
      </div>

      {isSearching ? (
        filtered.length === 0 ? (
          <p className="text-center py-12 text-sm" style={{ color: C.dark, opacity: 0.4 }}>
            No cities found for &ldquo;{query}&rdquo;
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(city => <CityCard key={city.slug} city={city} />)}
          </div>
        )
      ) : (
        <div className="space-y-14">
          {grouped.map(({ region, cities: regionCities }) => (
            <section key={region}>
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-lg font-semibold shrink-0"
                  style={{ fontFamily: 'var(--font-playfair)', color: C.dark }}>
                  {region}
                </h2>
                <div className="flex-1 h-px" style={{ background: `${C.dark}18` }} />
                <span className="text-xs shrink-0" style={{ color: C.dark, opacity: 0.35 }}>
                  {regionCities.length} {regionCities.length === 1 ? 'city' : 'cities'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {regionCities.map(city => <CityCard key={city.slug} city={city} />)}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
