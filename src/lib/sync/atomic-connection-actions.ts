import { createClient } from "@/lib/supabase/client";
import { readAtomicBackup } from "@/lib/sync/atomic-backup";
import { useBabyStore } from "@/lib/store/baby-store";
import { useAtomicConnectionStore, ATOMIC_CONNECTION_KEY, type AtomicConnection, type DetachedConnection } from "@/lib/store/atomic-connection-store";
import { useAtomicTransferStore, transferKey } from "@/lib/store/atomic-transfer-store";
import { isAtomicRegistrationEnabled, localBackupSnapshot, snapshotSignature, registrationOperations } from "@/lib/sync/register-local-backup";
import { listAccountBackups } from "@/lib/sync/restore-account-backup";

const changed={error:"계정·아기·백업 연결이 바뀌었어요. 현재 내용을 확인한 뒤 다시 시도해 주세요."};
const same=(a:AtomicConnection,b:AtomicConnection)=>a.accountId===b.accountId&&a.localBabyId===b.localBabyId&&a.sharedBabyId===b.sharedBabyId&&a.requestId===b.requestId;
function canonical(value:unknown):unknown{
  if(Array.isArray(value))return value.map(canonical);
  if(value&&typeof value==="object")return Object.fromEntries(Object.entries(value).filter(([,v])=>v!==undefined&&typeof v!=="function").sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,canonical(v)]));
  return value;
}
const exact=(a:unknown,b:unknown)=>JSON.stringify(canonical(a))===JSON.stringify(canonical(b));
async function authenticate(id:string){const result=await createClient().auth.getUser();return !result.error&&result.data.user?.id===id;}
async function currentRole(accountId:string,remoteId:string){
  let cursor:string|null=null;
  for(let page=0;page<1000;page++){
    const result=await listAccountBackups(accountId,cursor);
    if("error" in result)return null;
    const found=result.items.find(item=>item.baby_id===remoteId);
    if(found)return found.role;
    if(!result.next_cursor||result.next_cursor>=remoteId)return null;
    cursor=result.next_cursor;
  }
  return null;
}
function active(c:AtomicConnection){return isAtomicRegistrationEnabled()&&useBabyStore.getState().profile?.id===c.localBabyId;}
function commit(change:()=>void){
  const before=useAtomicConnectionStore.getState(),raw=localStorage.getItem(ATOMIC_CONNECTION_KEY);
  if(!exact(raw?JSON.parse(raw)?.state:null,JSON.parse(JSON.stringify(before))))throw Error("CONNECTION_CHANGED_IN_ANOTHER_TAB");
  try{
    change();
    const disk=JSON.parse(localStorage.getItem(ATOMIC_CONNECTION_KEY)??"null")?.state;
    if(!exact(disk,JSON.parse(JSON.stringify(useAtomicConnectionStore.getState()))))throw Error("CONNECTION_NOT_SAVED");
  }catch(error){
    try{useAtomicConnectionStore.setState({pending:before.pending,connections:before.connections,reviewWrites:before.reviewWrites,detached:before.detached});}catch{/* restore memory even if storage is unavailable */}
    try{if(raw===null)localStorage.removeItem(ATOMIC_CONNECTION_KEY);else localStorage.setItem(ATOMIC_CONNECTION_KEY,raw);}catch{/* caller reports that state needs confirmation */}
    throw error;
  }
}
// Local detach only. No membership revocation, server deletion or payload upload.
export async function disconnectAtomicConnection(expected:AtomicConnection):Promise<{error?:string}>{
  if(!isAtomicRegistrationEnabled())return{error:"백업 연결 관리는 아직 준비 중이에요."};
  try{
    if(!await authenticate(expected.accountId)||!active(expected))return changed;
    const state=useAtomicConnectionStore.getState();
    const current=state.connections.find(c=>same(c,expected));
    if(!current||!exact(current,expected))return changed;
    const key=transferKey(current.accountId,current.localBabyId,current.sharedBabyId,current.requestId);
    const archived:DetachedConnection={connection:{...current,autoBackupEnabled:false},detachedAt:new Date().toISOString(),hadUncertainRequests:!!useAtomicTransferStore.getState().outbox[key]||state.reviewWrites.some(w=>w.accountId===current.accountId&&w.localBabyId===current.localBabyId&&w.creationRequestId===current.requestId)||registrationOperations.has(`${current.accountId}:${current.localBabyId}`)};
    // One persisted store update both archives retry identity and removes the active target.
    // Outbox and review requests stay untouched; they cannot run without this active connection.
    commit(()=>useAtomicConnectionStore.setState({connections:state.connections.filter(c=>!same(c,current)),detached:[...state.detached.filter(d=>!same(d.connection,current)),archived]}));
    return{};
  }catch{return{error:"연결 해제 상태를 저장하지 못했어요. 기록과 이전 요청은 보존했어요. 연결 상태를 다시 확인해 주세요."};}
}

export async function reconnectAtomicConnection(expected:DetachedConnection):Promise<{error?:string}>{
  if(!isAtomicRegistrationEnabled())return{error:"백업 연결 관리는 아직 준비 중이에요."};
  const old=expected.connection,lock=`${old.accountId}:${old.localBabyId}`;
  if(registrationOperations.has(lock))return{error:"이전 요청이 아직 처리 중이에요. 완료 후 같은 백업을 확인해 주세요."};
  registrationOperations.add(lock);
  try{
    const unchanged=()=>{
      const s=useAtomicConnectionStore.getState();
      return active(old)&&s.detached.some(d=>same(d.connection,old)&&exact(d,expected))&&!s.connections.some(c=>c.accountId===old.accountId&&c.localBabyId===old.localBabyId)&&!s.pending.some(c=>c.accountId===old.accountId&&c.localBabyId===old.localBabyId);
    };
    if(!await authenticate(old.accountId)||!unchanged())return changed;
    const local=localBackupSnapshot(old.localBabyId,old.sharedBabyId);
    if(!local)return changed;
    const result=await readAtomicBackup(old.sharedBabyId);
    if("error" in result)return result;
    const role=await currentRole(old.accountId,old.sharedBabyId);
    if(!role)return{error:"이 계정의 백업 접근 권한을 확인하지 못했어요. 이전 연결 정보는 유지돼요."};
    if(!await authenticate(old.accountId)||!unchanged())return changed;
    const now=localBackupSnapshot(old.localBabyId,old.sharedBabyId);
    if(!now||snapshotSignature(now)!==snapshotSignature(local))return changed;
    const state=useAtomicConnectionStore.getState(),key=transferKey(old.accountId,old.localBabyId,old.sharedBabyId,old.requestId);
    const uncertain=expected.hadUncertainRequests||!!useAtomicTransferStore.getState().outbox[key]||state.reviewWrites.some(w=>w.accountId===old.accountId&&w.localBabyId===old.localBabyId&&w.creationRequestId===old.requestId);
    const restored:AtomicConnection={...old,snapshot:result.snapshot,revision:result.revision,autoBackupEnabled:false,role,requiresReview:uncertain||snapshotSignature(now)!==snapshotSignature(result.snapshot)};
    commit(()=>useAtomicConnectionStore.setState({connections:[...state.connections,restored],detached:state.detached.filter(d=>!same(d.connection,old))}));
    return{};
  }catch{return{error:"이전 백업 연결을 확인하거나 저장하지 못했어요. 기기 기록과 이전 연결 정보는 유지돼요."};}
  finally{registrationOperations.delete(lock);}
}
