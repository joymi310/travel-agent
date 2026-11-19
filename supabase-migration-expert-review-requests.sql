-- Migration: expert_review_requests table
-- Run in Supabase SQL editor

create table if not exists public.expert_review_requests (
  id uuid primary key default gen_random_uuid(),
  destination text,
  duration text,
  itinerary jsonb,
  note text,
  email text not null,
  created_at timestamptz not null default now()
);

-- Anyone can submit a request (no auth required)
alter table public.expert_review_requests enable row level security;

create policy "Anyone can submit an expert review request"
  on public.expert_review_requests for insert
  with check (true);

-- Only service role (admin API / SQL editor) can read requests
-- (RLS blocks anon/authenticated reads — admin client bypasses RLS)
