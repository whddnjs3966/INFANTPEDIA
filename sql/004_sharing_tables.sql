-- Shared baby profiles (cloud-synced)
create table shared_babies (
  id uuid primary key default gen_random_uuid(),
  invite_code text unique not null,
  name text not null,
  birthdate date not null,
  gender text not null default 'male',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Devices linked to a shared baby
create table shared_devices (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid references shared_babies(id) on delete cascade,
  device_id text not null,
  role text default 'parent',
  joined_at timestamptz default now(),
  unique(baby_id, device_id)
);

-- Shared measurements
create table shared_measurements (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid references shared_babies(id) on delete cascade,
  month integer not null,
  date date not null,
  height numeric,
  weight numeric,
  head_circumference numeric,
  created_at timestamptz default now()
);

-- Shared vaccinations
create table shared_vaccinations (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid references shared_babies(id) on delete cascade,
  vaccine_id text not null,
  dose_number integer not null,
  completed_date date,
  created_at timestamptz default now(),
  unique(baby_id, vaccine_id, dose_number)
);

-- Shared daily logs
create table shared_daily_logs (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid references shared_babies(id) on delete cascade,
  date date not null,
  time text not null,
  end_time text,
  category text not null,
  amount numeric,
  duration integer,
  side text,
  menu text,
  color text,
  consistency text,
  temperature numeric,
  note text,
  created_at timestamptz default now()
);

-- Enable RLS on all tables
alter table shared_babies enable row level security;
alter table shared_devices enable row level security;
alter table shared_measurements enable row level security;
alter table shared_vaccinations enable row level security;
alter table shared_daily_logs enable row level security;

-- Allow anonymous access (no auth, device-based trust)
create policy "allow_all_shared_babies" on shared_babies for all using (true) with check (true);
create policy "allow_all_shared_devices" on shared_devices for all using (true) with check (true);
create policy "allow_all_shared_measurements" on shared_measurements for all using (true) with check (true);
create policy "allow_all_shared_vaccinations" on shared_vaccinations for all using (true) with check (true);
create policy "allow_all_shared_daily_logs" on shared_daily_logs for all using (true) with check (true);

-- Indexes
create index idx_shared_babies_invite_code on shared_babies(invite_code);
create index idx_shared_devices_device_id on shared_devices(device_id);
create index idx_shared_measurements_baby_id on shared_measurements(baby_id);
create index idx_shared_vaccinations_baby_id on shared_vaccinations(baby_id);
create index idx_shared_daily_logs_baby_id on shared_daily_logs(baby_id);
