-- Lightweight activity metadata (no coordinates/elevation profiles)
create table activity_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  strava_id bigint not null,
  name text,
  start_date timestamptz not null,
  distance_m double precision not null default 0,
  moving_time_s integer not null default 0,
  elevation_gain_m double precision not null default 0,
  activity_type text,
  unique(user_id, strava_id)
);

-- Latest hiker position (one row per user)
create table latest_position (
  user_id uuid primary key references users(id) on delete cascade,
  lat double precision not null,
  lon double precision not null,
  activity_date timestamptz,
  updated_at timestamptz default now()
);

create index idx_activity_stats_user on activity_stats(user_id);
create index idx_activity_stats_start on activity_stats(user_id, start_date);
