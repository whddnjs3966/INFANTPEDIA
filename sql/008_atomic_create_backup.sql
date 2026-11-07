-- Staging only. Requires 004, 005, 007. Does not reopen legacy REST access.
begin;
create table public.backup_creation_requests (
  user_id uuid not null references auth.users(id) on delete cascade,
  request_id uuid not null,
  baby_id uuid not null unique references public.shared_babies(id) on delete restrict deferrable initially deferred,
  initial_payload jsonb not null,
  created_at timestamptz not null default now(),
  primary key(user_id, request_id)
);
alter table public.backup_creation_requests enable row level security;
revoke all on public.backup_creation_requests from public, anon, authenticated;
grant all on public.backup_creation_requests to service_role;

create function public.create_backup_snapshot(p_baby_id uuid, p_request_id uuid, p_payload jsonb, p_expected_user_id uuid default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  creation public.backup_creation_requests;
  inserted integer;
begin
  if actor is null then raise exception 'BACKUP_ACCESS_DENIED' using errcode='42501'; end if;
  if p_expected_user_id is not null and p_expected_user_id <> actor then
    raise exception 'BACKUP_ACCOUNT_CHANGED' using errcode='42501';
  end if;
  if p_baby_id is null or p_request_id is null then raise exception 'INVALID_BACKUP_REQUEST' using errcode='22023'; end if;
  perform public.validate_backup_payload(p_baby_id,p_payload);
  -- The request key serializes identical concurrent retries. No client-supplied owner.
  insert into public.backup_creation_requests(user_id,request_id,baby_id,initial_payload)
    values(actor,p_request_id,p_baby_id,p_payload)
    on conflict(user_id,request_id) do nothing;
  get diagnostics inserted = row_count;
  select * into creation from public.backup_creation_requests
    where user_id=actor and request_id=p_request_id for update;
  if creation.baby_id is distinct from p_baby_id or creation.initial_payload is distinct from p_payload then
    raise exception 'BACKUP_REQUEST_REUSED' using errcode='22023';
  end if;
  if inserted = 0 then
    if not exists(select 1 from public.backup_memberships where baby_id=p_baby_id and user_id=actor and role='owner') then
      raise exception 'BACKUP_ACCESS_DENIED' using errcode='42501';
    end if;
    if not exists(select 1 from public.backup_snapshots where baby_id=p_baby_id) then
      raise exception 'BACKUP_NOT_INITIALIZED' using errcode='P0002';
    end if;
  else
    insert into public.shared_babies(id,invite_code,name,birthdate,gender,creator_id)
      values(p_baby_id,'PRIVATE-'||pg_catalog.gen_random_uuid()::text,
        p_payload->'baby'->>'name',(p_payload->'baby'->>'birthdate')::date,p_payload->'baby'->>'gender',actor);
    insert into public.backup_memberships(baby_id,user_id,role) values(p_baby_id,actor,'owner');
    insert into public.backup_snapshots(baby_id,revision,payload,updated_by)
      values(p_baby_id,0,p_payload,actor);
  end if;
  -- Receipt only: a retry may follow later edits. Read and accept the current baseline separately.
  return jsonb_build_object('baby_id',p_baby_id,'request_id',p_request_id);
end;
$$;
revoke all on function public.create_backup_snapshot(uuid,uuid,jsonb,uuid) from public, anon, authenticated;
grant execute on function public.create_backup_snapshot(uuid,uuid,jsonb,uuid) to authenticated;
commit;
