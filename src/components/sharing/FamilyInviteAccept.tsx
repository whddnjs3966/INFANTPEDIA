"use client";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { isBackupLifecycleEnabled,acceptFamilyInvite } from "@/lib/sync/backup-lifecycle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
export default function FamilyInviteAccept(){const {user}=useAuth();const [token,setToken]=useState(""),[busy,setBusy]=useState(false),[message,setMessage]=useState("");if(!isBackupLifecycleEnabled()||!user)return null;return <section className="surface-card space-y-3 p-5" aria-label="가족 초대 참여"><h2 className="text-lg font-bold">받은 가족 초대로 참여하기</h2><label htmlFor="family-invite-token" className="block text-sm">이 이메일 계정 앞으로 받은 64자리 코드</label><Input id="family-invite-token" value={token} maxLength={64} onChange={e=>{setToken(e.target.value.trim().toLowerCase());setMessage("");}} autoComplete="off" /><Button disabled={busy||token.length!==64} className="min-h-12 w-full" onClick={async()=>{setBusy(true);const r=await acceptFamilyInvite(user.id,token);setBusy(false);setMessage("error" in r?r.error:"가족 접근이 연결됐어요. 아래 백업 목록을 새로 확인해 기록을 가져올 수 있어요.");}}>초대 확인하고 참여</Button>{message&&<p role="status" className="text-sm leading-6">{message}</p>}<p className="text-xs leading-5 text-[var(--muted-foreground)]">참여만으로 이 기기의 기록을 교체하거나 자동 전송하지 않아요.</p></section>;}
