"use client";
import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useBabyStore } from "@/lib/store/baby-store";
import { useMeasurementStore } from "@/lib/store/measurement-store";
import { useVaccinationStore } from "@/lib/store/vaccination-store";
import { useAtomicConnectionStore } from "@/lib/store/atomic-connection-store";
import { useAtomicTransferRuntime, transferKey } from "@/lib/store/atomic-transfer-store";
import { isAtomicAutobackupEnabled, runAtomicBackup } from "@/lib/sync/run-atomic-backup";

export default function AtomicSyncManager(){
  const {user,loading}=useAuth();
  const profile=useBabyStore(s=>s.profile);
  const babies=useBabyStore(s=>s.babies);
  const owner=useBabyStore(s=>s.legacyOwnerId);
  const measurements=useMeasurementStore(s=>s.measurements);
  const vaccinations=useVaccinationStore(s=>s.records);
  const connection=useAtomicConnectionStore(s=>s.connections.find(c=>c.accountId===user?.id&&c.localBabyId===profile?.id));
  const key=connection?transferKey(connection.accountId,connection.localBabyId,connection.sharedBabyId,connection.requestId):"";
  const retry=useAtomicTransferRuntime(s=>s.retries[key]??0);
  const queue=useRef<Promise<void>>(Promise.resolve());
  useEffect(()=>{
    if(!isAtomicAutobackupEnabled()||loading||!user||!profile||!connection?.autoBackupEnabled)return;
    const timer=setTimeout(()=>{queue.current=queue.current.catch(()=>{}).then(()=>runAtomicBackup(user.id,profile.id));},3000);
    return()=>clearTimeout(timer);
  },[user,loading,profile,babies,owner,measurements,vaccinations,connection,retry]);
  return null;
}
