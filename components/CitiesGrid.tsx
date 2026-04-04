'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
const C = {
  sand: '#F5ECD7',
  terra: '#C94A2B',
  saffron: '#E8850A',
  jade: '#2A7A5B',
  dark: '#1A1208',
}

const REGION_COLORS: Record<string, string> = {
  'East Asia': C.terra,
  'Southeast Asia': C.jade,
  'Africa': C.saffron,
  'Europe': '#7B5EA7',
  'Americas': '#2A6A8A',
  'South Asia': '#C47A2B',
  'Middle East': '#8A5A2B',
}

interface City {
  slug: string
  name: string
  country: string
  region: string | null
  hero_tagline: string | null
}

interface Props {
  cities: City[]
}

export function CitiesGrid({ cities }: Props) {
  const [search, setSearch] = useState('')
  const [activeRegion, setActiveRegion] = useState<string | null>(null)

  const regions = useMemo(() => {
    const set = new Set(cities.map(c => c.region).filter(Boolean) as string[])
    return Array.from(set).sort()
  }, [cities])

  const filtered = useMemo(() => {
    return cities.filter(city => {
      const matchesSearch =
        !search ||
        city.name.toLowerCase().includes(search.toLowerCase()) ||
        city.country.toLowerCase().includes(search.toLowerCase())
      const matchesRegion = !activeRegion || city.region === activeRegion
      return matchesSearch && matchesRegion
    })
  }, [cities, search, activeRegion])

  return (
    <div className="px-6 pb-16 max-w-5xl mx-auto">

      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <input
          type="text"
          placeholder="Search cities or countries…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-4 py-3 rounded-2xl text-sm outline-none transition-all"
          style={{
            background: 'white',
            border: `1.5px solid ${C.dark}15`,
            color: C.dark,
          }}
          onFocus={e => (e.target.style.borderColor = C.terra)}
          onBlur={e => (e.target.style.borderColor = `${C.dark}15`)}
        />

        {/* Region filters */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveRegion(null)}
            className="px-4 py-2 rounded-full text-sm font-medium border transition-all"
            style={!activeRegion
              ? { background: C.dark, color: C.sand, borderColor: C.dark }
              : { background: 'white', color: C.dark, borderColor: `${C.dark}20` }
            }
          >
            All
          </button>
          {regions.map(region => (
            <button
              key={region}
              onClick={() => setActiveRegion(activeRegion === region ? null : region)}
              className="px-4 py-2 rounded-full text-sm font-medium border transition-all"
              style={activeRegion === region
                ? { background: REGION_COLORS[region] ?? C.terra, color: C.sand, borderColor: 'transparent' }
                : { background: 'white', color: C.dark, borderColor: `${C.dark}20` }
              }
            >
              {region}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {(search || activeRegion) && (
        <p className="text-sm mb-4" style={{ color: C.dark, opacity: 0.5 }}>
          {filtered.length} {filtered.length === 1 ? 'city' : 'cities'} found
        </p>
      )}

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(city => (
            <Link key={city.slug} href={`/cities/${city.slug}`} className="group block">
              <div className="rounded-3xl p-6 h-full transition-all group-hover:shadow-lg group-hover:-translate-y-0.5"
                style={{ background: 'white', boxShadow: '0 2px 12px rgba(26,18,8,0.07)' }}>

                {/* Region badge */}
                {city.region && (
                  <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3"
                    style={{
                      background: `${REGION_COLORS[city.region] ?? C.terra}15`,
                      color: REGION_COLORS[city.region] ?? C.terra,
                    }}>
                    {city.region}
                  </span>
                )}

                <h2 className="text-2xl font-bold mb-0.5 transition-colors group-hover:opacity-80"
                  style={{ fontFamily: 'var(--font-playfair)', color: C.dark }}>
                  {city.name}
                </h2>
                <p className="text-sm mb-3" style={{ color: C.dark, opacity: 0.45 }}>
                  {city.country}
                </p>

                {city.hero_tagline && (
                  <p className="text-sm leading-relaxed" style={{ color: C.dark, opacity: 0.65 }}>
                    {city.hero_tagline}
                  </p>
                )}

                <div className="mt-4 flex items-center gap-1 text-sm font-medium transition-opacity group-hover:opacity-70"
                  style={{ color: C.terra }}>
                  Explore guide →
                </div>

              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-lg font-medium mb-1" style={{ color: C.dark }}>No cities found</p>
          <p className="text-sm" style={{ color: C.dark, opacity: 0.5 }}>
            Try a different search or clear the filter.
          </p>
        </div>
      )}
    </div>
  )
}
