import os
import json
import math
import urllib.request
import urllib.parse
from dotenv import load_dotenv

load_dotenv()

CLIENT_ID = os.environ["STRAVA_CLIENT_ID"]
CLIENT_SECRET = os.environ["STRAVA_CLIENT_SECRET"]
REFRESH_TOKEN = os.environ["STRAVA_REFRESH_TOKEN"]

TRACK_PATH = "data/track.geojson"
LATEST_PATH = "data/latest.json"
STATE_PATH = "data/strava_state.json"

# Max elevation profile points stored per activity (limits file size)
PROFILE_MAX_POINTS = 220

# Max distance (metres) from a PCT waypoint to count as "on trail"
PCT_PROXIMITY_M = 15000  # 15 km

# Simplified PCT centerline: ~40 waypoints from Campo, CA to Manning Park, BC
PCT_WAYPOINTS = [
    (32.59, -116.47),  # Campo (southern terminus)
    (32.87, -116.51),  # Mount Laguna
    (33.28, -116.64),  # Warner Springs
    (33.74, -116.69),  # Idyllwild
    (33.93, -116.83),  # San Jacinto
    (34.24, -116.87),  # Big Bear
    (34.32, -117.44),  # Cajon Pass
    (34.36, -117.63),  # Wrightwood
    (34.37, -117.99),  # Mt Baden-Powell
    (34.49, -118.32),  # Agua Dulce
    (34.82, -118.72),  # Lake Hughes
    (35.13, -118.45),  # Tehachapi
    (35.67, -118.23),  # Kennedy Meadows South
    (36.07, -118.11),  # Kennedy Meadows
    (36.58, -118.29),  # Mt Whitney / Crabtree
    (36.77, -118.42),  # Forester Pass
    (37.08, -118.66),  # Muir Pass
    (37.38, -118.80),  # Evolution Valley
    (37.65, -119.04),  # Mammoth Lakes
    (37.87, -119.34),  # Tuolumne Meadows
    (38.33, -119.64),  # Sonora Pass
    (38.72, -119.93),  # Carson Pass
    (38.94, -120.04),  # South Lake Tahoe
    (39.32, -120.33),  # Donner Pass
    (39.57, -120.64),  # Sierra City
    (39.96, -121.25),  # Belden
    (40.49, -121.51),  # Lassen area
    (41.01, -121.65),  # Burney Falls
    (41.17, -122.32),  # Castle Crags
    (41.31, -122.31),  # Mt Shasta area
    (41.46, -122.89),  # Etna
    (41.84, -123.23),  # Seiad Valley
    (42.19, -122.71),  # Ashland, OR
    (42.87, -122.17),  # Crater Lake
    (43.35, -122.04),  # Shelter Cove
    (43.83, -121.76),  # Bend area
    (44.42, -121.87),  # Santiam Pass
    (45.33, -121.71),  # Timberline Lodge
    (45.67, -121.90),  # Cascade Locks
    (46.65, -121.39),  # White Pass, WA
    (47.39, -121.41),  # Snoqualmie Pass
    (47.75, -121.09),  # Stevens Pass
    (48.33, -120.69),  # Stehekin
    (48.52, -120.74),  # Rainy Pass
    (49.06, -121.05),  # Manning Park (northern terminus)
]


def post_form(url, data):
    encoded = urllib.parse.urlencode(data).encode("utf-8")
    req = urllib.request.Request(url, data=encoded, method="POST")
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read().decode("utf-8"))


def get_json(url, headers=None):
    req = urllib.request.Request(url, headers=headers or {})
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"HTTP {e.code} on {url}: {body}") from e


def load_refresh_token():
    """Use saved refresh token if available, otherwise fall back to env var."""
    if os.path.exists(STATE_PATH):
        with open(STATE_PATH, "r", encoding="utf-8") as f:
            state = json.load(f)
        saved = state.get("refresh_token")
        if saved:
            return saved
    return REFRESH_TOKEN


def refresh_access_token():
    tok = post_form(
        "https://www.strava.com/oauth/token",
        {
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "grant_type": "refresh_token",
            "refresh_token": load_refresh_token(),
        },
    )
    if "access_token" not in tok:
        raise RuntimeError(f"Token refresh failed: {tok}")
    # Strava rotates refresh tokens — persist the new one for next run
    if "refresh_token" in tok:
        _save_refresh_token(tok["refresh_token"])
    return tok["access_token"]


def _save_refresh_token(new_token):
    state = {}
    if os.path.exists(STATE_PATH):
        with open(STATE_PATH, "r", encoding="utf-8") as f:
            state = json.load(f)
    state["refresh_token"] = new_token
    save_json(STATE_PATH, state)


def save_json(path, obj):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, indent=2)


def is_near_pct(lat, lon):
    """Return True if the point is within PCT_PROXIMITY_M of any PCT waypoint."""
    for wlat, wlon in PCT_WAYPOINTS:
        if haversine_m(lat, lon, wlat, wlon) <= PCT_PROXIMITY_M:
            return True
    return False


