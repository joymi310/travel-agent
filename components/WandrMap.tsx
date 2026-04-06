'use client'

export default function WandrMap() {
  return (
    <div style={{
      WebkitMaskImage: 'radial-gradient(ellipse at center, black 55%, transparent 80%)',
      maskImage: 'radial-gradient(ellipse at center, black 55%, transparent 80%)',
    }}>
      <img
        src="/hero-map.png"
        alt="Wandr illustrated map"
        style={{ width: '100%', display: 'block', mixBlendMode: 'multiply' }}
      />
    </div>
  )
}
