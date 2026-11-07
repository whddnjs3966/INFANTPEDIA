import { createClient } from "@/lib/supabase/client";
import { useAtomicConnectionStore, ATOMIC_CONNECTION_KEY, isAtomicConnectionPersisted, type AtomicConnection } from "@/lib/store/atomic-connection-store";
import { useAtomicTransferStore, transferKey, ATOMIC_TRANSFER_KEY } from "@/lib/store/atomic-transfer-store";
import { useSyncStore } from "@/lib/store/sync-store";
import { isAtomicRegistrationEnabled, localBackupSnapshot, snapshotSignature, registrationOperations } from "@/lib/sync/register-local-backup";
import { readAtomicBackup, writeAtomicBackup } from "@/lib/sync/atomic-backup";

export const isAtomicAutobackupEnabled=()=>isAtomicRegistrationEnabled()&&process.env.NEXT_PUBLIC_ATOMIC_AUTOBACKUP_ENABLED==="true";
export async function runAtomicBackup(accountId:string,localBabyId:string) {
  if(!isAtomicAutobackupEnabled())return;
  const lock=`${accountId}:${localBabyId}`;
  if(registrationOperations.has(lock))return;
  const connection=useAtomicConnectionStore.getState().connections.find(c=>c.accountId===accountId&&c.localBabyId===localBabyId);
  if(!connection?.autoBackupEnabled||connection.role==="reader")return;
  const key=transferKey(accountId,localBabyId,connection.sharedBabyId,connection.requestId);
  const transfers=useAtomicTransferStore.getState();
  if(connection.requiresReview||transfers.conflicts[key]){transfers.status(key,{phase:"conflict",message:"확인할 기록이나 이전 전송이 있어요. 기록을 비교한 뒤 반영할 내용을 선택해 주세요."});return;}
  registrationOperations.add(lock);
  const connected=()=>{
    const now=useAtomicConnectionStore.getState().connections.find(c=>c.accountId===accountId&&c.localBabyId===localBabyId);
    return isAtomicRegistrationEnabled()&&now?.autoBackupEnabled===true&&isAtomicConnectionPersisted(now)&&now.sharedBabyId===connection.sharedBabyId&&now.requestId===connection.requestId&&now.revision===connection.revision&&snapshotSignature(now.snapshot)===snapshotSignature(connection.snapshot)
      &&!!localBackupSnapshot(localBabyId,connection.sharedBabyId)&&!useSyncStore.getState().getMapping(localBabyId);
  };
  const auth=async()=>{const result=await createClient().auth.getUser();return !result.error&&result.data.user?.id===accountId;};
  const conflict=()=>{useAtomicTransferStore.setState(s=>({conflicts:{...s.conflicts,[key]:true}}));transfers.status(key,{phase:"conflict",message:"서버 기록이 달라요. 자동 덮어쓰기를 멈췄어요. 기록을 비교해 주세요."});};
  try {
    if(!connected()||!await auth()||!connected())return;
    transfers.status(key,{phase:"checking"});
    let pending=useAtomicTransferStore.getState().outbox[key];
    const local=localBackupSnapshot(localBabyId,connection.sharedBabyId)!;
    if(!pending&&snapshotSignature(local)===snapshotSignature(connection.snapshot)){
      const remote=await readAtomicBackup(connection.sharedBabyId);
      if(!await auth()||!connected())return;
      if("error" in remote){transfers.status(key,{phase:"error",message:remote.error});return;}
      if(remote.revision!==connection.revision||snapshotSignature(remote.snapshot)!==snapshotSignature(connection.snapshot)){conflict();return;}
      const current=localBackupSnapshot(localBabyId,connection.sharedBabyId)!;
      transfers.status(key,{phase:snapshotSignature(current)===snapshotSignature(connection.snapshot)?"success":"checking"});return;
    }
    if(!pending){
      pending={accountId,localBabyId,sharedBabyId:connection.sharedBabyId,connectionId:connection.requestId,requestId:crypto.randomUUID(),expectedRevision:connection.revision,snapshot:local};
      useAtomicTransferStore.setState(s=>({outbox:{...s.outbox,[key]:pending}}));
    }
    if(pending.accountId!==accountId||pending.localBabyId!==localBabyId||pending.sharedBabyId!==connection.sharedBabyId||pending.connectionId!==connection.requestId||pending.expectedRevision!==connection.revision){conflict();return;}
    // Persist and read back the exact request before any write; later edits never replace it.
    useAtomicTransferStore.setState(s=>({outbox:{...s.outbox,[key]:pending}}));
    const disk=JSON.parse(localStorage.getItem(ATOMIC_TRANSFER_KEY)??"null")?.state;
    if(JSON.stringify(disk?.outbox?.[key])!==JSON.stringify(pending))throw Error("OUTBOX_NOT_SAVED");
    if(!await auth()||!connected())return;
    transfers.status(key,{phase:"syncing"});
    const result=await writeAtomicBackup(connection.sharedBabyId,pending.expectedRevision,pending.requestId,pending.snapshot,accountId);
    if(!await auth()||!connected())return;
    if("error" in result){if(result.kind==="conflict")conflict();else transfers.status(key,{phase:"error",message:result.error});return;}
    const accepted:AtomicConnection={...connection,snapshot:pending.snapshot,revision:result.revision};
    const before=useAtomicConnectionStore.getState().connections;
    try{
      useAtomicConnectionStore.setState(s=>({connections:s.connections.map(c=>c.accountId===accountId&&c.localBabyId===localBabyId?accepted:c)}));
      const saved=JSON.parse(localStorage.getItem(ATOMIC_CONNECTION_KEY)??"null")?.state;
      if(!saved?.connections?.some((c:AtomicConnection)=>JSON.stringify(c)===JSON.stringify(accepted)))throw Error("BASELINE_NOT_SAVED");
      // Keep the outbox if clearing it fails: the next run detects the newer baseline safely.
      useAtomicTransferStore.setState(s=>{const outbox={...s.outbox};delete outbox[key];return{outbox};});
    }catch{
      try{useAtomicConnectionStore.setState({connections:before});}catch{/* original baseline restored in memory */}
      try{useAtomicTransferStore.setState(s=>({outbox:{...s.outbox,[key]:pending}}));}catch{/* request restored in memory */}
      throw Error("BASELINE_NOT_SAVED");
    }
    const current=localBackupSnapshot(localBabyId,connection.sharedBabyId);
    transfers.status(key,{phase:current&&snapshotSignature(current)===snapshotSignature(pending.snapshot)?"success":"checking"});
  }catch{
    transfers.status(key,{phase:"error",message:"백업 결과 또는 기기 저장을 확인하지 못했어요. 같은 요청으로 다시 확인해 주세요."});
  }finally{registrationOperations.delete(lock);}
}
