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

    const unsplashRes = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(name + ' city travel')}&orientation=landscape&per_page=1`,
      { headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` } }
    )

    if (!unsplashRes.ok) {
      return Response.json({ error: 'Unsplash request failed' }, { status: 502 })
    }

    const unsplashData = await unsplashRes.json()
    const photo = unsplashData?.results?.[0]
    const imageUrl = photo?.urls?.regular

    if (!imageUrl) {
      return Response.json({ error: `No Unsplash image found for "${name}"` }, { status: 404 })
    }

    const admin = createAdminClient()
    const { error } = await admin
      .from('cities')
      .update({ hero_image_url: imageUrl })
      .eq('id', id)

    if (error) throw error

    return Response.json({ hero_image_url: imageUrl })
  } catch (err) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err)
    return Response.json({ error: msg }, { status: 500 })
  }
}
