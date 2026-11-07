-- Staging only, after 007..010. No legacy client privileges are reopened.
begin;
create table public.backup_account_deletions(user_id uuid primary key references auth.users(id) on delete cascade,request_id uuid not null unique,manifest jsonb not null,status text not null check(status in ('prepared','purged')),created_at timestamptz not null default now());
create table public.backup_deletions(baby_id uuid primary key,owner_id uuid not null references auth.users(id) on delete cascade,request_id uuid not null,deleted_at timestamptz not null default now());
create table public.backup_invitations(id uuid primary key,baby_id uuid not null references public.shared_babies(id) on delete restrict,created_by uuid not null references auth.users(id) on delete cascade,target_user uuid not null references auth.users(id) on delete cascade,request_id uuid not null,token_hash text not null unique,role text not null check(role in ('editor','reader')),expires_at timestamptz not null,accepted_at timestamptz,revoked_at timestamptz,unique(created_by,request_id));
alter table public.backup_account_deletions enable row level security;
alter table public.backup_deletions enable row level security;
alter table public.backup_invitations enable row level security;
revoke all on public.backup_account_deletions,public.backup_deletions,public.backup_invitations from public,anon,authenticated;
grant all on public.backup_account_deletions,public.backup_deletions,public.backup_invitations to service_role;

create function public.backup_actor(p_expected uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();
begin
 if actor is null or p_expected is null or actor<>p_expected then raise exception 'BACKUP_ACCOUNT_CHANGED' using errcode='42501'; end if;
 perform 1 from auth.users where id=actor for key share;
 if not found or exists(select 1 from public.backup_account_deletions where user_id=actor) then raise exception 'ACCOUNT_DELETION_PENDING' using errcode='42501'; end if;
 return actor;
end;$$;
create function public.require_backup_access(p_baby uuid,p_actor uuid,p_owner boolean default false,p_write boolean default false) returns text language plpgsql security definer set search_path='' as $$
declare member_role text;
begin
 select role into member_role from public.backup_memberships where baby_id=p_baby and user_id=p_actor;
 if member_role is null then raise exception 'BACKUP_ACCESS_DENIED' using errcode='42501'; end if;
 -- All governance and writing paths lock snapshot first, then recheck membership.
 perform 1 from public.backup_snapshots where baby_id=p_baby for update;
 if not found then raise exception 'BACKUP_NOT_INITIALIZED' using errcode='P0002'; end if;
 select role into member_role from public.backup_memberships where baby_id=p_baby and user_id=p_actor;
 if member_role is null or (p_owner and member_role<>'owner') or (p_write and member_role not in ('owner','editor')) or exists(select 1 from public.backup_memberships m join public.backup_account_deletions d on d.user_id=m.user_id where m.baby_id=p_baby and m.role='owner') then raise exception 'BACKUP_ACCESS_DENIED' using errcode='42501'; end if;
 return member_role;
end;$$;
create function public.backup_revision(p_baby uuid,p_expected integer) returns void language plpgsql security definer set search_path='' as $$
begin
 if p_expected is null or not exists(select 1 from public.backup_snapshots where baby_id=p_baby and revision=p_expected) then raise exception 'BACKUP_CONFLICT' using errcode='40001'; end if;
end;$$;

create function public.create_backup_invitation(p_expected_user_id uuid,p_baby_id uuid,p_expected_revision integer,p_target_email text,p_role text,p_request_id uuid,p_token text) returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid;target uuid;item public.backup_invitations;hashed text;
begin
 actor:=public.backup_actor(p_expected_user_id);perform public.require_backup_access(p_baby_id,actor,true);
 if p_role is null or p_role not in ('editor','reader') or p_request_id is null or p_token is null or p_token !~ '^[0-9a-f]{64}$' then raise exception 'INVALID_INVITATION' using errcode='22023'; end if;
 select id into target from auth.users where lower(email)=lower(btrim(p_target_email));
 if target is null or target=actor or exists(select 1 from public.backup_account_deletions where user_id=target) then raise exception 'INVALID_RECIPIENT' using errcode='22023'; end if;
 hashed:=pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(p_token,'UTF8')),'hex');
 select * into item from public.backup_invitations where created_by=actor and request_id=p_request_id;
 if found then
  if item.baby_id<>p_baby_id or item.target_user<>target or item.role<>p_role or item.token_hash<>hashed or item.revoked_at is not null or item.expires_at<=now() then raise exception 'INVITATION_REQUEST_REUSED' using errcode='22023'; end if;
 else
  perform public.backup_revision(p_baby_id,p_expected_revision);
  if exists(select 1 from public.backup_memberships where baby_id=p_baby_id and user_id=target) then raise exception 'ALREADY_MEMBER' using errcode='22023'; end if;
  insert into public.backup_invitations values(gen_random_uuid(),p_baby_id,actor,target,p_request_id,hashed,p_role,now()+interval '24 hours',null,null) returning * into item;
 end if;
 return jsonb_build_object('id',item.id,'baby_id',item.baby_id,'role',item.role,'expires_at',item.expires_at,'token',p_token);
