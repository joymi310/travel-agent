import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { AdminCitiesClient } from './AdminCitiesClient'

export const dynamic = 'force-dynamic'

export default async function AdminCitiesPage() {
  // Server-side admin check — ADMIN_EMAIL never sent to client
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== process.env.ADMIN_EMAIL?.trim()) {
    redirect('/')
  }

  const admin = createAdminClient()
  const { data: cities } = await admin
    .from('cities')
    .select('id, slug, name, country, region, is_published, reviewed, created_at')
    .order('created_at', { ascending: false })

  return <AdminCitiesClient initialCities={cities ?? []} />
}
