-- Read-only metadata inspection. No user records, keys, DDL or data changes.
-- Select and run each numbered SELECT separately in the Dashboard SQL Editor.

-- 1. Editor identity. Admin reads do not prove end-user access isolation.
select current_user as editor_role;

-- 2. Existing private sharing/backup tables and RLS flags.
select c.relname as table_name,
       c.relrowsecurity as rls_enabled,
       c.relforcerowsecurity as force_rls
from pg_catalog.pg_class c
join pg_catalog.pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind in ('r', 'p')
  and c.relname in ('shared_babies','shared_devices','shared_measurements',
    'shared_vaccinations','shared_daily_logs','backup_memberships','backup_snapshots')
order by c.relname;

-- 3. Effective table privileges. RLS can further restrict which rows are accessible.
select c.relname as table_name, r.role_name,
       has_table_privilege(r.role_name,c.oid,'SELECT') as can_select,
       has_table_privilege(r.role_name,c.oid,'INSERT') as can_insert,
       has_table_privilege(r.role_name,c.oid,'UPDATE') as can_update,
       has_table_privilege(r.role_name,c.oid,'DELETE') as can_delete
from pg_catalog.pg_class c
join pg_catalog.pg_namespace n on n.oid = c.relnamespace
cross join (values ('anon'),('authenticated')) as r(role_name)
where n.nspname = 'public' and c.relkind in ('r','p')
  and c.relname in ('shared_babies','shared_devices','shared_measurements',
    'shared_vaccinations','shared_daily_logs','backup_memberships','backup_snapshots')
order by c.relname,r.role_name;

-- 4. Actual policies in this DB, not just local migration files.
select tablename, policyname, permissive, roles, cmd,
       qual as using_condition, with_check as check_condition
from pg_catalog.pg_policies
where schemaname = 'public'
  and tablename in ('shared_babies','shared_devices','shared_measurements',
    'shared_vaccinations','shared_daily_logs','backup_memberships','backup_snapshots')
order by tablename,policyname;

