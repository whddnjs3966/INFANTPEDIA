// Reproduce supplied policies only against fake records in a local memory DB.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {PGlite}=require('@electric-sql/pglite');
const root=path.resolve(__dirname,'..'),tables=['shared_babies','shared_devices','shared_measurements','shared_vaccinations','shared_daily_logs'];
const a='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',b='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
let db,checks=0;
async function check(name,fn){await fn();checks++;console.log('PASS '+name);}
async function role(name){await db.exec(`reset role; set role ${name};`);await db.query("select set_config('request.headers',$1,false)",[JSON.stringify({'x-device-id':'qa-chosen-device'})]);}
(async()=>{
 db=new PGlite();
 await db.exec('create role anon;create role authenticated;create role service_role bypassrls;');
 await db.exec(fs.readFileSync(path.join(root,'sql/004_sharing_tables.sql'),'utf8'));
 await db.exec(fs.readFileSync(path.join(root,'sql/006_fix_sharing_rls.sql'),'utf8'));
 for(const t of tables)await db.exec(`grant all on public.${t} to anon,authenticated,service_role`);
 await db.query("insert into shared_babies(id,invite_code,name,birthdate) values($1,'ABC234','Fake A','2026-08-29'),($2,'ABC235','Fake B','2026-08-29')",[a,b]);
 await db.query("insert into shared_measurements(baby_id,month,date,height) values($1,2,'2026-10-29',58.4)",[b]);
 await db.exec('create table public.test_public_content(month integer);insert into public.test_public_content values(2);grant select on public.test_public_content to anon,authenticated;');
 await check('baseline permits an anonymous user to enumerate fake baby profiles',async()=>{await role('anon');assert.equal((await db.query('select id from shared_babies')).rows.length,2);});
 await check('baseline permits self-registering a chosen device for another fake baby',async()=>{await db.query("insert into shared_devices(baby_id,device_id) values($1,'qa-chosen-device')",[b]);assert.equal((await db.query('select height from shared_measurements where baby_id=$1',[b])).rows[0].height,'58.4');});
 await check('table privileges alone do not imply missing UPDATE/DELETE policies permit rows',async()=>{assert.equal((await db.query('update shared_measurements set height=99 where baby_id=$1',[b])).affectedRows,0);assert.equal((await db.query('delete from shared_babies where id=$1',[a])).affectedRows,0);});
 await db.exec('reset role');
 const counts={};for(const t of tables)counts[t]=(await db.query(`select count(*) as n from public.${t}`)).rows[0].n;
 await db.exec(fs.readFileSync(path.join(root,'sql/security/lockdown-legacy-sharing.sql'),'utf8'));
 for(const client of ['anon','authenticated'])await check(client+' loses direct table access after containment',async()=>{await role(client);for(const t of tables)await assert.rejects(()=>db.query(`select * from public.${t}`),error=>error.code==='42501');});
 await check('all fake records are preserved',async()=>{await db.exec('reset role');for(const t of tables)assert.equal((await db.query(`select count(*) as n from public.${t}`)).rows[0].n,counts[t]);});
 await check('public content remains readable',async()=>{await role('anon');assert.equal((await db.query('select month from public.test_public_content')).rows[0].month,2);});
 await check('an explicitly privileged service role remains usable',async()=>{await role('service_role');assert.equal((await db.query('select id from shared_babies')).rows.length,2);});
 await check('restrictive policy still blocks rows if a table grant is reintroduced',async()=>{await db.exec('reset role;grant select on shared_babies to anon;');await role('anon');assert.equal((await db.query('select id from shared_babies')).rows.length,0);});
 await check('column-specific grants cannot expose private rows',async()=>{await db.exec('reset role;revoke select on shared_babies from anon;grant select(name) on shared_babies to anon;');await role('anon');assert.equal((await db.query('select name from shared_babies')).rows.length,0);});
 console.log(`${checks} sharing containment checks passed (fake records only).`);
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{await db?.close();});
