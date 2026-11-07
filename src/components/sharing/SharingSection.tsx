"use client";

import { useState } from "react";
import { CloudOff, ShieldCheck, Unlink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { useBabyStore } from "@/lib/store/baby-store";
import { useSyncStore } from "@/lib/store/sync-store";
import { disconnectSharing } from "@/lib/sync/disconnect-sharing";
import { SHARING_PAUSED_MESSAGE } from "@/lib/sync/sharing-availability";
import AtomicRegistration from "@/components/sharing/AtomicRegistration";
import { isAtomicRegistrationEnabled } from "@/lib/sync/register-local-backup";

function ConnectionNotice({ babyId, name, sharedBabyId }: { babyId: string; name: string; sharedBabyId?: string }) {
  const [error, setError] = useState("");
  return <section aria-label="가족 공유 상태" className="surface-card space-y-5 p-5">
    <div className="flex items-center gap-3">
      <span className="rounded-2xl bg-[var(--accent-soft)] p-3 text-[var(--brand)]"><CloudOff size={22} aria-hidden="true" /></span>
      <div><p className="text-xs font-semibold text-[var(--muted-foreground)]">가족 공유</p><h2 className="mt-1 text-lg font-bold">기기에 보관 중이에요</h2></div>
    </div>
    <p className="text-sm leading-6 text-[var(--muted-foreground)]">{SHARING_PAUSED_MESSAGE}</p>
    <div className="rounded-2xl bg-[var(--surface-bg)] p-4 text-sm leading-6">
      <p className="flex items-center gap-2 font-semibold"><ShieldCheck size={18} className="shrink-0 text-[var(--brand)]" aria-hidden="true" />{name}의 기록은 유지돼요</p>
      <p className="mt-2 text-[var(--muted-foreground)]">프로필·성장·접종 기록과 사진·메모는 그대로예요. 온라인 전송과 초대코드 생성·가져오기는 현재 이용할 수 없어요.</p>
    </div>
    {sharedBabyId ? <div className="space-y-3 border-t border-[var(--border)] pt-4">
      <p className="text-sm font-semibold">이 기기에 이전 공유 연결이 남아 있어요</p>
      <p className="text-sm leading-6 text-[var(--muted-foreground)]">이 연결은 현재 사용할 수 없어요. 연결 정보만 해제하면 이 기기의 기록은 계속 이용할 수 있어요.</p>
      <Dialog>
        <DialogTrigger render={<Button variant="outline" className="min-h-12 w-full rounded-xl" />}><Unlink size={16} aria-hidden="true" />이전 연결 정보 해제</DialogTrigger>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>연결 정보만 해제할까요?</DialogTitle><DialogDescription>{name}의 이 브라우저에 저장된 공유 연결만 해제해요. 아기와 기록은 삭제하지 않으며, 다른 기기의 연결이나 서버 데이터는 변경하지 않아요.</DialogDescription></DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" className="min-h-12 rounded-xl" />}>취소</DialogClose>
            <Button className="min-h-12 rounded-xl bg-[var(--brand)] text-[var(--brand-foreground)]" onClick={() => {
              if (!disconnectSharing(babyId, sharedBabyId)) setError("아기나 공유 연결이 바뀌었어요. 현재 상태를 확인한 뒤 다시 시도해 주세요.");
            }}>기록 유지하고 해제</Button>
          </DialogFooter>
          {error && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{error}</p>}
        </DialogContent>
      </Dialog>
    </div> : <p role="status" className="text-sm leading-6 text-[var(--muted-foreground)]">이 아기의 공유 연결 정보가 없어요. 현재 기록은 이 브라우저에 보관돼요.</p>}
    <p className="text-xs leading-5 text-[var(--muted-foreground)]">브라우저 데이터를 지우면 기기의 기록을 잃을 수 있어요.</p>
  </section>;
}

export default function SharingSection() {
  const profile = useBabyStore(state => state.profile);
  const mapping = useSyncStore(state => state.mappings.find(item => item.localBabyId === profile?.id));
  if (!profile) return null;
  // Reset an open confirmation when its baby or shared target changes.
  return <div className="space-y-4">{(!isAtomicRegistrationEnabled() || mapping) && <ConnectionNotice key={`${profile.id}:${mapping?.sharedBabyId ?? "local"}`} babyId={profile.id} name={profile.name} sharedBabyId={mapping?.sharedBabyId} />}<AtomicRegistration /></div>;
}
