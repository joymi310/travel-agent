import { anthropic } from '@ai-sdk/anthropic'
import { streamText } from 'ai'

export const maxDuration = 120

interface Neighbourhood {
  name: string
  vibe: string
  best_for: string
  price_range: string
}

interface CityData {
  name: string
  country: string
  overview: string
  neighbourhoods: Neighbourhood[]
  best_time: string
  getting_around: string
}

interface Questionnaire {
  companions: string
  budget: string
  interests: string[]
  duration: string
}

const GUIDE_INSTRUCTIONS = `You are Wayfindr, an expert travel guide. You will be given city context and a traveller profile, then generate a personalised city guide.

## YOUR TASK
Write exactly 5 sections using these exact headings. Each section must be personalised to this specific traveller — their budget, who they're with, and their interests should shape every recommendation.

Be opinionated. Name specific places. Give practical context (price ranges, best times, what to order or avoid). Don't pad with generic advice.

Use this exact structure:

## Where to Stay
[3–4 paragraphs recommending specific neighbourhoods and accommodation types suited to this traveller. Reference the neighbourhoods data above. Be direct about which area to choose and why.]

## Where to Eat
[Specific restaurant and food recommendations, from street food to sit-down. Tailor to their budget. Name dishes, neighbourhoods, and specific spots where possible.]

## What to See
[Must-see sights and experiences tailored to their interests. Flag anything that requires booking ahead, has physical demands, or is particularly suited/unsuited to their group type.]

## Where to Drink
[Bar, café, and nightlife recommendations. If their interests don't include nightlife, focus on cafés, teahouses, juice bars etc. Tailor the tone to who they're travelling with.]

## Where to Shop
[Shopping recommendations that fit their budget and interests — from markets to boutiques. Specific areas and what to look for.]`

function buildCityContext(city: CityData, q: Questionnaire): string {
  const neighbourhoodList = city.neighbourhoods
    .map(n => `- **${n.name}**: ${n.vibe} Best for: ${n.best_for}. Price range: ${n.price_range}.`)
    .join('\n')

  return `## CITY: ${city.name}, ${city.country}
${city.overview}

Neighbourhoods:
${neighbourhoodList}

Best time to visit: ${city.best_time}
Getting around: ${city.getting_around}

## THIS TRAVELLER
- Travelling: ${q.companions}
- Budget: ${q.budget}
- Interests: ${q.interests.join(', ')}
- Duration: ${q.duration}`
}

export async function POST(req: Request) {
  const { city, questionnaire } = await req.json()

  const result = await streamText({
    model: anthropic('claude-sonnet-4-20250514'),
    messages: [
      {
        role: 'system' as const,
        content: GUIDE_INSTRUCTIONS,
        providerOptions: {
          anthropic: { cacheControl: { type: 'ephemeral' } },
        },
      },
      {
        role: 'system' as const,
        content: buildCityContext(city, questionnaire),
      },
      { role: 'user', content: `Generate my personalised ${city.name} guide.` },
    ],
  })

  return result.toDataStreamResponse()
}
