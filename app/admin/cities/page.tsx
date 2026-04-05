import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { AdminCitiesClient } from './AdminCitiesClient'

export const dynamic = 'force-dynamic'

export default async function AdminCitiesPage() {
  // Server-side admin check — ADMIN_EMAIL never sent to client
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return (
      <div style={{ padding: 40, fontFamily: 'monospace' }}>
        <p>Access denied</p>
        <p>Signed in as: <strong>{user?.email ?? 'not signed in'}</strong></p>
        <p>ADMIN_EMAIL: <strong>{process.env.ADMIN_EMAIL ?? 'not set'}</strong></p>
      </div>
    )
  }

  const admin = createAdminClient()
  const { data: cities } = await admin
    .from('cities')
    .select('id, slug, name, country, region, is_published, reviewed, created_at')
    .order('created_at', { ascending: false })

  return <AdminCitiesClient initialCities={cities ?? []} />
}
