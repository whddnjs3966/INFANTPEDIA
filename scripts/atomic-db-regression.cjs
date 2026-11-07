// In-memory PostgreSQL-compatible engine, fake auth users. No network or production DB.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { PGlite } = require(process.env.INFANTPEDIA_PGLITE_MODULE || '@electric-sql/pglite');
const root = path.resolve(__dirname, '..');
const users = ['11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222','33333333-3333-4333-8333-333333333333','44444444-4444-4444-8444-444444444444'];
const baby = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const second = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
let db, checks = 0;
const payload = (name='A', height=58.4) => ({ baby:{id:baby,name,birthdate:'2026-08-29',gender:'male'},measurements:[{id:'m1',baby_id:baby,date:'2026-10-29',month:2,height,weight:null,head_circumference:null}],vaccinations:[{baby_id:baby,vaccine_id:'hepb',dose_number:1,completed_date:'2026-10-29'}] });
async function login(id, role='authenticated') { await db.exec(`reset role; set role ${role};`); await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id??'']); }
async function admin(sql, params=[]) { await db.exec('reset role'); return db.query(sql,params); }
async function read() { return (await db.query('select public.read_backup_snapshot($1) as snapshot',[baby])).rows[0].snapshot; }
async function write(rev, id, data) { return (await db.query('select public.write_backup_snapshot($1,$2,$3,$4::jsonb) as result',[baby,rev,id,JSON.stringify(data)])).rows[0].result; }
async function denied(action,code) { await assert.rejects(action, error=>error.code===code); }
async function check(name, action) { await action(); checks++; console.log('PASS '+name); }
(async()=>{
 db = new PGlite();
 await db.exec(`create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$; grant usage on schema auth to anon,authenticated;`);
 await db.exec(fs.readFileSync(path.join(root,'sql/004_sharing_tables.sql'),'utf8'));
 await db.exec(fs.readFileSync(path.join(root,'sql/005_add_creator_info.sql'),'utf8'));
 await db.exec(fs.readFileSync(path.join(root,'sql/007_atomic_backup.sql'),'utf8'));
 await db.exec(fs.readFileSync(path.join(root,'sql/009_account_bound_backup.sql'),'utf8'));
 await db.exec(fs.readFileSync(path.join(root,'sql/010_list_account_backups.sql'),'utf8'));
 for(const id of users) await db.query('insert into auth.users values($1)',[id]);
 await db.query("insert into public.shared_babies(id,invite_code,name,birthdate,gender,creator_id) values($1,'ABC234','Legacy','2026-08-29','male',$2),($3,'ABC235','Other','2026-08-29','female',$2)",[baby,users[3],second]);
 await db.query("insert into public.backup_memberships values($1,$2,'owner'),($1,$3,'editor'),($1,$4,'reader'),($5,$2,'owner')",[baby,users[0],users[1],users[2],second]);
 await db.query('select public.validate_backup_payload($1,$2::jsonb)',[baby,JSON.stringify(payload())]);
 await db.query('insert into public.backup_snapshots(baby_id,payload) values($1,$2::jsonb)',[baby,JSON.stringify(payload())]);
 await check('account backup listing rejects anonymous and mismatched JWT accounts',async()=>{await login(null,'anon');await denied(()=>db.query('select public.list_account_backups($1)',[users[0]]),'42501');await login(users[1]);await denied(()=>db.query('select public.list_account_backups($1)',[users[0]]),'42501');});
 await check('legacy creator cannot enumerate snapshots without membership',async()=>{await login(users[3]);const r=(await db.query('select public.list_account_backups($1) as r',[users[3]])).rows[0].r;assert.equal(r.items.length,0);assert.equal(r.next_cursor,null);});
 await check('reader list contains only its membership and canonical snapshot profile',async()=>{await login(users[2]);const r=(await db.query('select public.list_account_backups($1) as r',[users[2]])).rows[0].r;assert.equal(r.items.length,1);assert.equal(r.items[0].baby_id,baby);assert.equal(r.items[0].role,'reader');assert.equal(r.items[0].name,'A');});
 await check('listing pages in UUID order without leaking uninitialized babies',async()=>{await admin('select 1');for(let i=0;i<22;i++){const id=randomUUID();await db.query('insert into shared_babies(id,invite_code,name,birthdate) values($1,$2,$3,$4)',[id,'PAGE-'+id,'Legacy','2026-08-29']);await db.query("insert into backup_memberships values($1,$2,'owner')",[id,users[0]]);const p=payload();p.baby.id=id;p.measurements=[];p.vaccinations=[];await db.query('insert into backup_snapshots(baby_id,payload) values($1,$2::jsonb)',[id,JSON.stringify(p)]);}await login(users[0]);const first=(await db.query('select public.list_account_backups($1,null,20) as r',[users[0]])).rows[0].r;assert.equal(first.items.length,20);assert.equal(first.next_cursor,first.items.at(-1).baby_id);const secondPage=(await db.query('select public.list_account_backups($1,$2,20) as r',[users[0],first.next_cursor])).rows[0].r;assert.equal(secondPage.items.length,3);assert.equal(secondPage.next_cursor,null);const ids=[...first.items,...secondPage.items].map(x=>x.baby_id);assert.equal(new Set(ids).size,23);assert.deepEqual(ids,[...ids].sort());assert.equal(ids.includes(second),false);});
 await check('invalid listing limits are refused',async()=>{await login(users[0]);for(const limit of [0,51,null])await denied(()=>db.query('select public.list_account_backups($1,null,$2)',[users[0],limit]),'22023');});
 await check('anonymous RPC access denied',async()=>{await login(null,'anon');await denied(read,'42501');});
 await check('legacy creator/device identity does not grant membership',async()=>{await login(users[3]);await denied(read,'42501');await denied(()=>write(0,randomUUID(),payload()),'42501');});
 await check('readers can read but cannot write',async()=>{await login(users[2]);assert.equal((await read()).revision,0);await denied(()=>write(0,randomUUID(),payload()),'42501');});
 await check('account-bound writes reject a switched JWT even for another authorized editor',async()=>{await login(users[1]);await denied(()=>db.query('select public.write_backup_snapshot_for_account($1,0,$2,$3::jsonb,$4)',[baby,randomUUID(),JSON.stringify(payload()),users[0]]),'42501');});
 await check('account-bound writes require a non-null expected account',async()=>{await login(users[0]);await denied(()=>db.query('select public.write_backup_snapshot_for_account($1,0,$2,$3::jsonb,null)',[baby,randomUUID(),JSON.stringify(payload())]),'42501');});
 let firstRequest;
 await check('profile and both record lists commit as one version',async()=>{await login(users[0]);firstRequest=randomUUID();const next=payload('Updated',60.2);next.vaccinations[0].dose_number=2;const result=await write(0,firstRequest,next);assert.equal(result.revision,1);const snapshot=await read();assert.equal(snapshot.payload.baby.name,'Updated');assert.equal(snapshot.payload.measurements[0].height,60.2);assert.equal(snapshot.payload.vaccinations[0].dose_number,2);});
 await check('an editor with a stale base cannot overwrite another device',async()=>{await login(users[1]);await denied(()=>write(0,randomUUID(),payload('Stale',55)),'40001');assert.equal((await read()).payload.baby.name,'Updated');});
 await check('identical retry returns prior receipt without another revision',async()=>{await login(users[0]);const next=payload('Updated',60.2);next.vaccinations[0].dose_number=2;assert.equal((await write(0,firstRequest,next)).revision,1);assert.equal((await read()).revision,1);});
 await check('reusing request identity with different content is rejected',async()=>{await denied(()=>write(0,firstRequest,payload('Different')),'22023');});
 await check('same request identity cannot be replayed by another user',async()=>{await login(users[1]);const next=payload('Updated',60.2);next.vaccinations[0].dose_number=2;await denied(()=>write(0,firstRequest,next),'22023');});
 await check('a failure at the final update rolls back every field and revision',async()=>{await admin('alter table public.backup_snapshots add constraint force_failure check(revision <= 1)');await login(users[0]);const before=await read();await denied(()=>write(1,randomUUID(),payload('Must rollback',90)),'23514');assert.deepEqual(await read(),before);await admin('alter table public.backup_snapshots drop constraint force_failure');});
 for(const [label,change] of [
  ['foreign child owner',p=>p.measurements[0].baby_id=second],
  ['missing record list',p=>delete p.vaccinations],
  ['duplicate measurement IDs',p=>p.measurements.push({...p.measurements[0]})],
  ['negative measurement',p=>p.measurements[0].height=-1],
  ['duplicate vaccination dose',p=>p.vaccinations.push({...p.vaccinations[0]})],
  ['record before birth',p=>p.measurements[0].date='2026-08-28'],
 ]) await check('invalid '+label+' leaves the snapshot unchanged',async()=>{await login(users[0]);const before=await read(),invalid=payload();change(invalid);await denied(()=>write(1,randomUUID(),invalid),'22023');assert.deepEqual(await read(),before);});
 await check('equivalent numeric dose spellings cannot bypass duplicate validation',async()=>{await login(users[0]);const before=await read(),invalid=payload();invalid.vaccinations.push({...invalid.vaccinations[0]});let seen=0;const raw=JSON.stringify(invalid).replace(/"dose_number":1/g,match=>++seen===2?'"dose_number":1.0':match);await denied(()=>db.query('select public.write_backup_snapshot($1,$2,$3,$4::jsonb)',[baby,1,randomUUID(),raw]),'22023');assert.deepEqual(await read(),before);});
 await check('two requests from the same base yield one success and one conflict',async()=>{await login(users[1]);const results=await Promise.allSettled([write(1,randomUUID(),payload('First device',60)),write(1,randomUUID(),payload('Second device',61))]);assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(results.find(r=>r.status==='rejected').reason.code,'40001');assert.equal((await read()).revision,2);});
 await check('clients cannot read private tables or grant themselves membership',async()=>{await login(users[3]);await denied(()=>db.query('select * from public.backup_snapshots'),'42501');await denied(()=>db.query("insert into public.backup_memberships values($1,$2,'owner')",[baby,users[3]]),'42501');});
 await check('clients cannot bypass revision checks with direct table updates',async()=>{await login(users[0]);await denied(()=>db.query("update public.backup_snapshots set revision=99 where baby_id=$1",[baby]),'42501');});
 await check('legacy delete permissions cannot cascade into protected backup data',async()=>{await admin('grant select,delete on public.shared_babies to anon');await login(null,'anon');await denied(()=>db.query('delete from public.shared_babies where id=$1',[baby]),'23001');await login(users[0]);assert.equal((await read()).revision,2);});
 await check('a missing baseline is never initialized from an upload',async()=>{await login(users[0]);const next=payload();next.baby.id=second;next.measurements=[];next.vaccinations=[];await denied(()=>db.query('select public.write_backup_snapshot($1,0,$2,$3::jsonb)',[second,randomUUID(),JSON.stringify(next)]),'P0002');});
 await check('revocation takes effect before any further write',async()=>{await admin('delete from public.backup_memberships where baby_id=$1 and user_id=$2',[baby,users[0]]);await login(users[0]);await denied(()=>write(2,randomUUID(),payload()),'42501');});
 await check('authorized editor can write through the account-bound RPC',async()=>{await login(users[1]);const result=(await db.query('select public.write_backup_snapshot_for_account($1,2,$2,$3::jsonb,$4) as r',[baby,randomUUID(),JSON.stringify(payload('Guarded write')),users[1]])).rows[0].r;assert.equal(result.revision,3);});
 await check('anonymous execution of the account-bound wrapper is denied',async()=>{await login(null,'anon');await denied(()=>db.query('select public.write_backup_snapshot_for_account($1,3,$2,$3::jsonb,$4)',[baby,randomUUID(),JSON.stringify(payload()),users[1]]),'42501');});
 console.log(`${checks} atomic database checks passed (in-memory PGlite; simulated auth; not multi-session stress).`);
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{await db?.close();});
