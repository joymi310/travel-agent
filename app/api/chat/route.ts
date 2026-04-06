import Anthropic from '@anthropic-ai/sdk'
import { anthropic as vercelAnthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { buildSystemPrompt } from '@/lib/system-prompt'
import { checkRateLimit } from '@/lib/rate-limit'

export const maxDuration = 120

const MAX_MESSAGE_LEN = 4000
const MAX_MESSAGES = 50

const anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: Request) {
  const body = await req.json()

  // Input validation (NIST SI-10, OWASP A03)
  const messages = Array.isArray(body.messages)
    ? body.messages.slice(0, MAX_MESSAGES).map((m: { role: string; content: string }) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: typeof m.content === 'string' ? m.content.slice(0, MAX_MESSAGE_LEN) : '',
      }))
    : []
  const conversationId = typeof body.conversationId === 'string' ? body.conversationId : undefined
  const itinerary = body.itinerary && typeof body.itinerary === 'object' ? body.itinerary : null

  // Get authenticated user (optional — works without auth too)
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Rate limiting
  const identifier = user?.id ?? (req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'anonymous')
  const { allowed } = await checkRateLimit(identifier, !!user)
  if (!allowed) {
    return new Response(
      JSON.stringify({ error: 'Daily message limit reached. Please try again tomorrow.' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Fetch profile if logged in
  let travelStyle: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('travel_style')
      .eq('id', user.id)
      .single()
    travelStyle = profile?.travel_style ?? null
  }

  // If the user just completed the profile wizard, replace the trigger with a real prompt
  const lastMessage = messages[messages.length - 1]
  const isProfileComplete = lastMessage?.role === 'user' && lastMessage?.content === '__profile_complete__'
  const resolvedMessages = isProfileComplete
    ? [...messages.slice(0, -1), {
        role: 'user' as const,
        content: 'I\'ve just set up my traveller profile. Briefly introduce yourself, acknowledge my travel style, and ask me what trip I\'m thinking about.',
      }]
    : messages

  const itineraryContext = itinerary
    ? `The user has an existing itinerary displayed in a panel next to this chat. Treat this as the current plan.

Current itinerary (JSON):
${JSON.stringify(itinerary)}

IMPORTANT — when the user asks you to change, swap, add, remove, or modify anything in the itinerary:
1. Explain the change conversationally in plain text (1–3 sentences)
2. Then output the COMPLETE updated itinerary as valid JSON at the very end of your response, wrapped exactly like this:
<itinerary_update>
{"destination":"...","duration":"...","tagline":"...","days":[...]}
</itinerary_update>
Use the exact same JSON structure as the current itinerary. Include ALL days (not just the changed ones).

If the user is only asking a question and NOT modifying the itinerary, do NOT include <itinerary_update> tags.`
    : null

  // Build system blocks (supports prompt caching on the base prompt)
  const systemBlocks: Anthropic.TextBlockParam[] = [
    {
      type: 'text',
      text: buildSystemPrompt(travelStyle),
      cache_control: { type: 'ephemeral' } as { type: 'ephemeral' },
    },
  ]
  if (itineraryContext) {
    systemBlocks.push({ type: 'text', text: itineraryContext })
  }

  const encoder = new TextEncoder()
  let fullText = ''

  const anthropicStream = anthropicClient.messages.stream(
    {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8096,
      system: systemBlocks as Anthropic.TextBlockParam[],
      tools: [{ type: 'web_search_20250305', name: 'web_search' }] as unknown as Anthropic.Tool[],
      messages: resolvedMessages as Anthropic.MessageParam[],
    },
    { headers: { 'anthropic-beta': 'web-search-2025-03-05' } }
  )

  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of anthropicStream) {
          if (
            event.type === 'content_block_delta' &&
            'delta' in event &&
            event.delta.type === 'text_delta'
          ) {
            const text = event.delta.text
            fullText += text
            controller.enqueue(encoder.encode(`0:${JSON.stringify(text)}\n`))
          }
        }

        const finalMessage = await anthropicStream.finalMessage()

        // Save to DB if authenticated
        if (user) {
          const admin = createAdminClient()
          let activeConversationId = conversationId

          if (!activeConversationId) {
            const firstUserMessage = messages.find((m: { role: string }) => m.role === 'user')
            let title = 'New conversation'
            if (firstUserMessage) {
              try {
                const { text: generatedTitle } = await generateText({
                  model: vercelAnthropic('claude-haiku-4-5-20251001'),
                  prompt: `Generate a short (4–6 words) title for a travel planning conversation that starts with this message. Reply with only the title, no quotes:\n\n${firstUserMessage.content}`,
                })
                title = generatedTitle.trim()
              } catch {
                title = firstUserMessage.content.slice(0, 50)
              }
            }

            const { data: conversation } = await admin
              .from('conversations')
              .insert({ user_id: user.id, title })
              .select('id')
              .single()
            activeConversationId = conversation?.id
          }

          if (activeConversationId) {
            const lastUserMessage = messages[messages.length - 1]
            await admin.from('messages').insert([
              { conversation_id: activeConversationId, role: lastUserMessage.role, content: lastUserMessage.content },
              { conversation_id: activeConversationId, role: 'assistant', content: fullText },
            ])
          }
        }

        controller.enqueue(encoder.encode(
          `d:${JSON.stringify({
            finishReason: 'stop',
            usage: {
              promptTokens: finalMessage.usage.input_tokens,
              completionTokens: finalMessage.usage.output_tokens,
            },
          })}\n`
        ))
      } catch (err) {
        controller.error(err)
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readableStream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Vercel-AI-Data-Stream': 'v1',
    },
  })
}
