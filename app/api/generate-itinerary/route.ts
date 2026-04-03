import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import { checkRateLimit } from '@/lib/rate-limit'

export const maxDuration = 120

const MAX_STR = 300

function sanitize(value: unknown, max = MAX_STR): string {
  if (typeof value !== 'string') return ''
  return value.slice(0, max).trim()
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Input validation (NIST SI-10, OWASP A03)
    const traveller = sanitize(body.traveller, 100)
    const destination = sanitize(body.destination)
    const origin = sanitize(body.origin)
    const dateText = sanitize(body.dateText)
    const duration = typeof body.duration === 'number' && body.duration >= 0 && body.duration <= 30
      ? body.duration : 7
    const budget = sanitize(body.budget, 50)
    const budgetType = sanitize(body.budgetType, 50)
    const profileQ1 = sanitize(body.profileQ1)
    const profileQ2 = sanitize(body.profileQ2)
    const profileQ3 = sanitize(body.profileQ3)
    const profileQ4 = sanitize(body.profileQ4)

    if (!destination) {
      return Response.json({ error: 'Destination is required.' }, { status: 400 })
    }

    // Rate limiting (NIST SC-5, OWASP A04)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? req.headers.get('x-real-ip')
      ?? 'anonymous'
    const { allowed } = await checkRateLimit(`generate:${ip}`, false)
    if (!allowed) {
      return Response.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
    }

    const dateClause = dateText === 'Flexible'
      ? 'Dates are flexible — assume a typical time of year for this destination.'
      : `Travel period: ${dateText}.`

    const durationClause = duration > 0 ? `${duration} day` : '7 day'

    const profileQuestions = [profileQ1, profileQ2, profileQ3, profileQ4].filter(Boolean)

    const userMessage = [
      `Plan a ${durationClause} trip to ${destination} for a ${traveller || 'traveller'} flying from ${origin || 'New Zealand'}.`,
      dateClause,
      budget ? `Budget: ${budget}${budgetType ? ` (${budgetType === 'flights-included' ? 'flights included' : 'land costs only'})` : ''}.` : '',
      profileQuestions.length > 0 ? `Additional details: ${profileQuestions.join(' | ')}` : '',
    ].filter(Boolean).join(' ')

    const systemPrompt = `You are a travel planning API. Respond ONLY with a valid JSON object — no markdown, no code fences, no explanation. Use exactly this structure:
{
  "destination": "Vietnam",
  "duration": "10 days",
  "tagline": "Street food, ancient towns & turquoise bays",
  "days": [
    {
      "day": 1,
      "title": "Arrive in Hanoi & explore the Old Quarter",
      "highlights": [
        "Check in near Hoan Kiem Lake",
        "Street food tour of the Old Quarter",
        "Evening wander at Ta Hien beer street"
      ],
      "accommodation": "Boutique hotel in the Old Quarter",
      "meals": ["Bun Cha lunch spot near Hang Manh St", "Banh Mi from Banh Mi 25"],
      "transport": "Grab taxi from airport ~45 min",
      "estimatedCost": "~$80 NZD per person"
    }
  ]
}
Include accommodation, meals, transport, and estimatedCost for every day. Be specific with real place names. Generate exactly ${duration > 0 ? duration : 7} days. Tailor the itinerary specifically to the traveller profile and their answers.`

    const { text } = await generateText({
      model: anthropic('claude-haiku-4-5-20251001'),
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
      maxTokens: 8000,
    })

    const cleaned = text.replace(/```json[\s\S]*?```|```[\s\S]*?```/g, m =>
      m.replace(/```json|```/g, '')
    ).trim()

    try {
      const itinerary = JSON.parse(cleaned)
      return Response.json({ itinerary })
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/)
      if (match) {
        const itinerary = JSON.parse(match[0])
        return Response.json({ itinerary })
      }
      console.error('JSON parse failed. Raw text:', text.slice(0, 200))
      return Response.json({ error: 'Failed to generate itinerary. Please try again.' }, { status: 500 })
    }
  } catch (err) {
    // Don't leak internal error details (NIST SI-11, OWASP A05)
    console.error('generate-itinerary error:', err)
    return Response.json({ error: 'Failed to generate itinerary. Please try again.' }, { status: 500 })
  }
}
