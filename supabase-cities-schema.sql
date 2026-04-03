-- ──────────────────────────────────────────────────────
-- Run in Supabase Dashboard > SQL Editor
-- ──────────────────────────────────────────────────────

create table if not exists cities (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  country text not null,
  region text,
  hero_tagline text,
  overview text,
  neighbourhoods jsonb,
  best_time text,
  getting_around text,
  visa_notes text,
  suggested_questions jsonb,
  is_published boolean default false,
  reviewed boolean default false,
  created_at timestamptz default now()
);

alter table cities enable row level security;

-- Anyone can read published cities
create policy "Published cities are public"
  on cities for select
  using (is_published = true);

-- Service role (used by admin API routes) bypasses RLS automatically.
-- No additional insert/update policy needed.

-- ── Seed data ─────────────────────────────────────────

insert into cities (slug, name, country, region, hero_tagline, overview, neighbourhoods, best_time, getting_around, visa_notes, suggested_questions, is_published, reviewed)
values
(
  'tokyo', 'Tokyo', 'Japan', 'East Asia',
  'The world''s most organised chaos',
  'Tokyo is a city that defies expectations at every corner, blending thousand-year-old temples with neon-lit streets and some of the world''s best food at every price point. With 37 million people in the greater metro, it somehow manages to feel like the most efficient, courteous city on earth. Whether you''re chasing cherry blossoms in Ueno or hunting vintage clothing in Shimokitazawa, Tokyo rewards every type of traveller.',
  '[
    {"name":"Shinjuku","vibe":"Neon-lit and relentless — the entertainment capital of Tokyo with world-class nightlife.","best_for":"Nightlife, first-timers, shopping","price_range":"Mid-range"},
    {"name":"Shibuya","vibe":"Youth culture, iconic fashion and the world''s busiest pedestrian crossing.","best_for":"Young travellers, shopping","price_range":"Mid-range"},
    {"name":"Asakusa","vibe":"Old Tokyo — rickshaws, Senso-ji Temple and traditional craft shops.","best_for":"Culture seekers, families","price_range":"Budget"},
    {"name":"Shimokitazawa","vibe":"Tokyo''s indie neighbourhood — vintage shops, jazz bars and tiny live music venues.","best_for":"Couples, creative travellers","price_range":"Budget"}
  ]'::jsonb,
  'March–May for cherry blossoms; October–November for autumn foliage and mild temperatures. Avoid August — brutally hot and humid.',
  'JR Pass or IC card (Suica/Pasmo) works on almost every train and bus. The metro is fast and reliable — use Google Maps. Taxis are expensive and rarely necessary.',
  'Most Western passport holders enter visa-free for 90 days. Check the Japan Ministry of Foreign Affairs website for your nationality.',
  '["What''s the best neighbourhood to stay in for first-time visitors?","How do I use the Tokyo subway without getting lost?","What should I eat in Tokyo on a budget?","Is Tokyo safe for solo female travellers?","What are the best day trips from Tokyo?"]'::jsonb,
  true, true
),
(
  'bangkok', 'Bangkok', 'Thailand', 'Southeast Asia',
  'Temples, tuk-tuks and the best street food on earth',
  'Bangkok is Southeast Asia''s ultimate urban playground — chaotic, colourful, and completely addictive once you tune into its rhythm. The street food scene is extraordinary, from midnight pad thai on plastic stools to some of the world''s best fine dining at a fraction of Western prices. Between the gilded temples of the old city, buzzing rooftop bars of Sukhumvit, and quiet canal neighbourhoods, Bangkok contains enough to fill weeks.',
  '[
    {"name":"Sukhumvit","vibe":"Bangkok''s international strip — expat bars, malls and some of the city''s best restaurants.","best_for":"Expats, nightlife, foodies","price_range":"Mid-range"},
    {"name":"Silom & Sathorn","vibe":"Business district by day, legendary rooftop bars and nightlife by night.","best_for":"Couples, nightlife seekers","price_range":"Mid-range"},
    {"name":"Rattanakosin","vibe":"The historic heart — temples, the Grand Palace and budget guesthouses on the river.","best_for":"Families, culture seekers, budget travellers","price_range":"Budget"},
    {"name":"Ari","vibe":"A leafy, local neighbourhood beloved by Bangkok''s young creative class.","best_for":"Slow travellers, couples","price_range":"Mid-range"}
  ]'::jsonb,
  'November–February is the cool dry season — the best time to visit. Avoid April unless you want to be soaked during Songkran. May–October is hot and wet.',
  'BTS Skytrain and MRT cover most tourist areas cheaply. Grab is the safest taxi option. Tuk-tuks are fun for short hops — negotiate the price before getting in.',
  'Most nationalities receive 30–60 days visa-free on arrival. Thai immigration rules change regularly — check the Thai e-Visa portal before travel.',
  '["Which area is best to stay in Bangkok as a first-timer?","How do I get from Suvarnabhumi airport to central Bangkok?","What street food must I try in Bangkok?","Is Bangkok safe to walk around at night?","What temples are worth visiting beyond the Grand Palace?"]'::jsonb,
  true, true
),
(
  'shanghai', 'Shanghai', 'China', 'East Asia',
  'Ancient grandeur meets tomorrow''s skyline',
  'Shanghai sits at the crossroads of China''s past and future — a city where Art Deco Bund buildings face Pudong''s soaring towers across the Huangpu River. The French Concession''s leafy streets hide some of Asia''s most interesting cocktail bars, brunch spots and boutiques, while the Yu Garden area offers a glimpse of Ming Dynasty China within walking distance. Shanghai rewards visitors who push beyond the obvious landmarks.',
  '[
    {"name":"The Bund","vibe":"Shanghai''s iconic waterfront — colonial architecture facing the futuristic Pudong skyline.","best_for":"First-timers, photography, luxury","price_range":"Luxury"},
    {"name":"French Concession","vibe":"Tree-lined streets packed with boutiques, cafes and Shanghai''s best restaurants and bars.","best_for":"Foodies, couples, design lovers","price_range":"Mid-range"},
    {"name":"Pudong","vibe":"Futuristic Manhattan-on-steroids with the Oriental Pearl Tower and world-class hotels.","best_for":"Business travellers, families","price_range":"Luxury"},
    {"name":"Jing''an","vibe":"Upscale shopping, cultural venues and excellent international dining.","best_for":"Shoppers, expats","price_range":"Mid-range"}
  ]'::jsonb,
  'April–May and September–October offer mild weather. Summer (July–August) is brutally hot and humid. Winter is cold and grey but cheaper.',
  'The metro is fast, cheap and covers the whole city. Didi (Chinese Uber) requires a Chinese phone number — set this up before arrival. Download a VPN before entering China.',
  'China requires a visa for most nationalities, but Shanghai offers a 144-hour transit visa exemption for many passport holders. Check china-visaservice.com for your country.',
  '["Do I need a VPN in Shanghai and how do I get one?","What is the 144-hour visa exemption and do I qualify?","How do I pay for things in China without cash?","What are the best restaurants in the French Concession?","Is Shanghai safe to visit as a solo traveller?"]'::jsonb,
  true, true
),
(
  'bali', 'Bali', 'Indonesia', 'Southeast Asia',
  'Gods, rice terraces and world-class surf',
  'Bali is more complex than its Instagram image suggests — an island with a deeply spiritual Hindu culture, extraordinary food, and landscapes that shift from black-sand beaches to misty volcanic highlands in under an hour. Seminyak and Canggu attract digital nomads and surfers while Ubud offers rice terrace treks and genuine cultural immersion. Getting between areas requires a scooter or private driver, which shapes how you plan your days.',
  '[
    {"name":"Seminyak","vibe":"Bali''s upscale beach hub — beach clubs, designer boutiques and excellent restaurants.","best_for":"Couples, beach lovers, foodies","price_range":"Mid-range"},
    {"name":"Canggu","vibe":"The digital nomad capital of Asia — surf breaks, rice paddies and excellent coffee.","best_for":"Surfers, nomads, young travellers","price_range":"Mid-range"},
    {"name":"Ubud","vibe":"Bali''s cultural heart — rice terraces, temple ceremonies and a thriving wellness scene.","best_for":"Culture seekers, families, wellness travellers","price_range":"Budget"},
    {"name":"Nusa Dua","vibe":"A gated resort enclave with calm turquoise beaches and international luxury hotels.","best_for":"Families, luxury travellers","price_range":"Luxury"}
  ]'::jsonb,
  'May–September is the dry season — best for beaches and outdoor activities. The wet season (November–March) brings afternoon showers but lush scenery and fewer tourists.',
  'No public transport. Hire a scooter (200,000–300,000 IDR/day), use Grab for in-town trips, or hire a private driver (600,000–900,000 IDR for 8 hours) for day trips.',
  'Most nationalities get a 30-day visa on arrival, extendable once. Indonesia recently updated its visa policy — check imigrasi.go.id for the latest rules.',
  '["Is Seminyak or Canggu better for first-time visitors?","Do I need an international driving licence to hire a scooter?","What temples should I visit in Bali?","How much does a day in Bali cost on a mid-range budget?","Is Bali safe for solo female travellers?"]'::jsonb,
  true, true
),
(
  'marrakech', 'Marrakech', 'Morocco', 'Africa',
  'Spiced souks, rooftop riads and desert horizons',
  'Marrakech is one of the world''s great sensory experiences — a city where narrow medina alleyways open without warning into vast souks piled with leather, spice and hammered metalwork. Djemaa el-Fna, the central square, transforms from a morning market into an evening carnival of storytellers, acrobats and open-air food stalls that genuinely defies description. Beyond the medina walls, the French-influenced Gueliz district offers a calmer, more contemporary face of Morocco.',
  '[
    {"name":"Medina","vibe":"The historic walled city — ancient, labyrinthine and extraordinary. Stay here for the full Marrakech experience.","best_for":"First-timers, culture lovers, couples","price_range":"Mid-range"},
    {"name":"Gueliz","vibe":"Marrakech''s modern neighbourhood — wide boulevards, rooftop restaurants and easy navigation.","best_for":"Families, those who prefer calm","price_range":"Mid-range"},
    {"name":"Mellah","vibe":"The ancient Jewish quarter with spice-scented alleyways and hidden neighbourhood gems.","best_for":"History buffs, photographers","price_range":"Budget"},
    {"name":"Palmeraie","vibe":"A palm grove resort district outside the city walls — exclusive and tranquil.","best_for":"Luxury travellers","price_range":"Luxury"}
  ]'::jsonb,
  'March–May and September–November are ideal. Summer (June–August) can hit 40°C+. December–February is mild by day but cold at night.',
  'Walking is the only way through the medina''s narrow alleys. Petit taxis are cheap for longer journeys — always insist on the meter. Avoid unofficial guides near the main square.',
  'Most Western nationalities (US, UK, EU, Australia, Canada) get 90 days visa-free. Ensure your passport has at least 6 months validity.',
  '["Is Marrakech safe for solo female travellers?","How do I handle bargaining in the souks without getting ripped off?","What does a good riad cost per night?","How do I get to the Sahara Desert from Marrakech?","What should I eat in Marrakech beyond tagine?"]'::jsonb,
  true, true
);
