-- REVIEW BEFORE RUNNING. This pauses legacy cloud sharing/backup/import.
-- No records are deleted. Local device records and public encyclopedia tables are untouched.
-- Independent of 007_atomic_backup.sql; do NOT apply 007 as a prerequisite.
begin;
do $$
declare target text;
begin
  foreach target in array array['shared_babies','shared_devices','shared_measurements','shared_vaccinations','shared_daily_logs'] loop
    execute format('alter table public.%I enable row level security',target);
    execute format('revoke all privileges on table public.%I from public, anon, authenticated',target);
    execute format('drop policy if exists lockdown_legacy_clients on public.%I',target);
    -- Restrictive false also blocks normal client roles with inherited/column grants.
    execute format('create policy lockdown_legacy_clients on public.%I as restrictive for all to anon, authenticated using (false) with check (false)',target);
  end loop;
end;
$$;
commit;
-- Do not undo this with GRANT ALL. Restore access only after verified membership/RLS cutover.