end;$$;
create function public.accept_backup_invitation(p_expected_user_id uuid,p_token text) returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid;item public.backup_invitations;member_role text;
begin
 actor:=public.backup_actor(p_expected_user_id);
 if p_token is null or p_token !~ '^[0-9a-f]{64}$' then raise exception 'INVALID_INVITATION' using errcode='22023'; end if;
 select * into item from public.backup_invitations where token_hash=encode(sha256(convert_to(p_token,'UTF8')),'hex');
 if not found or item.target_user<>actor then raise exception 'BACKUP_ACCESS_DENIED' using errcode='42501'; end if;
 perform 1 from public.backup_snapshots where baby_id=item.baby_id for update;
 select * into item from public.backup_invitations where id=item.id for update;
 if item.revoked_at is not null or item.expires_at<=now() or exists(select 1 from public.backup_memberships m join public.backup_account_deletions d on d.user_id=m.user_id where m.baby_id=item.baby_id and m.role='owner') then raise exception 'INVITATION_UNAVAILABLE' using errcode='42501'; end if;
 select role into member_role from public.backup_memberships where baby_id=item.baby_id and user_id=actor;
 if item.accepted_at is not null then
  if member_role is null then raise exception 'BACKUP_ACCESS_DENIED' using errcode='42501'; end if;
 else
  if member_role is not null then raise exception 'ALREADY_MEMBER' using errcode='22023'; end if;
  insert into public.backup_memberships values(item.baby_id,actor,item.role);
  update public.backup_invitations set accepted_at=now() where id=item.id;
  member_role:=item.role;
 end if;
 return jsonb_build_object('baby_id',item.baby_id,'role',member_role);
