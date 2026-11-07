// Actual stores and registration runner with isolated storage/auth/RPC fixtures.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),ts=require(path.join(root,'node_modules/typescript')),cache=new Map(),memory=new Map();
const user='11111111-1111-4111-8111-111111111111';
let autobackup=true,account=user,enabled=true,calls=[],authCalls=0,onCreate,onRead,failStorage=false,checks=0,onWrite,writeCalls=[],remoteSnapshot,remoteRevision=3;
const storage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>{if(failStorage)throw Error('quota');memory.set(k,v);},removeItem:k=>memory.delete(k)};
const auth={auth:{async getUser(){authCalls++;return{data:{user:account?{id:account}:null},error:null};}}};
let counter=0;
function load(relative){const file=path.join(root,relative+'.ts');if(cache.has(file))return cache.get(file).exports;const module={exports:{}};cache.set(file,module);const out=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;vm.runInNewContext(out,{module,exports:module.exports,console,Date,Intl,Set,localStorage:storage,crypto:{randomUUID:()=>`aaaaaaaa-aaaa-4aaa-8aaa-${String(++counter).padStart(12,'0')}`},process:{env:{get NEXT_PUBLIC_ATOMIC_AUTOBACKUP_ENABLED(){return autobackup?'true':'false';},get NEXT_PUBLIC_ATOMIC_REGISTRATION_ENABLED(){return enabled?'true':'false';}}},require(name){
 if(name==='zustand')return require(path.join(root,'node_modules/zustand'));
 if(name==='zustand/middleware'){const m=require(path.join(root,'node_modules/zustand/middleware'));return{persist:(init,options)=>m.persist(init,{...options,storage:m.createJSONStorage(()=>storage)})};}
 if(name==='@/lib/supabase/client')return{createClient:()=>auth};
 if(name==='@/lib/sync/atomic-backup')return{
  async createAtomicBackup(id,request,snapshot,expected){calls.push({id,request,snapshot:JSON.parse(JSON.stringify(snapshot)),expected});if(onCreate)return onCreate();return{sharedBabyId:id,requestId:request};},
  async writeAtomicBackup(id,revision,request,snapshot,expected){writeCalls.push({id,revision,request,snapshot:JSON.parse(JSON.stringify(snapshot)),expected});if(onWrite)return onWrite();remoteSnapshot=JSON.parse(JSON.stringify(snapshot));remoteRevision=revision+1;return{revision:remoteRevision};},
  async readAtomicBackup(){if(onRead)return onRead();return{snapshot:remoteSnapshot??calls.at(-1).snapshot,revision:remoteRevision};}
 };
 if(name.startsWith('@/'))return load('src/'+name.slice(2));
 if(name.startsWith('.'))return load(path.relative(root,path.resolve(path.dirname(file),name)));
 throw Error(name);
}},{filename:file});return module.exports;}
const baby=load('src/lib/store/baby-store').useBabyStore,meas=load('src/lib/store/measurement-store').useMeasurementStore,vac=load('src/lib/store/vaccination-store').useVaccinationStore,sync=load('src/lib/store/sync-store').useSyncStore;
const connections=load('src/lib/store/atomic-connection-store').useAtomicConnectionStore;
const register=load('src/lib/sync/register-local-backup').registerLocalBackup;
const reviewApi=load('src/lib/sync/review-registration');
function fixture(){autobackup=true;failStorage=false;account=user;enabled=true;calls=[];authCalls=0;onCreate=null;onRead=null;onWrite=null;writeCalls=[];remoteSnapshot=null;remoteRevision=3;
 const profile={id:'A',name:'Fake A',birthdate:'2026-08-29',gender:'male'};
 baby.setState({babies:[profile,{...profile,id:'B'}],profile,activeBabyId:'A',legacyOwnerId:'A',legacyOwnershipChecked:true,babyPhotos:{A:'local-photo'}});
 meas.setState({measurements:[{id:'m1',babyId:'A',height:58,date:'2026-10-29',month:2,memo:'private memo'},{id:'m2',babyId:'B',height:60,date:'2026-10-29',month:2}]});vac.setState({records:[]});
 sync.setState({mappings:[],lastSyncAt:null});connections.setState({pending:[],connections:[],reviewWrites:[]});
}
async function check(name,fn){fixture();await fn();checks++;console.log('PASS '+name);}
function local(){return JSON.stringify([baby.getState(),meas.getState(),vac.getState(),sync.getState()]);}
const transfer=load('src/lib/store/atomic-transfer-store').useAtomicTransferStore;
const runtime=load('src/lib/store/atomic-transfer-store').useAtomicTransferRuntime;
const keyFor=load('src/lib/store/atomic-transfer-store').transferKey;
const run=load('src/lib/sync/run-atomic-backup').runAtomicBackup;
let key;
async function setup(){
 transfer.setState({outbox:{},conflicts:{}});runtime.setState({statuses:{},retries:{}});
 await register(user,'A');const c=connections.getState().connections[0];remoteSnapshot=JSON.parse(JSON.stringify(c.snapshot));remoteRevision=c.revision;
 connections.setState({connections:[{...c,autoBackupEnabled:true}]});
 key=keyFor(user,'A',c.sharedBabyId,c.requestId);writeCalls=[];
 meas.setState({measurements:meas.getState().measurements.map(m=>m.babyId==='A'?{...m,height:59}:m)});
}
(async()=>{
 await check('rollout off never sends an automatic write',async()=>{await setup();autobackup=false;await run(user,'A');assert.equal(writeCalls.length,0);});
 await check('per-baby opt-in is required',async()=>{await setup();connections.setState({connections:connections.getState().connections.map(c=>({...c,autoBackupEnabled:false}))});await run(user,'A');assert.equal(writeCalls.length,0);});
 await check('a changed profile and records commit with the accepted base and pinned account',async()=>{await setup();const before=local();await run(user,'A');assert.equal(local(),before);assert.equal(writeCalls.length,1);assert.equal(writeCalls[0].revision,3);assert.equal(writeCalls[0].expected,user);assert.equal(connections.getState().connections[0].revision,4);assert.equal(connections.getState().connections[0].snapshot.measurements[0].height,59);assert.equal(runtime.getState().statuses[key].phase,'success');assert.equal(transfer.getState().outbox[key],undefined);});
 await check('uncertain response retains the request across reload and retries unchanged',async()=>{await setup();onWrite=()=>({error:'offline',kind:'network'});await run(user,'A');const first=writeCalls[0];assert.equal(runtime.getState().statuses[key].phase,'error');await transfer.persist.rehydrate();onWrite=null;await run(user,'A');assert.deepEqual(writeCalls[1],first);});
 await check('new local edits never replace an uncertain request payload',async()=>{await setup();onWrite=()=>({error:'offline',kind:'network'});await run(user,'A');const request=writeCalls[0];meas.setState({measurements:meas.getState().measurements.map(m=>m.babyId==='A'?{...m,height:60}:m)});onWrite=null;await run(user,'A');assert.deepEqual(writeCalls[1],request);assert.equal(runtime.getState().statuses[key].phase,'checking');await run(user,'A');assert.equal(writeCalls[2].revision,4);assert.equal(writeCalls[2].snapshot.measurements[0].height,60);assert.notEqual(writeCalls[2].request,request.request);});
 await check('conflict persists and stops further writes after edits or retries',async()=>{await setup();onWrite=()=>({error:'conflict',kind:'conflict'});await run(user,'A');assert.equal(transfer.getState().conflicts[key],true);await transfer.persist.rehydrate();onWrite=null;await run(user,'A');transfer.getState().retry(key);assert.equal(writeCalls.length,1);assert.equal(runtime.getState().retries[key],undefined);});
 await check('conflict comparison resolves on the latest server version and clears only this outbox',async()=>{await setup();onWrite=()=>({error:'conflict',kind:'conflict'});await run(user,'A');onWrite=null;remoteRevision=5;const preview=await reviewApi.reviewRegistration(user,'A');assert.equal(preview.error,undefined);assert.equal(preview.revision,5);assert.equal((await reviewApi.applyRegistrationReview(preview)).error,undefined);assert.equal(connections.getState().connections[0].revision,6);assert.equal(connections.getState().connections[0].autoBackupEnabled,true);assert.equal(transfer.getState().conflicts[key],undefined);assert.equal(transfer.getState().outbox[key],undefined);});
 await check('same local baseline is checked by reading, without a new write',async()=>{await setup();meas.setState({measurements:meas.getState().measurements.map(m=>m.babyId==='A'?{...m,height:58}:m)});await run(user,'A');assert.equal(writeCalls.length,0);assert.equal(runtime.getState().statuses[key].phase,'success');remoteRevision=4;await run(user,'A');assert.equal(transfer.getState().conflicts[key],true);});
 await check('a changed account before starting never uploads',async()=>{await setup();account='other';await run(user,'A');assert.equal(writeCalls.length,0);});
 await check('account change during a write leaves its receipt pending',async()=>{await setup();onWrite=()=>{account='other';return{revision:4};};await run(user,'A');assert.equal(connections.getState().connections[0].revision,3);assert.ok(transfer.getState().outbox[key]);});
 await check('switching babies during a write never updates another baseline',async()=>{await setup();onWrite=()=>{baby.setState({profile:baby.getState().babies[1],activeBabyId:'B'});return{revision:4};};await run(user,'A');assert.equal(connections.getState().connections[0].revision,3);assert.ok(transfer.getState().outbox[key]);});
 await check('storage failure before transmission makes zero writes',async()=>{await setup();failStorage=true;await run(user,'A');assert.equal(writeCalls.length,0);assert.equal(runtime.getState().statuses[key].phase,'error');failStorage=false;await run(user,'A');assert.equal(writeCalls.length,1);});
 await check('baseline persistence failure restores the old baseline and exact pending request',async()=>{await setup();onWrite=()=>{failStorage=true;return{revision:4};};await run(user,'A');assert.equal(connections.getState().connections[0].revision,3);const request=transfer.getState().outbox[key];assert.equal(request.requestId,writeCalls[0].request);failStorage=false;onWrite=null;await run(user,'A');assert.equal(writeCalls[1].request,request.requestId);});
 await check('double automatic invocations serialize to a single write',async()=>{await setup();let release,started;const gate=new Promise(r=>release=r),ready=new Promise(r=>started=r);onWrite=()=>{started();return gate;};const pending=run(user,'A');await ready;await run(user,'A');release({revision:4});await pending;assert.equal(writeCalls.length,1);});
 await check('turning backup off during transmission does not accept a late receipt',async()=>{await setup();onWrite=()=>{connections.setState({connections:connections.getState().connections.map(c=>({...c,autoBackupEnabled:false}))});return{revision:4};};await run(user,'A');assert.equal(connections.getState().connections[0].revision,3);assert.ok(transfer.getState().outbox[key]);});
 await check('new legacy mapping blocks automatic writes',async()=>{await setup();sync.getState().addMapping({localBabyId:'A',sharedBabyId:'old',inviteCode:'ABC234'});await run(user,'A');assert.equal(writeCalls.length,0);});
 console.log(`${checks} atomic automatic-backup checks passed (isolated storage/auth/RPC).`);
})().catch(e=>{console.error(e);process.exitCode=1;});
