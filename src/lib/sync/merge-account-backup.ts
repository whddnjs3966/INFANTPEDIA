import { vaccinations } from "@/lib/data/growth-data";
import type { VaccinationRecord } from "@/lib/store/vaccination-store";
import { vaccinationRecordKey, vaccinationSeasonSuffix } from "@/lib/utils/vaccination-season";
import { createClient } from "@/lib/supabase/client";
import { readAtomicBackup } from "@/lib/sync/atomic-backup";
import { localBackupSnapshot,snapshotSignature,isAtomicRegistrationEnabled,registrationOperations } from "@/lib/sync/register-local-backup";
import { useBabyStore } from "@/lib/store/baby-store";
import { useMeasurementStore } from "@/lib/store/measurement-store";
import { useVaccinationStore } from "@/lib/store/vaccination-store";
import { useAtomicConnectionStore,type AtomicConnection } from "@/lib/store/atomic-connection-store";
import { useAtomicTransferStore } from "@/lib/store/atomic-transfer-store";
import { useSyncStore } from "@/lib/store/sync-store";
import { useMilestoneStore } from "@/lib/store/milestone-store";
import { localDataFingerprint,localEnvelope } from "@/lib/sync/local-data-actions";
import { commitLocalData } from "@/lib/sync/local-restore-journal";
import { decodeCloudSnapshot,type CloudSnapshot } from "@/lib/sync/cloud-snapshot";
import type { AccountBackup } from "@/lib/sync/restore-account-backup";

