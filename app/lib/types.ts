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

export interface Activity {
  id: string;
  user_id: string;
  strava_id: number;
  name: string | null;
  start_date: string;
  distance_m: number;
  moving_time_s: number;
  activity_type: string | null;
  elevation_gain_m: number;
  profile_dist_m: number[] | null;
  profile_elev_m: number[] | null;
  coordinates: [number, number][];
  created_at: string;
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

export interface GeoJSONFeature {
  type: "Feature";
  properties: {
    i: number;
    strava_id: number;
    name: string;
    start_date: string;
    distance_m: number;
    moving_time_s: number;
    type: string;
    elevation_gain_m: number;
    profile_dist_m: number[];
    profile_elev_m: number[];
  };
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
}

export interface GeoJSONFeatureCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

export interface SessionPayload {
  userId: string;
  exp: number;
}
