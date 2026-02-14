create table trail_updates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  title text not null,
  body text not null,
  lat double precision,
  lon double precision,
  created_at timestamptz default now()
);

create index idx_trail_updates_user on trail_updates(user_id);
create index idx_trail_updates_date on trail_updates(user_id, created_at desc);
