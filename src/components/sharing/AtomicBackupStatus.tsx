"use client";
import { useState } from "react";
import { useAtomicConnectionStore } from "@/lib/store/atomic-connection-store";
import { useAtomicTransferStore, useAtomicTransferRuntime, transferKey } from "@/lib/store/atomic-transfer-store";
import { isAtomicAutobackupEnabled } from "@/lib/sync/run-atomic-backup";
import RegistrationReview from "@/components/sharing/RegistrationReview";
import { Button } from "@/components/ui/button";
import { useBabyStore } from "@/lib/store/baby-store";
import { useMeasurementStore } from "@/lib/store/measurement-store";
import { useVaccinationStore } from "@/lib/store/vaccination-store";
import { snapshotSignature } from "@/lib/sync/register-local-backup";
import { recordsForBaby } from "@/lib/utils/baby-records";
import AtomicConnectionActions from "@/components/sharing/AtomicConnectionActions";

export default function AtomicBackupStatus({accountId,babyId}:{accountId:string;babyId:string}){
  const connection=useAtomicConnectionStore(s=>s.connections.find(c=>c.accountId===accountId&&c.localBabyId===babyId));
  const key=connection?transferKey(accountId,babyId,connection.sharedBabyId,connection.requestId):"";
  const status=useAtomicTransferRuntime(s=>s.statuses[key]);
  const persistedConflict=useAtomicTransferStore(s=>!!s.conflicts[key]);
  const conflict=!!connection?.requiresReview||persistedConflict;
  const [error,setError]=useState("");
  const profile=useBabyStore(s=>s.profile),babies=useBabyStore(s=>s.babies),owner=useBabyStore(s=>s.legacyOwnerId);
  const measurements=useMeasurementStore(s=>s.measurements),vaccinations=useVaccinationStore(s=>s.records);
  const local=connection&&profile?.id===babyId?{baby:{...profile,id:connection.sharedBabyId},measurements:recordsForBaby(measurements,babyId,babies.length,owner),vaccinations:recordsForBaby(vaccinations,babyId,babies.length,owner)}:null;
  const dirty=connection&&local&&snapshotSignature(local)!==snapshotSignature(connection.snapshot);
  if(!connection)return null;
  const available=isAtomicAutobackupEnabled()&&connection.role!=="reader",enabled=available&&connection.autoBackupEnabled;
  const title=!available?"자동 백업 준비 중":conflict?"기록 비교 필요":!enabled?"자동 백업 꺼짐":dirty&&(!status||status.phase==="success")?"변경 내용 백업 대기":({checking:"백업 확인 중",syncing:"변경 내용 백업 중",success:"현재 기록 백업 확인",error:"백업 확인 실패"})[status?.phase==="conflict"?"error":status?.phase??"checking"];
  return <section aria-label="온라인 백업 상태" className="space-y-3 rounded-2xl bg-[var(--surface-bg)] p-4 text-sm leading-6">
    <p role="status" className="font-semibold">{connection.role==="reader"?"읽기 전용 백업":title}</p>
    <p>{connection.role==="reader"?"복원한 기록은 이 기기에서 볼 수 있어요. 서버 백업을 변경할 권한은 없어요.":!available?"최초 등록 기록은 확인했어요. 이후 변경 내용의 자동 백업은 아직 시작하지 않아요.":conflict?"서버 기록과 기기 기록을 보존하며 자동 덮어쓰기를 멈췄어요. 비교 후 반영할 내용을 선택해 주세요.":!enabled?"켜면 현재 아기의 프로필·성장 수치·접종 변경을 자동으로 백업해요. 사진·메모·발달 관찰은 기기에만 남아요.":status?.message??"기록은 기기에 유지돼요. 계정과 아기별로 전송 결과를 확인해요."}</p>
    {available&&<Button disabled={conflict&&!enabled} variant="outline" className="min-h-12 w-full" onClick={()=>{
      const previous=useAtomicConnectionStore.getState().connections;
      try{useAtomicConnectionStore.setState(s=>({connections:s.connections.map(c=>c===connection?{...c,autoBackupEnabled:!c.autoBackupEnabled}:c)}));setError("");}
      catch{try{useAtomicConnectionStore.setState({connections:previous});}catch{/* memory restored */}setError("설정을 저장하지 못했어요. 저장 공간을 확인해 주세요.");}
    }}>{enabled?"자동 백업 끄기":"자동 백업 켜기"}</Button>}
    {available&&enabled&&!conflict&&status?.phase==="error"&&<Button className="min-h-12 w-full" onClick={()=>useAtomicTransferStore.getState().retry(key)}>같은 요청으로 백업 재시도</Button>}
    {available&&enabled&&<p className="text-xs text-[var(--muted-foreground)]">끄더라도 이미 전송한 요청은 서버에서 완료될 수 있어요.</p>}
    {error&&<p role="alert" className="text-red-700 dark:text-red-300">{error}</p>}
    {conflict&&connection.role!=="reader"&&<RegistrationReview accountId={accountId} babyId={babyId} />}
    <AtomicConnectionActions key={`${accountId}:${babyId}:${connection.requestId}`} accountId={accountId} babyId={babyId} />
  </section>;
}
