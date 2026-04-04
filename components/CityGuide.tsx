'use client'

import { useState, useMemo } from 'react'
import { useCompletion } from 'ai/react'
import ReactMarkdown from 'react-markdown'
import { CityQuestionnaire, type QuestionnaireAnswers } from './CityQuestionnaire'

const C = {
  sand: '#F5ECD7',
  terra: '#C94A2B',
  saffron: '#E8850A',
  jade: '#2A7A5B',
  dark: '#1A1208',
}

interface Neighbourhood {
  name: string
  vibe: string
  best_for: string
  price_range: string
}

interface CityData {
  slug: string
  name: string
  country: string
  overview: string
  neighbourhoods: Neighbourhood[]
  best_time: string
  getting_around: string
  suggested_questions: string[]
}

interface Props {
  city: CityData
  initialAnswers?: Partial<QuestionnaireAnswers>
}

const SECTIONS = [
  { key: 'Where to Stay', emoji: '🏨', color: C.terra },
  { key: 'Where to Eat', emoji: '🍜', color: C.saffron },
  { key: 'What to See', emoji: '👁️', color: C.jade },
  { key: 'Where to Drink', emoji: '🍸', color: C.terra },
  { key: 'Where to Shop', emoji: '🛍️', color: C.saffron },
]

function parseSections(text: string): Record<string, string> {
  const result: Record<string, string> = {}
  for (const { key } of SECTIONS) {
    const regex = new RegExp(`## ${key}\\n([\\s\\S]*?)(?=\\n## |$)`)
    const match = text.match(regex)
    if (match) result[key] = match[1].trim()
  }
  return result
}

function SectionCard({ title, emoji, color, content, isStreaming }: {
  title: string
  emoji: string
  color: string
  content?: string
  isStreaming: boolean
}) {
  const isLoading = !content && isStreaming

  return (
    <div className="rounded-3xl p-6" style={{ background: 'white', boxShadow: '0 2px 16px rgba(26,18,8,0.07)' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg"
          style={{ background: `${color}15` }}>
          {emoji}
        </div>
        <h3 className="text-lg font-bold" style={{ fontFamily: 'var(--font-playfair)', color: C.dark }}>
          {title}
        </h3>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[100, 80, 90, 60].map((w, i) => (
            <div key={i} className="h-3 rounded-full animate-pulse" style={{ width: `${w}%`, background: `${C.dark}10` }} />
          ))}
        </div>
      ) : content ? (
        <div className="prose prose-sm max-w-none"
          style={{ '--tw-prose-body': C.dark, '--tw-prose-headings': C.dark } as React.CSSProperties}>
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      ) : null}
    </div>
  )
}

export function CityGuide({ city, initialAnswers }: Props) {
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireAnswers | null>(null)

  const { completion, complete, isLoading } = useCompletion({
    api: '/api/city-guide',
  })

  const sections = useMemo(() => parseSections(completion), [completion])

  const handleQuestionnaireSubmit = async (answers: QuestionnaireAnswers) => {
    setQuestionnaire(answers)
    await complete('', {
      body: {
        city: {
          name: city.name,
          country: city.country,
          overview: city.overview,
          neighbourhoods: city.neighbourhoods,
          best_time: city.best_time,
          getting_around: city.getting_around,
        },
        questionnaire: answers,
      },
    })
  }

  return (
    <>
      {/* Questionnaire modal — shown until answered */}
      {!questionnaire && (
        <CityQuestionnaire
          cityName={city.name}
          initialAnswers={initialAnswers}
          onSubmit={handleQuestionnaireSubmit}
        />
      )}

      {/* Guide content */}
      {questionnaire && (
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto">

            {/* Section header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: C.terra }}>
                  Your personalised guide
                </p>
                <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair)', color: C.dark }}>
                  {city.name} for you
                </h2>
              </div>
              <button
                onClick={() => setQuestionnaire(null)}
                className="text-sm px-4 py-2 rounded-full border transition-all hover:opacity-70"
                style={{ borderColor: `${C.dark}20`, color: C.dark }}
              >
                Edit preferences
              </button>
            </div>

            {/* Sections grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SECTIONS.map(({ key, emoji, color }, i) => (
                <div key={key} className={i === 4 ? 'md:col-span-2' : ''}>
                  <SectionCard
                    title={key}
                    emoji={emoji}
                    color={color}
                    content={sections[key]}
                    isStreaming={isLoading}
                  />
                </div>
              ))}
            </div>

          </div>
        </section>
      )}

    </>
  )
}
