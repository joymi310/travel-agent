# travel-agent

Wayfindr — an AI travel planning app. Users describe a trip, get a structured itinerary, and can refine it via chat.

## Stack

- **Framework**: Next.js 14 (App Router)
- **Database/Auth**: Supabase
- **AI**: Vercel AI SDK (`ai` v4, `@ai-sdk/anthropic`) with Anthropic models
- **Deployment**: GitHub → Vercel auto-deploy on push to `main`
- **Styling**: Tailwind CSS

## Models

| Endpoint | Model | Why |
|----------|-------|-----|
| `/api/chat` | `claude-sonnet-4-20250514` | Main chat — quality matters |
| `/api/city-guide` | `claude-sonnet-4-20250514` | Detailed structured guide |
| `/api/city-chat` | `claude-haiku-4-5-20251001` | Speed/cost, concise answers |
| `/api/generate-itinerary` | `claude-haiku-4-5-20251001` | Structured JSON output |
| `/api/admin/generate-city` | `claude-sonnet-4-6` | Admin-only, one-off |
| Title generation (in chat) | `claude-haiku-4-5-20251001` | Short, cheap |

## Key Files

| File | Purpose |
|------|---------|
| `lib/system-prompt.ts` | Wayfindr system prompt + per-travel-style behaviour overrides |
| `lib/profile-tree.ts` | Travel style questionnaire definitions and `buildProfileContext()` |
| `lib/rate-limit.ts` | Rate limit checker via Supabase RPC |
| `lib/supabase/client.ts` | Browser Supabase client (anon key) |
| `lib/supabase/server.ts` | Server Supabase client (anon key + cookies) |
| `lib/supabase/admin.ts` | Admin Supabase client (service role, bypasses RLS) |
| `app/api/chat/route.ts` | Main streaming chat endpoint |
| `app/api/city-guide/route.ts` | Streaming personalised city guide |
| `app/api/generate-itinerary/route.ts` | JSON itinerary generation |
| `app/api/city-chat/route.ts` | City-specific local expert chat |
| `app/api/admin/generate-city/route.ts` | Admin: AI-generate a new city |

## API Routes

- `POST /api/chat` — main chat, auth optional, rate-limited (100/day auth, 20/day guest)
- `POST /api/generate-itinerary` — generates trip itinerary as JSON, rate-limited
- `POST /api/city-guide` — streams personalised 5-section city guide
- `POST /api/city-chat` — city-specific Q&A, rate-limited
- `POST /api/admin/generate-city` — admin only (checks `ADMIN_EMAIL`)
- `POST /api/admin/toggle-city` — admin only, toggles `is_published`/`reviewed`

## Auth & Supabase

- Supabase email/password auth; OAuth callback at `/auth/callback`
- **Server client** for reading auth context in API routes and server components
- **Admin client** (service role) only in admin routes and rate-limit checks — never expose to client
- Admin access: `user.email === process.env.ADMIN_EMAIL`
- DB trigger auto-creates a `profiles` row on signup
- RLS enforced on all tables; cities table: public read for `is_published = true`

## Rate Limiting

- Calls Supabase RPC `increment_rate_limit(identifier, date)` — atomically increments a daily counter
- Identifier: `user.id` for auth users, IP (`x-forwarded-for`/`x-real-ip`) for guests
- Some endpoints prefix the identifier (e.g. `city-chat:${ip}`) to have separate counters
- Fail-open: if RPC errors, request is allowed through

## Input Validation Pattern

All routes validate at the boundary — type check, length cap, sanitise:

```typescript
const field = typeof body.field === 'string' ? body.field.slice(0, MAX_LEN).trim() : ''
const messages = Array.isArray(body.messages)
  ? body.messages.slice(0, MAX_MESSAGES).map(m => sanitise(m))
  : []
```

Never trust `body` without this pattern.

## Prompt Caching

`/api/chat` and `/api/city-guide` use Anthropic prompt caching. System prompts are passed via the `messages` array (not the `system` string param — that doesn't support caching) with `providerOptions: { anthropic: { cacheControl: { type: 'ephemeral' } } }`.

In `city-guide`, the static task instructions (`GUIDE_INSTRUCTIONS`) are cached; dynamic city/traveller context is a separate un-cached system message.

## Itinerary Update Flow

When a user modifies their itinerary via chat, Claude returns the updated JSON wrapped in `<itinerary_update>...</itinerary_update>` tags. The client detects and parses these to update itinerary state. Claude only includes these tags when actually modifying the itinerary, not for Q&A.

## Special Message Trigger

`__profile_complete__` in the messages array signals the profile wizard just finished. The chat route replaces it with a real prompt asking Claude to introduce itself and acknowledge the user's travel style.

## localStorage State

- `wandr_pending_trip`: wizard answers + generated itinerary, stored pre-login
- On chat load post-login, moved to DB and cleared

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ADMIN_EMAIL
```

## Database Tables

- `profiles` — user preferences (home_airport, currency, travel_style)
- `conversations` — chat sessions (title, itinerary JSONB)
- `messages` — chat messages (role: user|assistant)
- `rate_limits` — daily request counts per identifier
- `cities` — city content (neighbourhoods JSONB, is_published, reviewed)

Schema files: `supabase-schema.sql`, `supabase-cities-schema.sql`, `supabase-rate-limit.sql`
