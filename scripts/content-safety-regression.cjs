// Real data and query modules. Fixture HTTP; no user data or production writes.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),ts=require(path.join(root,'node_modules/typescript')),cache=new Map();let checks=0;
const tableRows={activities:[],parenting_tips:[]};
function query(table){let rows=tableRows[table]||[];const q={select(){return q;},eq(k,v){rows=rows.filter(r=>r[k]===v);return q;},order(){return q;},or(){return q;},limit(){return q;},abortSignal(){return q;},then(resolve,reject){return Promise.resolve({data:rows,error:null}).then(resolve,reject);}};return q;}
function load(relative){const file=path.resolve(root,relative+'.ts');if(cache.has(file))return cache.get(file).exports;const module={exports:{}};cache.set(file,module);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;vm.runInNewContext(code,{module,exports:module.exports,console,Intl,Date,Set,Map,URL,URLSearchParams,AbortController,DOMException,setTimeout,clearTimeout,process:{env:{NODE_ENV:'test'}},require(name){if(name==='../supabase')return{supabase:{from:query}};if(name.startsWith('@/'))return load('src/'+name.slice(2));if(name.startsWith('.'))return load(path.relative(root,path.resolve(path.dirname(file),name)));throw Error(name);}},{filename:file});return module.exports;}
async function check(name,fn){await fn();checks++;console.log('PASS '+name);}
(async()=>{
 const schedules=load('src/lib/data/daily-schedule-data'),view=load('src/lib/utils/daily-schedule-view'),health=load('src/lib/data/health-faq-data'),review=load('src/lib/utils/reviewed-public-content'),queryApi=load('src/lib/queries/months');
 await check('all 13 ages remain available; newborn to 3 months use signal-based rather than fixed clock schedules',()=>{assert.equal(schedules.dailySchedules.length,13);for(let m=0;m<4;m++){const s=schedules.getScheduleForMonth(m);assert.equal(s.mode,'responsive');assert.equal(s.wakeUp,'—');assert.equal(s.bedtime,'—');assert.ok(s.items.every(i=>view.clockMinutes(i.time)===null));assert.equal(view.scheduleSegments(s).length,0);}});
 await check('example graph uses explicit duration and never paints a feed until the next event',()=>{const sample={month:4,wakeUp:'07:00',bedtime:'20:00',items:[{time:'07:00',type:'feed',durationMinutes:{min:20,max:30}},{time:'10:00',type:'play',durationMinutes:{min:10,max:10}},{time:'20:00',type:'sleep',duration:'~'}]};const segments=view.scheduleSegments(sample);assert.equal(segments.length,2);assert.equal(segments[0].minEnd,440);assert.equal(segments[0].maxEnd,450);assert.equal(segments.some(s=>s.type==='sleep'),false);});
 await check('missing or invalid durations are never guessed and invalid clocks are refused',()=>{const sample={month:4,items:[{time:'07:00',type:'feed',duration:'30분'},{time:'08:00',type:'nap',durationMinutes:{min:20,max:10}},{time:'25:00',type:'play',durationMinutes:{min:10,max:10}},{time:'10:00',type:'play',durationMinutes:{min:NaN,max:10}}]};assert.equal(view.scheduleSegments(sample).length,0);assert.equal(view.clockMinutes('24:00'),null);assert.equal(view.clockMinutes('12:60'),null);});
 await check('night windows cover both sides of midnight separately from actual sleep',()=>{const windows=view.nightWindows({wakeUp:'07:00',bedtime:'20:00'});assert.equal(JSON.stringify(windows),JSON.stringify([{start:0,end:420},{start:1200,end:1440}]));assert.equal(JSON.stringify(view.splitAtMidnight(1430,1460)),JSON.stringify([{start:1430,end:1440},{start:0,end:20}]));assert.equal(view.splitAtMidnight(10,2000).length,0);});
 await check('period boundaries put noon and evening in the next group, without converting signal labels to timestamps',()=>{for(const[clock,period]of [['00:00','night'],['05:59','night'],['06:00','morning'],['11:59','morning'],['12:00','afternoon'],['17:59','afternoon'],['18:00','evening'],['23:59','evening'],['24:00',null],['배고픈 신호가 보이면',null]])assert.equal(view.schedulePeriodForTime(clock),period,clock);});
 await check('every 4–12m example activity belongs to exactly one time group; activity data and original ordering survive grouping',()=>{for(const schedule of schedules.dailySchedules.filter(s=>s.month>=4)){const groups=Array.from(view.schedulePeriods,p=>schedule.items.map((item,index)=>({item,index})).filter(({item})=>view.schedulePeriodForTime(item.time)===p.key));const indexes=groups.flat().map(r=>r.index).sort((a,b)=>a-b);assert.deepEqual(indexes,Array.from({length:schedule.items.length},(_,i)=>i));for(const group of groups)assert.ok(group.every((r,i)=>i===0||group[i-1].index<r.index));}});
 await check('all timed non-sleep example activities have bounded finite numeric durations',()=>{for(const s of schedules.dailySchedules.filter(s=>s.month>=4)){for(const i of s.items.filter(i=>i.type!=='sleep')){assert.ok(i.durationMinutes,`${s.month} ${i.time}`);assert.ok(i.durationMinutes.min>0&&i.durationMinutes.max>=i.durationMinutes.min);}for(const seg of view.scheduleSegments(s))assert.ok(seg.maxEnd-seg.start<1440);}});
 await check('89 FAQ identities remain stable; reference metadata contains no approval state',()=>{
   assert.equal(health.healthFAQs.length,89);
   assert.equal(new Set(health.healthFAQs.map(f=>f.id)).size,89);
   assert.equal(health.healthFAQs.filter(f=>f.evidence?.checkedOn==='2026-11-04').length,18);
   assert.equal(health.healthFAQs.filter(f=>f.evidence?.checkedOn==='2026-11-13').length,71);
   for(const f of health.healthFAQs){
     assert.ok(f.care?.summary&&f.care.seekHelp,f.id);
     assert.ok(f.evidence?.sources.length,f.id);
     assert.equal('review' in f.evidence,false);
     assert.ok(f.evidence.sources.every(s=>s.url.startsWith('https://')));
   }
 });
 await check('structured FAQ blocks and full-text search share the exact same answer',()=>{for(const f of health.healthFAQs.filter(f=>f.care)){const c=f.care,expected=[c.summary,...c.steps.map((s,i)=>`${i+1}. ${s}`),...(c.avoid.length?['피해주세요: '+c.avoid.join(' ')]:[]),'진료·도움: '+c.seekHelp].join('\n\n');assert.equal(f.answer,expected);}});
 await check('corrected FAQ has no obsolete rectal fever conversion, inclined sleeping or foreign emergency number',()=>{const text=health.healthFAQs.filter(f=>f.care).map(f=>f.answer).join('\n');assert.ok(!/#7119|직장 38.5|머리를 약간 높여 재워|해열제 투여 후 1시간이 지나도/.test(text));assert.ok(health.healthFAQs.find(f=>f.id==='fever_07').answer.includes('진료를 미루지'));assert.equal(health.healthFAQs.find(f=>f.id==='fever_07').urgency,'emergency');assert.ok(health.healthFAQs.find(f=>f.id==='fever_01').answer.includes('38°C'));assert.ok(health.healthFAQs.find(f=>f.id==='general_16').answer.includes('119'));});
 await check('urgent FAQ always has a structured action and a source',()=>{
   for(const faq of health.healthFAQs.filter(item=>item.urgency==='emergency')){
     assert.ok(faq.care?.seekHelp,faq.id);
     assert.ok(faq.evidence?.sources.length,faq.id);
   }
   assert.match(health.healthFAQs.find(f=>f.id==='fever_11').care.summary,/처음.*119/);
   assert.match(health.healthFAQs.find(f=>f.id==='respiratory_05').care.avoid[0],/수증기.*하지 마세요/);
   assert.match(health.healthFAQs.find(f=>f.id==='digestion_18').care.summary,/자석.*증상이 없어도/);
   assert.match(health.healthFAQs.find(f=>f.id==='general_01').care.summary,/24시간.*즉시/);
   assert.match(health.healthFAQs.find(f=>f.id==='general_13').care.summary,/반응이 없으면.*119/);
   assert.match(health.healthFAQs.find(f=>f.id==='general_05').care.seekHelp,/임의로 추가 투여하지 말고/);
 });
 await check('food guide and feeding advice both use safe quartered preparation rather than halves',()=>{const food=JSON.stringify(load('src/lib/data/baby-food-guide-data').getBabyFoodGuide()),feeding=JSON.stringify(Array.from({length:13},(_,m)=>load('src/lib/data/feeding-guide-data').getFeedingGuideForMonth(m)));assert.ok(!/반으로 잘라/.test(food+feeding));assert.ok(food.includes('4조각'));assert.ok(feeding.includes('4조각'));});
 await check('feeding and storage searches use the same instructions and evidence as the guide',async()=>{
   const data=load('src/lib/data/feeding-guide-data');
   for(let month=0;month<=12;month++){
     const guide=data.getFeedingGuideForMonth(month);
     assert.ok(guide.feedingCues.length);
     assert.ok(!/\d\s*ml/i.test(JSON.stringify(guide)));
   }
   for(const [keyword, topic, prefix] of [
     ['먹다 남긴 모유',data.milkSafety.breastMilk,'feeding-storage-'],
     ['먹기 시작한 분유',data.milkSafety.formula,'feeding-formula-'],
   ]){
     const {results}=await queryApi.searchContentWithStatus(keyword,{currentMonth:6});
     const result=results.find(item=>String(item.id).startsWith(prefix));
     assert.equal(result.content,topic.entries.map(({label,text})=>`${label}\n${text}`).join('\n\n'));
     assert.equal(result.evidence,topic.evidence);
   }
 });
 await check('food preparation before six months has no menu and allergy search leads to visible guidance',async()=>{
   const food=load('src/lib/data/baby-food-guide-data');
   for(let month=0;month<6;month++) assert.equal(food.getAvailableIngredients(month).length,0);
   assert.equal(food.getStageForMonth(5).sampleMenu.length,0);
   assert.ok(food.getAvailableIngredients(6).some(ingredient=>ingredient.name==='완전히 익힌 달걀'));
   const {results}=await queryApi.searchContentWithStatus('이유식 알레르기 가이드',{currentMonth:5});
   const result=results.find(item=>item.id==='babyfood-allergy');
   assert.match(result.href,/month=6/);
   assert.ok(result.content.startsWith(food.getBabyFoodGuide().allergyGuide.emergencyAction));
   assert.ok(result.evidence.sources.length);
 });
 await check('safety overlay corrects both legacy and migrated rows while future edits get no inherited review',()=>{for(const c of review.publicContentCorrections){const row=review.reviewedPublicContent(c.table,{id:c.id,content:c.before});assert.equal(row.content,c.after);assert.equal('review' in row.evidence,false);assert.ok(review.reviewedPublicContent(c.table,{id:c.id,content:c.after}).evidence);const changed=review.reviewedPublicContent(c.table,{id:c.id,content:'Future editorial change'});assert.equal(changed.content,'Future editorial change');assert.equal(changed.evidence,undefined);assert.equal(review.reviewedPublicContent(c.table,{id:c.id+1000,content:c.before}).content,c.before);}});
 for(const c of review.publicContentCorrections)tableRows[c.table]=[{id:c.id,month_id:c.table==='activities'?6:1,title:'테스트 자료',category:c.table==='activities'?'sleep':'feeding_tips',content:c.before}];
 await check('online encyclopedia and tip reads apply the same exact-revision safety correction',async()=>{assert.equal((await queryApi.getParentingTips(1))[0].content,review.publicContentCorrections[0].after);assert.equal((await queryApi.getActivities(6))[0].content,review.publicContentCorrections[1].after);});
 await check('corrected activity titles are searchable before DB updates without replacing newer editor changes',async()=>{
   const revisions=load('src/lib/data/activity-release-corrections').activityReleaseCorrections;
   const correction=revisions.find(row=>row.id===25);
   const original={id:correction.id,month_id:correction.month,category:correction.category,title:correction.beforeTitle,content:correction.before};
   const prior=tableRows.activities;
   try{
     tableRows.activities=[original];
     const activities=await queryApi.getActivities(correction.month);
     assert.equal(activities[0].title,correction.title);
     const search=await queryApi.searchContentWithStatus(correction.title,{currentMonth:correction.month});
     const result=search.results.find(row=>row.source==='activities'&&row.id===correction.id);
     assert.equal(result.title,correction.title);
     assert.equal(result.content,correction.after);
     tableRows.activities=[{...original,content:'New editorial revision'}];
     const changed=await queryApi.searchContentWithStatus(correction.title,{currentMonth:correction.month});
     assert.equal(changed.results.some(row=>row.source==='activities'&&row.id===correction.id),false);
   }finally{tableRows.activities=prior;}
 });
 await check('FAQ search forwards action blocks, urgency and evidence to prevent loss of safety context',async()=>{const result=await queryApi.searchContentWithStatus('체온',{currentMonth:2});const faq=result.results.find(r=>r.source==='health_faq'&&r.id==='fever_05');assert.ok(faq);assert.ok(faq.care);assert.equal('review' in faq.evidence,false);assert.equal(faq.urgency,'caution');assert.equal(faq.content,health.healthFAQs.find(f=>f.id==='fever_05').answer);});
 await check('online search corrects unsafe text and recognizes the actual *_tips category names',async()=>{const result=await queryApi.searchContentWithStatus('테스트',{currentMonth:1});const tip=result.results.find(r=>r.source==='parenting_tips');assert.equal(tip.content,review.publicContentCorrections[0].after);assert.ok(tip.href.includes('tab=feeding'));assert.ok(tip.evidence);});
 await check('public correction signatures match the captured editorial DB revision',()=>{for(const c of review.publicContentCorrections){const snapshot=JSON.parse(fs.readFileSync(path.join(root,'docs/audits/2026-11-04/content/live-'+c.table+'.json'),'utf8'));assert.equal(snapshot.rows.find(r=>r.id===c.id).content,c.before);}});
 await check('prepared editorial migration is idempotent and rolls back every change if a source row differs',async()=>{const {PGlite}=require(path.join(root,'node_modules/@electric-sql/pglite')),db=new PGlite(),sql=fs.readFileSync(path.join(root,'sql/content/20261104_content_safety.sql'),'utf8');try{for(const table of ['activities','parenting_tips'])await db.exec(`create table ${table}(id integer primary key,content text)`);for(const c of review.publicContentCorrections)await db.query(`insert into ${c.table} values($1,$2)`,[c.id,c.before]);await db.query('update activities set content=$1 where id=27',['New editorial version']);await assert.rejects(()=>db.exec(sql));await db.exec('rollback');assert.equal((await db.query('select content from parenting_tips where id=12')).rows[0].content,review.publicContentCorrections[0].before);await db.query('update activities set content=$1 where id=27',[review.publicContentCorrections[1].before]);await db.exec(sql);await db.exec(sql);for(const c of review.publicContentCorrections)assert.equal((await db.query(`select content from ${c.table} where id=$1`,[c.id])).rows[0].content,c.after);}finally{await db.close();}});
 console.log(`${checks} content safety and schedule checks passed (data/RPC fixtures, not clinical certification).`);
})().catch(e=>{console.error(e);process.exitCode=1;});
