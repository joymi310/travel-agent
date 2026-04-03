import { createAdminClient } from '@/lib/supabase/admin'
import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://travel-agent-chi-ten.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const admin = createAdminClient()
  const { data: cities } = await admin
    .from('cities')
    .select('slug, created_at')
    .eq('is_published', true)

  const cityUrls = (cities ?? []).map(city => ({
    url: `${BASE_URL}/cities/${city.slug}`,
    lastModified: new Date(city.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    { url: BASE_URL, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/cities`, changeFrequency: 'daily', priority: 0.9 },
    ...cityUrls,
  ]
}
