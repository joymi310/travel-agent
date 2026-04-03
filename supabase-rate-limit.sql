-- Rate limiting table
create table public.rate_limits (
  identifier text not null,
  date date not null default current_date,
  count integer not null default 0,
  primary key (identifier, date)
);

-- Atomic increment function
create or replace function public.increment_rate_limit(p_identifier text, p_date date)
returns integer as $$
declare
  new_count integer;
begin
  insert into public.rate_limits (identifier, date, count)
  values (p_identifier, p_date, 1)
  on conflict (identifier, date)
  do update set count = rate_limits.count + 1
  returning count into new_count;
  return new_count;
end;
$$ language plpgsql security definer;
