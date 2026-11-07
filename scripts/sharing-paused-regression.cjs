// Production pause policy, actual stores and runner; fake data, no network.
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const root = path.resolve(__dirname, '..'), ts = require(path.join(root, 'node_modules/typescript'));
const cache = new Map(), memory = new Map();
let networkCalls = 0, checks = 0;
const storage = { getItem:k=>memory.get(k)??null, setItem:(k,v)=>memory.set(k,v), removeItem:k=>memory.delete(k) };
function load(relative) {
  const filename = path.join(root, relative+'.ts');
  if (cache.has(filename)) return cache.get(filename).exports;
  const module = {exports:{}}; cache.set(filename,module);
  const output = ts.transpileModule(fs.readFileSync(filename,'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
  vm.runInNewContext(output, {module,exports:module.exports,console,Date,Intl,require(name){
    if(name==='zustand') return require(path.join(root,'node_modules/zustand'));
    if(name==='zustand/middleware') {
      const middleware=require(path.join(root,'node_modules/zustand/middleware'));
      return {persist:(init,options)=>middleware.persist(init,{...options,storage:middleware.createJSONStorage(()=>storage)})};
    }
    if(name==='@/lib/supabase') return {supabase:new Proxy({}, {get(){networkCalls++;throw Error('NETWORK_MUST_NOT_RUN');}})};
    if(name.startsWith('@/')) return load('src/'+name.slice(2));
    if(name.startsWith('.')) return load(path.relative(root,path.resolve(path.dirname(filename),name)));
    throw Error('Unexpected import '+name);
  }},{filename}); return module.exports;
}
const service=load('src/lib/sync/sync-service');
const sync=load('src/lib/store/sync-store').useSyncStore;
const backup=load('src/lib/store/backup-store').useBackupStore;
const baby=load('src/lib/store/baby-store').useBabyStore;
const measurements=load('src/lib/store/measurement-store').useMeasurementStore;
const vaccinations=load('src/lib/store/vaccination-store').useVaccinationStore;
const disconnect=load('src/lib/sync/disconnect-sharing').disconnectSharing;
const run=load('src/lib/sync/run-backup').runBackup;
const profile={id:'A',name:'Fake A',gender:'male',birthdate:'2026-08-29'};
function fixture() {
  sync.setState({mappings:[{localBabyId:'A',sharedBabyId:'remote-A',inviteCode:'ABC234'},{localBabyId:'B',sharedBabyId:'remote-B',inviteCode:'DEF567'}],lastSyncAt:'2026-11-01T00:00:00Z'});
  baby.setState({profile,babies:[profile,{...profile,id:'B'}],activeBabyId:'A',babyPhotos:{A:'fake-photo'}});
  measurements.setState({measurements:[{id:'m1',babyId:'A',height:58,date:'2026-10-30',month:2,memo:'fake memo'}]});
  vaccinations.setState({records:[{babyId:'A',vaccineId:'hepb',doseNumber:1,completedDate:'2026-10-30'}]});
  backup.setState({byBaby:{},retries:{}});
}
async function check(name,fn){fixture();await fn();checks++;console.log('PASS '+name);}
(async()=>{
  for(const [name,fn] of [
    ['share',()=>service.shareBaby(profile,[],[])],
    ['join',()=>service.joinByInviteCode('ABC234','account')],
    ['push',()=>service.pushToCloud('remote-A',profile,[],[])],
    ['pull',()=>service.pullFromCloud('remote-A')],
  ]) await check(name+' is paused before auth, storage or network',async()=>{const result=await fn();assert.ok(result.error);assert.equal(networkCalls,0);});
  await check('disconnect preserves every profile, photo and local record',()=>{
    const before=JSON.stringify([baby.getState(),measurements.getState(),vaccinations.getState()]);
    assert.equal(disconnect('A','remote-A'),true);
    assert.equal(JSON.stringify([baby.getState(),measurements.getState(),vaccinations.getState()]),before);
    assert.equal(sync.getState().getMapping('A'),undefined);
    assert.equal(sync.getState().getMapping('B').sharedBabyId,'remote-B');
    assert.equal(sync.getState().lastSyncAt,null);
    const persisted=JSON.parse(memory.get('baby-sync')).state;
    assert.equal(persisted.mappings.length,1);assert.equal(persisted.mappings[0].localBabyId,'B');
  });
  await check('a stale confirmation cannot remove a newer connection',()=>{
    sync.getState().addMapping({localBabyId:'A',sharedBabyId:'new-target',inviteCode:'NEW234'});
    assert.equal(disconnect('A','remote-A'),false);assert.equal(sync.getState().getMapping('A').sharedBabyId,'new-target');
  });
  await check('switching babies refuses the old confirmation',()=>{
    baby.setState({profile:{...profile,id:'B'},activeBabyId:'B'});
    assert.equal(disconnect('A','remote-A'),false);assert.equal(sync.getState().mappings.length,2);
  });
  await check('repeated disconnect is harmless',()=>{
    assert.equal(disconnect('A','remote-A'),true);assert.equal(disconnect('A','remote-A'),false);assert.equal(networkCalls,0);
  });
  await check('queued backup is invalidated when its mapping is detached',async()=>{
    const token=backup.getState().queue('A','account','remote-A');let uploads=0;
    disconnect('A','remote-A');
    const ok=await run({babyId:'A',token,authenticate:async()=>true,upload:async()=>{uploads++;return{};},stillConnected:()=>!!sync.getState().getMapping('A')});
    assert.equal(ok,false);assert.equal(uploads,0);assert.notEqual(backup.getState().byBaby.A.token,token);
  });
  await check('late upload response cannot mark a detached baby successful',async()=>{
    const token=backup.getState().queue('A','account','remote-A');let release,started;
    const startedPromise=new Promise(r=>started=r),response=new Promise(r=>release=r);
    const pending=run({babyId:'A',token,authenticate:async()=>true,upload:()=>{started();return response;},stillConnected:()=>!!sync.getState().getMapping('A')});
    await startedPromise;disconnect('A','remote-A');release({});
    assert.equal(await pending,false);assert.equal(backup.getState().byBaby.A.phase,'idle');assert.equal(backup.getState().byBaby.A.lastSuccessAt,undefined);
  });
  console.log(`${checks} paused-sharing regression checks passed.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
