-- Staging migration only. Apply after auditing ownership and planning legacy cutover.
-- Existing creator_id/device headers are NOT used to auto-grant membership.
begin;

create table public.backup_memberships (
  baby_id uuid not null references public.shared_babies(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'editor', 'reader')),
  primary key (baby_id, user_id)
);
create table public.backup_snapshots (
  baby_id uuid primary key references public.shared_babies(id) on delete restrict,
  revision integer not null default 0 check (revision >= 0),
  payload jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id),
  last_request_id uuid,
  last_request_user uuid references auth.users(id),
  last_expected_revision integer
);
alter table public.backup_memberships enable row level security;
alter table public.backup_snapshots enable row level security;
revoke all on public.backup_memberships, public.backup_snapshots from public, anon, authenticated;
grant all on public.backup_memberships, public.backup_snapshots to service_role;

create function public.validate_backup_payload(p_baby_id uuid, p_payload jsonb)
returns void language plpgsql set search_path = '' as $$
declare
  item jsonb;
  field text;
  birth date;
  recorded date;
  today date := (current_timestamp at time zone 'Asia/Seoul')::date;
begin
  if p_baby_id is null or p_payload is null or jsonb_typeof(p_payload) <> 'object'
    or pg_column_size(p_payload) > 2097152
    or jsonb_typeof(p_payload->'baby') is distinct from 'object'
    or p_payload->'baby'->>'id' is distinct from p_baby_id::text
    or jsonb_typeof(p_payload->'baby'->'name') is distinct from 'string'
    or length(btrim(p_payload->'baby'->>'name')) not between 1 and 100
    or (p_payload->'baby'->>'gender') is null
    or (p_payload->'baby'->>'gender') not in ('male','female')
    or coalesce(p_payload->'baby'->>'birthdate','') !~ '^\d{4}-\d{2}-\d{2}$'
    or jsonb_typeof(p_payload->'measurements') is distinct from 'array'
    or jsonb_typeof(p_payload->'vaccinations') is distinct from 'array' then
    raise exception 'INVALID_BACKUP_PAYLOAD' using errcode = '22023';
  end if;
  birth := (p_payload->'baby'->>'birthdate')::date;
  if birth > today or jsonb_array_length(p_payload->'measurements') > 10000 or jsonb_array_length(p_payload->'vaccinations') > 1000 then
    raise exception 'INVALID_BACKUP_PAYLOAD' using errcode = '22023';
  end if;
  for item in select value from jsonb_array_elements(p_payload->'measurements') loop
    if jsonb_typeof(item) <> 'object' or item->>'baby_id' is distinct from p_baby_id::text
      or jsonb_typeof(item->'id') is distinct from 'string' or length(btrim(item->>'id')) not between 1 and 200
      or coalesce(item->>'date','') !~ '^\d{4}-\d{2}-\d{2}$'
      or jsonb_typeof(item->'month') is distinct from 'number'
      or (item->>'month')::numeric not between 0 and 12 or trunc((item->>'month')::numeric) <> (item->>'month')::numeric
      or (coalesce(item->>'height', item->>'weight', item->>'head_circumference') is null) then
      raise exception 'INVALID_MEASUREMENT' using errcode = '22023';
    end if;
    recorded := (item->>'date')::date;
    if recorded < birth or recorded > today then raise exception 'INVALID_MEASUREMENT_DATE' using errcode = '22023'; end if;
    foreach field in array array['height','weight','head_circumference'] loop
      if item->>field is not null then
        if jsonb_typeof(item->field) <> 'number' or (item->>field)::numeric <= 0 then
          raise exception 'INVALID_MEASUREMENT_VALUE' using errcode = '22023';
        end if;
      end if;
    end loop;
  end loop;
  if exists (select 1 from jsonb_array_elements(p_payload->'measurements') m group by m->>'id' having count(*) > 1) then
    raise exception 'DUPLICATE_MEASUREMENT' using errcode = '22023';
  end if;
  for item in select value from jsonb_array_elements(p_payload->'vaccinations') loop
    if jsonb_typeof(item) <> 'object' or item->>'baby_id' is distinct from p_baby_id::text
      or jsonb_typeof(item->'vaccine_id') is distinct from 'string' or length(btrim(item->>'vaccine_id')) not between 1 and 100
      or jsonb_typeof(item->'dose_number') is distinct from 'number' or (item->>'dose_number')::numeric < 1
      or trunc((item->>'dose_number')::numeric) <> (item->>'dose_number')::numeric
      or coalesce(item->>'completed_date','') !~ '^\d{4}-\d{2}-\d{2}$' then
      raise exception 'INVALID_VACCINATION' using errcode = '22023';
    end if;
    recorded := (item->>'completed_date')::date;
    if recorded < birth or recorded > today then raise exception 'INVALID_VACCINATION_DATE' using errcode = '22023'; end if;
  end loop;
  if exists (select 1 from jsonb_array_elements(p_payload->'vaccinations') v group by v->>'vaccine_id', (v->>'dose_number')::numeric having count(*) > 1) then
    raise exception 'DUPLICATE_VACCINATION' using errcode = '22023';
  end if;
