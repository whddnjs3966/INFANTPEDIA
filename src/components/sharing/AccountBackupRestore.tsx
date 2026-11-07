"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { isAtomicRegistrationEnabled } from "@/lib/sync/register-local-backup";
import { listAccountBackups, previewAccountRestore, applyAccountRestore, type AccountBackup, type RestorePreview } from "@/lib/sync/restore-account-backup";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import ExistingBackupMerge from "@/components/sharing/ExistingBackupMerge";
import { isLocalRestoreBlocked } from "@/lib/sync/local-restore-journal";

function RestoreCard({accountId}:{accountId:string}){
  const [items,setItems]=useState<AccountBackup[]>([]),[cursor,setCursor]=useState<string|null>(null);
  const [loaded,setLoaded]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState("");
  const [preview,setPreview]=useState<RestorePreview|null>(null);
  const generation=useRef(0);
  const load=async(more=false)=>{
    const attempt=++generation.current;setBusy(true);setError("");
    const result=await listAccountBackups(accountId,more?cursor:null);
    if(attempt!==generation.current)return;
    setBusy(false);
    if("error" in result){setError(result.error);return;}
    setItems(previous=>more?[...previous,...result.items]:result.items);setCursor(result.next_cursor);setLoaded(true);
  };
  return <section aria-label="온라인 백업에서 아기 복원" className="surface-card space-y-4 p-5">
    <div><h2 className="text-lg font-bold">다른 기기의 기록 가져오기</h2><p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">이 계정이 접근할 수 있는 백업을 확인해요. 선택한 백업은 새 아기로 추가하며, 기존 아기와 기록은 그대로 유지해요.</p></div>
    <Button disabled={busy} variant="outline" className="min-h-12 w-full rounded-xl" onClick={()=>load()}>{busy?"백업 확인 중…":loaded?"백업 목록 새로 확인":"내 백업 목록 확인"}</Button>
    {loaded&&!items.length&&<p role="status" className="text-sm leading-6">이 계정에서 이용할 수 있는 백업이 없어요. 새로 등록한 기록은 백업이 완료된 뒤 다른 기기에서 확인할 수 있어요.</p>}
    {items.length>0&&<ul className="space-y-3" aria-label="복원 가능한 아기 목록">{items.map(item=><li key={item.baby_id} className="rounded-2xl border border-[var(--border)] p-4">
      <p className="break-words font-semibold">{item.name}</p><p className="mt-1 text-sm text-[var(--muted-foreground)]">{item.birthdate} · {item.gender==="male"?"남아":"여아"} · {item.role==="reader"?"읽기 전용":"기록 관리 가능"}</p>
      <Button disabled={busy} variant="outline" className="mt-3 min-h-12 w-full rounded-xl" onClick={async()=>{
        setBusy(true);setError("");const result=await previewAccountRestore(accountId,item);setBusy(false);
        if("error" in result)setError(result.error);else setPreview(result);
      }}>{item.name} 백업 내용 확인</Button>
      <ExistingBackupMerge accountId={accountId} summary={item} />
    </li>)}</ul>}
    {cursor&&<Button variant="outline" disabled={busy} className="min-h-12 w-full" onClick={()=>load(true)}>백업 더 보기</Button>}
    {!preview&&error&&<p role="alert" className="text-sm leading-6 text-red-700 dark:text-red-300">{error}</p>}
    <Dialog open={!!preview} onOpenChange={open=>{if(!busy&&!open){setPreview(null);setError("");}}}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto rounded-2xl" showCloseButton={!busy}>
        <DialogHeader><DialogTitle>새 아기로 복원할까요?</DialogTitle><DialogDescription>기존 아기와 기록을 교체하지 않아요. 프로필·성장 수치·접종 기록을 이 기기에 추가해요. 사진·메모·발달 관찰은 서버 백업에 포함되지 않아요.</DialogDescription></DialogHeader>
        {preview&&<div className="space-y-2 rounded-xl bg-[var(--surface-bg)] p-4 text-sm leading-6"><p className="break-words font-semibold">{preview.snapshot.baby.name}</p><p>{preview.snapshot.baby.birthdate} · {preview.snapshot.baby.gender==="male"?"남아":"여아"}</p><p>성장 {preview.snapshot.measurements.length}건 · 접종 {preview.snapshot.vaccinations.length}건</p><p>복원 후 자동 백업은 꺼진 상태로 시작해요.</p>{preview.summary.role==="reader"&&<p>이 백업은 읽기 전용으로 이용해요.</p>}</div>}
        {error&&<p role="alert" className="text-sm leading-6 text-red-700 dark:text-red-300">{error}</p>}
        <DialogFooter>
          <DialogClose disabled={busy} render={<Button variant="outline" className="min-h-12" />}>취소</DialogClose>
          <Button disabled={busy||!!error} className="min-h-12" onClick={async()=>{
            if(!preview)return;setBusy(true);setError("");
            const result=await applyAccountRestore(preview);
            if("error" in result){setBusy(false);setError(result.error);if(isLocalRestoreBlocked())window.location.reload();return;}
            // Full navigation hydrates all four committed stores together, never a partial in-memory import.
            window.location.replace(`/settings?restored=${encodeURIComponent(result.localBabyId)}#settings-babies`);
          }}>{busy?"복원 확인 중…":"기존 기록 유지하고 복원"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </section>;
}
export default function AccountBackupRestore(){
  const {user,loading}=useAuth();
  if(!isAtomicRegistrationEnabled())return null;
  if(loading)return <p role="status" className="text-sm">복원할 계정을 확인하고 있어요.</p>;
  if(!user)return <section className="surface-card space-y-3 p-5"><h2 className="font-bold">기존 백업을 가져오려면 로그인해 주세요</h2><p className="text-sm leading-6">다른 기기에서 기록을 보관한 계정으로 로그인하면 백업을 확인할 수 있어요.</p><Link href="/login" className="inline-flex min-h-12 items-center font-semibold text-[var(--brand)]">로그인하고 백업 확인</Link></section>;
  return <RestoreCard key={user.id} accountId={user.id} />;
}
