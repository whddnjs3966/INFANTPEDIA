// Actual TS stores, isolated in memory. No network or user-data writes.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname,'..');
const ts = require(path.join(root,'node_modules/typescript'));
const zustand = require(path.join(root,'node_modules/zustand'));
const cache = new Map();
const draftData = new Map();
const draftStorage={getItem:key=>draftData.get(key)??null,setItem:(key,value)=>draftData.set(key,value),removeItem:key=>draftData.delete(key)};
class TestDate extends Date { constructor(...args){ super(...(args.length?args:['2026-10-30T01:00:00+09:00'])); } }
function load(relative){
  const filename=path.normalize(path.join(root,relative+(relative.endsWith('.ts')?'':'.ts')));
  if(cache.has(filename))return cache.get(filename).exports;
  const module={exports:{}};cache.set(filename,module);
  const output=ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
  vm.runInNewContext(output,{module,exports:module.exports,Date:TestDate,Intl,console,sessionStorage:draftStorage,require(name){
    if(name==='zustand')return zustand;
    if(name==='zustand/middleware')return {persist:initializer=>initializer};
    if(name.startsWith('@/'))return load('src/'+name.slice(2));
    if(name.startsWith('.'))return load(path.relative(root,path.resolve(path.dirname(filename),name)));
    throw Error('Unexpected import '+name);
  }},{filename});return module.exports;
}
const baby=load('src/lib/store/baby-store').useBabyStore;
const measurements=load('src/lib/store/measurement-store').useMeasurementStore;
const observations=load('src/lib/store/milestone-store').useMilestoneStore;
const vaccinations=load('src/lib/store/vaccination-store').useVaccinationStore;
const activeProgress=load('src/lib/store/milestone-store').activeMilestoneProgress;
const dates=load('src/lib/utils/record-date');
const seasons=load('src/lib/utils/vaccination-season');
let checks=0;
function check(name,run){run();checks++;console.log('PASS '+name);}
baby.getState().addBaby({name:'A',birthdate:'2026-08-29',gender:'male'});
const a=baby.getState().profile.id;
check('measurement month follows measurement date rather than supplied month',()=>{
  assert.equal(measurements.getState().addMeasurement({month:9,date:'2026-10-28',height:58.4},a),true);
  assert.equal(measurements.getState().measurements[0].month,1);
});
const measurementId=measurements.getState().measurements[0].id;
check('editing a measurement keeps its owner and updates calendar month',()=>{
  assert.equal(measurements.getState().updateMeasurement(measurementId,{date:'2026-10-30',weight:5.6},a),true);
  assert.equal(measurements.getState().measurements.length,1);
  assert.equal(measurements.getState().measurements[0].babyId,a);
  assert.equal(measurements.getState().measurements[0].month,2);
});
check('an observation can be backdated then edited without increasing its count',()=>{
  assert.equal(observations.getState().saveObservation('2_gross_1','2026-10-18',a).ok,true);
  assert.equal(observations.getState().saveObservation('2_gross_1','2026-10-12',a).ok,true);
  assert.equal(observations.getState().getCompletedCountForMonth(2).completed,1);
  assert.equal(activeProgress(observations.getState()).completedDates['2_gross_1'],'2026-10-12');
});
check('invalid calendar, future and pre-birth observation dates cannot replace a record',()=>{
  for(const date of ['2026-02-30','2026-10-31','2026-08-28',''])assert.equal(observations.getState().saveObservation('2_gross_1',date,a).ok,false);
  assert.equal(activeProgress(observations.getState()).completedDates['2_gross_1'],'2026-10-12');
});
check('unknown milestone identifiers do not create observations',()=>assert.equal(observations.getState().saveObservation('2_unknown','2026-10-12',a).ok,false));
assert.equal(vaccinations.getState().saveVaccination('hepb',1,'2026-08-29',a).ok,true);
baby.getState().addBaby({name:'B',birthdate:'2026-08-29',gender:'female'});
const b=baby.getState().profile.id;
check('switching baby hides growth, vaccination and observation records together',()=>{
  assert.equal(measurements.getState().getMeasurementsByMonth(2).length,0);
  assert.equal(vaccinations.getState().getCompletedCount(),0);
  assert.equal(observations.getState().getCompletedCountForMonth(2).completed,0);
});
check('stale measurement forms cannot add, update or delete for another baby',()=>{
  assert.equal(measurements.getState().addMeasurement({month:2,date:'2026-10-30',height:60},a),false);
  assert.equal(measurements.getState().updateMeasurement(measurementId,{height:70}),false);
  assert.equal(measurements.getState().deleteMeasurement(measurementId),false);
  assert.equal(measurements.getState().measurements[0].height,58.4);
});
check('the same milestone has independent dates for A and B',()=>{
  assert.equal(observations.getState().saveObservation('2_gross_1','2026-10-20',b).ok,true);
  assert.equal(activeProgress(observations.getState()).completedDates['2_gross_1'],'2026-10-20');
  assert.equal(observations.getState().byBaby[a].completedDates['2_gross_1'],'2026-10-12');
});
check('stale observation forms and cancellation cannot affect the current baby',()=>{
  assert.equal(observations.getState().saveObservation('2_gross_1','2026-10-10',a).ok,false);
  assert.equal(observations.getState().removeObservation('2_gross_1',a).ok,false);
  assert.equal(activeProgress(observations.getState()).completedDates['2_gross_1'],'2026-10-20');
});
check('observation cancellation removes only B and preserves A',()=>{
  assert.equal(observations.getState().removeObservation('2_gross_1',b).ok,true);
  assert.equal(observations.getState().isCompleted('2_gross_1'),false);
  assert.equal(observations.getState().byBaby[a].completedMilestones['2_gross_1'],true);
});
check('vaccination dates upsert once per baby and dose',()=>{
  assert.equal(vaccinations.getState().saveVaccination('hepb',1,'2026-09-01',b).ok,true);
  assert.equal(vaccinations.getState().saveVaccination('hepb',1,'2026-09-02',b).ok,true);
  assert.equal(vaccinations.getState().getCompletedCount(),1);
  assert.equal(vaccinations.getState().getRecord('hepb',1).completedDate,'2026-09-02');
  assert.equal(vaccinations.getState().records.find(r=>r.babyId===a).completedDate,'2026-08-29');
});
check('invalid vaccination dates, doses and stale owners do not write',()=>{
  for(const date of ['2026-02-30','2026-10-31','2026-08-28'])assert.equal(vaccinations.getState().saveVaccination('hepb',1,date,b).ok,false);
  assert.equal(vaccinations.getState().saveVaccination('hepb',99,'2026-10-20',b).ok,false);
  assert.equal(vaccinations.getState().saveVaccination('unknown',1,'2026-10-20',b).ok,false);
  assert.equal(vaccinations.getState().saveVaccination('hepb',1,'2026-10-20',a).ok,false);
  assert.equal(vaccinations.getState().removeVaccination('hepb',1,a).ok,false);
  assert.equal(vaccinations.getState().getRecord('hepb',1).completedDate,'2026-09-02');
});
check('influenza doses preserve old dates and update or remove only the selected season',()=>{
  const initial=vaccinations.getState().records;
  const profile=baby.getState().profile;
  const savedBabies=baby.getState().babies;
  const older={...profile,birthdate:'2025-01-12'};
  baby.setState({profile:older,babies:savedBabies.map(item=>item.id===older.id?older:item)});
  const legacy={babyId:older.id,vaccineId:'flu',doseNumber:1,completedDate:'2025-10-10'};
  vaccinations.setState({records:[...initial,legacy]});
  const store=vaccinations.getState();
  try {
    assert.equal(seasons.influenzaSeason('2026-08-31'),2025);
    assert.equal(seasons.influenzaSeason('2026-09-01'),2026);
    assert.equal(seasons.influenzaSeason('2026-02-30'),undefined);
    assert.equal(store.saveVaccination('flu',1,'2026-10-01',older.id,2026).ok,true);
    assert.equal(store.saveVaccination('flu',2,'2026-10-29',older.id,2026).ok,true);
    assert.equal(store.getRecord('flu',1,2025).completedDate,'2025-10-10');
    assert.equal(store.getRecord('flu',1,2026).completedDate,'2026-10-01');
    assert.equal(store.saveVaccination('flu',1,'2025-10-12',older.id,2026).ok,false);
    assert.equal(store.saveVaccination('flu',1,'2025-10-12',older.id,2025).ok,true);
    assert.equal(store.removeVaccination('flu',1,older.id,2026).ok,true);
    assert.equal(store.getRecord('flu',1,2026),undefined);
    assert.equal(store.getRecord('flu',2,2026).completedDate,'2026-10-29');
    assert.equal(store.getRecord('flu',1,2025).completedDate,'2025-10-12');
  } finally {
    baby.setState({profile,babies:savedBabies});
    vaccinations.setState({records:initial});
  }
});
baby.getState().setActiveBaby(a);
check('measurement identifiers and ownership cannot be reassigned',()=>{
  assert.equal(measurements.getState().updateMeasurement(measurementId,{babyId:b}),false);
  assert.equal(measurements.getState().updateMeasurement(measurementId,{id:'other'}),false);
  assert.equal(measurements.getState().measurements[0].babyId,a);
});
check('legacy observation dates can be corrected without losing other legacy items',()=>{
  observations.setState({completedMilestones:{'0_gross_1':true,'2_gross_1':true},completedDates:{'0_gross_1':'2026-08-30'},byBaby:{[b]:{completedMilestones:{'2_gross_1':true},completedDates:{'2_gross_1':'2026-10-20'}}}});
  assert.equal(observations.getState().saveObservation('2_gross_1','2026-10-15',a).ok,true);
  assert.equal(activeProgress(observations.getState()).completedDates['2_gross_1'],'2026-10-15');
  assert.equal(activeProgress(observations.getState()).completedDates['0_gross_1'],'2026-08-30');
  assert.equal(observations.getState().byBaby[b].completedDates['2_gross_1'],'2026-10-20');
});
check('month reset retains other months and the other baby',()=>{
  observations.getState().resetMonth(2,a);
  assert.equal(observations.getState().isCompleted('0_gross_1'),true);
  assert.equal(observations.getState().isCompleted('2_gross_1'),false);
  assert.equal(observations.getState().byBaby[b].completedMilestones['2_gross_1'],true);
});
check('date validation permits birth date and rejects malformed profiles',()=>{
  assert.equal(dates.recordDateError('2026-08-29','2026-08-29','관찰일'),null);
  assert.equal(typeof dates.recordDateError('2026-10-10','invalid','관찰일'),'string');
});
baby.getState().clearAll();
check('guest record writes are rejected rather than creating unowned data',()=>{
  assert.equal(measurements.getState().addMeasurement({month:2,date:'2026-10-20',height:58}),false);
  assert.equal(observations.getState().saveObservation('2_gross_1','2026-10-20',a).ok,false);
  assert.equal(vaccinations.getState().saveVaccination('hepb',1,'2026-10-20',a).ok,false);
});
const draft=load('src/lib/utils/measurement-draft');
const input={date:'2026-10-30',height:'60.2',weight:'',head:'',memo:'draft test'};
const draftA=draft.measurementDraftKey(a);
const draftB=draft.measurementDraftKey(b);
check('measurement drafts are isolated by baby',()=>{
  draft.writeMeasurementDraft(draftA,input);
  assert.equal(draft.readMeasurementDraft(draftA).height,'60.2');
  assert.equal(draft.readMeasurementDraft(draftB),undefined);
});
check('editing a saved record cannot reuse a draft for a changed base',()=>{
  const original={id:'edit-1',babyId:a,date:'2026-10-29',month:2,height:58};
  const key=draft.measurementDraftKey(a,original);
  draft.writeMeasurementDraft(key,input);
  assert.equal(draft.readMeasurementDraft(draft.measurementDraftKey(a,{...original,height:59})),undefined);
  assert.notEqual(key,draftA);
});
check('a fresh module restores the draft from the same session',()=>{
  cache.delete(path.normalize(path.join(root,'src/lib/utils/measurement-draft.ts')));
  const restored=load('src/lib/utils/measurement-draft');
  assert.equal(restored.readMeasurementDraft(draftA).memo,'draft test');
});
check('saving or explicitly discarding one draft preserves another baby',()=>{
  draft.writeMeasurementDraft(draftB,{...input,height:'62'});
  draft.clearMeasurementDraft(draftA);
  assert.equal(draft.readMeasurementDraft(draftA),undefined);
  assert.equal(draft.readMeasurementDraft(draftB).height,'62');
});
check('the draft cache retains at most twenty recent inputs',()=>{
  for(let i=0;i<21;i++)draft.writeMeasurementDraft(draft.measurementDraftKey('temporary-'+i),input);
  assert.equal(draft.readMeasurementDraft(draft.measurementDraftKey('temporary-0')),undefined);
  assert.equal(draft.readMeasurementDraft(draft.measurementDraftKey('temporary-20')).height,'60.2');
  const persisted=JSON.parse(draftData.get('infantpedia-measurement-drafts-v1'));
  assert.equal(Object.keys(persisted).length,20);
});
console.log(`${checks} record regression checks passed.`);