end;
$$;
revoke all on function public.validate_backup_payload(uuid,jsonb) from public, anon, authenticated;

create function public.read_backup_snapshot(p_baby_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare snapshot public.backup_snapshots;
begin
  if auth.uid() is null or not exists (select 1 from public.backup_memberships m where m.baby_id=p_baby_id and m.user_id=auth.uid()) then
    raise exception 'BACKUP_ACCESS_DENIED' using errcode = '42501';
  end if;
  select * into snapshot from public.backup_snapshots where baby_id=p_baby_id;
  if not found then raise exception 'BACKUP_NOT_INITIALIZED' using errcode = 'P0002'; end if;
  return jsonb_build_object('baby_id',snapshot.baby_id,'revision',snapshot.revision,'payload',snapshot.payload);
end;
$$;

create function public.write_backup_snapshot(p_baby_id uuid, p_expected_revision integer, p_request_id uuid, p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  member_role text;
  snapshot public.backup_snapshots;
begin
  if auth.uid() is null then raise exception 'BACKUP_ACCESS_DENIED' using errcode='42501'; end if;
  select role into member_role from public.backup_memberships where baby_id=p_baby_id and user_id=auth.uid() for share;
  if not found or member_role not in ('owner','editor') then raise exception 'BACKUP_ACCESS_DENIED' using errcode='42501'; end if;
  if p_request_id is null or p_expected_revision is null or p_expected_revision < 0 then raise exception 'INVALID_BACKUP_REQUEST' using errcode='22023'; end if;
  perform public.validate_backup_payload(p_baby_id,p_payload);
  select * into snapshot from public.backup_snapshots where baby_id=p_baby_id for update;
  if not found then raise exception 'BACKUP_NOT_INITIALIZED' using errcode='P0002'; end if;
  if snapshot.last_request_id = p_request_id then
    if snapshot.last_request_user is distinct from auth.uid() or snapshot.last_expected_revision is distinct from p_expected_revision or snapshot.payload is distinct from p_payload then
      raise exception 'BACKUP_REQUEST_REUSED' using errcode='22023';
    end if;
    return jsonb_build_object('baby_id',snapshot.baby_id,'revision',snapshot.revision,'request_id',p_request_id);
  end if;
  if snapshot.revision <> p_expected_revision then raise exception 'BACKUP_CONFLICT' using errcode='40001'; end if;
  -- One versioned row contains the whole profile/measurement/vaccination snapshot.
  -- Any validation/constraint/trigger failure rolls back the entire statement.
  update public.backup_snapshots set payload=p_payload, revision=revision+1,
    updated_at=clock_timestamp(),updated_by=auth.uid(),last_request_id=p_request_id,
    last_request_user=auth.uid(),last_expected_revision=p_expected_revision
    where baby_id=p_baby_id returning * into snapshot;
  return jsonb_build_object('baby_id',snapshot.baby_id,'revision',snapshot.revision,'request_id',p_request_id);
end;
$$;
revoke all on function public.read_backup_snapshot(uuid) from public, anon, authenticated;
revoke all on function public.write_backup_snapshot(uuid,integer,uuid,jsonb) from public, anon, authenticated;
grant execute on function public.read_backup_snapshot(uuid) to authenticated;
grant execute on function public.write_backup_snapshot(uuid,integer,uuid,jsonb) to authenticated;
commit;
