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
      group ? `Travelling: ${group}.` : '',
      `Flying from: ${origin || 'New Zealand'}.`,
    ].filter(Boolean).join(' ')

    const systemPrompt = `You are a travel inspiration API. Respond ONLY with valid JSON — no markdown, no code fences, no explanation. Use exactly this structure:
{
  "destinations": [
    {
      "city": "Kyoto",
      "country": "Japan",
      "tagline": "Ancient temples, cherry blossoms & world-class ramen",
      "pitch": "Go in spring when the temple gardens are at their most breathtaking. Kyoto moves at a slower pace than Tokyo — pure culture without the crowds.",
      "why_you": "You want culture and food — Kyoto delivers both in spades",
      "best_time": "March–May or Oct–Nov",
      "est_cost": "$2,500–$3,800 NZD for 1 week",
      "vibe_tags": ["culture", "food", "history"],
      "emoji": "🏯"
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
- Consider who is travelling — if kids are mentioned, suggest genuinely family-friendly destinations with good infrastructure, safe environments, and child-appropriate activities. If "just adults" or no kids, you can suggest more adventurous or remote options freely
- Consider the timing stated — if someone is going "next month" suggest places that are great at that time of year`

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
    return NextResponse.json(data)
  } catch (err) {
    console.error('[inspire] Error:', err)
    return NextResponse.json({ error: 'Failed to generate suggestions' }, { status: 500 })
  }
}
