import { anthropic } from '@ai-sdk/anthropic'
import { streamText } from 'ai'

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const { messages, city, country } = await req.json()

    const systemPrompt = `You are a local expert on ${city}, ${country}. Answer travel questions concisely and specifically — neighbourhoods, food, transport, safety, culture, money. Keep answers to 3–5 sentences unless a list is genuinely clearer. Do not build full itineraries — if asked, say "For a full itinerary, use the Wandr trip planner" and mention they can start from the homepage.`

    const result = await streamText({
      model: anthropic('claude-haiku-4-5-20251001'),
      system: systemPrompt,
      messages,
    })

    return result.toDataStreamResponse()
  } catch (err) {
    console.error('city-chat error:', err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
}
