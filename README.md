# PCT Tracker

A multi-user Pacific Crest Trail tracker built with Next.js, Supabase, and MapLibre. Connect your Strava account to get a live map of your PCT progress with stats, trail updates, and a shareable public tracker page.

Most of this app was built in a weekend with Claude Code.

## Prerequisites

- Node.js 18+
- pnpm (`npm i -g pnpm`)
- A [Supabase](https://supabase.com) project
- A [Strava API application](https://www.strava.com/settings/api)

## Getting Started

1. **Clone the repo**

   ```bash
   git clone git@github.com:NoahMLoomis/pct-tracker.git 
   cd pct-tracker
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Copy the env.example file and fill in your values:

   ```bash
   cp .env.example .env
   ```

   | Variable | Description |
   |----------|-------------|
   | `STRAVA_CLIENT_ID` | From your Strava API application |
   | `STRAVA_CLIENT_SECRET` | From your Strava API application |
   | `SUPABASE_URL` | Your Supabase project URL |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
   | `NEXT_PUBLIC_SUPABASE_URL` | Same as `SUPABASE_URL` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
   | `SESSION_SECRET` | A random string for signing session JWTs |
   | `CRON_SECRET` | Protects the `/api/cron/sync` endpoint |
   | `NEXT_PUBLIC_BASE_URL` | `http://localhost:3000` for local dev |

4. **Run database migrations**

   Apply the Supabase migrations in `supabase/migrations/` to your project:

   ```bash
   npx supabase db push
   ```

5. **Start the dev server**

   ```bash
   pnpm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Deployment

The app is designed to deploy on [Vercel](https://vercel.com). Set the same environment variables from `.env.example` in your Vercel project settings, with `NEXT_PUBLIC_BASE_URL` set to your production URL.

The cron sync endpoint (`/api/cron/sync`) can be triggered by Vercel Cron or any external scheduler using the `CRON_SECRET` for auth.

## Notes

The develop branch exists because vercel automatically re-deploys any pushes on main. So when deployment is ready, merge develop into main and vercel should auto deploy

## Shoutouts
This project would not have happended without the reddit user r/Fickle_Bed8196 [post](https://www.reddit.com/r/PacificCrestTrail/comments/1r24p0x) or work on [his app](https://www.reddit.com/r/PacificCrestTrail/comments/1r24p0x).

[Derek Carr's](https://www.dcarr.com/) 2025 PCT GPX file also made my job much easier 