def get_recent_activities(access_token):
    acts = []
    for page in range(1, 6):
        url = (
            f"https://www.strava.com/api/v3/athlete/activities?per_page=50&page={page}"
        )
        batch = get_json(url, headers={"Authorization": f"Bearer {access_token}"})
        if not batch:
            break
        acts.extend(batch)
    return acts


def get_stream(access_token, activity_id):
    # Important: include altitude!
    url = (
        f"https://www.strava.com/api/v3/activities/{activity_id}/streams"
        f"?keys=latlng,time,altitude&key_by_type=true"
    )
    return get_json(url, headers={"Authorization": f"Bearer {access_token}"})


def haversine_m(lat1, lon1, lat2, lon2):
    R = 6371000.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = (
        math.sin(dphi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(dl / 2) ** 2
    )
    return 2 * R * math.asin(math.sqrt(a))


def downsample_series(xs, ys, max_points):
    """Evenly downsample (no libs), xs/ys must be same length."""
    n = min(len(xs), len(ys))
    if n <= max_points:
        return xs[:n], ys[:n]
    step = (n - 1) / (max_points - 1)
    out_x, out_y = [], []
    for i in range(max_points):
        idx = int(round(i * step))
        idx = max(0, min(n - 1, idx))
        out_x.append(xs[idx])
        out_y.append(ys[idx])
    return out_x, out_y


def main():
    access = refresh_access_token()

    activities = get_recent_activities(access)
    activities.sort(key=lambda a: a.get("start_date", ""))  # oldest -> newest

    track = {"type": "FeatureCollection", "features": []}
    latest = None
    kept_ids = []

    skipped = 0
    for a in activities:
        act_id = int(a["id"])

        # Quick proximity check using start coordinates (avoids stream fetch)
        start = a.get("start_latlng")
        if start and len(start) == 2 and not is_near_pct(start[0], start[1]):
            skipped += 1
            continue

        try:
            streams = get_stream(access, act_id)
        except RuntimeError as e:
            print(f"Skipping activity {act_id} ({a.get('name', '?')}): {e}")
            continue

        latlng = streams.get("latlng", {}).get("data", [])
        if not latlng or len(latlng) < 2:
            continue

        altitude = streams.get("altitude", {}).get("data", [])
        # altitude can be missing/empty -> no profile in that case
        has_alt = bool(altitude) and len(altitude) == len(latlng)

        # GeoJSON coords [lon, lat]
        coords = [[p[1], p[0]] for p in latlng]

        # Profil: cumulative distance (m) + altitude (m)
        dist_m = [0.0]
        elev_m = [float(altitude[0])] if has_alt else []
        total_up = 0.0

        if has_alt:
            prev_lat, prev_lon = latlng[0][0], latlng[0][1]
            prev_e = float(altitude[0])
            cum = 0.0

            for i in range(1, len(latlng)):
                lat, lon = latlng[i][0], latlng[i][1]
                d = haversine_m(prev_lat, prev_lon, lat, lon)
                cum += d
                dist_m.append(cum)

                e = float(altitude[i])
                elev_m.append(e)

                delta = e - prev_e
                if delta > 0:
                    total_up += delta

                prev_lat, prev_lon = lat, lon
                prev_e = e

            # downsample for file size
            dist_m_ds, elev_m_ds = downsample_series(dist_m, elev_m, PROFILE_MAX_POINTS)
        else:
            dist_m_ds, elev_m_ds = [], []
            total_up = float(a.get("total_elevation_gain", 0) or 0)

        feature = {
            "type": "Feature",
            "properties": {
                # i for alternating colours
                "strava_id": act_id,
                "name": a.get("name", ""),
                "start_date": a.get("start_date", ""),
                "distance_m": float(a.get("distance", 0) or 0),
                "moving_time_s": int(a.get("moving_time", 0) or 0),
                "type": a.get("type", ""),
                "elevation_gain_m": float(total_up),
                # Profile data (for popup chart)
                "profile_dist_m": dist_m_ds,  # x
                "profile_elev_m": elev_m_ds,  # y
            },
            "geometry": {"type": "LineString", "coordinates": coords},
        }

        track["features"].append(feature)
        kept_ids.append(act_id)

        # latest: last coordinate of the most recent activity with GPS
        last = latlng[-1]
        latest = {"lat": last[0], "lon": last[1], "ts": a.get("start_date", "")}

    # Re-index stable: sort by start_date and assign i
    track["features"].sort(key=lambda f: f.get("properties", {}).get("start_date", ""))
    for idx, f in enumerate(track["features"]):
        f.setdefault("properties", {})
        f["properties"]["i"] = idx

    save_json(TRACK_PATH, track)
    if latest:
        save_json(LATEST_PATH, latest)

    # Preserve refresh_token when updating state
    state = {}
    if os.path.exists(STATE_PATH):
        with open(STATE_PATH, "r", encoding="utf-8") as f:
            state = json.load(f)
    state["seen_ids"] = sorted(kept_ids)
    save_json(STATE_PATH, state)

    print(f"Wrote {len(track['features'])} PCT activities to {TRACK_PATH} "
          f"({skipped} non-PCT skipped).")
    if not latest:
        print("No GPS streams found (check Strava privacy/scope).")


if __name__ == "__main__":
    main()

