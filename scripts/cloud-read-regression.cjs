// Dormant legacy behavior checks explicitly bypass the pause; production gates are tested separately.
// Actual TS modules, fake Supabase and memory-only stores. No network or real storage writes.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),ts=require(path.join(root,'node_modules/typescript')),cache=new Map();
let responses,account,authCalls,calls,changeAccount;
function fixture(){account='u1';authCalls=0;calls=[];changeAccount=false;responses={
 shared_babies:{data:{id:'shared',name:'Cloud baby',birthdate:'2026-08-29',gender:'male'},error:null},
 shared_devices:{data:[],error:null},
 shared_measurements:{data:[{id:'m1',baby_id:'shared',date:'2026-10-29',month:99,height:58.4}],count:1,error:null},
 shared_vaccinations:{data:[{id:'v1',baby_id:'shared',vaccine_id:'hepb',dose_number:1,completed_date:'2026-10-29'}],count:1,error:null},
};}
const supabase={auth:{async getUser(){authCalls++;return {data:{user:account?{id:changeAccount&&authCalls>1?'other':account}:null},error:null};}},from(table){calls.push(table);const q={select(){return q;},eq(){return q;},single(){return q;},upsert(){return q;},then(resolve,reject){return Promise.resolve(responses[table]).then(resolve,reject);}};return q;}};
const storage=new Map();
function load(relative){const filename=path.normalize(path.join(root,relative+(relative.endsWith('.ts')?'':'.ts')));if(cache.has(filename))return cache.get(filename).exports;const module={exports:{}};cache.set(filename,module);const output=ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 vm.runInNewContext(output,{module,exports:module.exports,console,Date,Intl,localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)},crypto:{randomUUID:()=> 'qa-device'},require(name){
 if(name==='zustand')return require(path.join(root,'node_modules/zustand'));
 if(name==='zustand/middleware')return {persist:init=>init};
 if(name==='@/lib/sync/sharing-availability')return {isLegacySharingPaused:()=>false};
  if(name==='@/lib/supabase')return {supabase};
 if(name.startsWith('@/'))return load('src/'+name.slice(2));
 if(name.startsWith('.'))return load(path.relative(root,path.resolve(path.dirname(filename),name)));
 throw Error('Unexpected '+name);
 }},{filename});return module.exports;}
const service=load('src/lib/sync/sync-service'),decode=load('src/lib/sync/cloud-snapshot').decodeCloudSnapshot;
const baby=load('src/lib/store/baby-store').useBabyStore,meas=load('src/lib/store/measurement-store').useMeasurementStore,vac=load('src/lib/store/vaccination-store').useVaccinationStore;
const guard=load('src/lib/sync/cloud-import');let checks=0;
async function check(name,fn){fixture();await fn();checks++;console.log('PASS '+name);}
(async()=>{
 await check('complete snapshot preserves IDs and derives age from measurement date',async()=>{const a=await service.pullFromCloud('shared'),b=await service.pullFromCloud('shared');assert.equal(a.measurements[0].id,'m1');assert.equal(b.measurements[0].id,'m1');assert.equal(a.measurements[0].month,2);});
 for(const table of ['shared_measurements','shared_vaccinations'])await check('query failure cannot become empty '+table,async()=>{responses[table]={data:null,count:null,error:{message:'failed'}};assert.ok((await service.pullFromCloud('shared')).error);});
 await check('truncated and missing-count responses are rejected',async()=>{responses.shared_measurements.count=2;assert.ok((await service.pullFromCloud('shared')).error);responses.shared_measurements.count=null;assert.ok((await service.pullFromCloud('shared')).error);});
 await check('guest lookup does not read or register any shared data',async()=>{account=null;assert.ok((await service.joinByInviteCode('ABC234')).error);assert.equal(calls.length,0);});
 await check('failed device registration stops import',async()=>{responses.shared_devices.error={message:'denied'};assert.ok((await service.joinByInviteCode('ABC234','u1')).error);assert.equal(calls.includes('shared_measurements'),false);});
 await check('account changes during reads invalidate the result',async()=>{changeAccount=true;assert.ok((await service.pullFromCloud('shared')).error);});
 await check('a mismatched shared profile is rejected',async()=>{responses.shared_babies.data.id='foreign';assert.ok((await service.pullFromCloud('shared')).error);});
 for(const [label,edit] of [
  ['foreign records',()=>responses.shared_measurements.data[0].baby_id='foreign'],
  ['invalid calendar date',()=>responses.shared_measurements.data[0].date='2026-02-30'],
  ['duplicate measurement IDs',()=>{responses.shared_measurements.data.push({...responses.shared_measurements.data[0]});responses.shared_measurements.count=2;}],
  ['invalid measurement values',()=>responses.shared_measurements.data[0].height=-1],
  ['unknown vaccine dose',()=>responses.shared_vaccinations.data[0].dose_number=99],
  ['duplicate vaccination doses',()=>{responses.shared_vaccinations.data.push({...responses.shared_vaccinations.data[0]});responses.shared_vaccinations.count=2;}],
 ])await check(label+' fails whole snapshot',async()=>{edit();assert.ok((await service.pullFromCloud('shared')).error);});
 await check('cloud validation distinguishes the same flu dose across season boundaries',async()=>{
  const baby={...responses.shared_babies.data,birthdate:'2025-01-01'};
  const flu=completed_date=>({baby_id:baby.id,vaccine_id:'flu',dose_number:1,completed_date});
  const two=[flu('2026-08-31'),flu('2026-09-01')];
  const result=decode(baby,[],two,baby.id);
  assert.equal(result.vaccinations.length,2);
  assert.equal(result.vaccinations[0].completedDate,'2026-08-31');
  assert.equal(result.vaccinations[1].completedDate,'2026-09-01');
  assert.ok(decode(baby,[],[...two,flu('2026-09-02')],baby.id).error);
 });
 await check('valid genuinely empty server arrays remain distinguishable from failure',async()=>{responses.shared_measurements={data:[],count:0,error:null};responses.shared_vaccinations={data:[],count:0,error:null};const result=await service.pullFromCloud('shared');assert.equal(result.measurements.length,0);assert.equal(result.vaccinations.length,0);});
 await check('local edits and baby switches refuse stale imports without changing records',async()=>{
  baby.getState().addBaby({name:'A',birthdate:'2026-08-29',gender:'male'});const id=baby.getState().profile.id;
  meas.getState().addMeasurement({date:'2026-10-29',month:2,height:58.4},id);const before=guard.importFingerprint(id),snapshot=decode(responses.shared_babies.data,responses.shared_measurements.data,responses.shared_vaccinations.data);
  assert.equal(guard.importGuard(id,before,snapshot),null);
  meas.getState().addMeasurement({date:'2026-10-30',month:2,height:58.5},id);assert.ok(guard.importGuard(id,before,snapshot));assert.equal(meas.getState().measurements.length,2);
  const fresh=guard.importFingerprint(id);baby.getState().addBaby({name:'B',birthdate:'2026-08-29',gender:'female'});assert.ok(guard.importGuard(id,fresh,snapshot));assert.equal(meas.getState().measurements.length,2);
 });
 await check('empty cloud responses cannot erase nonempty local records',async()=>{
  const id=baby.getState().babies[0].id;baby.getState().setActiveBaby(id);const before=guard.importFingerprint(id),snapshot=decode(responses.shared_babies.data,[],[]);
  assert.ok(guard.importGuard(id,before,snapshot));assert.equal(meas.getState().measurements.length,2);assert.equal(vac.getState().records.length,0);
 });
 console.log(`${checks} cloud-read regression checks passed.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
