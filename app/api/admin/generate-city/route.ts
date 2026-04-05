import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const maxDuration = 120

export async function POST(req: Request) {
  try {
    // Verify admin
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== process.env.ADMIN_EMAIL?.trim()) {
      return Response.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const { cityName } = await req.json()
    if (!cityName?.trim()) {
      return Response.json({ error: 'City name required' }, { status: 400 })
    }

    const systemPrompt = `You are a travel content API. Respond ONLY with a valid JSON object — no markdown, no code fences, no explanation. Use exactly this structure:
{
  "slug": "city-name-lowercase-hyphenated",
  "name": "City Name",
  "country": "Country Name",
  "region": "One of: East Asia | Southeast Asia | South Asia | Middle East | Europe | Africa | Americas | Oceania",
  "hero_tagline": "Short evocative tagline (5-8 words)",
  "overview": "Three sentences about the city — character, highlights, what makes it special.",
  "neighbourhoods": [
    {
      "name": "Neighbourhood Name",
      "vibe": "One sentence describing the feel and character.",
      "best_for": "Audience types e.g. Couples, families, backpackers",
      "price_range": "Budget"
    }
  ],
  "best_time": "When to visit and why, including what to avoid.",
  "getting_around": "Practical transport advice — metro, taxis, apps, tips.",
  "visa_notes": "Visa requirements for common Western nationalities.",
  "suggested_questions": [
    "Question 1?",
    "Question 2?",
    "Question 3?",
    "Question 4?",
    "Question 5?"
  ]
}
Include 3-5 neighbourhoods. Make all content specific and useful — real names, real advice. price_range must be exactly "Budget", "Mid-range" or "Luxury".`

    const { text } = await generateText({
      model: anthropic('claude-sonnet-4-6'),
      system: systemPrompt,
      messages: [{ role: 'user', content: `Generate a complete city guide for ${cityName}.` }],
      maxTokens: 4000,
    })

    const cleaned = text.replace(/```json[\s\S]*?```|```[\s\S]*?```/g, m =>
      m.replace(/```json|```/g, '')
    ).trim()

    let cityData
    try {
      cityData = JSON.parse(cleaned)
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/)
      if (!match) throw new Error('Could not parse JSON from response')
      cityData = JSON.parse(match[0])
    }

    const admin = createAdminClient()
    const { data: city, error } = await admin
      .from('cities')
      .insert({ ...cityData, is_published: false, reviewed: false })
      .select('id, slug, name')
      .single()

    if (error) throw error

    return Response.json({ city })
  } catch (err) {
    console.error('generate-city error:', err)
    const msg = err instanceof Error ? err.message : JSON.stringify(err)
    return Response.json({ error: msg }, { status: 500 })
  }
}
