-- Staging only, after 007. Does not reopen legacy REST.
begin;
create function public.write_backup_snapshot_for_account(
  p_baby_id uuid, p_expected_revision integer, p_request_id uuid,
  p_payload jsonb, p_expected_user_id uuid
) returns jsonb language plpgsql set search_path = '' as $$
begin
  if auth.uid() is null or p_expected_user_id is null or auth.uid() <> p_expected_user_id then
    raise exception 'BACKUP_ACCOUNT_CHANGED' using errcode='42501';
  end if;
  return public.write_backup_snapshot(p_baby_id,p_expected_revision,p_request_id,p_payload);
end;
$$;
revoke all on function public.write_backup_snapshot_for_account(uuid,integer,uuid,jsonb,uuid) from public, anon, authenticated;
grant execute on function public.write_backup_snapshot_for_account(uuid,integer,uuid,jsonb,uuid) to authenticated;
commit;
