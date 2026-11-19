import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { destination, duration, itinerary, note, email } = await req.json()
    if (!email?.trim()) {
      return Response.json({ error: 'Email required' }, { status: 400 })
    }
    if (!itinerary) {
      return Response.json({ error: 'Itinerary required' }, { status: 400 })
    }

    const supabase = createClient()
    const { error } = await supabase
      .from('expert_review_requests')
      .insert({
        destination: typeof destination === 'string' ? destination.slice(0, 100) : null,
        duration: typeof duration === 'string' ? duration.slice(0, 50) : null,
        itinerary,
        note: note ? String(note).trim().slice(0, 500) : null,
        email: email.trim().slice(0, 200),
      })

    if (error) throw error
    return Response.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err)
    return Response.json({ error: msg }, { status: 500 })
  }
}
