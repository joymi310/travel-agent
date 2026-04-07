'use client'

import { useEffect, useRef } from 'react'
import type { Map as LeafletMap } from 'leaflet'

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

export function TripMap({ locations, className = '' }: TripMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<LeafletMap | null>(null)

  useEffect(() => {
    if (!containerRef.current || locations.length === 0) return

    // Leaflet must be imported client-side only
    import('leaflet').then(L => {
      // Prevent double-init on hot-reload
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }

      // Import CSS once
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link')
        link.id   = 'leaflet-css'
        link.rel  = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
      }

      const map = L.map(containerRef.current!, { zoomControl: true, attributionControl: true })
      mapRef.current = map

      // Carto Light — minimal, clean, no API key required
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
      }).addTo(map)

      const latlngs = locations.map(l => [l.lat, l.lng] as [number, number])

      // Route polyline
      if (latlngs.length > 1) {
        L.polyline(latlngs, {
          color: TERRA,
          weight: 2.5,
          opacity: 0.7,
          dashArray: '6 4',
        }).addTo(map)
      }

      // Numbered pins
      locations.forEach((loc, i) => {
        const isLast = i === locations.length - 1
        const bg = isLast ? JADE : TERRA
        const icon = L.divIcon({
          html: `<div style="
            background:${bg};
            color:${SAND};
            border-radius:50%;
            width:28px;height:28px;
            display:flex;align-items:center;justify-content:center;
            font-size:11px;font-weight:700;
            border:2.5px solid white;
            box-shadow:0 2px 6px rgba(0,0,0,0.25);
            font-family:sans-serif;
          ">${loc.day}</div>`,
          className: '',
          iconSize:   [28, 28],
          iconAnchor: [14, 14],
          popupAnchor: [0, -16],
        })

        L.marker([loc.lat, loc.lng], { icon })
          .addTo(map)
          .bindPopup(`<strong style="font-size:13px">${loc.label}</strong>`, {
            closeButton: false,
            className: 'wandr-popup',
          })
      })

      // Fit all pins — defer so the flex layout has finished sizing the container
      const fitMap = () => {
        map.invalidateSize()
        if (latlngs.length === 1) {
          map.setView(latlngs[0], 12)
        } else {
          map.fitBounds(L.latLngBounds(latlngs), { padding: [40, 40] })
        }
      }
      // Two passes: immediate + 300ms fallback covers most browser paint cycles
      requestAnimationFrame(() => { fitMap(); setTimeout(fitMap, 300) })

      // Also re-fit whenever the container is resized (e.g. panel resize)
      const ro = new ResizeObserver(() => map.invalidateSize())
      ro.observe(containerRef.current!)
    })

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
      if (containerRef.current) {
        // ResizeObserver cleanup happens automatically when the element is removed
      }
    }
  }, [locations])

  return (
    <>
      <style>{`
        .wandr-popup .leaflet-popup-content-wrapper {
          border-radius: 10px;
          padding: 2px 6px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .wandr-popup .leaflet-popup-tip { display: none; }
      `}</style>
      <div ref={containerRef} className={className} style={{ background: '#e8e0d4' }} />
    </>
  )
}
