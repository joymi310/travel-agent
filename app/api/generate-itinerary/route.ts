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
    const duration = typeof body.duration === 'number' && body.duration > 0 && body.duration <= 30
      ? body.duration : 7
    const budget = sanitize(body.budget, 50)
    const budgetType = sanitize(body.budgetType, 50)
    const profileAnswersRaw = Array.isArray(body.profileAnswers) ? body.profileAnswers : [
      body.profileQ1, body.profileQ2, body.profileQ3, body.profileQ4,
    ]
    const explorationStyle = ['classics', 'mixed', 'off_beaten_track'].includes(body.explorationStyle)
      ? (body.explorationStyle as string) : 'mixed'

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

    const profileQuestions = (profileAnswersRaw as unknown[]).map((v) => sanitize(v)).filter(Boolean)

    const userMessage = [
      `Plan a ${durationClause} trip to ${destination} for a ${traveller || 'traveller'} flying from ${origin || 'New Zealand'}.`,
      dateClause,
      budget ? `Budget: ${budget}${budgetType ? ` (${budgetType === 'flights-included' ? 'flights included' : 'land costs only'})` : ''}.` : '',
      profileQuestions.length > 0 ? `Additional details: ${profileQuestions.join(' | ')}` : '',
    ].filter(Boolean).join(' ')

    const isReturningVisitor = profileQuestions.some(q =>
      typeof q === 'string' && q.toLowerCase().includes('been before')
    )
    const returningVisitorNote = isReturningVisitor
      ? 'IMPORTANT: This traveller has been to this destination before. Do NOT include standard first-timer highlights (major tourist sites everyone does on their first visit). Go deeper — lesser-known neighbourhoods, off-the-beaten-track experiences, local spots that returning visitors discover. Make this feel like a completely different trip.'
      : 'This is a first-time visitor. Include the essential experiences, but with specific recommendations and a local angle — not the generic tourist circuit.'

    const explorationNote = explorationStyle === 'classics'
      ? 'EXPLORATION STYLE — CLASSICS: This traveller explicitly wants the iconic sights. Lead with the most celebrated attractions, landmark restaurants, and well-known experiences. Do not be contrarian. Famous is famous for a reason — lean into it.'
      : explorationStyle === 'off_beaten_track'
      ? 'EXPLORATION STYLE — OFF THE BEATEN TRACK: This traveller actively avoids mainstream tourist attractions. NEVER headline a day with a famous sight. Every day must include at least one recommendation that a casual tourist would never find. Use local guesthouses, street stalls with no tourist menus, and non-tourist neighbourhoods. If an attraction is truly unmissable, mention it once with crowd-avoidance timing only — never as a highlight.'
      : 'EXPLORATION STYLE — MIXED: Balance 1–2 headline sights per city with neighbourhood exploration and local spots. This is the default balanced approach.'

    const systemPrompt = `You are a travel planning API. Respond ONLY with a valid JSON object — no markdown, no code fences, no explanation. ${returningVisitorNote} ${explorationNote} Use exactly this structure:
{
  "destination": "Vietnam",
  "duration": "10 days",
  "tagline": "Street food, ancient towns & turquoise bays",
  "follow_up_questions": [
    "I've given you 4 days in Hoi An — do you want that more beach-focused or centred on the old town?",
    "Day 3 in Hanoi is quite packed — want me to build in more breathing room?"
  ],
  "locations": [
    { "day": 1, "city": "Hanoi", "lat": 21.0278, "lng": 105.8342, "label": "Hanoi (Days 1–3)" },
    { "day": 4, "city": "Hoi An", "lat": 15.8801, "lng": 108.3380, "label": "Hoi An (Days 4–6)" },
    { "day": 7, "city": "Ho Chi Minh City", "lat": 10.8231, "lng": 106.6297, "label": "Ho Chi Minh City (Days 7–10)" }
  ],
  "budget_summary": {
    "total_low": 2200,
    "total_high": 2800,
    "currency": "USD",
    "includes": ["accommodation", "activities", "local transport", "food"],
    "excludes": ["international flights"],
    "per_day_avg": 250,
    "breakdown": {
      "accommodation": 900,
      "food": 600,
      "activities": 500,
      "local_transport": 200
    }
  },
  "days": [
    {
      "day": 1,
      "title": "Arrive in Hanoi & explore the Old Quarter",
      "highlights": [
        { "text": "Street food tour of the Old Quarter", "reason": "You said food is your top priority — this is the best way to hit the ground running" },
        { "text": "Check in near Hoan Kiem Lake", "reason": "Central location keeps walking distances short, suits your relaxed pace" },
        { "text": "Evening wander at Ta Hien beer street", "reason": "Lively but unhurried — good first-night energy without committing to a packed schedule" }
      ],
      "accommodation": { "name": "Boutique hotel in the Old Quarter", "reason": "Mid-range budget, walkable to everything on Day 1" },
      "meals": [
        { "name": "Bun Cha Huong Lien", "dish": "Bun cha set (~$3 USD)", "reason": "Obama/Bourdain spot — iconic, no-frills" },
        { "name": "Banh Mi 25", "dish": "Classic pork banh mi", "reason": "Best banh mi in the Old Quarter" }
      ],
      "transport": "Grab taxi from airport ~45 min",
      "estimatedCost": "~$80 NZD per person"
    }
  ]
}
IMPORTANT: The "locations" array defines the map pins. For multi-city trips, include one entry per city/destination change — use the day the traveller arrives there. For single-city trips, include one entry per day with neighbourhood-level specificity (e.g. Shinjuku, Asakusa). Each entry needs accurate lat/lng coordinates. The label should say the city and day range (e.g. "Hanoi (Days 1–3)").

IMPORTANT: The "budget_summary" must reflect the user's actual stated budget level (${budget || 'mid-range'}) and the specific accommodation/activities chosen. Use the currency that matches the traveller's origin city (e.g. Auckland/Wellington/Christchurch → NZD, Sydney/Melbourne/Brisbane → AUD, London/Edinburgh → GBP, US cities → USD, European cities → EUR). total_low and total_high should be realistic ranges in that currency. breakdown figures should sum to roughly (total_low + total_high) / 2. excludes should always include "international flights" unless the budget is explicitly flights-included.

IMPORTANT: The "follow_up_questions" array must contain exactly 2 questions that are specific to THIS itinerary — reference actual day numbers, cities, or durations from the plan. Ask about things the traveller would genuinely want to tweak: pacing on a heavy day, split between two locations, activity focus, etc. Never use generic questions like "does this look good?" or "any changes?".

IMPORTANT: Every highlight must have a "reason" field. Accommodation must have a "reason". Keep every "reason" to 8 words or fewer — punchy, not verbose.

IMPORTANT: Every meal must be a specific named restaurant or stall (never a generic "hotel restaurant" unless it is genuinely world-class). Each meal must include a "dish" field with exactly what to order (include approximate local price where helpful), and a "reason" ≤8 words. For budget travellers: include at least one street food stall per day with neighbourhood context. For luxury travellers: name at least one fine dining venue per trip and add "(reservation recommended)" to the dish field if booking is required. Include transport and estimatedCost for every day. Be specific with real place names. Generate exactly ${duration > 0 ? duration : 7} days.`

    const actualDuration = duration > 0 ? duration : 7
    const maxTokens = Math.min(Math.max(actualDuration * 650 + 1500, 3500), 16000)

    const { text } = await generateText({
      model: anthropic('claude-haiku-4-5-20251001'),
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
      maxTokens,
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
