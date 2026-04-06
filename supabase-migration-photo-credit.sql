alter table cities
  add column if not exists hero_photographer_name text,
  add column if not exists hero_photographer_url  text;
