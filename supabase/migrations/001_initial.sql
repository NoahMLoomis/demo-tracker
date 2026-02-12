-- Users (one per Strava athlete)
create table users (
  id uuid primary key default gen_random_uuid(),
  strava_athlete_id bigint unique not null,
  display_name text not null,
  slug text unique not null,
  profile_image_url text,
  flickr_user_id text,
  flickr_photoset_id text,
  lighterpack_url text,
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
  profile_dist_m jsonb,
  profile_elev_m jsonb,
  coordinates jsonb not null,
  created_at timestamptz default now(),
  unique(user_id, strava_id)
);

-- Sync state per user
create table sync_state (
  user_id uuid primary key references users(id) on delete cascade,
  last_sync_at timestamptz,
  status text default 'idle'
);

-- Indexes
create index idx_activities_user on activities(user_id);
create index idx_activities_start on activities(user_id, start_date);
create index idx_users_slug on users(slug);
