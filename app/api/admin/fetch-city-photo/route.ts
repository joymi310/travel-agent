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
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (!id || !name) return Response.json({ error: 'Missing id or name' }, { status: 400 })

    const wikiRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(name)}&prop=pageimages&format=json&pithumbsize=1200`,
      { headers: { 'User-Agent': 'Wandr Travel App' } }
    )
    const wikiData = await wikiRes.json()
    const pages = Object.values(wikiData?.query?.pages ?? {}) as Record<string, unknown>[]
    const thumb = (pages[0] as { thumbnail?: { source?: string } })?.thumbnail?.source

    if (!thumb) {
      return Response.json({ error: `No Wikipedia image found for "${name}"` }, { status: 404 })
    }

    const admin = createAdminClient()
    const { error } = await admin
      .from('cities')
      .update({ hero_image_url: thumb })
      .eq('id', id)

    if (error) throw error

    return Response.json({ hero_image_url: thumb })
  } catch (err) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err)
    return Response.json({ error: msg }, { status: 500 })
  }
}
