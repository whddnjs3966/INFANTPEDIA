-- Staging only. Requires 007. Canonical snapshots, never legacy public profile lookup.
begin;
create function public.list_account_backups(p_expected_user_id uuid, p_after uuid default null, p_limit integer default 20)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare items jsonb; cursor uuid;
begin
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
    where m.user_id=auth.uid() and (p_after is null or b.baby_id > p_after)
    order by b.baby_id limit p_limit+1
  ) s;
  if jsonb_array_length(items) > p_limit then
    items := items - p_limit;
    cursor := (items->(p_limit-1)->>'baby_id')::uuid;
  end if;
  return jsonb_build_object('items',items,'next_cursor',cursor);
end;
$$;
revoke all on function public.list_account_backups(uuid,uuid,integer) from public, anon, authenticated;
grant execute on function public.list_account_backups(uuid,uuid,integer) to authenticated;
commit;
