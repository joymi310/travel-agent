import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

function sanitize(v: unknown, max = 200): string {
  return typeof v === 'string' ? v.slice(0, max).trim() : ''
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const vibes: string[] = Array.isArray(body.vibes)
      ? body.vibes.map((v: unknown) => sanitize(v, 50)).filter(Boolean).slice(0, 8)
      : []
    const duration = sanitize(body.duration, 50)
    const when = sanitize(body.when, 50)
    const budget = sanitize(body.budget, 50)
    const flightTime = sanitize(body.flightTime, 100)
    const group = sanitize(body.group, 100)
    const origin = sanitize(body.origin, 100)

    if (vibes.length === 0) {
      return NextResponse.json({ error: 'At least one vibe is required' }, { status: 400 })
    }

    const userMessage = [
      `Suggest 3 diverse travel destinations for someone who wants: ${vibes.join(', ')}.`,
      duration ? `Trip length: ${duration}.` : '',
      when ? `Timing: ${when}.` : '',
      budget ? `Budget: ${budget}.` : '',
      flightTime ? `Maximum flight time: ${flightTime}.` : '',
      group ? `Travelling: ${group}.` : '',
      `Flying from: ${origin || 'New Zealand'}.`,
    ].filter(Boolean).join(' ')

    const isLongerTrip = duration.startsWith('2 weeks') || duration.startsWith('3+')

    const systemPrompt = `You are a travel inspiration API. Respond ONLY with valid JSON — no markdown, no code fences, no explanation. Use exactly this structure:
{
  "destinations": [
    {
      "city": "Japan",
      "country": "Japan",
      "tagline": "Ancient temples, bullet trains & world-class food",
      "pitch": "Two weeks lets you move from the neon chaos of Tokyo to the tranquil temples of Kyoto and the deer parks of Nara. Japan rewards slow travel — take the bullet train and let each city surprise you.",
      "why_you": "You want culture and food — Japan is one of the world's best for both",
      "best_time": "March–May or Oct–Nov",
      "est_cost": "$4,500–$6,500 NZD for 2 weeks",
      "vibe_tags": ["culture", "food", "history"],
      "emoji": "🗾"
    }
  ]
}

Rules:
- Suggest exactly 3 destinations — genuinely diverse (different continents or regions where possible)
- Match the stated vibes and budget level seriously — don't suggest luxury resorts for a budget traveller
- pitch is 2 short punchy sentences, specific and vivid, written like a well-travelled friend recommending it
- why_you is 1 short sentence referencing their specific stated vibes/preferences
- est_cost should be realistic, in the currency matching their origin city (NZ cities → NZD, AU cities → AUD, UK cities → GBP, US cities → USD, EU cities → EUR). Format: "$X,XXX–$X,XXX [CURRENCY] for [duration]"
- best_time is a brief string like "April–June" or "Year-round"
- vibe_tags is 2–3 tags from: beach, culture, food, adventure, nature, city, luxury, budget, history, wellness
- emoji is a single relevant emoji for the destination (landmark, flag, or nature icon)
- Respect the maximum flight time strictly — if someone says "up to 3 hours" from Auckland, do NOT suggest Europe or the US. Only suggest destinations reachable within that flight time from their origin city (or from New Zealand if no origin given)
- Consider who is travelling — if kids are mentioned, suggest genuinely family-friendly destinations with good infrastructure, safe environments, and child-appropriate activities. If "just adults" or no kids, you can suggest more adventurous or remote options freely
- Consider the timing stated — if someone is going "next month" suggest places that are great at that time of year
${isLongerTrip ? `- IMPORTANT: This is a longer trip (${duration}). Suggest COUNTRIES or multi-country routes, not single cities. The "city" field should be the country name (e.g. "Japan") or a multi-country route (e.g. "Vietnam + Cambodia"). The "country" field should be the broader region (e.g. "Southeast Asia"). The pitch should describe the country/route as a whole and mention 2–3 specific places within it.` : `- For shorter trips (1 week or less), "city" should be a specific city and "country" the country it's in.`}`

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1200,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : ''

    // Strip markdown code fences if model includes them
    const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()

    const data = JSON.parse(cleaned)

    // Fetch Unsplash photos for each destination in parallel
    const unsplashKey = process.env.UNSPLASH_ACCESS_KEY
    if (unsplashKey && Array.isArray(data.destinations)) {
      await Promise.all(
        data.destinations.map(async (dest: { city: string; country: string; image_url?: string; photographer_name?: string; photographer_url?: string }) => {
          try {
            // For multi-country routes like "Vietnam + Cambodia", use just the first country for the photo
            const photoSubject = dest.city.includes('+') ? dest.city.split('+')[0].trim() : dest.city
            const query = encodeURIComponent(`${photoSubject} ${dest.country} travel landscape`)
            const res = await fetch(
              `https://api.unsplash.com/search/photos?query=${query}&orientation=landscape&per_page=1`,
              { headers: { Authorization: `Client-ID ${unsplashKey}` } }
            )
            if (!res.ok) return
            const json = await res.json()
            const photo = json?.results?.[0]
            if (photo?.urls?.regular) {
              dest.image_url = photo.urls.regular
              dest.photographer_name = photo.user?.name ?? undefined
              dest.photographer_url = photo.user?.links?.html
                ? `${photo.user.links.html}?utm_source=wandr&utm_medium=referral`
                : undefined
            }
          } catch {
            // Photo fetch failing silently is fine — card still renders without image
          }
        })
      )
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('[inspire] Error:', err)
    return NextResponse.json({ error: 'Failed to generate suggestions' }, { status: 500 })
  }
}
