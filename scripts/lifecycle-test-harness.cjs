const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),ts=require(path.join(root,'node_modules/typescript'));
const accountId='11111111-1111-4111-8111-111111111111',remoteId='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';let checks=0;
function harness(){
 const cache=new Map(),memory=new Map();let enabled=true,account=accountId,onRead,onAuth,onRpc,failAt=0,writes=0,persistentFailure=false,calls=[],counter=0;
 const storage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>{if(persistentFailure||++writes===failAt)throw Error('quota');memory.set(k,v);},removeItem:k=>memory.delete(k)};
 const summary={baby_id:remoteId,name:'Cloud',birthdate:'2026-08-29',gender:'male',revision:4,role:'owner'};
 let snapshot={baby:{id:remoteId,name:'Cloud',birthdate:'2026-08-29',gender:'male'},measurements:[{id:'cloud-m1',date:'2026-10-29',month:2,height:58}],vaccinations:[]},revision=4,page={items:[summary],next_cursor:null};
 const auth={auth:{async getUser(){if(onAuth)onAuth();return{data:{user:account?{id:account}:null},error:null};}},async rpc(name,args){calls.push({name,args});return onRpc?onRpc(name,args):{data:page,error:null};}};
 function load(relative){const file=path.join(root,relative+'.ts');if(cache.has(file))return cache.get(file).exports;const module={exports:{}};cache.set(file,module);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;vm.runInNewContext(code,{module,exports:module.exports,console,Date,Intl,Set,localStorage:storage,crypto:{randomUUID:()=>`bbbbbbbb-bbbb-4bbb-8bbb-${String(++counter).padStart(12,'0')}`},process:{env:{NEXT_PUBLIC_BACKUP_LIFECYCLE_ENABLED:"true",get NEXT_PUBLIC_ATOMIC_REGISTRATION_ENABLED(){return enabled?'true':'false';}}},require(name){
  if(name==='zustand')return require(path.join(root,'node_modules/zustand'));
  if(name==='zustand/middleware'){const m=require(path.join(root,'node_modules/zustand/middleware'));return{persist:(init,opts)=>m.persist(init,{...opts,storage:m.createJSONStorage(()=>storage)})};}
  if(name==='@/lib/supabase/client')return{createClient:()=>auth};
  if(name==='@/lib/sync/atomic-backup')return{async readAtomicBackup(){calls.push({name:'read'});if(onRead)return onRead();return{snapshot:JSON.parse(JSON.stringify(snapshot)),revision};}};
  if(name.startsWith('@/'))return load('src/'+name.slice(2));if(name.startsWith('.'))return load(path.relative(root,path.resolve(path.dirname(file),name)));throw Error(name);
 }},{filename:file});return module.exports;}
 const baby=load('src/lib/store/baby-store').useBabyStore,meas=load('src/lib/store/measurement-store').useMeasurementStore,vac=load('src/lib/store/vaccination-store').useVaccinationStore,connections=load('src/lib/store/atomic-connection-store').useAtomicConnectionStore;
 const p={id:'local-A',name:'Local',birthdate:'2026-08-29',gender:'female'};
 baby.setState({babies:[p],profile:p,activeBabyId:p.id,legacyOwnerId:p.id,legacyOwnershipChecked:true,babyPhotos:{'local-A':'local-photo'}});meas.setState({measurements:[{id:'local-m1',babyId:p.id,date:'2026-10-29',month:2,height:57,memo:'private memo'}]});vac.setState({records:[{babyId:p.id,vaccineId:'hepb',doseNumber:1,completedDate:'2026-10-29'}]});
 const api=load('src/lib/sync/restore-account-backup'),journal=load('src/lib/sync/local-restore-journal');
 return{load,api,journal,baby,meas,vac,connections,memory,summary,calls,storage,set enabled(v){enabled=v;},set account(v){account=v;},set onRead(v){onRead=v;},set onRpc(v){onRpc=v;},set onAuth(v){onAuth=v;},set revision(v){revision=v;},set page(v){page=v;},snapshot,set failAfter(v){failAt=writes+v;},set persistentFailure(v){persistentFailure=v;},disk:()=>JSON.stringify([...memory]),local:()=>JSON.stringify([baby.getState(),meas.getState(),vac.getState(),connections.getState()])};
}

module.exports={harness,accountId,remoteId};
