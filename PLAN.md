# Next.js SaaS Migration Plan

## Overview
Migrate the PCT Trail Tracker from a Jekyll static site to a multi-user Next.js SaaS app. Any Strava user can sign up and get their own public PCT tracker page.

**Stack:** Next.js (App Router) + Vercel + Supabase (Postgres + Auth)

---

## Phase 1: Project Scaffolding

Create a new Next.js project alongside the existing Jekyll site (can live in same repo or new one).

```
pct-tracker-app/
├── app/
│   ├── layout.tsx              # Root layout (dark theme, fonts)
│   ├── page.tsx                # Landing page ("Track your PCT hike")
│   ├── login/page.tsx          # "Connect with Strava" button
│   ├── dashboard/page.tsx      # User settings (slug, Flickr ID, Lighterpack URL)
│   ├── tracker/[slug]/
│   │   ├── layout.tsx          # Tracker layout (header + tabs)
│   │   ├── page.tsx            # Map + stats + insights
│   │   ├── photos/page.tsx     # Flickr photo grid
│   │   └── updates/page.tsx    # Trail journal
│   └── api/
│       ├── auth/
│       │   ├── strava/route.ts       # Redirect to Strava OAuth
│       │   └── callback/route.ts     # Exchange code, create user, set session
│       ├── sync/route.ts             # Trigger sync for authenticated user
│       ├── tracks/[slug]/route.ts    # Serve GeoJSON for a tracker
│       ├── latest/[slug]/route.ts    # Serve latest position
│       └── cron/sync/route.ts        # Vercel cron: sync all users
├── components/
│   ├── Map.tsx                 # MapLibre GL wrapper (port map.js)
│   ├── StatsPanel.tsx          # Distance, elevation, time, speed
│   ├── InsightsPanel.tsx       # Progress %, timeline, longest/shortest day
│   ├── TrackerHeader.tsx       # Brand + tabs (Map | Photos | Updates)
│   ├── PhotoGrid.tsx           # Flickr grid + lightbox
│   └── UpdateCard.tsx          # Trail journal entry
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser Supabase client
│   │   ├── server.ts           # Server-side Supabase client
│   │   └── middleware.ts       # Session refresh middleware
│   ├── strava.ts               # Token refresh, fetch activities, fetch streams
│   ├── sync.ts                 # Full sync pipeline (port of strava_sync.py)
│   ├── pct-filter.ts           # PCT waypoints + segment proximity check
│   ├── geo.ts                  # Haversine, downsample, elevation calc
│   └── types.ts                # Shared TypeScript types
├── styles/
│   └── globals.css             # Dark theme CSS variables (port style.css)
├── supabase/
│   └── migrations/
│       └── 001_initial.sql     # Database schema
└── vercel.json                 # Cron schedule config
```

---

## Phase 2: Database Schema (Supabase)

```sql
-- Users (one per Strava athlete)
create table users (
  id uuid primary key default gen_random_uuid(),
  strava_athlete_id bigint unique not null,
  display_name text not null,
  slug text unique not null,              -- public URL: /tracker/{slug}
  profile_image_url text,
  flickr_user_id text,                    -- optional Flickr integration
  flickr_photoset_id text,
  lighterpack_url text,                   -- external link (no embed)
  strava_access_token text not null,
  strava_refresh_token text not null,
  strava_token_expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Activities (synced from Strava, filtered to PCT)
create table activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  strava_id bigint not null,
  name text,
  start_date timestamptz not null,
  distance_m double precision not null default 0,
  moving_time_s integer not null default 0,
  activity_type text,
  elevation_gain_m double precision not null default 0,
  profile_dist_m jsonb,                   -- cumulative distance array
  profile_elev_m jsonb,                   -- elevation array
  coordinates jsonb not null,             -- GeoJSON LineString coords [[lon,lat],...]
  created_at timestamptz default now(),
  unique(user_id, strava_id)
);

-- Sync state per user
create table sync_state (
  user_id uuid primary key references users(id) on delete cascade,
  last_sync_at timestamptz,
  status text default 'idle'              -- idle | syncing | error
);

-- Indexes
create index idx_activities_user on activities(user_id);
create index idx_activities_start on activities(user_id, start_date);
create index idx_users_slug on users(slug);
```

---

## Phase 3: Auth Flow (Strava OAuth)

