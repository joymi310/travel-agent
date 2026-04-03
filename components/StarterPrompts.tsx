'use client'

const STARTER_PROMPTS = [
  'Plan me 5 days in Kyoto with a 2-year-old',
  'Best route Wellington to London — minimise travel time',
  'Family itinerary: 2 weeks in Japan from WLG',
  'Cheap month in Southeast Asia, flying from Christchurch',
  'Honest cost breakdown for 2 weeks in Italy',
  'What\'s the best stopover city for WLG to Europe?',
]

export function StarterPrompts({ onSelect }: { onSelect: (prompt: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-full bg-sky-500 flex items-center justify-center text-xl font-bold mx-auto">
          TA
        </div>
        <h2 className="text-xl font-semibold">Where to next?</h2>
        <p className="text-slate-400 text-sm">Ask me anything about travel from New Zealand or Australia.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-2xl">
        {STARTER_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onSelect(prompt)}
            className="text-left bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-300 transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  )
}
