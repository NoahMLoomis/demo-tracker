# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PCT Trail Tracker — a static site (GitHub Pages + Jekyll) that displays hiking progress on the Pacific Crest Trail. Combines live Strava activity data, MapLibre GL maps, Flickr photo galleries, and markdown trail updates. No backend server; all data lives in the repo as JSON/GeoJSON files.

## Architecture

**Data pipeline:** `scripts/strava_sync.py` authenticates with Strava OAuth 2.0, fetches activities, computes GPS/elevation data via Haversine, and writes three files:
- `data/track.geojson` — all activities as GeoJSON LineString features with elevation profiles
- `data/latest.json` — most recent coordinates/timestamp
- `data/strava_state.json` — seen activity IDs to avoid reprocessing

**Frontend:** Vanilla JS (no frameworks). Two main scripts:
- `assets/js/map.js` (~900 lines) — loads GeoJSON, renders MapLibre GL map, calculates stats (distance, elevation, time, PCT % completion out of 2,650 mi), builds elevation profile charts in popups, and generates the insights panel
- `assets/js/flickr-grid.js` — fetches photos from Flickr API via JSONP

**Pages:** `index.md` (map/stats), `updates.md` (trail journal), `photos.md` (Flickr gallery), `gear.md` (LighterPack embed). All use `_layouts/default.html`.

**Styling:** `assets/css/style.css` — dark theme with CSS variables (`--bg`, `--card`, `--text`, `--accent: #7ee787`, `--radius: 16px`, `--max: 980px`). Mobile-first responsive design.

## Commands

**Run Strava sync locally:**
```bash
source venv/bin/activate
pip install -r requirements.txt
python scripts/strava_sync.py
```
Requires `.env` with `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `STRAVA_REFRESH_TOKEN` (see `.env.example`).

**Serve site locally:**
```bash
bundle exec jekyll serve
```
Site is at `http://localhost:4000/demo-tracker/` (baseurl is `/demo-tracker`).

## Automated Sync

GitHub Actions (`.github/workflows/strava-sync.yml`) runs `strava_sync.py` every 6 hours via cron and on manual dispatch. It commits changed data files as `strava-sync-bot`. Strava credentials are stored as GitHub repository secrets.

## Key Configuration

- Jekyll config: `_config.yml` (baseurl: `/demo-tracker`, markdown: kramdown, no theme)
- Flickr User ID: `35469735@N03`, Photoset ID: `72177720331905792`
- LighterPack ID: `lm2int`
- All frontend dependencies are CDN-hosted (MapLibre GL v3.6.2, Flickr API, LighterPack embed)