export interface ExistingRestorePreview{accountId:string;localBabyId:string;summary:AccountBackup;local:CloudSnapshot;remote:CloudSnapshot;revision:number;fingerprint:string;}
export type Choice="local"|"remote"|"omit";
export interface MergeChoices{profile:{name:"local"|"remote";birthdate:"local"|"remote";gender:"local"|"remote"};records:Record<string,Choice>;}
export interface MergeRow{key:string;label:string;local:string;remote:string;hasLocal:boolean;hasRemote:boolean;}
const changed={error:"계정·기기 기록·연결 또는 서버 버전이 바뀌었어요. 다시 비교해 주세요."};
async function auth(id:string){const r=await createClient().auth.getUser();return !r.error&&r.data.user?.id===id;}
function fingerprint(){return JSON.stringify([localDataFingerprint(),useMeasurementStore.getState(),useVaccinationStore.getState(),useAtomicConnectionStore.getState(),useMilestoneStore.getState(),useAtomicTransferStore.getState().outbox]);}
function safeTarget(accountId:string,localId:string,remoteId:string){
 const a=useAtomicConnectionStore.getState();
 return useBabyStore.getState().profile?.id===localId&&!useSyncStore.getState().getMapping(localId)
  &&!a.pending.some(c=>c.localBabyId===localId)&&!a.reviewWrites.some(c=>c.localBabyId===localId)
  &&!Object.values(useAtomicTransferStore.getState().outbox).some(w=>w.localBabyId===localId)
  &&!a.connections.some(c=>c.accountId===accountId&&((c.localBabyId===localId&&c.sharedBabyId!==remoteId)||(c.localBabyId!==localId&&c.sharedBabyId===remoteId)));
}
export async function previewExistingRestore(accountId:string,localBabyId:string,summary:AccountBackup):Promise<ExistingRestorePreview|{error:string}>{
 if(!isAtomicRegistrationEnabled()||registrationOperations.size||!safeTarget(accountId,localBabyId,summary.baby_id))return{error:"현재 아기의 이전 연결이나 미확정 전송을 먼저 정리해 주세요."};
 try{if(!await auth(accountId))return changed;const before=fingerprint(),local=localBackupSnapshot(localBabyId,summary.baby_id);if(!local)return changed;const remote=await readAtomicBackup(summary.baby_id);if("error" in remote)return remote;
 if(!await auth(accountId)||fingerprint()!==before||!safeTarget(accountId,localBabyId,summary.baby_id))return changed;
 return{accountId,localBabyId,summary,local,remote:remote.snapshot,revision:remote.revision,fingerprint:before};}catch{return changed;}
}
const mKey=(id:string)=>`measurement:${id}`,vKey=(record:VaccinationRecord)=>`vaccination:${vaccinationRecordKey(record)}`;
export function defaultMergeChoices(p:ExistingRestorePreview,replace=false):MergeChoices{
 const records:Record<string,Choice>={};for(const m of p.local.measurements)records[mKey(m.id)]=replace?"omit":"local";for(const m of p.remote.measurements)if(replace||!records[mKey(m.id)])records[mKey(m.id)]="remote";
 for(const v of p.local.vaccinations)records[vKey(v)]=replace?"omit":"local";for(const v of p.remote.vaccinations)if(replace||!records[vKey(v)])records[vKey(v)]="remote";
 return{profile:{name:replace?"remote":"local",birthdate:replace?"remote":"local",gender:replace?"remote":"local"},records};
}
export function mergeRows(p:ExistingRestorePreview):MergeRow[]{
 const local=new Map<string,{label:string;value:string}>(),remote=new Map<string,{label:string;value:string}>();
 for(const [snapshot,map] of [[p.local,local],[p.remote,remote]] as const){for(const m of snapshot.measurements)map.set(mKey(m.id),{label:`성장 · ${m.date}`,value:`${m.date} · 키 ${m.height??"—"}cm · 몸무게 ${m.weight??"—"}kg · 머리둘레 ${m.headCircumference??"—"}cm`});for(const v of snapshot.vaccinations)map.set(vKey(v),{label:`접종 · ${vaccinations.find(item=>item.id===v.vaccineId)?.name??v.vaccineId} ${v.doseNumber}차${vaccinationSeasonSuffix(v)}`,value:v.completedDate});}
 return[...new Set([...local.keys(),...remote.keys()])].sort().map(key=>({key,label:local.get(key)?.label??remote.get(key)!.label,local:local.get(key)?.value??"기록 없음",remote:remote.get(key)?.value??"기록 없음",hasLocal:local.has(key),hasRemote:remote.has(key)}));
}
export function mergedSnapshot(p:ExistingRestorePreview,choices:MergeChoices):CloudSnapshot|{error:string}{
 if(!choices||!choices.profile||!choices.records||(["name","birthdate","gender"] as const).some(k=>!["local","remote"].includes(choices.profile[k])))return{error:"합칠 항목을 다시 선택해 주세요."};
 const selected=(key:string,side:"local"|"remote")=>choices.records[key]===side;
 const baby={...p.remote.baby,name:p[choices.profile.name].baby.name,birthdate:p[choices.profile.birthdate].baby.birthdate,gender:p[choices.profile.gender].baby.gender};
 const measurements=[...p.local.measurements.filter(m=>selected(mKey(m.id),"local")),...p.remote.measurements.filter(m=>selected(mKey(m.id),"remote"))];
 const vaccinations=[...p.local.vaccinations.filter(v=>selected(vKey(v),"local")),...p.remote.vaccinations.filter(v=>selected(vKey(v),"remote"))];
 if(mergeRows(p).some(row=>!["local","remote","omit"].includes(choices.records[row.key])||(choices.records[row.key]==="local"&&!row.hasLocal)||(choices.records[row.key]==="remote"&&!row.hasRemote)))return{error:"없는 기록을 선택했어요. 선택 내용을 확인해 주세요."};
 return decodeCloudSnapshot(baby,measurements.map(m=>({id:m.id,baby_id:baby.id,date:m.date,month:m.month,height:m.height,weight:m.weight,head_circumference:m.headCircumference})),vaccinations.map(v=>({baby_id:baby.id,vaccine_id:v.vaccineId,dose_number:v.doseNumber,completed_date:v.completedDate})),baby.id);
}
export async function applyExistingRestore(p:ExistingRestorePreview,choices:MergeChoices):Promise<{error?:string}>{
 if(!isAtomicRegistrationEnabled()||registrationOperations.size)return changed;const lock=`merge:${p.accountId}:${p.localBabyId}`;registrationOperations.add(lock);
 try{if(!await auth(p.accountId)||fingerprint()!==p.fingerprint||!safeTarget(p.accountId,p.localBabyId,p.summary.baby_id))return changed;
 const merged=mergedSnapshot(p,choices);if("error" in merged)return merged;
 const milestone=useMilestoneStore.getState(),b=useBabyStore.getState();const observations=milestone.byBaby[p.localBabyId]?.completedDates??(b.legacyOwnerId===p.localBabyId?milestone.completedDates:{});
 if(Object.values(observations).some(d=>d<merged.baby.birthdate))return{error:"선택한 생년월일보다 이른 관찰 기록이 있어요. 생년월일을 다시 확인해 주세요."};
 const latest=await readAtomicBackup(p.summary.baby_id);if("error" in latest)return latest;
 if(!await auth(p.accountId)||fingerprint()!==p.fingerprint||!safeTarget(p.accountId,p.localBabyId,p.summary.baby_id))return changed;
 if(latest.revision!==p.revision||snapshotSignature(latest.snapshot)!==snapshotSignature(p.remote))return changed;
 const a=useAtomicConnectionStore.getState(),m=useMeasurementStore.getState(),v=useVaccinationStore.getState(),profile={...merged.baby,id:p.localBabyId},babies=b.babies.map(i=>i.id===p.localBabyId?profile:i);
 const belongs=(r:{babyId?:string})=>r.babyId===p.localBabyId||(!r.babyId&&b.legacyOwnerId===p.localBabyId);
 const existing=a.connections.find(c=>c.accountId===p.accountId&&c.localBabyId===p.localBabyId&&c.sharedBabyId===p.summary.baby_id);
 const connection:AtomicConnection={accountId:p.accountId,localBabyId:p.localBabyId,sharedBabyId:p.summary.baby_id,requestId:existing?.requestId??crypto.randomUUID(),snapshot:latest.snapshot,revision:latest.revision,role:p.summary.role,autoBackupEnabled:false,requiresReview:snapshotSignature(merged)!==snapshotSignature(latest.snapshot)};
 const after={
  "baby-profile":localEnvelope("baby-profile",{babies,activeBabyId:b.activeBabyId,profile,babyPhotos:b.babyPhotos,legacyOwnerId:b.legacyOwnerId,legacyOwnershipChecked:true}),
  "baby-measurements":localEnvelope("baby-measurements",{measurements:[...m.measurements.filter(r=>!belongs(r)),...merged.measurements.map(r=>({...r,babyId:p.localBabyId,memo:m.measurements.find(old=>belongs(old)&&old.id===r.id)?.memo}))]}),
  "baby-vaccinations":localEnvelope("baby-vaccinations",{records:[...v.records.filter(r=>!belongs(r)),...merged.vaccinations.map(r=>({...r,babyId:p.localBabyId}))]}),
  "baby-atomic-connections":localEnvelope("baby-atomic-connections",{pending:a.pending,reviewWrites:a.reviewWrites,detached:a.detached.filter(d=>!(d.connection.accountId===p.accountId&&d.connection.localBabyId===p.localBabyId&&d.connection.sharedBabyId===p.summary.baby_id)),connections:[...a.connections.filter(c=>c.accountId!==p.accountId||c.localBabyId!==p.localBabyId).map(c=>c.localBabyId===p.localBabyId?{...c,autoBackupEnabled:false,requiresReview:true}:c),connection]}),
 };
 commitLocalData(after);return{};
 }catch{return{error:"기록 반영을 완료하지 못했어요. 이전 상태 복구를 시도했어요. 저장 상태를 확인해 주세요."};}finally{registrationOperations.delete(lock);}
}
