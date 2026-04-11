import { anthropic } from '@ai-sdk/anthropic'
import { streamText } from 'ai'
import { checkRateLimit } from '@/lib/rate-limit'

export const maxDuration = 60

const MAX_CITY_LEN = 100
const MAX_COUNTRY_LEN = 100
const MAX_MESSAGE_LEN = 2000
const MAX_MESSAGES = 20

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Input validation (NIST SI-10, OWASP A03)
    const city = typeof body.city === 'string' ? body.city.slice(0, MAX_CITY_LEN).trim() : ''
    const country = typeof body.country === 'string' ? body.country.slice(0, MAX_COUNTRY_LEN).trim() : ''
    const messages = Array.isArray(body.messages)
      ? body.messages.slice(0, MAX_MESSAGES).map((m: { role: string; content: string }) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: typeof m.content === 'string' ? m.content.slice(0, MAX_MESSAGE_LEN) : '',
        }))
      : []

    if (!city || !country || messages.length === 0) {
      return Response.json({ error: 'Invalid request.' }, { status: 400 })
    }

    // Server-side rate limiting (NIST SC-5, OWASP A04)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? req.headers.get('x-real-ip')
      ?? 'anonymous'
    const { allowed } = await checkRateLimit(`city-chat:${ip}`, false)
    if (!allowed) {
      return Response.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
    }

    const systemPrompt = `You are a local expert on ${city}, ${country}. Answer travel questions concisely and specifically — neighbourhoods, food, transport, safety, culture, money. Keep answers to 3–5 sentences unless a list is genuinely clearer. Do not build full itineraries — if asked, say "For a full itinerary, use the Wayfindr trip planner" and mention they can start from the homepage.

For questions about current visa requirements, entry restrictions, travel advisories, or anything time-sensitive, do not answer from training data — instead say that Wayfindr's trip planner has live web search for accurate, up-to-date answers and direct them there.`

    const result = await streamText({
      model: anthropic('claude-haiku-4-5-20251001'),
      system: systemPrompt,
      messages,
    })

    return result.toDataStreamResponse()
  } catch (err) {
    // Don't leak internal error details (NIST SI-11, OWASP A05)
    console.error('city-chat error:', err)
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
