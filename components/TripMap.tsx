'use client'

import { useRef, useCallback } from 'react'
import Map, { Marker, Source, Layer, type MapRef } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'

export interface TripLocation {
  day: number
  city: string
  lat: number
  lng: number
  label: string
}

interface TripMapProps {
  locations: TripLocation[]
  className?: string
}

const TERRA = '#C94A2B'
const JADE  = '#2A7A5B'
const SAND  = '#F5ECD7'

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY
const MAP_STYLE = `https://api.maptiler.com/maps/streets-v2-light/style.json?key=${MAPTILER_KEY}`

type Bounds = [[number, number], [number, number]]

function getBounds(locations: TripLocation[]): Bounds | null {
  if (locations.length < 2) return null
  const lngs = locations.map(l => l.lng)
  const lats = locations.map(l => l.lat)
  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ]
}

export function TripMap({ locations, className = '' }: TripMapProps) {
  const mapRef = useRef<MapRef>(null)

  const onLoad = useCallback(() => {
    const bounds = getBounds(locations)
    if (!mapRef.current || !bounds) return
    mapRef.current.fitBounds(bounds, { padding: 60, duration: 600 })
  }, [locations])

  if (!MAPTILER_KEY) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ background: '#e8e0d4' }}>
        <p className="text-sm" style={{ color: '#888' }}>Map unavailable</p>
      </div>
    )
  }

  if (locations.length === 0) return null

  const singleLocation = locations.length === 1
  const bounds = getBounds(locations)

  const routeGeoJSON: GeoJSON.Feature<GeoJSON.LineString> = {
    type: 'Feature',
    geometry: { type: 'LineString', coordinates: locations.map(l => [l.lng, l.lat]) },
    properties: {},
  }

  return (
    <Map
      ref={mapRef}
      mapStyle={MAP_STYLE}
      initialViewState={
        singleLocation
          ? { longitude: locations[0].lng, latitude: locations[0].lat, zoom: 12 }
          : bounds
          ? { bounds, fitBoundsOptions: { padding: 60 } }
          : undefined
      }
      style={{ width: '100%', height: '100%' }}
      onLoad={onLoad}
      attributionControl={false}
    >
      {/* Route line */}
      {!singleLocation && (
        <Source id="route" type="geojson" data={routeGeoJSON}>
          <Layer
            id="route-line"
            type="line"
            paint={{
              'line-color': TERRA,
              'line-width': 2.5,
              'line-opacity': 0.75,
              'line-dasharray': [2, 2],
            }}
          />
        </Source>
      )}

      {/* Day pill pins */}
      {locations.map((loc, i) => {
        const isLast = i === locations.length - 1
        return (
          <Marker key={i} latitude={loc.lat} longitude={loc.lng} anchor="center">
            <div
              title={`Day ${loc.day} — ${loc.city}${isLast ? ' (final stop)' : ' (overnight)'}`}
              style={{
                background: isLast ? JADE : TERRA,
                color: SAND,
                borderRadius: '999px',
                padding: '4px 9px',
                fontSize: 11,
                fontWeight: 700,
                border: '2px solid white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                fontFamily: 'sans-serif',
                cursor: 'default',
                userSelect: 'none',
                whiteSpace: 'nowrap',
                lineHeight: 1.2,
              }}
            >
              Day {loc.day}
            </div>
          </Marker>
        )
      })}
    </Map>
  )
}
