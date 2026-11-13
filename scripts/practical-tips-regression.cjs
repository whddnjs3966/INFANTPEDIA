const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const root=process.env.INFANTPEDIA_TEST_ROOT||path.resolve(__dirname,'..'),ts=require(path.join(root,'node_modules/typescript')),cache=new Map();let count=0;
function query(){const q={select(){return q},eq(){return q},or(){return q},limit(){return q},abortSignal(){return q},then(resolve,reject){return Promise.resolve({data:[],error:null}).then(resolve,reject)}};return q}
function load(rel){const file=path.resolve(root,rel+'.ts');if(cache.has(file))return cache.get(file).exports;const m={exports:{}};cache.set(file,m);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;vm.runInNewContext(code,{module:m,exports:m.exports,console,Intl,Date,Set,Map,URL,URLSearchParams,AbortController,DOMException,setTimeout,clearTimeout,process:{env:{NODE_ENV:'test'}},require(n){if(n==='../supabase')return{supabase:{from:query}};if(n.startsWith('@/'))return load('src/'+n.slice(2));if(n.startsWith('.'))return load(path.relative(root,path.resolve(path.dirname(file),n)));throw Error(n)}},{filename:file});return m.exports}
async function check(name,fn){await fn();count++;console.log('PASS '+name)}
(async()=>{const p=load('src/lib/data/practical-tips-data'),r=load('src/lib/utils/reviewed-public-content'),rev=load('src/lib/data/parenting-tip-revisions').parentingTipRevisions,d=load('src/lib/data/daily-tips-data'),s=load('src/lib/data/daily-schedule-data'),api=load('src/lib/queries/months');
await check('30 practical topics have unique identities, an action and an explicit caution',()=>{assert.equal(p.practicalTips.length,30);assert.equal(new Set(p.practicalTips.map(t=>t.key)).size,30);for(const t of p.practicalTips){assert.equal(t.steps.length,2);assert.ok(t.takeaway&&t.caution);assert.ok(t.minMonth>=0&&t.minMonth<=12);for(const k of t.sourceKeys)assert.ok(p.tipSources[k].url.startsWith('https://'));}});
await check('every medical or safety topic carries source links without an approval workflow; life organization is labeled separately',()=>{for(const t of p.practicalTips){const e=p.practicalEvidence(t);if(t.key==='bag'){assert.equal(e,undefined);continue}assert.ok(e.sources.length);assert.equal('review' in e,false);assert.equal(e.checkedOn,'2026-11-06');}});
await check('all 104 captured DB rows are covered by an exact editorial signature',()=>{const rows=JSON.parse(fs.readFileSync(path.join(root,'docs/audits/2026-11-04/content/live-parenting_tips.json'))).rows;assert.equal(rev.length,104);assert.equal(new Set(rev.map(r=>r.id)).size,104);for(const row of rows){const revised=r.reviewedPublicContent('parenting_tips',row);assert.notEqual(revised.content,row.content,'row '+row.id);assert.ok(row.id===12||revised.practical,'row '+row.id);if(row.id!==12)assert.equal(revised.content,p.practicalContent(revised.practical));}});
await check('future server edits and mismatched title, month or category never inherit an old review',()=>{for(const item of rev.filter(r=>r.id!==12)){const row={id:item.id,month_id:item.month,category:item.category,title:item.beforeTitle,content:item.before};for(const change of [{content:'새로운 원문'},{title:'새 제목'},{month_id:99},{category:'future'}]){const result=r.reviewedPublicContent('parenting_tips',{...row,...change});assert.equal(result.practical,undefined);assert.equal(result.evidence,undefined);}}});
await check('all 13 monthly sets contain eight tips in four categories with appropriate minimum ages',()=>{for(let m=0;m<=12;m++){const tips=p.getMonthPracticalTips(m);assert.equal(tips.length,8);assert.equal(new Set(tips.map(t=>t.practical.key)).size,8);for(const c of ['sleep_tips','feeding_tips','crying_tips','outing_tips'])assert.equal(tips.filter(t=>t.category===c).length,2);assert.ok(tips.every(t=>t.practical.minMonth<=m));}});
await check('retired random medical tips cannot reappear through saved legacy IDs or age selection',()=>{assert.equal(d.dailyTips.length,30);assert.ok(d.dailyTips.every(t=>t.id>=1000));for(let m=0;m<=12;m++){assert.ok(d.getTipsForMonth(m).every(t=>t.practical.minMonth<=m));assert.ok(d.getRandomTip(m).practical.minMonth<=m);}const text=d.dailyTips.map(t=>t.content).join('');assert.ok(!/81%|3分|3분→5분|3~7일이면|미온수\(25|30~33°C|밤 수유를 빼지/.test(text));});
await check('all 133 schedule descriptions resolve to the same sourced practical tips',()=>{assert.equal(s.dailySchedules.length,13);assert.equal(s.dailySchedules.reduce((n,s)=>n+s.items.length,0),133);for(const schedule of s.dailySchedules)for(const item of schedule.items){const t=p.getPracticalTip(item.practicalKey);assert.ok(t);assert.ok(t.minMonth<=schedule.month);assert.ok(item.tip.includes(t.caution));}for(let m=0;m<4;m++){assert.equal(s.getScheduleForMonth(m).mode,'responsive');assert.equal(s.getScheduleForMonth(m).wakeUp,'—');}});
await check('unsafe legacy sleep objects and routine night-weaning advice are absent from the rewritten tips',()=>{const text=p.practicalTips.map(p.practicalContent).join('\n');assert.ok(!/인형을 도입|인형이나 블랭킷을 사용|밤중 수유를 끊을|수면교육의 골든타임|물을 주거나 토닥|옆으로 눕혀 재워/.test(text));assert.ok(p.getPracticalTip('transfer').caution.includes('소파'));assert.ok(p.getPracticalTip('texture').caution.includes('이동 중'));});
await check('new practical titles are searchable offline and keep source and direct destination',async()=>{const result=await api.searchContentWithStatus('입가로',{currentMonth:2}),t=result.results.find(t=>t.id==='practical:bottle-flow');assert.ok(t);assert.equal(t.content,p.practicalContent(p.getPracticalTip('bottle-flow')));assert.ok(t.href.includes('month=2&tip=bottle-flow'));assert.equal('review' in t.evidence,false);});
await check('all 126 published meals have ingredient-specific guidance and no pre-first-birthday milk drink',()=>{
  const {getMealPlanForMonth,getMealSafety,mealPlans,mealPlanEvidence,mealPlanSafety}=load('src/lib/data/meal-plan-data');
  assert.equal(getMealPlanForMonth(5),undefined);
  assert.equal(mealPlans.map(plan=>plan.month).join(','),'6,7,8,9,10,11,12');
  assert.match(mealPlanSafety.preparation,/통견과류/);
  assert.match(mealPlanSafety.underOne,/첫돌 전.*꿀/);
  assert.ok(mealPlanEvidence.sources.length>=5);
  let count=0;
  for(const plan of mealPlans){
    assert.equal(plan.weeklyPlan.map(day=>day.day).join(''),'월화수목금토일');
    for(const day of plan.weeklyPlan) for(const meal of day.meals){
      count++;
      assert.ok(meal.ingredients.length,meal.menu);
      assert.equal(meal.ingredients.length,new Set(meal.ingredients).size,meal.menu);
      const safety=getMealSafety(meal);
      assert.ok(safety.prep.every(Boolean)&&safety.prep.length,meal.menu);
      assert.ok(!/\d\s*(?:ml|g)/i.test(JSON.stringify(meal)),meal.menu);
      if(plan.month<12) assert.ok(!meal.ingredients.includes('살균 전지우유(컵)'),meal.menu);
      if(/달걀|옴렛/.test(meal.menu)) assert.ok(safety.allergens.includes('달걀'),meal.menu);
      if(/두부/.test(meal.menu)) assert.ok(safety.allergens.includes('대두'),meal.menu);
      if(/대구|연어/.test(meal.menu)) assert.ok(safety.allergens.includes('생선')&&safety.prep.some(tip=>tip.includes('가시')),meal.menu);
      if(/새우/.test(meal.menu)) assert.ok(safety.allergens.includes('갑각류')&&safety.prep.some(tip=>tip.includes('꼬리')),meal.menu);
      if(/식빵|파스타/.test(meal.menu)) assert.ok(safety.allergens.includes('밀')&&safety.checkLabel,meal.menu);
      if(/치즈|우유/.test(meal.menu)) assert.ok(safety.allergens.includes('우유'),meal.menu);
    }
  }
  assert.equal(count,126);
  const cooked=mealPlans.find(plan=>plan.month===10).weeklyPlan[5].meals[0];
  assert.ok(cooked.ingredients.includes('우유(조리용)'));
  const drink=mealPlans.find(plan=>plan.month===12).weeklyPlan[0].meals[0];
  assert.ok(drink.ingredients.includes('살균 전지우유(컵)'));
});
console.log(count+' practical content checks passed (not clinical certification).');})().catch(e=>{console.error(e);process.exitCode=1});
