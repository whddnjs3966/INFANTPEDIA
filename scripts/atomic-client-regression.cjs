const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),ts=require(path.join(root,'node_modules/typescript')),cache=new Map();
const baby='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',request='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
let response,calls=[];
const supabase={async rpc(name,args){calls.push({name,args});if(response instanceof Error)throw response;return response;},from(){throw Error('Unsafe legacy fallback');}};
function load(relative){const filename=path.join(root,relative+'.ts');if(cache.has(filename))return cache.get(filename).exports;const module={exports:{}};cache.set(filename,module);const output=ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;vm.runInNewContext(output,{module,exports:module.exports,Date,Intl,console,require(name){if(name==='@/lib/supabase/client')return {createClient:()=>supabase};if(name.startsWith('@/'))return load('src/'+name.slice(2));throw Error(name);}},{filename});return module.exports;}
const client=load('src/lib/sync/atomic-backup');
const snapshot=()=>({baby:{id:baby,name:'Fake',birthdate:'2026-08-29',gender:'male'},measurements:[{id:'stable-m',date:'2026-10-29',month:2,height:58.4,memo:'local only'}],vaccinations:[{vaccineId:'hepb',doseNumber:1,completedDate:'2026-10-29'}]});
const receipt=rev=>({data:{baby_id:baby,revision:rev,request_id:request},error:null});
let checks=0;
async function check(name,action){calls=[];response=receipt(1);await action();checks++;console.log('PASS '+name);}
(async()=>{
 await check('unknown or invalid base revision never sends a write',async()=>{for(const rev of [undefined,null,-1,0.5,NaN,2147483647])assert.equal((await client.writeAtomicBackup(baby,rev,request,snapshot())).kind,'invalid');assert.equal(calls.length,0);});
 await check('write uses one RPC and sends only the supported snapshot fields',async()=>{assert.equal((await client.writeAtomicBackup(baby,0,request,snapshot())).revision,1);assert.equal(calls.length,1);assert.equal(calls[0].name,'write_backup_snapshot');assert.equal(calls[0].args.p_payload.measurements[0].id,'stable-m');assert.equal('memo' in calls[0].args.p_payload.measurements[0],false);});
 await check('UUID case does not invalidate a valid acknowledgement',async()=>{assert.equal((await client.writeAtomicBackup(baby.toUpperCase(),0,request.toUpperCase(),snapshot())).revision,1);assert.equal(calls[0].args.p_baby_id,baby);});
 await check('conflict returns without retrying or changing the expected revision',async()=>{response={data:null,error:{code:'40001'}};assert.equal((await client.writeAtomicBackup(baby,0,request,snapshot())).kind,'conflict');assert.equal(calls.length,1);assert.equal(calls[0].args.p_expected_revision,0);});
 await check('an unavailable RPC never falls back to legacy delete/insert',async()=>{response={data:null,error:{code:'PGRST202'}};assert.equal((await client.writeAtomicBackup(baby,0,request,snapshot())).kind,'unavailable');assert.equal(calls.length,1);});
 await check('an uncertain network result retains the request identity for caller retry',async()=>{response=Error('offline');assert.equal((await client.writeAtomicBackup(baby,0,request,snapshot())).kind,'network');response=receipt(1);assert.equal((await client.writeAtomicBackup(baby,0,request,snapshot())).revision,1);assert.equal(calls[0].args.p_request_id,calls[1].args.p_request_id);});
 await check('a mismatched acknowledgement is never treated as success',async()=>{for(const data of [{baby_id:baby,revision:9,request_id:request},{baby_id:request,revision:1,request_id:request},{baby_id:baby,revision:1,request_id:baby}]){response={data,error:null};assert.equal((await client.writeAtomicBackup(baby,0,request,snapshot())).kind,'invalid');}});
 await check('invalid local records never reach the RPC',async()=>{const value=snapshot();value.measurements[0].height=-1;assert.equal((await client.writeAtomicBackup(baby,0,request,value)).kind,'invalid');assert.equal(calls.length,0);});
 await check('read validates the complete snapshot and its version',async()=>{const value=snapshot();response={data:{baby_id:baby,revision:4,payload:{baby:value.baby,measurements:[{id:'m1',baby_id:baby,date:'2026-10-29',month:2,height:58.4}],vaccinations:[]}},error:null};const result=await client.readAtomicBackup(baby);assert.equal(result.revision,4);assert.equal(result.snapshot.measurements[0].id,'m1');response.data.payload.measurements[0].baby_id=request;assert.equal((await client.readAtomicBackup(baby)).kind,'invalid');});
 await check('influenza dates survive RPC serialization and decoding without a new payload field',async()=>{
  const value=snapshot();
  value.baby.birthdate='2025-01-01';
  value.vaccinations=['2025-10-12','2026-10-14'].map(completedDate=>({vaccineId:'flu',doseNumber:1,completedDate}));
  assert.equal((await client.writeAtomicBackup(baby,0,request,value)).revision,1);
  const payload=calls[0].args.p_payload;
  assert.equal(payload.vaccinations.length,2);
  assert.equal(Object.keys(payload.vaccinations[0]).sort().join(','),'baby_id,completed_date,dose_number,vaccine_id');
  response={data:{baby_id:baby,revision:1,payload},error:null};
  const result=await client.readAtomicBackup(baby);
  assert.equal(JSON.stringify(result.snapshot.vaccinations),JSON.stringify(value.vaccinations));
 });
 await check('missing membership is returned as permission denial',async()=>{response={data:null,error:{code:'42501'}};assert.equal((await client.readAtomicBackup(baby)).kind,'permission');});
 await check('account-bound automatic writes use the guarded RPC',async()=>{await client.writeAtomicBackup(baby,0,request,snapshot(),'11111111-1111-4111-8111-111111111111');assert.equal(calls[0].name,'write_backup_snapshot_for_account');assert.equal(calls[0].args.p_expected_user_id,'11111111-1111-4111-8111-111111111111');});
 console.log(`${checks} atomic client checks passed (mock RPC, no production writes).`);
})().catch(error=>{console.error(error);process.exitCode=1;});
