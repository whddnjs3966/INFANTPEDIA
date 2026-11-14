-- Derive the influenza record season from the date in the existing backup payload.
-- Apply after 007-011. This changes validation only and leaves existing data and grants intact.
begin;

create or replace function public.validate_backup_payload(p_baby_id uuid, p_payload jsonb)
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
  if exists (
    select 1 from jsonb_array_elements(p_payload->'vaccinations') v
    group by v->>'vaccine_id', (v->>'dose_number')::numeric,
      case when v->>'vaccine_id' = 'flu' then
        extract(year from (v->>'completed_date')::date)::integer -
        case when extract(month from (v->>'completed_date')::date) < 9 then 1 else 0 end
      end
    having count(*) > 1
  ) then
    raise exception 'DUPLICATE_VACCINATION' using errcode = '22023';
  end if;
end;
$$;
commit;
