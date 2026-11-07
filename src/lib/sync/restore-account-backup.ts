import { createClient } from "@/lib/supabase/client";
import { readAtomicBackup } from "@/lib/sync/atomic-backup";
import { isAtomicRegistrationEnabled, snapshotSignature, registrationOperations } from "@/lib/sync/register-local-backup";
import { useBabyStore } from "@/lib/store/baby-store";
import { useMeasurementStore } from "@/lib/store/measurement-store";
import { useVaccinationStore } from "@/lib/store/vaccination-store";
import { useAtomicConnectionStore, type AtomicConnection } from "@/lib/store/atomic-connection-store";
import { commitLocalRestore, RESTORE_KEYS, isLocalRestoreInProgress } from "@/lib/sync/local-restore-journal";
import { isValidDateOnly, getKoreaDate } from "@/lib/utils/date";
import type { CloudSnapshot } from "@/lib/sync/cloud-snapshot";

export interface AccountBackup {baby_id:string;name:string;birthdate:string;gender:"male"|"female";revision:number;role:"owner"|"editor"|"reader";}
export interface RestorePreview {accountId:string;summary:AccountBackup;snapshot:CloudSnapshot;revision:number;fingerprint:string;}
const uuid=(v:unknown):v is string=>typeof v==="string"&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(v);
const version=(v:unknown):v is number=>typeof v==="number"&&Number.isInteger(v)&&v>=0&&v<=2147483647;
const failed={error:"백업 정보를 확인하지 못했어요. 기기의 기록은 그대로예요."};
async function auth(id:string){const a=await createClient().auth.getUser();return !a.error&&a.data.user?.id===id;}
export async function listAccountBackups(accountId:string,after:string|null=null):Promise<{items:AccountBackup[];next_cursor:string|null}|{error:string}>{
  if(!isAtomicRegistrationEnabled()||!uuid(accountId)||(after!==null&&!uuid(after))||isLocalRestoreInProgress())return failed;
  try{
    if(!await auth(accountId))return failed;
    const {data,error}=await createClient().rpc("list_account_backups",{p_expected_user_id:accountId,p_after:after,p_limit:20});
    if(error||!data||!Array.isArray(data.items)||data.items.length>20||!await auth(accountId))return failed;
    let previous=after??"";
    for(const item of data.items){
      if(!item||!uuid(item.baby_id)||item.baby_id<=previous||typeof item.name!=="string"||!item.name.trim()||typeof item.birthdate!=="string"||!isValidDateOnly(item.birthdate)||item.birthdate>getKoreaDate()||!["male","female"].includes(item.gender)||!["owner","editor","reader"].includes(item.role)||!version(item.revision))return failed;
      previous=item.baby_id;
    }
    if(data.next_cursor!==null&&(!uuid(data.next_cursor)||data.items.length!==20||data.next_cursor!==previous))return failed;
    return{items:data.items.map((i:AccountBackup)=>({baby_id:i.baby_id,name:i.name,birthdate:i.birthdate,gender:i.gender,revision:i.revision,role:i.role})),next_cursor:data.next_cursor};
  }catch{return failed;}
}
function fingerprint(){return JSON.stringify([RESTORE_KEYS.map(key=>localStorage.getItem(key)),useBabyStore.getState(),useMeasurementStore.getState(),useVaccinationStore.getState(),useAtomicConnectionStore.getState()]);}
function alreadyLinked(accountId:string,remoteId:string){const s=useAtomicConnectionStore.getState(),ids=new Set(useBabyStore.getState().babies.map(b=>b.id));return[...s.pending,...s.connections].some(c=>c.accountId===accountId&&c.sharedBabyId===remoteId&&ids.has(c.localBabyId));}
export async function previewAccountRestore(accountId:string,summary:AccountBackup):Promise<RestorePreview|{error:string}>{
  if(!isAtomicRegistrationEnabled()||!uuid(accountId)||!uuid(summary.baby_id)||isLocalRestoreInProgress()||registrationOperations.size)return failed;
  try{
    if(!await auth(accountId))return{error:"로그인 계정을 다시 확인해 주세요."};
    if(alreadyLinked(accountId,summary.baby_id))return{error:"이미 이 기기에 연결했거나 확인 중인 아기예요. 기존 아기를 선택해 주세요."};
    const before=fingerprint();
    const result=await readAtomicBackup(summary.baby_id);
    if("error" in result)return result;
    if(!await auth(accountId)||fingerprint()!==before)return{error:"확인 중 계정이나 기기 기록이 바뀌었어요. 다시 확인해 주세요."};
    return{accountId,summary,snapshot:result.snapshot,revision:result.revision,fingerprint:before};
  }catch{return failed;}
}
function envelope(key:typeof RESTORE_KEYS[number],state:object){
  return JSON.stringify({state,version:key==="baby-profile"?1:0});
}
export async function applyAccountRestore(preview:RestorePreview):Promise<{localBabyId:string}|{error:string}>{
  if(!isAtomicRegistrationEnabled()||isLocalRestoreInProgress()||registrationOperations.size)return failed;
  const lock=`restore:${preview.accountId}`;registrationOperations.add(lock);
  try{
    const unchanged=()=>fingerprint()===preview.fingerprint&&!alreadyLinked(preview.accountId,preview.summary.baby_id);
    if(!await auth(preview.accountId)||!unchanged())return failed;
    const latest=await readAtomicBackup(preview.summary.baby_id);
    if("error" in latest)return latest;
    if(!await auth(preview.accountId)||!unchanged())return failed;
    if(latest.revision!==preview.revision||snapshotSignature(latest.snapshot)!==snapshotSignature(preview.snapshot))return{error:"서버 기록이 바뀌었어요. 최신 내용을 다시 확인한 뒤 복원해 주세요."};
    const b=useBabyStore.getState(),m=useMeasurementStore.getState(),v=useVaccinationStore.getState(),a=useAtomicConnectionStore.getState();
    // No existing baby is replaced. Stable remote record IDs remain scoped by a new local baby ID.
    const localBabyId=crypto.randomUUID();const profile={...latest.snapshot.baby,id:localBabyId};
    const connection:AtomicConnection={accountId:preview.accountId,localBabyId,sharedBabyId:preview.summary.baby_id,requestId:crypto.randomUUID(),snapshot:latest.snapshot,revision:latest.revision,autoBackupEnabled:false,role:preview.summary.role};
    const after={
      "baby-profile":envelope("baby-profile",{babies:[...b.babies,profile],activeBabyId:localBabyId,profile,babyPhotos:b.babyPhotos,legacyOwnerId:b.legacyOwnerId,legacyOwnershipChecked:true}),
      "baby-measurements":envelope("baby-measurements",{measurements:[...m.measurements,...latest.snapshot.measurements.map(item=>({...item,babyId:localBabyId}))]}),
      "baby-vaccinations":envelope("baby-vaccinations",{records:[...v.records,...latest.snapshot.vaccinations.map(item=>({...item,babyId:localBabyId}))]}),
      "baby-atomic-connections":envelope("baby-atomic-connections",{pending:a.pending,connections:[...a.connections,connection],reviewWrites:a.reviewWrites,detached:a.detached}),
    };
    commitLocalRestore(after);
    return{localBabyId};
  }catch{return{error:"기기 저장을 완료하지 못했어요. 기존 기록으로 복구를 시도했어요. 브라우저 데이터를 지우지 말고 상태를 확인해 주세요."};}
  finally{registrationOperations.delete(lock);}
}