end;$$;
create function public.backup_family(p_expected_user_id uuid,p_baby_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid;member_role text;members jsonb;invites jsonb;rev integer;
begin
 actor:=public.backup_actor(p_expected_user_id);member_role:=public.require_backup_access(p_baby_id,actor);
 select revision into rev from public.backup_snapshots where baby_id=p_baby_id;
 select coalesce(jsonb_agg(jsonb_build_object('user_id',m.user_id,'role',m.role,'label',case when member_role='owner' then coalesce(u.email,'가족') else left(split_part(coalesce(u.email,'family@account'),'@',1),2)||'***' end) order by m.user_id),'[]') into members from public.backup_memberships m join auth.users u on u.id=m.user_id where m.baby_id=p_baby_id;
 if member_role='owner' then
  select coalesce(jsonb_agg(jsonb_build_object('id',i.id,'recipient',coalesce(u.email,'가족'),'role',i.role,'expires_at',i.expires_at,'accepted',i.accepted_at is not null,'revoked',i.revoked_at is not null) order by i.expires_at desc),'[]') into invites from public.backup_invitations i join auth.users u on u.id=i.target_user where i.baby_id=p_baby_id;
 else invites:='[]'; end if;
 return jsonb_build_object('baby_id',p_baby_id,'revision',rev,'role',member_role,'members',members,'invitations',invites);
end;$$;
create function public.revoke_backup_invitation(p_expected_user_id uuid,p_baby_id uuid,p_invitation_id uuid) returns void language plpgsql security definer set search_path='' as $$
declare actor uuid;
begin actor:=public.backup_actor(p_expected_user_id);perform public.require_backup_access(p_baby_id,actor,true);update public.backup_invitations set revoked_at=now() where id=p_invitation_id and baby_id=p_baby_id;end;$$;
create function public.change_backup_member(p_expected_user_id uuid,p_baby_id uuid,p_target_user uuid,p_role text) returns void language plpgsql security definer set search_path='' as $$
declare actor uuid;old_role text;
begin
 actor:=public.backup_actor(p_expected_user_id);perform public.require_backup_access(p_baby_id,actor,true);
 select role into old_role from public.backup_memberships where baby_id=p_baby_id and user_id=p_target_user;
 if old_role is null or old_role='owner' or p_target_user=actor or (p_role is not null and p_role not in ('reader','editor')) then raise exception 'INVALID_MEMBER_CHANGE' using errcode='22023'; end if;
 update public.backup_invitations set revoked_at=now() where baby_id=p_baby_id and target_user=p_target_user;
 if p_role is null then delete from public.backup_memberships where baby_id=p_baby_id and user_id=p_target_user;
 else update public.backup_memberships set role=p_role where baby_id=p_baby_id and user_id=p_target_user;end if;
end;$$;
create function public.leave_backup_family(p_expected_user_id uuid,p_baby_id uuid) returns void language plpgsql security definer set search_path='' as $$
declare actor uuid;member_role text;
begin actor:=public.backup_actor(p_expected_user_id);member_role:=public.require_backup_access(p_baby_id,actor);
 if member_role='owner' then raise exception 'OWNER_CANNOT_LEAVE' using errcode='22023'; end if;
 update public.backup_invitations set revoked_at=now() where baby_id=p_baby_id and target_user=actor;
 delete from public.backup_memberships where baby_id=p_baby_id and user_id=actor;
end;$$;

create function public.purge_backup_baby_internal(p_baby uuid,p_owner uuid,p_request uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 insert into public.backup_deletions values(p_baby,p_owner,p_request,now()) on conflict(baby_id) do nothing;
 delete from public.backup_invitations where baby_id=p_baby;
 delete from public.backup_creation_requests where baby_id=p_baby;
 delete from public.backup_snapshots where baby_id=p_baby;
 delete from public.backup_memberships where baby_id=p_baby;
 delete from public.shared_devices where baby_id=p_baby;
 delete from public.shared_measurements where baby_id=p_baby;
 delete from public.shared_vaccinations where baby_id=p_baby;
 delete from public.shared_daily_logs where baby_id=p_baby;
 delete from public.shared_babies where id=p_baby;
end;$$;
create function public.delete_backup_baby(p_expected_user_id uuid,p_baby_id uuid,p_expected_revision integer,p_request_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid;
begin
 actor:=public.backup_actor(p_expected_user_id);
 if p_request_id is null then raise exception 'INVALID_REQUEST' using errcode='22023'; end if;
 if exists(select 1 from public.backup_deletions where baby_id=p_baby_id and owner_id=actor) then return jsonb_build_object('baby_id',p_baby_id,'deleted',true,'request_id',p_request_id);end if;
 perform public.require_backup_access(p_baby_id,actor,true);perform public.backup_revision(p_baby_id,p_expected_revision);
 perform public.purge_backup_baby_internal(p_baby_id,actor,p_request_id);
 return jsonb_build_object('baby_id',p_baby_id,'deleted',true,'request_id',p_request_id);
end;$$;

create function public.account_backup_manifest(p_user uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare owned jsonb;shared jsonb;legacy integer;
begin
 select coalesce(jsonb_agg(jsonb_build_object('baby_id',s.baby_id,'name',s.payload->'baby'->>'name','revision',s.revision,'members',(select jsonb_agg(jsonb_build_object('user_id',x.user_id,'role',x.role) order by x.user_id) from public.backup_memberships x where x.baby_id=s.baby_id)) order by s.baby_id),'[]') into owned from public.backup_snapshots s join public.backup_memberships m on m.baby_id=s.baby_id where m.user_id=p_user and m.role='owner';
 select coalesce(jsonb_agg(jsonb_build_object('baby_id',s.baby_id,'name',s.payload->'baby'->>'name','role',m.role) order by s.baby_id),'[]') into shared from public.backup_snapshots s join public.backup_memberships m on m.baby_id=s.baby_id where m.user_id=p_user and m.role<>'owner';
 select count(*) into legacy from public.shared_babies b where b.creator_id=p_user and not exists(select 1 from public.backup_memberships m join public.backup_snapshots s on s.baby_id=m.baby_id where m.baby_id=b.id and m.role='owner');
 return jsonb_build_object('owned',owned,'shared',shared,'unverified_legacy',legacy);
end;$$;
create function public.preview_account_backup_deletion(p_expected_user_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();job public.backup_account_deletions;
begin
 if actor is null or actor<>p_expected_user_id then raise exception 'BACKUP_ACCESS_DENIED' using errcode='42501';end if;
 select * into job from public.backup_account_deletions where user_id=actor;
 if found then return jsonb_build_object('manifest',job.manifest,'request_id',job.request_id,'status',job.status);end if;
 perform public.backup_actor(p_expected_user_id);
 return jsonb_build_object('manifest',public.account_backup_manifest(actor),'status','preview');
end;$$;
create function public.start_account_backup_deletion(p_expected_user_id uuid,p_request_id uuid,p_manifest jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();job public.backup_account_deletions;actual jsonb;
begin
 if actor is null or p_expected_user_id is null or actor<>p_expected_user_id or p_request_id is null then raise exception 'BACKUP_ACCESS_DENIED' using errcode='42501';end if;
 perform 1 from auth.users where id=actor for update;
 if not found then raise exception 'BACKUP_ACCESS_DENIED' using errcode='42501';end if;
 select * into job from public.backup_account_deletions where user_id=actor;
 if found then
  if job.request_id<>p_request_id or job.manifest is distinct from p_manifest then raise exception 'DELETION_REQUEST_REUSED' using errcode='22023';end if;
  return jsonb_build_object('request_id',job.request_id,'status',job.status);
 end if;
 perform 1 from public.backup_snapshots where baby_id in(select baby_id from public.backup_memberships where user_id=actor and role='owner') order by baby_id for update;
 actual:=public.account_backup_manifest(actor);
 if actual is distinct from p_manifest then raise exception 'DELETION_PREVIEW_CHANGED' using errcode='40001';end if;
 if (actual->>'unverified_legacy')::integer<>0 then raise exception 'LEGACY_OWNERSHIP_REVIEW_REQUIRED' using errcode='22023';end if;
 insert into public.backup_account_deletions values(actor,p_request_id,actual,'prepared',now());
 return jsonb_build_object('request_id',p_request_id,'status','prepared');
end;$$;
create function public.purge_account_backup_data(p_user_id uuid,p_request_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare job public.backup_account_deletions;item jsonb;
begin
 select * into job from public.backup_account_deletions where user_id=p_user_id for update;
 if not found or job.request_id<>p_request_id then raise exception 'NO_CONFIRMED_DELETION' using errcode='42501';end if;
 if (public.account_backup_manifest(p_user_id)->>'unverified_legacy')::integer<>0 then raise exception 'LEGACY_OWNERSHIP_REVIEW_REQUIRED' using errcode='22023';end if;
 for item in select value from jsonb_array_elements(job.manifest->'owned') loop
  perform 1 from public.backup_snapshots where baby_id=(item->>'baby_id')::uuid for update;
  perform public.purge_backup_baby_internal((item->>'baby_id')::uuid,p_user_id,p_request_id);
 end loop;
 update public.backup_snapshots set updated_by=null where updated_by=p_user_id;
 update public.backup_snapshots set last_request_user=null,last_request_id=null,last_expected_revision=null where last_request_user=p_user_id;
 delete from public.backup_invitations where target_user=p_user_id or created_by=p_user_id;
 delete from public.backup_memberships where user_id=p_user_id;
 delete from public.backup_creation_requests where user_id=p_user_id;
 update public.shared_babies set creator_id=null,creator_email=null where creator_id=p_user_id;
 update public.backup_account_deletions set status='purged' where user_id=p_user_id;
 return jsonb_build_object('request_id',p_request_id,'status','purged');
end;$$;

create or replace function public.create_backup_snapshot(p_baby_id uuid, p_request_id uuid, p_payload jsonb, p_expected_user_id uuid default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  creation public.backup_creation_requests;
  inserted integer;
begin
  perform public.backup_actor(coalesce(p_expected_user_id,auth.uid()));
  if exists(select 1 from public.backup_deletions where baby_id=p_baby_id) then raise exception 'BABY_WAS_DELETED' using errcode='42501';end if;
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
create or replace function public.write_backup_snapshot(p_baby_id uuid, p_expected_revision integer, p_request_id uuid, p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  member_role text;
  snapshot public.backup_snapshots;
begin
  perform public.backup_actor(auth.uid());
  perform public.require_backup_access(p_baby_id,auth.uid(),false,true);
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
create or replace function public.read_backup_snapshot(p_baby_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare snapshot public.backup_snapshots;
begin
  perform public.backup_actor(auth.uid());
  perform public.require_backup_access(p_baby_id,auth.uid());
  if auth.uid() is null or not exists (select 1 from public.backup_memberships m where m.baby_id=p_baby_id and m.user_id=auth.uid()) then
    raise exception 'BACKUP_ACCESS_DENIED' using errcode = '42501';
  end if;
  select * into snapshot from public.backup_snapshots where baby_id=p_baby_id;
  if not found then raise exception 'BACKUP_NOT_INITIALIZED' using errcode = 'P0002'; end if;
  return jsonb_build_object('baby_id',snapshot.baby_id,'revision',snapshot.revision,'payload',snapshot.payload);
end;
$$;
create or replace function public.list_account_backups(p_expected_user_id uuid, p_after uuid default null, p_limit integer default 20)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare items jsonb; cursor uuid;
begin
  perform public.backup_actor(p_expected_user_id);
  if auth.uid() is null or p_expected_user_id is null or auth.uid() <> p_expected_user_id then
    raise exception 'BACKUP_ACCESS_DENIED' using errcode='42501';
  end if;
  if p_limit is null or p_limit < 1 or p_limit > 50 then
    raise exception 'INVALID_PAGE_SIZE' using errcode='22023';
  end if;
  select coalesce(jsonb_agg(jsonb_build_object(
    'baby_id',s.baby_id,'name',s.payload->'baby'->>'name',
    'birthdate',s.payload->'baby'->>'birthdate','gender',s.payload->'baby'->>'gender',
    'revision',s.revision,'role',s.role) order by s.baby_id),'[]'::jsonb)
  into items from (
    select b.baby_id,b.payload,b.revision,m.role
    from public.backup_snapshots b join public.backup_memberships m on m.baby_id=b.baby_id
    where m.user_id=auth.uid() and not exists(select 1 from public.backup_memberships owner_member join public.backup_account_deletions d on d.user_id=owner_member.user_id where owner_member.baby_id=b.baby_id and owner_member.role='owner') and (p_after is null or b.baby_id > p_after)
    order by b.baby_id limit p_limit+1
  ) s;
  if jsonb_array_length(items) > p_limit then
    items := items - p_limit;
    cursor := (items->(p_limit-1)->>'baby_id')::uuid;
  end if;
  return jsonb_build_object('items',items,'next_cursor',cursor);
end;
$$;
do $$declare f record;begin for f in select p.oid::regprocedure as signature,p.proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname=any(array['backup_actor','require_backup_access','backup_revision','purge_backup_baby_internal','account_backup_manifest','create_backup_invitation','accept_backup_invitation','backup_family','revoke_backup_invitation','change_backup_member','leave_backup_family','delete_backup_baby','preview_account_backup_deletion','start_account_backup_deletion','purge_account_backup_data']) loop execute format('revoke all on function %s from public,anon,authenticated',f.signature);if f.proname=any(array['create_backup_invitation','accept_backup_invitation','backup_family','revoke_backup_invitation','change_backup_member','leave_backup_family','delete_backup_baby','preview_account_backup_deletion','start_account_backup_deletion']) then execute format('grant execute on function %s to authenticated',f.signature);elsif f.proname='purge_account_backup_data' then execute format('grant execute on function %s to service_role',f.signature);end if;end loop;end;$$;
commit;
