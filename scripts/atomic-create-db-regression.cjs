// In-memory database only, simulated JWT identities. No production reads/writes.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {randomUUID}=require('node:crypto');
const {PGlite}=require('@electric-sql/pglite');
const root=path.resolve(__dirname,'..');
const owner='11111111-1111-4111-8111-111111111111',other='22222222-2222-4222-8222-222222222222';
let db,checks=0;
const payload=id=>({baby:{id,name:'Fake',birthdate:'2026-08-29',gender:'male'},measurements:[{id:'m1',baby_id:id,date:'2026-10-29',month:2,height:58}],vaccinations:[]});
async function login(id,role='authenticated'){await db.exec('reset role; set role '+role);await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id||'']);}
async function admin(sql,params=[]){await db.exec('reset role');return db.query(sql,params);}
async function create(id,request,p=payload(id)){return(await db.query('select public.create_backup_snapshot($1,$2,$3::jsonb) as receipt',[id,request,JSON.stringify(p)])).rows[0].receipt;}
async function denied(fn,code){await assert.rejects(fn,e=>e.code===code);}
async function counts(){return(await admin(`select (select count(*)::int from shared_babies) babies,(select count(*)::int from backup_memberships) members,(select count(*)::int from backup_snapshots) snapshots,(select count(*)::int from backup_creation_requests) requests`)).rows[0];}
async function check(name,fn){await fn();checks++;console.log('PASS '+name);}
(async()=>{
 db=new PGlite();
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to anon,authenticated;`);
 for(const file of ['004_sharing_tables.sql','005_add_creator_info.sql','007_atomic_backup.sql','security/lockdown-legacy-sharing.sql','008_atomic_create_backup.sql'])await db.exec(fs.readFileSync(path.join(root,'sql',file),'utf8'));
 await db.query('insert into auth.users values($1),($2)',[owner,other]);
 const id=randomUUID(),request=randomUUID();
 await check('anonymous execution is denied',async()=>{await login(null,'anon');await denied(()=>create(id,request),'42501');});
 await check('a switched JWT cannot create under the expected account',async()=>{await login(other);await denied(()=>db.query('select public.create_backup_snapshot($1,$2,$3::jsonb,$4)',[id,request,JSON.stringify(payload(id)),owner]),'42501');assert.equal((await counts()).babies,0);});
 await check('authenticated role without a JWT subject is denied',async()=>{await login(null);await denied(()=>create(id,request),'42501');});
 await check('profile, JWT owner, baseline and request commit together under lockdown',async()=>{
  await login(owner);assert.equal((await create(id,request)).baby_id,id);
  assert.deepEqual(await counts(),{babies:1,members:1,snapshots:1,requests:1});
  const b=(await admin('select creator_id,creator_email from shared_babies where id=$1',[id])).rows[0];assert.equal(b.creator_id,owner);assert.equal(b.creator_email,null);
  await login(owner);const s=(await db.query('select public.read_backup_snapshot($1) as s',[id])).rows[0].s;assert.equal(s.revision,0);assert.equal(s.payload.measurements[0].height,58);
 });
 await check('same request retry does not duplicate or reset later edits',async()=>{
  await login(owner);const p=payload(id);p.baby.name='Later edit';await db.query('select public.write_backup_snapshot($1,0,$2,$3::jsonb)',[id,randomUUID(),JSON.stringify(p)]);
  assert.equal((await create(id,request)).request_id,request);
  const s=(await db.query('select public.read_backup_snapshot($1) as s',[id])).rows[0].s;assert.equal(s.revision,1);assert.equal(s.payload.baby.name,'Later edit');
  assert.equal((await counts()).babies,1);
 });
 await check('changed payload or baby on retry is refused',async()=>{await login(owner);const p=payload(id);p.baby.name='Changed';await denied(()=>create(id,request,p),'22023');await denied(()=>create(randomUUID(),request),'22023');});
 await check('another account cannot claim an existing baby',async()=>{await login(other);await denied(()=>create(id,randomUUID()),'23505');await denied(()=>db.query('select public.read_backup_snapshot($1)',[id]),'42501');assert.deepEqual(await counts(),{babies:1,members:1,snapshots:1,requests:1});});
 await check('same request UUID is independently scoped to each account',async()=>{await login(other);await create(randomUUID(),request);assert.equal((await counts()).babies,2);});
 await check('invalid payload creates nothing',async()=>{const before=await counts();await login(owner);const invalid=payload(randomUUID());invalid.measurements[0].height=-1;await denied(()=>create(invalid.baby.id,randomUUID(),invalid),'22023');assert.deepEqual(await counts(),before);});
 await check('new baby with no records receives a genuine empty baseline',async()=>{const empty=payload(randomUUID());empty.measurements=[];await login(owner);await create(empty.baby.id,randomUUID(),empty);const s=(await db.query('select public.read_backup_snapshot($1) as s',[empty.baby.id])).rows[0].s;assert.equal(s.revision,0);assert.equal(s.payload.measurements.length,0);assert.equal(s.payload.vaccinations.length,0);});
 await check('null creation identities leave no partial request',async()=>{const before=await counts();await login(owner);await denied(()=>create(null,randomUUID()),'22023');await denied(()=>create(randomUUID(),null),'22023');assert.deepEqual(await counts(),before);});
 await check('a final snapshot failure rolls back profile, membership and request',async()=>{
  const bad=randomUUID(),r=randomUUID(),before=await counts();
  await admin(`alter table backup_snapshots add constraint reject_creation check(baby_id <> '${bad}'::uuid)`);
  await login(owner);await denied(()=>create(bad,r),'23514');assert.deepEqual(await counts(),before);
  await admin('alter table backup_snapshots drop constraint reject_creation');await login(owner);await create(bad,r);assert.equal((await counts()).babies,before.babies+1);
 });
 await check('clients cannot modify creation receipts or legacy tables directly',async()=>{
  await login(owner);for(const sql of ['select * from backup_creation_requests','delete from backup_creation_requests','update shared_babies set name=\'Unsafe\'','insert into shared_devices(baby_id,device_id) values(null,\'unsafe\')'])await denied(()=>db.query(sql),'42501');
 });
 await check('revoked membership cannot be restored by creation replay',async()=>{
  await admin('delete from backup_memberships where baby_id=$1 and user_id=$2',[id,owner]);await login(owner);await denied(()=>create(id,request),'42501');
 });
 console.log(`${checks} atomic creation database checks passed (PGlite, simulated JWT; not multi-session stress).`);
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{await db?.close();});
