import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== process.env.ADMIN_EMAIL?.trim()) {
      return Response.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const body = await req.json()
    const id = typeof body.id === 'string' ? body.id.trim() : ''
    if (!id) return Response.json({ error: 'Missing id' }, { status: 400 })

    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 })
    }

    const admin = createAdminClient()
    const { data: city, error } = await admin
      .from('cities')
      .select('name, country, overview, best_time, getting_around, visa_notes, neighbourhoods')
      .eq('id', id)
      .single()

    if (error) throw error

    const cityContent = `
City: ${city.name}, ${city.country}

Overview:
${city.overview}

Best time to visit:
${city.best_time}

Getting around:
${city.getting_around}

Visa notes:
${city.visa_notes}

Neighbourhoods:
${JSON.stringify(city.neighbourhoods, null, 2)}
`.trim()

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content: `You are a travel fact-checker. You will be given content from a travel guide. Your job is to identify any factual inaccuracies, outdated information, misleading claims, or significant omissions.

Be specific and cite the exact claim. For each issue found, rate its severity: HIGH (factually wrong), MEDIUM (possibly outdated or misleading), LOW (minor or subjective).

If the content looks accurate, say so briefly.

Respond as a JSON object with this shape:
{
  "summary": "one sentence overall assessment",
  "issues": [
    { "severity": "HIGH|MEDIUM|LOW", "field": "which section", "claim": "the specific claim", "concern": "why it may be inaccurate" }
  ]
}

If no issues are found, return { "summary": "Content looks accurate.", "issues": [] }`,
          },
          {
            role: 'user',
            content: cityContent,
          },
        ],
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`OpenAI error: ${err}`)
    }

    const data = await res.json()
    const raw = data.choices?.[0]?.message?.content ?? ''

    let result
    try {
      // Strip markdown code fences if present
      const cleaned = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
      result = JSON.parse(cleaned)
    } catch {
      result = { summary: raw, issues: [] }
    }

    return Response.json({ result })
  } catch (err) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err)
    return Response.json({ error: msg }, { status: 500 })
  }
}
