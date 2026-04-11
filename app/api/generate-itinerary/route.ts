import { anthropic } from '@ai-sdk/anthropic'
import { streamText } from 'ai'
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

    const actualDuration = duration > 0 ? duration : 7
    // Extra tokens needed for markdown + JSON dual output
    const maxTokens = Math.min(Math.max(actualDuration * 900 + 2500, 6000), 16000)

    const systemPrompt = `You are a travel planning assistant. Output your response in exactly two parts with nothing between them.

PART 1 — A readable markdown itinerary. Use exactly this format for every day:

# {Destination} — {N} days
*{one-line tagline}*

## Day 1 — {Title}
**Highlights**
- {Specific highlight} *({reason ≤8 words})*
- {Specific highlight} *({reason ≤8 words})*

**Stay:** {Named hotel or guesthouse} — {reason ≤8 words}
**Meals:** {Named restaurant} ({exact dish, ~local price}) · {Named restaurant} ({exact dish})
**Transport:** {practical transport note}
**Est. cost:** {realistic amount}

[Repeat for ALL ${actualDuration} days — no gaps, no "similar to above"]

PART 2 — Immediately after the last day (no blank line), output EXACTLY this single line — minified JSON, no internal newlines:
<!--WANDR_DATA:{"destination":"...","duration":"${actualDuration} days","tagline":"...","follow_up_questions":["question referencing specific day/city","question referencing specific day/city"],"locations":[{"day":1,"city":"...","lat":0.0,"lng":0.0,"label":"City (Days 1–N)"}],"budget_summary":{"total_low":0,"total_high":0,"currency":"...","includes":["accommodation","activities","local transport","food"],"excludes":["international flights"],"per_day_avg":0,"breakdown":{"accommodation":0,"food":0,"activities":0,"local_transport":0}},"days":[{"day":1,"title":"...","highlights":[{"text":"...","reason":"..."}],"accommodation":{"name":"...","reason":"..."},"meals":[{"name":"...","dish":"...","reason":"..."}],"transport":"...","estimatedCost":"..."}]}-->

${returningVisitorNote} ${explorationNote}

RULES (apply to both parts):
- Generate exactly ${actualDuration} days — no skipping, no summarising
- Every restaurant/café must be a real named place — no generics like "local restaurant"
- Every reason field: ≤8 words, punchy
- Locations array: one entry per city/area change; for single-city trips use neighbourhood granularity with accurate lat/lng
- Budget level: ${budget || 'mid-range'}. Currency matching origin city (NZ cities → NZD, AU cities → AUD, UK cities → GBP, US cities → USD, EU cities → EUR)
- budget_summary: total_low and total_high are realistic for ${budget || 'mid-range'} level; breakdown should sum to ~(total_low+total_high)/2
- follow_up_questions must reference actual day numbers or cities in THIS itinerary — never generic
- For budget travellers: at least one street food stall per day with neighbourhood context
- For luxury travellers: at least one fine dining venue per trip; add "(reservation recommended)" to dish field if needed
- The WANDR_DATA line must be on ONE LINE — no internal newlines in the JSON`

    const result = streamText({
      model: anthropic('claude-haiku-4-5-20251001'),
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
      maxTokens,
    })

    return result.toTextStreamResponse()
  } catch (err) {
    // Don't leak internal error details (NIST SI-11, OWASP A05)
    console.error('generate-itinerary error:', err)
    return Response.json({ error: 'Failed to generate itinerary. Please try again.' }, { status: 500 })
  }
}
