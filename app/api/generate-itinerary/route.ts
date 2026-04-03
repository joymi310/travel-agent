import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'

export const maxDuration = 120

export async function POST(req: Request) {
  try {
    const {
      traveller, destination, origin,
      dateText, duration,
      budget, budgetType,
      profileQ1, profileQ2, profileQ3, profileQ4,
    } = await req.json()

    const dateClause = dateText === 'Flexible'
      ? 'Dates are flexible — assume a typical time of year for this destination.'
      : `Travel period: ${dateText}.`

    const durationClause = duration > 0 ? `${duration} day` : '7 day'

    const profileQuestions = [profileQ1, profileQ2, profileQ3, profileQ4].filter(Boolean)

    const userMessage = [
      `Plan a ${durationClause} trip to ${destination} for a ${traveller} flying from ${origin}.`,
      dateClause,
      `Budget: ${budget} (${budgetType === 'flights-included' ? 'flights included' : 'land costs only'}).`,
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
      console.error('JSON parse failed. Raw text:', text.slice(0, 500))
      return Response.json({ error: 'Failed to parse itinerary' }, { status: 500 })
    }
  } catch (err) {
    console.error('generate-itinerary error:', err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
