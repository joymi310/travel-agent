import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-xl w-full text-center space-y-6">
        <div className="space-y-2">
          <p className="text-slate-400 text-sm uppercase tracking-widest">AI Travel Agent</p>
          <h1 className="text-4xl font-bold tracking-tight">Plan your next adventure</h1>
          <p className="text-slate-400 text-lg">
            Expert travel planning from New Zealand and Australia. Routes, itineraries, honest costs — no bookings made.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/chat"
            className="bg-sky-500 hover:bg-sky-400 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Start planning
          </Link>
        </div>

        <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          {[
            { label: 'Long-haul routing', desc: 'Best stopovers and connections from WLG, AKL, CHC and beyond' },
            { label: 'Family travel', desc: 'Itineraries that work with toddlers — pacing, accommodation, flights' },
            { label: 'Honest costs', desc: 'Real NZD estimates for flights, hotels, food, and activities' },
          ].map((item) => (
            <div key={item.label} className="bg-slate-900 rounded-lg p-4 border border-slate-800">
              <p className="font-semibold text-sm text-sky-400">{item.label}</p>
              <p className="text-slate-400 text-sm mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
