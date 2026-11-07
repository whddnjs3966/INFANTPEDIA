// Dormant legacy behavior checks explicitly bypass the pause; production gates are tested separately.
// Actual TS store, runner and service. Mock auth/database; no network or browser writes.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const ts=require(path.join(root,'node_modules/typescript'));
const cache=new Map();
let calls=[],fault='',profileExists=true;
const supabase={from(table){let op;const query={update(){op='update';calls.push(table+':'+op);return query;},delete(){op='delete';calls.push(table+':'+op);return query;},insert(){op='insert';calls.push(table+':'+op);return query;},eq(){return query;},select(){return query;},single(){return query;},then(resolve,reject){return Promise.resolve({data:table==='shared_babies'&&profileExists?{id:'shared'}:null,error:fault===table+':'+op?{message:'mock failure'}:null}).then(resolve,reject);}};return query;}};
function load(relative){
 const filename=path.join(root,relative+'.ts');if(cache.has(filename))return cache.get(filename).exports;
 const module={exports:{}};cache.set(filename,module);
 const output=ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 vm.runInNewContext(output,{module,exports:module.exports,console,Date,require(name){
  if(name==='zustand')return require(path.join(root,'node_modules/zustand'));
  if(name==='@/lib/sync/sharing-availability')return {isLegacySharingPaused:()=>false};
  if(name==='@/lib/supabase')return {supabase};
  if(name.startsWith('@/'))return load('src/'+name.slice(2));
  throw Error('Unexpected import '+name);
 }},{filename});return module.exports;
}
const store=load('src/lib/store/backup-store').useBackupStore;
const run=load('src/lib/sync/run-backup').runBackup;
const push=load('src/lib/sync/sync-service').pushToCloud;
let checks=0;
async function check(name,fn){store.setState({byBaby:{},retries:{}});await fn();checks++;console.log('PASS '+name);}
function attempt(overrides={}){const token=store.getState().queue('A','user1','shared');return {babyId:'A',token,authenticate:async()=>true,upload:async()=>({}),stillConnected:()=>true,...overrides};}
(async()=>{
 await check('successful acknowledgement sets only this baby and account',async()=>{
  const tokenB=store.getState().queue('B','user2','shared-B');await run(attempt());
  assert.equal(store.getState().byBaby.A.phase,'success');assert.ok(store.getState().byBaby.A.lastSuccessAt);
  assert.equal(store.getState().byBaby.B.phase,'queued');assert.equal(store.getState().byBaby.B.token,tokenB);
 });
 await check('auth rejection never uploads or marks success',async()=>{
  let uploaded=false;await run(attempt({authenticate:async()=>false,upload:async()=>{uploaded=true;return {};}}));
  assert.equal(uploaded,false);assert.equal(store.getState().byBaby.A.phase,'error');assert.equal(store.getState().byBaby.A.lastSuccessAt,undefined);
 });
 await check('upload failure is retryable only by the same account',async()=>{
  await run(attempt({upload:async()=>({error:'failed'})}));
  store.getState().retry('A','other');assert.equal(store.getState().retries.A,undefined);
  store.getState().retry('A','user1');assert.equal(store.getState().retries.A,1);
 });
 await check('network exceptions become an error and keep local scope',async()=>{
  await run(attempt({upload:async()=>{throw Error('offline');}}));assert.equal(store.getState().byBaby.A.phase,'error');
 });
 await check('newer changes prevent an old success overwriting pending backup',async()=>{
  let release;const done=new Promise(r=>release=r);const old=attempt({upload:()=>done});
  const pending=run(old);await Promise.resolve();const newer=store.getState().queue('A','user1','shared');release({});await pending;
  assert.equal(store.getState().byBaby.A.token,newer);assert.equal(store.getState().byBaby.A.phase,'queued');
 });
 await check('cancellation while authenticating prevents an upload',async()=>{
  let release,uploaded=false;const auth=new Promise(r=>release=r);
  const a=attempt({authenticate:()=>auth,upload:async()=>{uploaded=true;return {};}});
  const pending=run(a);store.getState().cancel('A',a.token);release(true);await pending;
  assert.equal(uploaded,false);assert.equal(store.getState().byBaby.A.phase,'idle');
 });
 await check('pending and running backups cannot enqueue retries',async()=>{
  const a=attempt();store.getState().retry('A','user1');store.getState().start('A',a.token);store.getState().retry('A','user1');assert.equal(store.getState().retries.A,undefined);
 });
 await check('an account change cannot reuse the previous success date',async()=>{
  await run(attempt());store.getState().queue('A','other','shared');assert.equal(store.getState().byBaby.A.lastSuccessAt,undefined);
 });
 await check('a new shared target cannot inherit the previous success date',async()=>{
  await run(attempt());store.getState().queue('A','user1','other-target');assert.equal(store.getState().byBaby.A.lastSuccessAt,undefined);
 });
 const baby={id:'A',name:'Fake',birthdate:'2026-08-29',gender:'male'};
 for(const failed of ['shared_babies:update','shared_measurements:delete','shared_measurements:insert','shared_vaccinations:delete','shared_vaccinations:insert']){
  await check('service surfaces '+failed,async()=>{calls=[];fault=failed;profileExists=true;const result=await push('shared',baby,[{date:'2026-10-30',month:2,height:58}],[{vaccineId:'hepb',doseNumber:1,completedDate:'2026-10-30'}]);assert.ok(result.error);assert.equal(calls.at(-1),failed);});
 }
 await check('zero profile rows is not an acknowledged upload',async()=>{calls=[];fault='';profileExists=false;assert.ok((await push('shared',baby,[],[])).error);assert.equal(calls.length,1);});
 await check('all acknowledged stages permit success including empty snapshots',async()=>{calls=[];fault='';profileExists=true;assert.equal((await push('shared',baby,[],[])).error,undefined);assert.equal(calls.join(','),'shared_babies:update,shared_measurements:delete,shared_vaccinations:delete');});
 console.log(`${checks} backup regression checks passed.`);
})().catch(error=>{console.error(error);process.exitCode=1;});
