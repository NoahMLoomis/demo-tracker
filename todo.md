## TODO 
- put env variables in BW
- Add FAQ 
    - How to automatically upload garmin / coros activites to strava

- Change deployed env variable NEXT_PUBLIC_BASE_AUTH to be correct deployed url

- Change the amount of strava activities gotten to be only the latest, and move the marker based on where it is
- Use the same GPX file for the map
- Optionally, users can include coordinates in their blog posts.

- ? Users will have to put SOBO or NOBO so the stats are calculated correctly

## Possible blockers:

- Vercel / Supabase limiting - could pass by the free tier

- Strava API usage - 200 requests every 15 minutes, with up to 2,000 requests per day
