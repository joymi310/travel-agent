import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { cityName, note, email } = await req.json()
    if (!cityName?.trim()) {
      return Response.json({ error: 'City name required' }, { status: 400 })
    }

    const supabase = createClient()
    const { error } = await supabase
      .from('city_requests')
      .insert({
        city_name: cityName.trim().slice(0, 100),
        note: note ? note.trim().slice(0, 500) : null,
        email: email ? email.trim().slice(0, 200) : null,
      })

    if (error) throw error
    return Response.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err)
    return Response.json({ error: msg }, { status: 500 })
  }
}
