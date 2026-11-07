"use client";
import { useState } from "react";
import { useAtomicConnectionStore, type AtomicConnection } from "@/lib/store/atomic-connection-store";
import { useBabyStore } from "@/lib/store/baby-store";
import { disconnectAtomicConnection, reconnectAtomicConnection } from "@/lib/sync/atomic-connection-actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";

export default function AtomicConnectionActions({accountId,babyId}:{accountId:string;babyId:string}){
  const connection=useAtomicConnectionStore(s=>s.connections.find(c=>c.accountId===accountId&&c.localBabyId===babyId));
  const archived=useAtomicConnectionStore(s=>s.detached.filter(d=>d.connection.accountId===accountId&&d.connection.localBabyId===babyId).at(-1));
  const profile=useBabyStore(s=>s.profile);
  const [confirm,setConfirm]=useState<AtomicConnection|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState("");
  if(!connection&&!archived)return null;
  return <div className="space-y-3 border-t border-[var(--border)] pt-4">
    {connection?<Button variant="outline" disabled={busy} className="min-h-12 w-full rounded-xl" onClick={()=>{setError("");setConfirm(connection);}}>이 기기의 백업 연결 해제</Button>:<>
      <p role="status" className="font-semibold">이 기기의 백업 연결을 해제했어요</p>
      <p className="text-sm leading-6">아기·성장·접종 기록과 사진·메모는 그대로예요. 서버 백업과 다른 기기의 연결도 유지돼요.</p>
      {archived?.hadUncertainRequests&&<p className="text-sm leading-6 text-[var(--muted-foreground)]">처리 여부를 확인하지 못한 이전 요청을 보관했어요. 이미 전송한 내용은 서버에서 완료될 수 있으며, 다시 연결할 때 기록을 비교해요.</p>}
      <Button variant="outline" disabled={busy} className="min-h-12 w-full rounded-xl" onClick={async()=>{
        if(!archived)return;setBusy(true);setError("");const result=await reconnectAtomicConnection(archived);setBusy(false);setError(result.error??"");
      }}>{busy?"이전 백업 확인 중…":"이전 백업 확인하고 다시 연결"}</Button>
      <p className="text-xs leading-5 text-[var(--muted-foreground)]">같은 서버 백업을 읽어 연결 정보만 확인해요. 기기와 서버 기록을 덮어쓰지 않고 자동 백업은 꺼진 상태로 시작해요.</p>
    </>}
    {!confirm&&error&&<p role="alert" className="text-sm leading-6 text-red-700 dark:text-red-300">{error}</p>}
    <Dialog open={!!confirm} onOpenChange={open=>{if(!open&&!busy){setConfirm(null);setError("");}}}>
      <DialogContent className="rounded-2xl" showCloseButton={!busy}>
        <DialogHeader><DialogTitle>이 기기의 백업 연결만 해제할까요?</DialogTitle><DialogDescription>{profile?.name}의 기기 기록은 유지해요. 서버 데이터 삭제나 가족의 접근 권한 해제가 아니며, 다른 기기의 연결은 바꾸지 않아요.</DialogDescription></DialogHeader>
        {confirm&&<div className="rounded-xl bg-[var(--surface-bg)] p-4 text-sm leading-6"><p className="font-semibold">연결된 백업: {confirm.snapshot.baby.name}</p><p>{confirm.snapshot.baby.birthdate}</p><p className="mt-2">대기 요청은 보관하고 새 전송은 중단해요. 이미 보낸 요청은 서버에서 완료될 수 있어요.</p></div>}
        {error&&<p role="alert" className="text-sm leading-6 text-red-700 dark:text-red-300">{error}</p>}
        <DialogFooter>
          <DialogClose disabled={busy} render={<Button variant="outline" className="min-h-12" />}>취소</DialogClose>
          <Button disabled={busy} className="min-h-12" onClick={async()=>{
            if(!confirm)return;setBusy(true);setError("");const result=await disconnectAtomicConnection(confirm);setBusy(false);
            if(result.error)setError(result.error);else setConfirm(null);
          }}>{busy?"해제 상태 저장 중…":"기록 유지하고 연결 해제"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>;
}
