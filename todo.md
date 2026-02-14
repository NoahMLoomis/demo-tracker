## TODO 
- Add FAQ 
    - How to automatically upload garmin / coros activites to strava
- is sync state still used?
## Possible blockers:

- Vercel / Supabase limiting - could pass by the free tier

- Strava API usage - 200 requests every 15 minutes, with up to 2,000 requests per day

## Roadmap

### Priority 1
- **GPX file upload** — Allow users to upload their own GPX files instead of having to use strava.
- **Migrate from CSS to Tailwind** 
- **Photo support** — Allow users to attach photos to updates 
- **Email notifications** — Let followers subscribe to a hiker's tracker and receive email updates when new trail updates are posted
- **Elevation profile chart** — Display an elevation chart of the PCT showing the hiker's current position
- **Multiple trail support** — Expand beyond the PCT to support other long-distance trails (AT, CDT, etc.)

### Priority 2


### Completed
- **NOBO/SOBO direction support** — Users can select hiking direction, map shows completed vs remaining sections
- **Trail updates with map pins** — Hikers can post journal entries with optional locations that appear as clickable pins
- **Browser geolocation for updates** — Location picker auto-detects the user's position
- **Static PCT trail display** — Replaced per-activity GPS rendering with a static GeoJSON trail line
- **Lightweight Strava sync** — Switched from full GPS streams to lightweight activity summaries (~5 API calls vs ~255)
