import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== process.env.ADMIN_EMAIL?.trim()) {
      return Response.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const { id, field, value } = await req.json()
    if (!id || !field) return Response.json({ error: 'Missing id or field' }, { status: 400 })
    if (!['is_published', 'reviewed'].includes(field)) {
      return Response.json({ error: 'Invalid field' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { error } = await admin
      .from('cities')
      .update({ [field]: value })
      .eq('id', id)

    if (error) throw error

    return Response.json({ ok: true })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