Custom OAuth (Supabase doesn't have a built-in Strava provider):

1. **`/login`** — button: "Connect with Strava"
2. **`GET /api/auth/strava`** — redirects to Strava authorize URL:
   ```
   https://www.strava.com/oauth/authorize
     ?client_id=...&response_type=code
     &redirect_uri=.../api/auth/callback
     &scope=activity:read_all
     &approval_prompt=auto
   ```
3. **`GET /api/auth/callback`** — exchanges code for tokens + athlete info:
   - Upserts user row in Supabase (strava_athlete_id, tokens, display_name)
   - Auto-generates slug from athlete name (e.g. "noah-loomis")
   - Sets a signed HTTP-only cookie (JWT) for session
   - Redirects to `/dashboard`
4. **Middleware** — reads session cookie, refreshes Strava token if expired

---

## Phase 4: Sync Pipeline (Port strava_sync.py to TypeScript)

Port the Python sync logic to `lib/sync.ts`:

- **Token refresh:** refresh Strava access token, save new refresh token to DB
- **Fetch activities:** paginate up to 250 activities from Strava API
- **PCT filter:** port `PCT_WAYPOINTS`, `_point_to_segment_m`, `is_near_pct` to TypeScript (`lib/pct-filter.ts`)
- **Fetch streams:** get latlng + altitude for each PCT activity
- **Compute elevation:** Haversine distance, cumulative profiles, downsample to 220 points (`lib/geo.ts`)
- **Upsert to DB:** insert/update activities table (skip existing strava_ids)
- **Update latest:** compute latest position from newest activity

**Triggers:**
- `POST /api/sync` — user clicks "Sync Now" in dashboard
- `GET /api/cron/sync` — Vercel cron runs every 6 hours, iterates all users

**Strava rate limits (100 req/15min, 1000/day):**
- Skip activities already in DB (check strava_id)
- Stagger user syncs in cron (don't sync all at once)

---

## Phase 5: API Routes

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/auth/strava` | GET | None | Redirect to Strava OAuth |
| `/api/auth/callback` | GET | None | Exchange code, create session |
| `/api/sync` | POST | Required | Trigger sync for current user |
| `/api/tracks/[slug]` | GET | None (public) | Return GeoJSON FeatureCollection |
| `/api/latest/[slug]` | GET | None (public) | Return { lat, lon, ts } |
| `/api/cron/sync` | GET | Cron secret | Sync all users (Vercel cron) |

**`/api/tracks/[slug]`** builds GeoJSON on the fly from the activities table:
- Query activities for user, ordered by start_date
- Assemble into FeatureCollection with `i` index for alternating colors
- Cache with `Cache-Control: s-maxage=300` (5 min)

---

## Phase 6: Frontend Components (Port existing JS to React)

### Map.tsx (~port of map.js)
- React component using `useRef` + `useEffect` for MapLibre GL lifecycle
- Same 4 track layers (glow, main, highlight, hover)
- Same animated latest-progress line (requestAnimationFrame)
- Same blinking position marker
- Props: `geojsonUrl`, `latestUrl`

### StatsPanel.tsx
- Port `computeStats` and `setStatsUI` from map.js
- Props: `features` (GeoJSON features array)
- Renders hero card + chip grid (distance, elevation, time, speed)

### InsightsPanel.tsx
- Port `setInsightsUI` from map.js
- Progress bar (% of 2,650 mi), timeline, longest/shortest day chips

### TrackerHeader.tsx
- Port from `_layouts/default.html`
- Brand title (user's display name), tabs: Map | Photos | Updates
- Gear tab is a link to user's Lighterpack URL (opens in new tab)
- Active tab state from current route

### PhotoGrid.tsx
- Port from photos.md inline script
- Fetch from Flickr API using user's flickr_user_id + flickr_photoset_id
- Grid layout + lightbox modal
- Only shown if user has configured Flickr IDs

---

## Phase 7: Pages

### `/` (Landing)
- Marketing page: "Track your PCT hike"
- Show example tracker screenshot/demo
- "Connect with Strava" CTA button

### `/login`
- Single button: "Connect with Strava" -> `/api/auth/strava`

### `/dashboard` (Authenticated)
- Profile info (from Strava)
- Public tracker URL: `/tracker/{slug}`
- Edit slug
- Set Flickr User ID + Photoset ID (optional)
- Set Lighterpack URL (optional)
- "Sync Now" button + last sync time
- Sync status indicator

### `/tracker/[slug]` (Public)
- Same layout as current site: map + stats + insights
- Fetches from `/api/tracks/[slug]` and `/api/latest/[slug]`
- Auto-refreshes every 60 seconds (same as current)

### `/tracker/[slug]/photos`
- Flickr photo grid (if configured)
- "No photos configured" message if not

### `/tracker/[slug]/updates`
- Trail journal entries
- For MVP: store updates as markdown in a `updates` table or let user edit in dashboard
- Alternative: simple text entries stored in DB

---

## Phase 8: Styling

Port `assets/css/style.css` to `styles/globals.css`:
- Keep all CSS variables (--bg, --card, --text, --accent, --radius, --max)
- Keep dark theme, mobile-first responsive design
- Keep sticky header, card layout, chip grid patterns
- Use CSS modules or globals — no Tailwind needed (existing CSS is clean and small)

---

## Phase 9: Deployment

1. **Vercel:** connect repo, auto-deploy on push
2. **Supabase:** create project, run migrations, set env vars
3. **Environment variables (Vercel):**
   - `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`
   - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - `CRON_SECRET` (to protect cron endpoint)
   - `SESSION_SECRET` (for JWT signing)
4. **vercel.json cron:**
   ```json
   { "crons": [{ "path": "/api/cron/sync", "schedule": "0 */6 * * *" }] }
   ```
5. **Strava app settings:** update redirect URI to production callback URL

---

## Implementation Order

1. `npm create next-app` + Supabase setup + DB migration
2. Strava OAuth flow (auth routes + session)
3. Sync pipeline (port Python to TypeScript)
4. API routes (tracks, latest, cron)
5. Map component (port map.js to React)
6. Stats + Insights components
7. Tracker pages (map, photos, updates)
8. Dashboard (settings, sync button)
9. Landing page
10. Deploy to Vercel
