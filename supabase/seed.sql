-- USERS
insert into users (
  id,
  strava_athlete_id,
  display_name,
  slug,

  hike_start_date,
  lighterpack_url,
  strava_access_token,
  strava_refresh_token,
  strava_token_expires_at,
  created_at,
  updated_at
) values
(
  '11111111-1111-1111-1111-111111111111',
  90000001,
  'Alex "Switchback" Moreno',
  'switchback',

  '2025-04-10',
  'https://lighterpack.com/r/switchback-pct',
  'strava_access_token_1',
  'strava_refresh_token_1',
  now() + interval '6 hours',
  now(),
  now()
),
(
  '22222222-2222-2222-2222-222222222222',
  90000002,
  'Jamie "Granite" Lee',
  'granite',

  '2025-06-01',
  'https://lighterpack.com/r/granite-pct',
  'strava_access_token_2',
  'strava_refresh_token_2',
  now() + interval '4 hours',
  now(),
  now()
),
(
  '33333333-3333-3333-3333-333333333333',
  90000003,
  'Taylor "Snowline" Brooks',
  'snowline',

  '2025-08-15',
  'https://lighterpack.com/r/snowline-pct',
  'strava_access_token_3',
  'strava_refresh_token_3',
  now() + interval '2 hours',
  now(),
  now()
);

-- ACTIVITIES
insert into activities (
  id,
  user_id,
  strava_id,
  name,
  start_date,
  distance_m,
  moving_time_s,
  activity_type,
  elevation_gain_m,
  profile_dist_m,
  profile_elev_m,
  coordinates,
  created_at
) values
(
  'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
  '11111111-1111-1111-1111-111111111111',
  800000001,
  'PCT Day 1 - Campo to Lake Morena',
  '2025-04-15T06:15:00Z',
  32500,
  28800,
  'Hike',
  950,
  '[0,5000,10000,15000,20000,25000,30000,32500]'::jsonb,
  '[900,920,980,1100,1050,1150,1200,1180]'::jsonb,
  '{"type":"LineString","coordinates":[[-116.466,32.605],[-116.500,32.650],[-116.520,32.680]]}'::jsonb,
  now()
),
(
  'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
  '11111111-1111-1111-1111-111111111111',
  800000002,
  'PCT Day 2 - Morena to Mount Laguna',
  '2025-04-16T06:05:00Z',
  31000,
  27600,
  'Hike',
  1200,
  '[0,6000,12000,18000,24000,30000,31000]'::jsonb,
  '[1180,1250,1400,1500,1700,1800,1900]'::jsonb,
  '{"type":"LineString","coordinates":[[-116.520,32.680],[-116.560,32.720],[-116.600,32.760]]}'::jsonb,
  now()
),
(
  'bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
  '22222222-2222-2222-2222-222222222222',
  800000003,
  'PCT - Sierra Entry',
  '2025-06-10T07:10:00Z',
  28000,
  25200,
  'Hike',
  1400,
  '[0,7000,14000,21000,28000]'::jsonb,
  '[2500,2700,3100,3300,3600]'::jsonb,
  '{"type":"LineString","coordinates":[[-118.300,36.600],[-118.350,36.650],[-118.400,36.700]]}'::jsonb,
  now()
),
(
  'ccccccc1-cccc-cccc-cccc-ccccccccccc1',
  '33333333-3333-3333-3333-333333333333',
  800000004,
  'PCT - Goat Rocks Traverse',
  '2025-08-20T08:00:00Z',
  22000,
  19800,
  'Hike',
  1100,
  '[0,5000,10000,15000,20000,22000]'::jsonb,
  '[1200,1400,1600,1800,2000,2100]'::jsonb,
  '{"type":"LineString","coordinates":[[-121.500,46.650],[-121.550,46.700],[-121.600,46.750]]}'::jsonb,
  now()
);

-- SYNC STATE
insert into sync_state (
  user_id,
  last_sync_at,
  status
) values
(
  '11111111-1111-1111-1111-111111111111',
  now() - interval '1 hour',
  'idle'
),
(
  '22222222-2222-2222-2222-222222222222',
  now() - interval '10 minutes',
  'syncing'
),
(
  '33333333-3333-3333-3333-333333333333',
  null,
  'idle'
);
