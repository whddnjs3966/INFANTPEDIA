"use client";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useBabyStore } from "@/lib/store/baby-store";
import { useAtomicConnectionStore } from "@/lib/store/atomic-connection-store";
import { backupFamily,createFamilyInvite,revokeFamilyInvite,changeFamilyMember,leaveFamily,clearInviteDraft,isBackupLifecycleEnabled,type Family } from "@/lib/sync/backup-lifecycle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription,DialogFooter,DialogClose } from "@/components/ui/dialog";

function FamilyCard({accountId,babyId}:{accountId:string;babyId:string}){
 const connection=useAtomicConnectionStore(s=>s.connections.find(c=>c.accountId===accountId&&c.localBabyId===babyId));
 const [family,setFamily]=useState<Family|null>(null),[email,setEmail]=useState(""),[role,setRole]=useState<"reader"|"editor">("reader"),[busy,setBusy]=useState(false),[error,setError]=useState(""),[token,setToken]=useState(""),[copied,setCopied]=useState(false);
 const [checkedAt,setCheckedAt]=useState(0);
 const [action,setAction]=useState<{title:string;description:string;run:()=>Promise<{error?:string}>}|null>(null);
 async function load(){if(!connection)return;setBusy(true);setError("");const r=await backupFamily(accountId,connection.sharedBabyId);setBusy(false);if("error" in r)setError(r.error);else{setFamily(r);setCheckedAt(Date.now());}}
 if(!connection)return null;
 return <section aria-label="가족 접근 관리" className="surface-card space-y-4 p-5"><h2 className="text-lg font-bold">가족과 함께 기록하기</h2><p className="text-sm leading-6 text-[var(--muted-foreground)]">초대는 지정한 이메일의 로그인 계정만 사용할 수 있어요. 읽기 전용과 기록 수정 권한을 구분해요.</p>
 <Button variant="outline" disabled={busy} className="min-h-12 w-full" onClick={load}>가족·초대 상태 확인</Button>
 {family&&<>
  <ul className="space-y-3">{family.members.map(m=><li key={m.user_id} className="rounded-xl border border-[var(--border)] p-3 text-sm leading-6"><p className="break-all font-semibold">{m.label}{m.user_id===accountId?" (나)":""}</p><p>{m.role==="owner"?"소유자":m.role==="editor"?"기록 수정 가능":"읽기 전용"}</p>{family.role==="owner"&&m.role!=="owner"&&<div className="mt-2 flex flex-wrap gap-2"><Button variant="outline" disabled={busy} className="min-h-12" onClick={()=>setAction({title:"가족 권한을 변경할까요?",description:`${m.label}의 권한을 ${m.role==="reader"?"기록 수정 가능":"읽기 전용"}으로 바꿔요. 이전 초대는 취소돼요.`,run:async()=>{const r=await changeFamilyMember(accountId,connection.sharedBabyId,m.user_id,m.role==="reader"?"editor":"reader");return "error" in r?r:{};}})}>권한 변경</Button><Button variant="outline" disabled={busy} className="min-h-12" onClick={()=>setAction({title:"가족 접근을 해제할까요?",description:`${m.label}의 서버 접근을 중단해요. 이미 각 기기에 저장한 기록은 원격으로 지우지 않아요.`,run:async()=>{const r=await changeFamilyMember(accountId,connection.sharedBabyId,m.user_id,null);return "error" in r?r:{};}})}>접근 해제</Button></div>}</li>)}</ul>
  {family.role==="owner"?<div className="space-y-3 border-t border-[var(--border)] pt-4">
   <label className="block text-sm font-semibold" htmlFor={`invite-email-${babyId}`}>초대받을 계정 이메일</label><Input id={`invite-email-${babyId}`} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="family@example.com" />
   <div className="grid grid-cols-2 gap-2">{(["reader","editor"] as const).map(r=><Button key={r} variant={role===r?"default":"outline"} aria-pressed={role===r} className="min-h-12" onClick={()=>setRole(r)}>{r==="reader"?"읽기 전용":"기록 수정 가능"}</Button>)}</div>
   <p className="text-xs leading-5 text-[var(--muted-foreground)]">24시간 동안 유효해요. 응답을 확인하지 못했다면 같은 이메일·권한으로 다시 확인해 주세요.</p>
   <Button disabled={busy||!email.trim()} className="min-h-12 w-full" onClick={async()=>{setBusy(true);setError("");const r=await createFamilyInvite(accountId,connection.sharedBabyId,family.revision,email,role);setBusy(false);if("error" in r)setError(r.error);else{setToken(r.invitation.token);setCopied(false);await load();}}}>가족 초대 코드 만들기</Button>
   {token&&<div className="space-y-2 rounded-xl bg-[var(--surface-bg)] p-3"><p className="text-sm font-semibold">지정한 가족에게 직접 전달해 주세요</p><code className="block break-all text-xs">{token}</code><Button variant="outline" className="min-h-12 w-full" onClick={async()=>{try{await navigator.clipboard.writeText(token);setCopied(true);}catch{setError("코드를 길게 눌러 복사해 주세요.");}}}>{copied?"코드 복사됨":"초대 코드 복사"}</Button><Button variant="outline" className="min-h-12 w-full" disabled={busy} onClick={()=>{clearInviteDraft(accountId,connection.sharedBabyId);setToken("");setEmail("");setCopied(false);}}>다른 가족 초대하기</Button><p className="text-xs leading-5">이미 만든 초대는 유지돼요. 참여 대기 목록에서 취소할 수 있어요.</p></div>}
   {family.invitations.map(i=><div key={i.id} className="rounded-xl border border-[var(--border)] p-3 text-sm leading-6"><p className="break-all">{i.recipient} · {i.role==="reader"?"읽기 전용":"수정 가능"}</p><p>{i.revoked?"취소됨":Date.parse(i.expires_at)<checkedAt?"만료됨":i.accepted?"참여 완료":"참여 대기"}</p><p className="text-xs">만료: {new Date(i.expires_at).toLocaleString("ko-KR",{timeZone:"Asia/Seoul"})}</p>{!i.revoked&&!i.accepted&&<Button variant="outline" disabled={busy} className="mt-2 min-h-12" onClick={()=>setAction({title:"이 초대를 취소할까요?",description:`${i.recipient}에게 전달한 초대 코드를 사용할 수 없게 해요.`,run:async()=>{const r=await revokeFamilyInvite(accountId,connection.sharedBabyId,i.id);if("error" in r)return r;clearInviteDraft(accountId,connection.sharedBabyId);setToken("");return{};}})}>초대 취소</Button>}</div>)}
  </div>:<Button variant="outline" disabled={busy} className="min-h-12 w-full" onClick={()=>setAction({title:"가족 공유에서 나갈까요?",description:"이 계정의 서버 접근과 이 기기의 연결을 해제해요. 기기 기록과 다른 가족의 접근은 유지돼요.",run:()=>leaveFamily(connection)})}>가족 공유 나가기</Button>}
 </>}
 {error&&<p role="alert" className="text-sm leading-6 text-red-700 dark:text-red-300">{error}</p>}
 <Dialog open={!!action} onOpenChange={open=>{if(!open&&!busy)setAction(null);}}><DialogContent className="rounded-2xl" showCloseButton={!busy}><DialogHeader><DialogTitle>{action?.title}</DialogTitle><DialogDescription>{action?.description}</DialogDescription></DialogHeader><DialogFooter><DialogClose disabled={busy} render={<Button variant="outline" className="min-h-12" />}>취소</DialogClose><Button disabled={busy} className="min-h-12" onClick={async()=>{if(!action)return;setBusy(true);setError("");const r=await action.run();setBusy(false);setAction(null);if(r.error)setError(r.error);else await load();}}>확인하고 반영</Button></DialogFooter></DialogContent></Dialog>
 </section>;
}
export default function BackupFamily(){const {user}=useAuth();const profile=useBabyStore(s=>s.profile);if(!isBackupLifecycleEnabled()||!user||!profile)return null;return <FamilyCard key={`${user.id}:${profile.id}`} accountId={user.id} babyId={profile.id} />;}
