"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { isBackupLifecycleEnabled } from "@/lib/sync/backup-lifecycle";
import { localDataFingerprint,readLocalState,localEnvelope,resetLocalData,forgetAccountLinks } from "@/lib/sync/local-data-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription,DialogFooter,DialogClose } from "@/components/ui/dialog";
interface Preview{account_id:string;request_id?:string;status:string;manifest:{owned:{baby_id:string;name:string;members:{user_id:string;role:string}[]}[];shared:{baby_id:string;name:string;role:string}[];unverified_legacy:number};}
function AccountCard({accountId}:{accountId:string}){
 const [preview,setPreview]=useState<Preview|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(""),[confirm,setConfirm]=useState(""),[clearLocal,setClearLocal]=useState(false),[fingerprint,setFingerprint]=useState("");
 return <section className="surface-card space-y-3 p-5" aria-label="계정 삭제"><h3 className="text-base font-bold">계정 삭제</h3><p className="text-sm leading-6 text-[var(--muted-foreground)]">내가 소유한 서버 백업은 가족의 접근까지 삭제하고, 다른 가족이 소유한 백업에서는 내 접근만 해제해요. 기기 기록 삭제는 별도로 선택해요.</p>
 <Button variant="outline" disabled={busy||!isBackupLifecycleEnabled()} className="min-h-12 w-full" onClick={async()=>{setBusy(true);setError("");try{const r=await fetch('/api/account/delete',{method:'POST'}),data=await r.json();if(!r.ok||data.account_id!==accountId||!Array.isArray(data.manifest?.owned)||!Array.isArray(data.manifest?.shared)||!Number.isInteger(data.manifest?.unverified_legacy))setError(data.error??"삭제 범위를 확인하지 못했어요.");else{setPreview(data);setConfirm("");setClearLocal(false);setFingerprint(localDataFingerprint());}}catch{setError("삭제 범위를 불러오지 못했어요.");}finally{setBusy(false);}}}>계정 삭제 범위 확인</Button>
 {!isBackupLifecycleEnabled()&&<p className="text-xs leading-5">안전한 서버 파기 경로를 준비 중이며 현재 계정 삭제는 중지 상태예요.</p>}
 {!preview&&error&&<p role="alert" className="text-sm text-red-700 dark:text-red-300">{error}</p>}
 <Dialog open={!!preview} onOpenChange={open=>{if(!open&&!busy){setPreview(null);setError("");}}}><DialogContent className="max-h-[85dvh] overflow-y-auto rounded-2xl" showCloseButton={!busy}><DialogHeader><DialogTitle>계정과 소유 백업을 삭제할까요?</DialogTitle><DialogDescription>서버 삭제와 로그인 계정 삭제를 순서대로 진행해요. 서버 정리 후 로그인 삭제가 실패하면 같은 요청으로 재시도하며, 완료된 삭제는 되돌릴 수 없어요.</DialogDescription></DialogHeader>
 {preview&&<div className="space-y-3 text-sm leading-6"><p className="font-semibold">내 소유 백업 {preview.manifest.owned.length}개 · 다른 가족 백업 {preview.manifest.shared.length}개</p>{preview.manifest.owned.map(b=><p key={b.baby_id}>삭제: {b.name} · 연결 가족 {b.members.length}명</p>)}{preview.manifest.shared.map(b=><p key={b.baby_id}>내 접근만 해제: {b.name}</p>)}{preview.manifest.unverified_legacy>0&&<p className="text-red-700 dark:text-red-300">소유권을 확인하지 못한 기존 서버 기록이 있어 삭제를 진행할 수 없어요.</p>}<label className="flex items-start gap-2"><input type="checkbox" checked={clearLocal} onChange={e=>setClearLocal(e.target.checked)} className="mt-1 h-5 w-5" /><span>이 브라우저의 모든 아기·기록·사진·메모도 삭제해요. 다른 계정으로 남긴 기기 기록도 포함돼요.</span></label><label htmlFor="delete-account-confirm" className="block font-semibold">계속하려면 ‘계정 삭제’를 입력해 주세요</label><Input id="delete-account-confirm" value={confirm} onChange={e=>setConfirm(e.target.value)} autoComplete="off" />{preview.status!=='preview'&&<p>이전에 확인한 삭제 요청을 이어서 처리해요. 상태: {preview.status==='purged'?'로그인 계정 삭제 대기':'서버 정리 대기'}</p>}</div>}
 {error&&<div role="alert" className="text-sm leading-6 text-red-700 dark:text-red-300">{error}<Link href="/login" className="block min-h-12 py-3 font-semibold underline">로그인 상태 다시 확인</Link></div>}
 <DialogFooter><DialogClose disabled={busy} render={<Button variant="outline" className="min-h-12" />}>취소</DialogClose><Button variant="destructive" disabled={busy||confirm!=='계정 삭제'||!!preview?.manifest.unverified_legacy} className="min-h-12" onClick={async()=>{
  if(!preview)return;setBusy(true);setError("");
  try{const key=`account:${accountId}`,cache=readLocalState('baby-account-deletion'),old=cache[key] as {requestId:string;manifest:unknown}|undefined;
   const requestId=preview.request_id??(old&&JSON.stringify(old.manifest)===JSON.stringify(preview.manifest)?old.requestId:crypto.randomUUID());cache[key]={requestId,manifest:preview.manifest};localStorage.setItem('baby-account-deletion',localEnvelope('baby-account-deletion',cache));if((readLocalState('baby-account-deletion')[key] as {requestId?:string})?.requestId!==requestId)throw Error('SAVE_FAILED');
   const r=await fetch('/api/account/delete',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({accountId,requestId,manifest:preview.manifest,confirmation:'DELETE_ACCOUNT_AND_OWNED_BACKUPS'})}),data=await r.json();
   if(!r.ok||data.success!==true||data.account_id!==accountId||data.request_id!==requestId){setError(data.error??"삭제 결과를 확인하지 못했어요. 같은 요청을 보관했어요.");return;}
   const session=await createClient().auth.getSession();if(session.data.session?.user.id&&session.data.session.user.id!==accountId){setError("이전 계정 삭제는 완료됐지만 현재 로그인 계정이 달라져 기기 기록을 지우지 않았어요.");return;}
   const local=clearLocal?resetLocalData(fingerprint):forgetAccountLinks(accountId);if(local.error){setError(`계정 삭제는 완료됐어요. ${local.error}`);return;}
   try{await createClient().auth.signOut({scope:'local'});}catch{/* auth account is already deleted */}window.location.replace('/onboarding?accountDeleted=1');
  }catch{setError("요청 저장 또는 삭제 결과를 확인하지 못했어요. 기록을 지우지 말고 같은 요청으로 다시 확인해 주세요.");}finally{setBusy(false);}
 }}>확인한 범위 삭제</Button></DialogFooter></DialogContent></Dialog>
 </section>;
}
export default function AccountDeletion(){const {user}=useAuth();return user?<AccountCard key={user.id} accountId={user.id}/>:null;}
