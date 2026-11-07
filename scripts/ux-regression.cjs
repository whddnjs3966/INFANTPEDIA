// Regression checks for calendar boundaries and persisted-record ownership. No network or disk data writes.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const ts = require(path.join(root, 'node_modules/typescript'));
const zustand = require(path.join(root, 'node_modules/zustand'));
const cache = new Map();
const persistence = new Map();
class TestDate extends Date { constructor(...args) { super(...(args.length ? args : ['2026-10-29T01:00:00+09:00'])); } }
function load(relative) {
  const filename = path.normalize(path.join(root, relative + (relative.endsWith('.ts') ? '' : '.ts')));
  if (cache.has(filename)) return cache.get(filename).exports;
  const module = { exports: {} }; cache.set(filename, module);
  const source = fs.readFileSync(filename, 'utf8');
  const js = ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
  vm.runInNewContext(js, {module,exports:module.exports,Date:TestDate,Intl,console,require(name) {
    if(name==='zustand')return zustand;
    if(name==='zustand/middleware')return {persist:(initializer,options)=>{persistence.set(options.name,options);return initializer;}};
    if(name.startsWith('@/'))return load('src/'+name.slice(2));
    if(name.startsWith('.'))return load(path.relative(root,path.resolve(path.dirname(filename),name)));
    throw Error('Unexpected import '+name);
  }}, {filename});
  return module.exports;
}
let count=0;
function check(name,run){run();count++;console.log('PASS '+name);}
const dates=load('src/lib/utils/date');
const {recordsForBaby}=load('src/lib/utils/baby-records');
const baby=load('src/lib/store/baby-store').useBabyStore;
const measurements=load('src/lib/store/measurement-store').useMeasurementStore;
const vaccinations=load('src/lib/store/vaccination-store').useVaccinationStore;
const milestones=load('src/lib/store/milestone-store').useMilestoneStore;
check('KST date does not use the previous UTC day',()=>assert.equal(dates.getKoreaDate(new Date('2026-10-28T16:00:00Z')),'2026-10-29'));
check('newborn at 01:00 has zero age',()=>{baby.getState().addBaby({name:'A',birthdate:'2026-10-29',gender:'male'});assert.equal(baby.getState().getDaysOld(),0);assert.equal(baby.getState().getMonthsOld(),0);});
check('calendar months handle February anniversaries',()=>{assert.equal(dates.getCalendarMonthsOld('2026-01-31','2026-02-28'),1);assert.equal(dates.getCalendarMonthsOld('2026-01-31','2026-03-01'),1);assert.equal(dates.getCalendarMonthsOld('2026-01-31','2026-03-31'),2);});
check('leap days and invalid dates are handled',()=>{assert.equal(dates.getDaysSinceBirth('2024-02-28','2024-03-01'),2);assert.equal(dates.isValidDateOnly('2026-02-30'),false);assert.equal(dates.getDaysSinceBirth('2026-10-30','2026-10-29'),0);});
const a=baby.getState().profile.id;
measurements.getState().addMeasurement({month:0,date:'2026-10-29',height:50});
vaccinations.getState().toggleVaccination('hepb',1);
milestones.getState().toggleMilestone('0_gross_1');
baby.getState().addBaby({name:'B',birthdate:'2026-09-29',gender:'female'});
const b=baby.getState().profile.id;
check('measurements are isolated for B',()=>assert.equal(measurements.getState().getMeasurementsByMonth(0).length,0));
check('vaccinations are isolated for B',()=>assert.equal(vaccinations.getState().isCompleted('hepb',1),false));
check('milestones are isolated for B',()=>assert.equal(milestones.getState().isCompleted('0_gross_1'),false));
check('switching back keeps A milestones',()=>{baby.getState().setActiveBaby(a);assert.equal(milestones.getState().isCompleted('0_gross_1'),true);});
check('legacy ownership survives adding and removing babies',()=>{const legacy=[{height:49}];assert.equal(recordsForBaby(legacy,a,2,a).length,1);assert.equal(recordsForBaby(legacy,b,1,a).length,0);assert.equal(recordsForBaby(legacy,b,1,null).length,0);});
check('invalid active baby selection normalizes the record owner',()=>{baby.getState().setActiveBaby('missing');assert.equal(baby.getState().activeBabyId,a);measurements.getState().addMeasurement({month:0,date:'2026-10-29',weight:3.3});assert.equal(measurements.getState().measurements.at(-1).babyId,a);});
check('old single-baby storage pins the legacy owner during hydration',()=>{baby.setState({babies:[{id:a,name:'A',birthdate:'2026-10-29',gender:'male'}],activeBabyId:'missing',legacyOwnershipChecked:false,legacyOwnerId:null});persistence.get('baby-profile').onRehydrateStorage()(baby.getState());assert.equal(baby.getState().legacyOwnerId,a);assert.equal(baby.getState().activeBabyId,a);});
check('old ambiguous multi-baby storage is never auto-assigned',()=>{baby.setState({babies:[{id:a,name:'A',birthdate:'2026-10-29',gender:'male'},{id:b,name:'B',birthdate:'2026-09-29',gender:'female'}],activeBabyId:b,legacyOwnershipChecked:false,legacyOwnerId:null});persistence.get('baby-profile').onRehydrateStorage()(baby.getState());baby.getState().removeBaby(a);assert.equal(baby.getState().legacyOwnerId,null);assert.equal(recordsForBaby([{height:49}],b,1,baby.getState().legacyOwnerId).length,0);});
check('full reset removes baby-specific milestone data',()=>{milestones.getState().clearAll();assert.equal(Object.keys(milestones.getState().byBaby).length,0);});
console.log(`${count} regression checks passed.`);
