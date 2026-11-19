-- Migration: harden SECURITY DEFINER functions
-- Run in Supabase SQL editor
--
-- Flagged by Security Advisor:
--  - Function Search Path Mutable (both functions)
--  - Public/Signed-In Users Can Execute SECURITY DEFINER Function (both functions)
--
-- handle_new_user() is only ever invoked by the on_auth_user_created trigger
-- (supabase-schema.sql) — trigger firing does not require EXECUTE privilege,
-- so revoking it from PUBLIC does not break signup.
--
-- increment_rate_limit() is only ever called server-side via the service-role
-- admin client (lib/rate-limit.ts). Revoking from PUBLIC/anon/authenticated
-- closes a hole where anyone could call it directly with someone else's
-- identifier to burn through their rate limit.

ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.increment_rate_limit(text, date) SET search_path = public;

-- Supabase grants EXECUTE directly to anon/authenticated, not just PUBLIC,
-- so both must be named explicitly for the revoke to actually take effect.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_rate_limit(text, date) FROM PUBLIC, anon, authenticated;

-- Ensure the admin (service-role) client can still call it
GRANT EXECUTE ON FUNCTION public.increment_rate_limit(text, date) TO service_role;
