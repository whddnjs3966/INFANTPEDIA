// Uses the actual navigation store with isolated in-memory session storage.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const ts = require(path.join(root, 'node_modules/typescript'));
function load(relative, storage) {
  const filename = path.join(root, relative);
  const module = {exports:{}};
  const output = ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
  vm.runInNewContext(output,{module,exports:module.exports,URL,URLSearchParams,console,sessionStorage:storage,require(name){
    if(name==='zustand'||name==='zustand/middleware')return require(path.join(root,'node_modules',name));
    throw new Error('Unexpected import: '+name);
  }},{filename});
  return module.exports;
}
const data = new Map();
const storage = {getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value),removeItem:key=>data.delete(key)};
const store = load('src/lib/store/reading-store.ts',storage).useReadingStore;
const navigate = load('src/lib/utils/guide-navigation.ts',storage).guideReturnHref;
let checks=0;
function check(name,run){run();checks++;console.log('PASS '+name);}
check('reader state separates baby, age and topic',()=>{
  store.getState().setValue('encyclopedia:A:2:sleep','accordion:issue',true);
  store.getState().setPosition('encyclopedia:A:2:sleep',{top:1300,anchor:'accordion:issue',offset:-20});
  store.getState().setValue('encyclopedia:A:3:sleep','accordion:issue',false);
  store.getState().setValue('encyclopedia:B:2:sleep','accordion:issue',false);
  store.getState().setPosition('encyclopedia:A:2:feeding',{top:450});
  assert.equal(store.getState().views['encyclopedia:A:2:sleep'].values['accordion:issue'],true);
  assert.equal(store.getState().views['encyclopedia:A:2:sleep'].top,1300);
  assert.equal(store.getState().views['encyclopedia:B:2:sleep'].values['accordion:issue'],false);
});
check('returning to the top clears an old anchor',()=>{
  store.getState().setPosition('encyclopedia:A:2:sleep',{top:0});
  assert.equal(store.getState().views['encyclopedia:A:2:sleep'].anchor,undefined);
  assert.equal(store.getState().views['encyclopedia:A:2:sleep'].values['accordion:issue'],true);
});
check('disclosures and filters survive a fresh store in the same session',()=>{
  store.getState().setValue('health:A:2','health:query','수유');
  store.getState().setValue('health:A:2','health:groups',{info:true});
  store.getState().setPosition('health:A:2',{top:1000,anchor:'faq:1',offset:24});
  const restored=load('src/lib/store/reading-store.ts',storage).useReadingStore.getState();
  assert.equal(restored.views['health:A:2'].values['health:query'],'수유');
  assert.equal(restored.views['health:A:2'].values['health:groups'].info,true);
  assert.equal(restored.views['health:A:2'].offset,24);
});
check('a different browser session starts without reading history',()=>{
  const empty=load('src/lib/store/reading-store.ts',{getItem:()=>null,setItem(){},removeItem(){}}).useReadingStore;
  assert.equal(Object.keys(empty.getState().views).length,0);
});
check('the session cache evicts old views and retains recently used views',()=>{
  for(let i=0;i<80;i++)store.getState().setPosition('view:'+i,{top:i});
  store.getState().setValue('view:0','open',true);
  store.getState().setPosition('view:80',{top:80});
  assert.equal(Object.keys(store.getState().views).length,80);
  assert.equal(store.getState().views['view:1'],undefined);
  assert.equal(store.getState().views['view:0'].values.open,true);
});
check('invalid persisted positions and values are sanitized',()=>{
  data.set('infantpedia-reading-session-v1',JSON.stringify({state:{views:{bad:{top:-12,anchor:'x',offset:'wrong',values:{open:'x'.repeat(301),groups:{x:'wrong'},valid:true}}}},version:0}));
  const restored=load('src/lib/store/reading-store.ts',storage).useReadingStore.getState();
  assert.equal(restored.views.bad.top,0);
  assert.equal(restored.views.bad.anchor,undefined);
  assert.equal(restored.views.bad.values.open,undefined);
  assert.equal(restored.views.bad.values.groups,undefined);
  assert.equal(restored.views.bad.values.valid,true);
});
check('malformed session JSON does not prevent using the app',()=>{
  data.set('infantpedia-reading-session-v1','{not json');
  const fresh=load('src/lib/store/reading-store.ts',storage).useReadingStore;
  fresh.getState().setValue('reader','open',true);
  assert.equal(fresh.getState().views.reader.values.open,true);
});
check('blocked browser storage retains in-memory reading controls',()=>{
  const unavailable={getItem(){throw Error("blocked");},setItem(){throw Error("quota");},removeItem(){throw Error("blocked");}};
  const memory=load("src/lib/store/reading-store.ts",unavailable).useReadingStore;
  memory.getState().setValue("reader","open",true);
  assert.equal(memory.getState().views.reader.values.open,true);
});
check('a valid guide return keeps age, topic and article',()=>{
  assert.equal(navigate('/encyclopedia?tab=sleep&month=2'),'/encyclopedia?tab=sleep&month=2');
  assert.equal(navigate('/encyclopedia?month=12&tab=encyclopedia&entry=42&unknown=1'),'/encyclopedia?tab=encyclopedia&month=12&entry=42');
});
check('external and invalid return destinations are rejected',()=>{
  for(const href of ['https://example.com/encyclopedia?tab=sleep&month=2','//example.com/encyclopedia?tab=sleep&month=2','/settings?tab=sleep&month=2','/encyclopedia?tab=unknown&month=2','/encyclopedia?tab=sleep&month=13','javascript:alert(1)'])assert.equal(navigate(href),undefined);
});
console.log(`${checks} navigation regression checks passed.`);
