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

  const filtered = query.trim()
    ? cities.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.country.toLowerCase().includes(query.toLowerCase())
      )
    : cities

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

      {filtered.length === 0 ? (
        <p className="text-center py-12 text-sm" style={{ color: C.dark, opacity: 0.4 }}>
          No cities found for &ldquo;{query}&rdquo;
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(city => {
            const bg = REGION_COLORS[city.region ?? ''] ?? '#374151'
            return (
              <Link key={city.slug} href={`/cities/${city.slug}`}
                className="group block rounded-2xl overflow-hidden transition-transform hover:scale-[1.02]"
                style={{ boxShadow: '0 4px 20px rgba(26,18,8,0.12)' }}>
                {/* Photo header */}
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
                  {/* Gradient overlay */}
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)' }} />
                  {/* City name on photo */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-xs font-medium mb-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      {city.country}{city.region ? ` · ${city.region}` : ''}
                    </p>
                    <h3 className="text-xl font-bold leading-tight" style={{ fontFamily: 'var(--font-playfair)', color: 'white' }}>
                      {city.name}
                    </h3>
                  </div>
                </div>
                {/* Card footer */}
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
          })}
        </div>
      )}
    </div>
  )
}
