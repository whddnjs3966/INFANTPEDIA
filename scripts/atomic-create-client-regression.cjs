const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),ts=require(path.join(root,'node_modules/typescript')),cache=new Map();
const id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',request='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
let calls=[],response,checks=0;
const supabase={async rpc(name,args){calls.push({name,args});if(response instanceof Error)throw response;return response;},from(){throw Error('Legacy fallback forbidden');}};
function load(relative){const file=path.join(root,relative+'.ts');if(cache.has(file))return cache.get(file).exports;const module={exports:{}};cache.set(file,module);const out=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;vm.runInNewContext(out,{module,exports:module.exports,Date,Intl,console,require(name){if(name==='@/lib/supabase/client')return{createClient:()=>supabase};if(name.startsWith('@/'))return load('src/'+name.slice(2));throw Error(name);}},{filename:file});return module.exports;}
const create=load('src/lib/sync/atomic-backup').createAtomicBackup;
const snapshot=()=>({baby:{id,name:'Fake',birthdate:'2026-08-29',gender:'male'},measurements:[{id:'m1',date:'2026-10-29',month:2,height:58,memo:'private'}],vaccinations:[]});
async function check(name,fn){calls=[];response={data:{baby_id:id,request_id:request},error:null};await fn();checks++;console.log('PASS '+name);}
(async()=>{
 await check('one authenticated-browser RPC with no client owner or private memo',async()=>{const result=await create(id,request,snapshot());assert.equal(result.sharedBabyId,id);assert.equal('revision' in result,false);assert.equal(calls.length,1);assert.equal(calls[0].name,'create_backup_snapshot');assert.equal(Object.keys(calls[0].args).length,3);assert.equal('memo' in calls[0].args.p_payload.measurements[0],false);});
 await check('registration pins the expected account for server comparison',async()=>{await create(id,request,snapshot(),'11111111-1111-4111-8111-111111111111');assert.equal(calls[0].args.p_expected_user_id,'11111111-1111-4111-8111-111111111111');});
 await check('invalid IDs and local records are refused before sending',async()=>{assert.equal((await create('bad',request,snapshot())).kind,'invalid');const p=snapshot();p.measurements[0].height=-1;assert.equal((await create(id,request,p)).kind,'invalid');assert.equal(calls.length,0);});
 await check('foreign baby cannot be silently relabeled',async()=>{const p=snapshot();p.baby.id=request;assert.equal((await create(id,request,p)).kind,'invalid');assert.equal(calls.length,0);});
 await check('UUID case is normalized',async()=>{assert.equal((await create(id.toUpperCase(),request.toUpperCase(),snapshot())).sharedBabyId,id);});
 await check('uncertain response permits exact caller retry without new identities',async()=>{response=Error('timeout');assert.equal((await create(id,request,snapshot())).kind,'network');response={data:{baby_id:id,request_id:request},error:null};await create(id,request,snapshot());assert.deepEqual(calls[0],calls[1]);});
 await check('missing RPC and denied permission never fall back to legacy',async()=>{for(const [code,kind] of [['PGRST202','unavailable'],['42501','permission'],['23505','invalid']]){response={data:null,error:{code}};assert.equal((await create(id,request,snapshot())).kind,kind);}assert.equal(calls.length,3);});
 await check('mismatched receipts are refused',async()=>{for(const data of [null,{baby_id:request,request_id:request},{baby_id:id,request_id:id}]){response={data,error:null};assert.equal((await create(id,request,snapshot())).kind,'invalid');}});
 console.log(`${checks} atomic creation client checks passed (mock RPC).`);
})().catch(e=>{console.error(e);process.exitCode=1;});
