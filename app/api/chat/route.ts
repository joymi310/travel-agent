import { anthropic } from '@ai-sdk/anthropic'
import { streamText, generateText } from 'ai'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { buildSystemPrompt } from '@/lib/system-prompt'
import { checkRateLimit } from '@/lib/rate-limit'

export const maxDuration = 120

export async function POST(req: Request) {
  const { messages, conversationId } = await req.json()

  // Get authenticated user (optional — works without auth too)
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Rate limiting
  const identifier = user?.id ?? (req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'anonymous')
  const { allowed, remaining } = await checkRateLimit(identifier, !!user)
  if (!allowed) {
    return new Response(
      JSON.stringify({ error: 'Daily message limit reached. Please try again tomorrow.' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Fetch profile if logged in
  let travelStyle: string | null = null
  let profileData: Record<string, string> | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('travel_style, profile_data')
      .eq('id', user.id)
      .single()
    travelStyle = profile?.travel_style ?? null
    profileData = profile?.profile_data ?? null
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

  const result = await streamText({
    model: anthropic('claude-sonnet-4-20250514'),
    system: buildSystemPrompt(travelStyle, profileData),
    messages: resolvedMessages,
    providerOptions: {
      anthropic: {
        thinking: { type: 'enabled', budgetTokens: 8000 },
      },
    },
    onFinish: async ({ text }) => {
      if (!user) return

      const admin = createAdminClient()
      let activeConversationId = conversationId

      // Create conversation if this is the first message
      if (!activeConversationId) {
        const firstUserMessage = messages.find((m: { role: string }) => m.role === 'user')
        let title = 'New conversation'

        if (firstUserMessage) {
          try {
            const { text: generatedTitle } = await generateText({
              model: anthropic('claude-haiku-4-5-20251001'),
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

      if (!activeConversationId) return

      const lastUserMessage = messages[messages.length - 1]
      await admin.from('messages').insert([
        { conversation_id: activeConversationId, role: lastUserMessage.role, content: lastUserMessage.content },
        { conversation_id: activeConversationId, role: 'assistant', content: text },
      ])
    },
  })

  return result.toDataStreamResponse()
}
