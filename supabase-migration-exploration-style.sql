-- WAN-028: Add exploration_style to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS exploration_style text;
