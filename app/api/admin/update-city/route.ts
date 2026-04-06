import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== process.env.ADMIN_EMAIL?.trim()) {
      return Response.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const { id, ...fields } = await req.json()
    if (!id) return Response.json({ error: 'Missing id' }, { status: 400 })

    // Parse JSON fields if passed as strings
    const update = { ...fields }
    for (const key of ['neighbourhoods', 'suggested_questions']) {
      if (typeof update[key] === 'string') {
        try {
          update[key] = JSON.parse(update[key])
        } catch {
          return Response.json({ error: `Invalid JSON in ${key}` }, { status: 400 })
        }
      }
    }

    const admin = createAdminClient()
    const { error } = await admin.from('cities').update(update).eq('id', id)
    if (error) throw error

    return Response.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err)
    return Response.json({ error: msg }, { status: 500 })
  }
}
