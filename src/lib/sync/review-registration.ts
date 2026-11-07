import { createClient } from "@/lib/supabase/client";
import { createAtomicBackup, readAtomicBackup, writeAtomicBackup } from "@/lib/sync/atomic-backup";
import { useAtomicConnectionStore, ATOMIC_CONNECTION_KEY, isAtomicConnectionPersisted, type AtomicConnection, type Registration, type ReviewWrite } from "@/lib/store/atomic-connection-store";
import { useSyncStore } from "@/lib/store/sync-store";
import { localBackupSnapshot, snapshotSignature, durableRegistration, registrationOperations, isAtomicRegistrationEnabled } from "@/lib/sync/register-local-backup";
import type { CloudSnapshot } from "@/lib/sync/cloud-snapshot";
import { vaccinations } from "@/lib/data/growth-data";
import { useAtomicTransferStore, transferKey } from "@/lib/store/atomic-transfer-store";

export interface RegistrationReview { registration: Registration; local: CloudSnapshot; remote: CloudSnapshot; revision: number; }
const changed = {error:"계정·아기·기록 또는 서버 버전이 바뀌었어요. 기록을 다시 비교해 주세요."};
async function authenticated(accountId: string) {
  const auth=await createClient().auth.getUser();
  return !auth.error && auth.data.user?.id===accountId;
}
function current(request: Registration) {
  if(!isAtomicRegistrationEnabled())return false;
  if("revision" in request&&!isAtomicConnectionPersisted(request as AtomicConnection))return false;
  const state=useAtomicConnectionStore.getState();
  return !useSyncStore.getState().getMapping(request.localBabyId) && [...state.pending,...state.connections].some(p=>p.accountId===request.accountId&&p.localBabyId===request.localBabyId&&p.requestId===request.requestId&&p.sharedBabyId===request.sharedBabyId&&snapshotSignature(p.snapshot)===snapshotSignature(request.snapshot)&&(!("revision" in request)||("revision" in p&&p.revision===request.revision)));
}
function localUnchanged(review: RegistrationReview) {
  const local=localBackupSnapshot(review.registration.localBabyId,review.registration.sharedBabyId);
  return current(review.registration)&&local&&snapshotSignature(local)===snapshotSignature(review.local);
}
// Resolve the original creation request first, even if local data changed afterwards.
// This never uploads the new local data or changes any local profile/record store.
export async function reviewRegistration(accountId: string, localBabyId: string): Promise<RegistrationReview | {error:string}> {
  if(!isAtomicRegistrationEnabled())return{error:"온라인 등록은 아직 준비 중이에요."};
  const key=`${accountId}:${localBabyId}`;
  if(registrationOperations.has(key))return{error:"이전 요청을 확인 중이에요. 잠시 뒤 다시 시도해 주세요."};
  registrationOperations.add(key);
  try {
    const state=useAtomicConnectionStore.getState();
    const request=[...state.pending,...state.connections].find(p=>p.accountId===accountId&&p.localBabyId===localBabyId);
    if(!request || !current(request) || !await authenticated(accountId))return changed;
    const local=localBackupSnapshot(localBabyId,request.sharedBabyId);
    if(!local)return changed;
    if(!durableRegistration(request,"revision" in request)) {
      useAtomicConnectionStore.setState({pending:[...useAtomicConnectionStore.getState().pending]});
      if(!durableRegistration(request,"revision" in request))return{error:"등록 요청을 기기에 저장하지 못했어요. 저장 공간을 확인해 주세요."};
    }
    if(!("revision" in request)) {
      const created=await createAtomicBackup(request.sharedBabyId,request.requestId,request.snapshot,accountId);
      if("error" in created)return created;
    }
    if(!await authenticated(accountId)||!current(request))return changed;
    const result=await readAtomicBackup(request.sharedBabyId);
    if("error" in result)return result;
    const review={registration:request,local,remote:result.snapshot,revision:result.revision};
    if(!await authenticated(accountId)||!localUnchanged(review))return changed;
    return review;
  } catch {return{error:"기록 비교 결과를 확인하지 못했어요. 기존 요청과 기기 기록은 유지돼요."};}
  finally{registrationOperations.delete(key);}
}

