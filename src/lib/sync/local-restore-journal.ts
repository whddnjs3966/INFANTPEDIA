// This module has no store imports: recover BEFORE any affected Zustand store hydrates.
export const RESTORE_JOURNAL_KEY="baby-restore-journal";
export const RESTORE_KEYS=["baby-profile","baby-measurements","baby-vaccinations","baby-atomic-connections"] as const;
type Entry={key:string;before:string|null;after:string};
export const LOCAL_DATA_KEYS=[...RESTORE_KEYS,"baby-atomic-transfers","baby-sync","infantpedia-milestones","baby-family-invites","baby-account-deletion"] as const;
type Journal={schema:1|2;phase:"prepared"|"committed";entries:Entry[];startedAt?:number};
let blocked=false,needsReload=false,lastRecoveredCommitted=false,externalChange=false;
const listeners=new Set<()=>void>();
export function subscribeLocalDataSafety(listener:()=>void){listeners.add(listener);return()=>{listeners.delete(listener);};}
export function isLocalDocumentStale(){return externalChange;}
function journal(raw:string):Journal {
  const data=JSON.parse(raw);
  if(![1,2].includes(data?.schema)||!["prepared","committed"].includes(data.phase)||!Array.isArray(data.entries)||!data.entries.length||data.entries.length>LOCAL_DATA_KEYS.length||(data.schema===1&&data.entries.length!==RESTORE_KEYS.length))throw Error("INVALID_RESTORE_JOURNAL");
  const seen=new Set<string>();
  data.entries.forEach((entry:Entry,i:number)=>{
    if((data.schema===1&&entry.key!==RESTORE_KEYS[i])||!LOCAL_DATA_KEYS.includes(entry.key as typeof LOCAL_DATA_KEYS[number])||seen.has(entry.key)||(entry.before!==null&&typeof entry.before!=="string")||typeof entry.after!=="string")throw Error("INVALID_RESTORE_ENTRY");
    seen.add(entry.key);
    for(const value of [entry.before,entry.after])if(value!==null){const parsed=JSON.parse(value);if(!parsed||typeof parsed.state!=="object"||!parsed.state||Array.isArray(parsed.state))throw Error("INVALID_RESTORE_STATE");}
  });
  return data;
}
function save(key:string,value:string|null){
  if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,value);
  if(localStorage.getItem(key)!==value)throw Error("RESTORE_WRITE_FAILED");
}
export function recoverLocalRestore(ownFailedWrite=false):boolean {
  lastRecoveredCommitted=false;
  if(typeof localStorage==="undefined")return true;
  try{
    const raw=localStorage.getItem(RESTORE_JOURNAL_KEY);
    if(!raw){blocked=false;return true;}
    const data=journal(raw);
    // A newly opened tab must not roll back another document's live transaction.
    if(!ownFailedWrite&&data.phase==="prepared"&&typeof data.startedAt==="number"&&Date.now()-data.startedAt<10000)throw Error("LOCAL_WRITE_ACTIVE");
    for(const entry of data.entries)save(entry.key,data.phase==="committed"?entry.after:entry.before);
    save(RESTORE_JOURNAL_KEY,null);blocked=false;lastRecoveredCommitted=data.phase==="committed";return true;
  }catch{blocked=true;return false;}
}
export function isLocalRestoreBlocked(){return blocked;}
export function isLocalRestoreInProgress(){
  if(blocked||needsReload||externalChange)return true;
  try{return typeof localStorage!=="undefined"&&localStorage.getItem(RESTORE_JOURNAL_KEY)!==null;}catch{return true;}
}
// Write ahead, verify every value, then commit. The next document hydrates all stores together.
export function commitLocalRestore(after:Record<typeof RESTORE_KEYS[number],string>){
  commitLocalData(after,true);
}
export function commitLocalData(after:Partial<Record<typeof LOCAL_DATA_KEYS[number],string>>,legacyRestore=false){
  if(isLocalRestoreInProgress())throw Error("RESTORE_ALREADY_ACTIVE");
  const keys=legacyRestore?[...RESTORE_KEYS]:LOCAL_DATA_KEYS.filter(key=>after[key]!==undefined);
  const data:Journal={schema:legacyRestore?1:2,phase:"prepared",startedAt:Date.now(),entries:keys.map(key=>({key,before:localStorage.getItem(key),after:after[key]!}))};
  const raw=JSON.stringify(data);journal(raw);
  let committed=false;
  try{
    save(RESTORE_JOURNAL_KEY,raw);
    for(const entry of data.entries)save(entry.key,entry.after);
    data.phase="committed";save(RESTORE_JOURNAL_KEY,JSON.stringify(data));committed=true;
    save(RESTORE_JOURNAL_KEY,null);
    needsReload=true;
  }catch(error){
    // Recovery chooses rollback before commit, roll-forward after commit.
    const recovered=recoverLocalRestore(true);
    if((committed||lastRecoveredCommitted)&&recovered){needsReload=true;return;}
    throw error;
  }
}
if(typeof window!=="undefined")window.addEventListener("storage",event=>{
  if(event.storageArea!==localStorage)return;
  if(event.key===null||event.key===RESTORE_JOURNAL_KEY||LOCAL_DATA_KEYS.includes(event.key as typeof LOCAL_DATA_KEYS[number])){
    externalChange=true;
    for(const listener of listeners)listener();
  }
});
recoverLocalRestore();
