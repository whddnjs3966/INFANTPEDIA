"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { reviewRegistration, applyRegistrationReview, registrationDifferences, type RegistrationReview as Review } from "@/lib/sync/review-registration";

export default function RegistrationReview({accountId,babyId}:{accountId:string;babyId:string}) {
  const [review,setReview]=useState<Review|null>(null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const load=async()=>{
    setBusy(true);setError("");
    const result=await reviewRegistration(accountId,babyId);
    setBusy(false);
    if("error" in result){setError(result.error);setReview(null);}else setReview(result);
  };
  const differences=review?registrationDifferences(review.local,review.remote):[];
  return <div className="space-y-3">
    <Button variant="outline" disabled={busy} className="min-h-12 w-full rounded-xl" onClick={load}>{busy?"기록 확인 중…":"기기·서버 기록 비교"}</Button>
    <p className="text-xs leading-5 text-[var(--muted-foreground)]">로그인한 계정의 서버 기록을 확인한 뒤 차이를 보여줘요. 비교만으로 현재 기기 기록을 서버에 덮어쓰지 않아요.</p>
    {!review&&error&&<p role="alert" className="text-sm leading-6 text-red-700 dark:text-red-300">{error}</p>}
    <Dialog open={!!review} onOpenChange={open=>{if(!open&&!busy){setReview(null);setError("");}}}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto rounded-2xl sm:max-w-lg" showCloseButton={!busy}>
        <DialogHeader><DialogTitle>기기와 서버의 기록 비교</DialogTitle><DialogDescription>기기의 기록은 그대로 유지해요. 아래 차이를 확인하고 선택한 경우에만 서버 백업을 기기 기록으로 갱신해요.</DialogDescription></DialogHeader>
        {review&&<>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-xl bg-[var(--surface-bg)] p-3"><p className="font-semibold">이 기기</p><p className="mt-1">성장 {review.local.measurements.length}건 · 접종 {review.local.vaccinations.length}건</p></div>
            <div className="rounded-xl bg-[var(--surface-bg)] p-3"><p className="font-semibold">서버 백업</p><p className="mt-1">성장 {review.remote.measurements.length}건 · 접종 {review.remote.vaccinations.length}건</p></div>
          </div>
          {differences.length?<div className="space-y-3" aria-label="다른 기록 목록">{differences.map((row,index)=><div key={`${row.label}:${index}`} className="rounded-xl border border-[var(--border)] p-3 text-sm leading-6"><p className="font-semibold">{row.label}</p><dl className="mt-2 space-y-2 break-words"><div><dt className="font-medium text-[var(--brand)]">이 기기</dt><dd>{row.local}</dd></div><div><dt className="font-medium text-[var(--muted-foreground)]">서버 백업</dt><dd>{row.remote}</dd></div></dl></div>)}</div>:<p role="status" className="text-sm leading-6">기기와 서버의 프로필·성장·접종 기록이 같아요. 서버에 쓰지 않고 연결만 확인해요.</p>}
          {differences.length>0&&<p className="rounded-xl bg-[var(--accent-soft)] p-3 text-sm leading-6">서버에만 있는 기록은 이 기기의 기록으로 교체되며, 기기에 없는 항목은 서버 백업에서도 빠져요. 기기의 사진·메모·발달 관찰과 다른 아기의 기록은 변경하지 않아요.</p>}
        </>}
        {error&&<p role="alert" className="text-sm leading-6 text-red-700 dark:text-red-300">{error}</p>}
        <DialogFooter className="gap-2">
          <DialogClose disabled={busy} render={<Button variant="outline" className="min-h-12" />}>취소</DialogClose>
          <Button variant="outline" disabled={busy} className="min-h-12" onClick={load}>다시 비교</Button>
          <Button disabled={busy||!!error} className="min-h-12" onClick={async()=>{
            if(!review)return;
            setBusy(true);setError("");const result=await applyRegistrationReview(review);setBusy(false);
            if(result.error)setError(result.error);else setReview(null);
          }}>{busy?"반영 확인 중…":differences.length?"기기 기록으로 백업 갱신":"같은 기록으로 연결"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>;
}
