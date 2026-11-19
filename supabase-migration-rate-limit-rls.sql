-- Migration: enable RLS on rate_limits
-- Run in Supabase SQL editor
--
-- rate_limits is only ever read/written by lib/rate-limit.ts via the
-- service-role admin client (createAdminClient), which bypasses RLS
-- regardless of policies. No anon/authenticated client needs direct
-- access to this table, so enabling RLS with zero policies denies all
-- client-side access while leaving the server-side admin flow untouched.
--
-- Without this, the table was exposed through the public anon key via
-- PostgREST: anyone could read other identifiers' usage counts, or
-- delete/zero their own row to bypass the daily rate limit entirely.

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
