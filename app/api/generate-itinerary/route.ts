import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'

export const maxDuration = 120

export async function POST(req: Request) {
  try {
    const { destination, startDate, endDate, duration, who, people, budget, pace } = await req.json()

    const userMessage = `Plan a ${duration} day trip to ${destination} for ${who}, total ${people} people, with a ${budget} budget and a ${pace} pace. Dates: ${startDate} to ${endDate}.`

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
Include accommodation, meals, transport, and estimatedCost for every day. Be specific with real place names. Generate exactly ${duration} days.`

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
      // Try to extract JSON from the response if there's surrounding text
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
