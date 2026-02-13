export interface User {
  id: string;
  strava_athlete_id: number;
  display_name: string;
  slug: string;
  hike_start_date: string;
  hike_end_date: string | null;
  lighterpack_url: string | null;
  strava_access_token: string;
  strava_refresh_token: string;
  strava_token_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SyncState {
  user_id: string;
  last_sync_at: string | null;
  status: "idle" | "syncing" | "error";
}

export interface LatestPosition {
  lat: number;
  lon: number;
  ts: string;
}

export interface TrailStats {
  totalDistanceM: number;
  totalMovingTimeS: number;
  totalElevationGainM: number;
  activityCount: number;
  firstDate: string | null;
  lastDate: string | null;
  activities: {
    start_date: string;
    distance_m: number;
    moving_time_s: number;
    elevation_gain_m: number;
  }[];
}

export interface SessionPayload {
  userId: string;
  exp: number;
}
