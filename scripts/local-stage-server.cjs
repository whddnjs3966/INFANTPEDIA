// Loopback-only test auth/RPC gateway over real PostgreSQL. Never a production server.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {Client}=require('pg'),root=path.resolve(__dirname,'..');
const ids=['11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222','33333333-3333-4333-8333-333333333333','44444444-4444-4444-8444-444444444444'];
const pgConfig={host:'127.0.0.1',port:55439,user:'postgres',database:'infantpedia_stage_browser_'+Date.now()};
const allowed=new Set(['create_backup_snapshot','read_backup_snapshot','write_backup_snapshot','write_backup_snapshot_for_account','list_account_backups','create_backup_invitation','accept_backup_invitation','backup_family','revoke_backup_invitation','change_backup_member','leave_backup_family','delete_backup_baby','preview_account_backup_deletion','start_account_backup_deletion']);
const {privateKey,publicKey}=crypto.generateKeyPairSync('rsa',{modulusLength:2048});const issuer='http://127.0.0.1:3228/test-auth',serviceKey='qa-stage-service-only';
let db,server,requests=0,rpcWrites=0;const specs=new Map();
const encode=v=>Buffer.from(JSON.stringify(v)).toString('base64url');
function token(id,seconds=3600,extra={}){const now=Math.floor(Date.now()/1000),head=encode({alg:'RS256',typ:'JWT'}),body=encode({iss:issuer,aud:'authenticated',role:'authenticated',sub:id,iat:now,exp:now+seconds,...extra});const message=head+'.'+body;return message+'.'+crypto.sign('RSA-SHA256',Buffer.from(message),privateKey).toString('base64url');}
function verify(raw){const parts=raw.split('.');if(parts.length!==3)throw Error('JWT_FORMAT');const h=JSON.parse(Buffer.from(parts[0],'base64url')),p=JSON.parse(Buffer.from(parts[1],'base64url'));if(h.alg!=='RS256'||!crypto.verify('RSA-SHA256',Buffer.from(parts[0]+'.'+parts[1]),publicKey,Buffer.from(parts[2],'base64url'))||p.iss!==issuer||p.aud!=='authenticated'||p.role!=='authenticated'||!ids.includes(p.sub)||p.exp<=Date.now()/1000||p.iat>Date.now()/1000+60)throw Error('JWT_INVALID');return p;}
async function connect(database=pgConfig.database){const c=new Client({...pgConfig,database});await c.connect();return c;}
async function authUser(id){return(await db.query('select id,email,raw_user_meta_data as user_metadata,last_sign_in_at from auth.users where id=$1',[id])).rows[0];}
function userJson(u){return{...u,aud:'authenticated',role:'authenticated',app_metadata:{},created_at:'2026-01-01T00:00:00Z'};}
async function session(id,seconds=3600,extra={}){const u=await authUser(id);if(!u)return null;return{access_token:token(id,seconds,extra),refresh_token:'qa:'+id,expires_at:Math.floor(Date.now()/1000)+seconds,expires_in:seconds,token_type:'bearer',user:userJson(u)};}
function send(res,status,data){res.writeHead(status);res.end(JSON.stringify(data));}
(async()=>{
 const admin=await connect('postgres');await admin.query('create database '+pgConfig.database);await admin.end();db=await connect();
 for(const name of ['anon','authenticated','service_role'])if(!(await db.query('select 1 from pg_roles where rolname=$1',[name])).rowCount)await db.query('create role '+name+(name==='service_role'?' bypassrls':''));
 await db.query(`create schema auth;create table auth.users(id uuid primary key,email text unique,raw_user_meta_data jsonb not null default '{}',last_sign_in_at timestamptz default now());create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to anon,authenticated;`);
 for(const name of ['004_sharing_tables.sql','005_add_creator_info.sql','007_atomic_backup.sql','008_atomic_create_backup.sql','009_account_bound_backup.sql','010_list_account_backups.sql','011_backup_lifecycle.sql','security/lockdown-legacy-sharing.sql'])await db.query(fs.readFileSync(path.join(root,'sql',name),'utf8'));
 for(let i=0;i<ids.length;i++)await db.query('insert into auth.users(id,email) values($1,$2)',[ids[i],`stage${i+1}@example.test`]);
 fs.writeFileSync(process.env.INFANTPEDIA_STAGE_CONFIG||path.join(root,'.next/local-stage-browser.json'),JSON.stringify({...pgConfig,fixtureUsers:ids},null,2));
 server=http.createServer(async(req,res)=>{
  res.setHeader('Content-Type','application/json');res.setHeader('Access-Control-Allow-Origin',req.headers.origin||'*');res.setHeader('Access-Control-Allow-Headers','*');res.setHeader('Access-Control-Allow-Methods','GET,POST,DELETE,OPTIONS');res.setHeader('Cache-Control','no-store');if(req.method==='OPTIONS'){res.writeHead(204);return res.end();}
  const url=new URL(req.url,'http://127.0.0.1:3228');let c;
  try{
   if(url.pathname==='/qa/login'){const id=url.searchParams.get('user');if(!ids.includes(id))return send(res,400,{error:'unknown fixture'});await db.query('update auth.users set last_sign_in_at=now() where id=$1',[id]);return send(res,200,await session(id));}
   if(url.pathname==='/qa/jwt-tests'){
    const good=token(ids[1]),expired=token(ids[1],-1),wrongRole=token(ids[1],3600,{role:'service_role'}),tampered=good.slice(0,-8)+'AAAAAAAA';
    let denied=0;for(const t of [expired,wrongRole,tampered])try{verify(t);}catch{denied++;}
    assertJwt(verify(good).sub===ids[1]&&denied===3);return send(res,200,{signedJwtVerified:true,expiredDenied:true,roleEscalationDenied:true,tamperDenied:true});
   }
   if(url.pathname==='/qa/stats')return send(res,200,{requests,rpcWrites,productionRequests:0,database:pgConfig.database});
   if(url.pathname==='/auth/v1/token'){let raw='';for await(const p of req)raw+=p;const input=JSON.parse(raw||'{}'),id=String(input.refresh_token||'').replace(/^qa:/,'');if(!ids.includes(id))return send(res,401,{message:'Invalid refresh token'});const s=await session(id);return send(res,s?200:401,s??{message:'User deleted'});}
   if(url.pathname==='/auth/v1/logout'){res.writeHead(204);return res.end();}
   const bearer=String(req.headers.authorization||'').replace(/^Bearer /,''),isService=bearer===serviceKey;
   let actor=null;if(!isService){const claims=verify(bearer);actor=await authUser(claims.sub);if(!actor)throw Error('USER_MISSING');}
   if(url.pathname==='/auth/v1/user')return send(res,200,userJson(actor));
   if(url.pathname.startsWith('/auth/v1/admin/users/')&&req.method==='DELETE'){
    const id=url.pathname.split('/').at(-1);if(!isService||!ids.includes(id))return send(res,403,{message:'Forbidden'});await db.query('delete from auth.users where id=$1',[id]);return send(res,200,{user:{id}});
   }
   if(url.pathname.startsWith('/rest/v1/rpc/')&&req.method==='POST'){
    const name=url.pathname.split('/').at(-1);if(isService?name!=='purge_account_backup_data':!allowed.has(name))return send(res,403,{code:'42501',message:'RPC denied'});
    let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>2500000)return send(res,413,{message:'Payload too large'});}const args=JSON.parse(raw||'{}');
    if(!specs.has(name)){const result=await db.query("select proargnames from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and proname=$1",[name]);if(result.rowCount!==1)return send(res,404,{code:'PGRST202'});specs.set(name,result.rows[0].proargnames);}
    const keys=Object.keys(args);if(keys.some(k=>!specs.get(name).includes(k)))return send(res,400,{message:'Invalid arguments'});
    c=await connect();await c.query('begin');await c.query('set local role '+(isService?'service_role':'authenticated'));await c.query("select set_config('request.jwt.claim.sub',$1,true)",[actor?.id||'']);
    const call=`select public.${name}(${keys.map((k,i)=>'"'+k+'"=>$'+(i+1)).join(',')}) as result`;const result=(await c.query(call,keys.map(k=>args[k]))).rows[0].result;await c.query('commit');requests++;if(!['read_backup_snapshot','list_account_backups','backup_family','preview_account_backup_deletion'].includes(name))rpcWrites++;
    return send(res,200,result===''?null:result);
   }
   return send(res,403,{code:'42501',message:'Legacy table access blocked'});
  }catch(error){if(c)try{await c.query('rollback');}catch{}return send(res,error.code==='40001'?409:error.code==='42501'?403:error.code?.startsWith('22')?400:401,{code:error.code??'AUTH_INVALID',message:'Local stage request denied'});}finally{await c?.end();}
 });await new Promise(r=>server.listen(3228,'127.0.0.1',r));console.log('LOCAL_STAGE_READY: PostgreSQL-backed loopback auth/RPC gateway on 3228');
 function stop(){server.close(async()=>{await db.end();process.exit(0);});}process.on('SIGINT',stop);process.on('SIGTERM',stop);
})().catch(e=>{console.error(e);process.exitCode=1;});
function assertJwt(condition){if(!condition)throw Error('JWT_TEST_FAILED');}
