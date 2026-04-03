import { createAdminClient } from './supabase/admin'

const GUEST_LIMIT = 20
const USER_LIMIT = 100

export async function checkRateLimit(
  identifier: string,
  isAuthenticated: boolean
): Promise<{ allowed: boolean; remaining: number }> {
  const limit = isAuthenticated ? USER_LIMIT : GUEST_LIMIT
  const admin = createAdminClient()
  const today = new Date().toISOString().slice(0, 10)

  // Atomically increment via RPC
  const { data: count, error } = await admin.rpc('increment_rate_limit', {
    p_identifier: identifier,
    p_date: today,
  })

  if (error) {
    // Fail open — don't block users if rate limit check itself errors
    console.error('Rate limit check failed:', error)
    return { allowed: true, remaining: limit }
  }

  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
  }
}