export async function applyRegistrationReview(review: RegistrationReview): Promise<{error?:string}> {
  if(!isAtomicRegistrationEnabled())return{error:"온라인 등록은 아직 준비 중이에요."};
  const request=review.registration,key=`${request.accountId}:${request.localBabyId}`;
  if(registrationOperations.has(key))return{error:"이미 요청을 확인 중이에요."};
  registrationOperations.add(key);
  try {
    if(!await authenticated(request.accountId)||!localUnchanged(review))return changed;
    const latest=await readAtomicBackup(request.sharedBabyId);
    if("error" in latest)return latest;
    if(!await authenticated(request.accountId)||!localUnchanged(review))return changed;
    if(latest.revision!==review.revision||snapshotSignature(latest.snapshot)!==snapshotSignature(review.remote))return changed;
    let revision=latest.revision;
    if(snapshotSignature(review.local)!==snapshotSignature(review.remote)) {
      const store=useAtomicConnectionStore.getState();
      let update=store.reviewWrites.find(w=>w.accountId===request.accountId&&w.localBabyId===request.localBabyId&&w.creationRequestId===request.requestId&&w.expectedRevision===review.revision&&snapshotSignature(w.snapshot)===snapshotSignature(review.local));
      if(!update) {
        update={accountId:request.accountId,localBabyId:request.localBabyId,creationRequestId:request.requestId,requestId:crypto.randomUUID(),expectedRevision:review.revision,snapshot:review.local};
        useAtomicConnectionStore.setState({reviewWrites:[...store.reviewWrites.filter(w=>w.accountId!==request.accountId||w.localBabyId!==request.localBabyId),update]});
      }
      const write=update;
      // Flush an in-memory request left by a storage error, then read back its exact identity.
      useAtomicConnectionStore.setState({reviewWrites:[...useAtomicConnectionStore.getState().reviewWrites]});
      const disk=JSON.parse(localStorage.getItem(ATOMIC_CONNECTION_KEY)??"null")?.state;
      if(!disk?.reviewWrites?.some((w:ReviewWrite)=>JSON.stringify(w)===JSON.stringify(write)))return{error:"반영 요청을 기기에 저장하지 못했어요. 저장 공간을 확인해 주세요."};
      if(!await authenticated(request.accountId)||!localUnchanged(review))return changed;
      const result=await writeAtomicBackup(request.sharedBabyId,write.expectedRevision,write.requestId,write.snapshot,request.accountId);
      if("error" in result)return result;
      revision=result.revision;
    }
    if(!await authenticated(request.accountId)||!localUnchanged(review))return changed;
    const accepted={...request,snapshot:review.local};
    const before=useAtomicConnectionStore.getState();
    try {
      if(!before.accept(accepted,revision)||!durableRegistration(accepted,true))throw Error("PERSIST_FAILED");
    }catch{
      try{useAtomicConnectionStore.setState({pending:before.pending,connections:before.connections,reviewWrites:before.reviewWrites});}catch{/* request restored in memory */}
      return{error:"서버 확인 후 연결 정보를 저장하지 못했어요. 기록을 다시 비교하면 같은 아기로 확인할 수 있어요."};
    }
    useAtomicTransferStore.getState().resolve(transferKey(request.accountId,request.localBabyId,request.sharedBabyId,request.requestId));
    return{};
  } catch{return{error:"반영 결과를 확인하지 못했어요. 기기 기록과 요청을 보관했어요. 다시 비교해 주세요."};}
  finally{registrationOperations.delete(key);}
}

export interface RecordDifference { label: string; local: string; remote: string; }
// Compare values and identities, not just counts. Absence is displayed as a removal/addition.
export function registrationDifferences(local: CloudSnapshot, remote: CloudSnapshot): RecordDifference[] {
  const rows:RecordDifference[]=[];
  for(const [key,label] of [["name","이름"],["birthdate","생년월일"],["gender","성별"]] as const) {
    const value=(s:CloudSnapshot)=>key==="gender"?(s.baby.gender==="male"?"남아":"여아"):s.baby[key];
    if(value(local)!==value(remote))rows.push({label,local:value(local),remote:value(remote)});
  }
  const measurements=(s:CloudSnapshot)=>new Map(s.measurements.map(m=>[m.id,{label:`성장 기록 · ${m.date}`,value:`${m.date} · 키 ${m.height??"—"}cm · 몸무게 ${m.weight??"—"}kg · 머리둘레 ${m.headCircumference??"—"}cm`}]));
  const vaccines=(s:CloudSnapshot)=>new Map(s.vaccinations.map(v=>[`${v.vaccineId}:${v.doseNumber}`,{label:`접종 · ${vaccinations.find(item=>item.id===v.vaccineId)?.name??v.vaccineId} ${v.doseNumber}차`,value:v.completedDate}]));
  for(const maps of [[measurements(local),measurements(remote)],[vaccines(local),vaccines(remote)]]) {
    const [a,b]=maps;
    for(const id of [...new Set([...a.keys(),...b.keys()])].sort()) {
      const l=a.get(id),r=b.get(id);
      if(l?.value!==r?.value)rows.push({label:l?.label??r!.label,local:l?.value??"기록 없음",remote:r?.value??"기록 없음"});
    }
  }
  return rows;
}
