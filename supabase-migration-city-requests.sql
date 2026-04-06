-- Migration: city_requests table
-- Run in Supabase SQL editor

create table if not exists public.city_requests (
  id uuid primary key default gen_random_uuid(),
  city_name text not null,
  note text,
  email text,
  created_at timestamptz not null default now()
);

-- Anyone can insert a request (no auth required)
alter table public.city_requests enable row level security;

create policy "Anyone can submit a city request"
  on public.city_requests for insert
  with check (true);

-- Only service role (admin API) can read requests
-- (RLS blocks anon/authenticated reads — admin client bypasses RLS)
