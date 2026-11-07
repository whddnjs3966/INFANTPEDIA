"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useBabyStore } from "@/lib/store/baby-store";
import { useSyncStore } from "@/lib/store/sync-store";
import { useAtomicConnectionStore } from "@/lib/store/atomic-connection-store";
import { isAtomicRegistrationEnabled, registerLocalBackup } from "@/lib/sync/register-local-backup";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import RegistrationReview from "@/components/sharing/RegistrationReview";
import AtomicBackupStatus from "@/components/sharing/AtomicBackupStatus";
import { isAtomicAutobackupEnabled } from "@/lib/sync/run-atomic-backup";
import BackupFamily from "@/components/sharing/BackupFamily";
import FamilyInviteAccept from "@/components/sharing/FamilyInviteAccept";
import AccountBackupRestore from "@/components/sharing/AccountBackupRestore";
import AtomicConnectionActions from "@/components/sharing/AtomicConnectionActions";

function RegistrationCard({accountId,babyId,name}:{accountId:string;babyId:string;name:string}) {
  const [open,setOpen]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const pending=useAtomicConnectionStore(s=>s.pending.find(item=>item.accountId===accountId&&item.localBabyId===babyId));
  const connection=useAtomicConnectionStore(s=>s.connections.find(item=>item.accountId===accountId&&item.localBabyId===babyId));
  const detached=useAtomicConnectionStore(s=>s.detached.some(item=>item.connection.accountId===accountId&&item.connection.localBabyId===babyId));
  const legacy=useSyncStore(s=>s.mappings.some(item=>item.localBabyId===babyId));
  return <section aria-label="새 온라인 백업 등록" className="surface-card space-y-3 p-5">
    <h2 className="text-lg font-bold">{name}의 온라인 등록</h2>
    <p className="text-sm leading-6 text-[var(--muted-foreground)]">기기의 프로필·성장 수치·접종 정보를 로그인한 계정에 처음 보관해요. 사진·메모·발달 관찰은 전송하지 않아요.</p>
    {connection ? <AtomicBackupStatus accountId={accountId} babyId={babyId} /> : detached ? <AtomicConnectionActions accountId={accountId} babyId={babyId} /> : <>
      {legacy && <p className="text-sm leading-6">위에서 이전 연결 정보만 해제한 뒤 등록할 수 있어요.</p>}
      {pending && <p className="text-sm leading-6">확인이 끝나지 않은 등록 요청이 있어요. 같은 요청으로 결과를 다시 확인해요.</p>}
      <Button disabled={busy||legacy} className="min-h-12 w-full rounded-xl" onClick={()=>{setError("");setOpen(true);}}>{busy?"등록 결과 확인 중…":pending?"기존 등록 요청 다시 확인":"온라인 등록 시작"}</Button>
      {pending&&!legacy&&<RegistrationReview key={pending.requestId} accountId={accountId} babyId={babyId} />}
    </>}
    {error && <p role="alert" className="text-sm leading-6 text-red-700 dark:text-red-300">{error}</p>}
    <Dialog open={open} onOpenChange={value=>{if(!busy)setOpen(value);}}>
      <DialogContent className="rounded-2xl" showCloseButton={!busy}>
        <DialogHeader><DialogTitle>{pending?"같은 등록 요청을 확인할까요?":"현재 기록을 처음 등록할까요?"}</DialogTitle><DialogDescription>{name}의 기록을 현재 로그인한 계정에 보관해요. 기기 기록을 지우거나 서버 기록으로 교체하지 않아요. {isAtomicAutobackupEnabled()?"등록 뒤 자동 백업을 따로 켤 수 있어요. 가족 초대는 준비 중이에요.":"이후 자동 백업과 가족 초대는 아직 제공하지 않아요."}</DialogDescription></DialogHeader>
        <DialogFooter>
          <DialogClose disabled={busy} render={<Button variant="outline" className="min-h-12" />}>취소</DialogClose>
          <Button disabled={busy} className="min-h-12" onClick={async()=>{
            setBusy(true);setError("");
            const result=await registerLocalBackup(accountId,babyId);
            setBusy(false);setOpen(false);setError(result.error??"");
          }}>{busy?"확인 중…":pending?"같은 요청으로 확인":"기록 유지하고 등록"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </section>;
}
export default function AtomicRegistration() {
  const {user,loading}=useAuth();
  const profile=useBabyStore(s=>s.profile);
  if (!isAtomicRegistrationEnabled()||!profile) return null;
  if (loading) return <p role="status">로그인 계정을 확인하고 있어요.</p>;
  if (!user) return <section className="surface-card space-y-3 p-5"><h2 className="font-bold">온라인 등록은 로그인이 필요해요</h2><p className="text-sm leading-6">기기의 기록은 그대로 두고, 로그인한 계정에 등록할 수 있어요.</p><Link href="/login" className="inline-flex min-h-12 items-center font-semibold text-[var(--brand)]">로그인하기</Link></section>;
  return <div className="space-y-4"><RegistrationCard key={`${user.id}:${profile.id}`} accountId={user.id} babyId={profile.id} name={profile.name} /><BackupFamily /><FamilyInviteAccept /><AccountBackupRestore /></div>;
}
