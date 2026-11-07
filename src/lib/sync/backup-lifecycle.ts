import { createClient } from "@/lib/supabase/client";
import { isAtomicRegistrationEnabled } from "@/lib/sync/register-local-backup";
import { useAtomicConnectionStore, isAtomicConnectionPersisted, type AtomicConnection } from "@/lib/store/atomic-connection-store";
import { useBabyStore } from "@/lib/store/baby-store";
import { readAtomicBackup } from "@/lib/sync/atomic-backup";
import { snapshotSignature } from "@/lib/sync/register-local-backup";
import { disconnectAtomicConnection } from "@/lib/sync/atomic-connection-actions";
import { localEnvelope, readLocalState, forgetAccountLinks } from "@/lib/sync/local-data-actions";

export const isBackupLifecycleEnabled=()=>isAtomicRegistrationEnabled()&&process.env.NEXT_PUBLIC_BACKUP_LIFECYCLE_ENABLED==="true";
export interface FamilyMember{user_id:string;role:"owner"|"editor"|"reader";label:string;}
export interface FamilyInvitation{id:string;recipient:string;role:"editor"|"reader";expires_at:string;accepted:boolean;revoked:boolean;}
export interface Family{baby_id:string;revision:number;role:"owner"|"editor"|"reader";members:FamilyMember[];invitations:FamilyInvitation[];}
const uuid=(s:unknown):s is string=>typeof s==="string"&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(s);
const failed={error:"서버 처리 결과를 확인하지 못했어요. 기록은 기기에 유지돼요."};
type RpcResult={data:Record<string,unknown>|null}|{error:string;code?:string};
async function rpc(accountId:string,name:string,args:Record<string,unknown>):Promise<RpcResult>{
 if(!isBackupLifecycleEnabled()||!uuid(accountId))return failed;
 try{const client=createClient(),auth=await client.auth.getUser();if(auth.error||auth.data.user?.id!==accountId)return{error:"로그인 계정이 바뀌었어요."};
 if(!isBackupLifecycleEnabled())return failed;
 const result=await client.rpc(name,{p_expected_user_id:accountId,...args});
 const after=await client.auth.getUser();if(after.error||after.data.user?.id!==accountId)return{error:"처리 중 계정이 바뀌었어요. 이전 요청의 상태를 다시 확인해 주세요."};
 if(result.error)return{code:result.error.code,error:result.error.code==="40001"?"서버 기록이 바뀌었어요. 최신 내용을 다시 확인해 주세요.":result.error.code==="42501"?"접근 권한이나 계정 삭제 상태를 확인해 주세요.":"요청을 처리하지 못했어요. 대상·권한·초대 유효성을 다시 확인해 주세요."};
 return{data:result.data as Record<string,unknown>|null};}catch{return failed;}
}
export async function backupFamily(accountId:string,babyId:string):Promise<Family|{error:string}>{
 if(!uuid(babyId))return failed;const result=await rpc(accountId,"backup_family",{p_baby_id:babyId});if("error" in result)return result;
 const v=result.data;if(!v||v.baby_id!==babyId||typeof v.revision!=="number"||!Number.isInteger(v.revision)||v.revision<0||typeof v.role!=="string"||!["owner","editor","reader"].includes(v.role)||!Array.isArray(v.members)||!Array.isArray(v.invitations))return failed;
 if(v.members.some((m:FamilyMember)=>!uuid(m.user_id)||!["owner","editor","reader"].includes(m.role)||typeof m.label!=="string")||v.invitations.some((i:FamilyInvitation)=>!uuid(i.id)||typeof i.recipient!=="string"||!["editor","reader"].includes(i.role)||!Number.isFinite(Date.parse(i.expires_at))||typeof i.accepted!=="boolean"||typeof i.revoked!=="boolean"))return failed;
 return {baby_id:babyId,revision:v.revision,role:v.role as Family["role"],members:v.members as FamilyMember[],invitations:v.invitations as FamilyInvitation[]};
}
export async function createFamilyInvite(accountId:string,babyId:string,revision:number,email:string,role:"reader"|"editor"){
 if(!isBackupLifecycleEnabled()||!uuid(accountId)||!uuid(babyId)||!Number.isInteger(revision)||revision<0||!email.trim()||!["reader","editor"].includes(role))return failed;
 try{
  const key=JSON.stringify([accountId,babyId]),cache=readLocalState("baby-family-invites");
  let request=cache[key] as {accountId:string;babyId:string;email:string;role:string;requestId:string;token:string}|undefined;
  if(request&&(request.email!==email.trim().toLowerCase()||request.role!==role))return{error:"확인 중인 이전 초대가 있어요. 같은 정보로 확인하거나 이전 요청을 정리해 주세요."};
  if(!request){request={accountId,babyId,email:email.trim().toLowerCase(),role,requestId:crypto.randomUUID(),token:crypto.randomUUID().replaceAll("-","")+crypto.randomUUID().replaceAll("-","")};cache[key]=request;localStorage.setItem("baby-family-invites",localEnvelope("baby-family-invites",cache));}
  if(JSON.stringify(readLocalState("baby-family-invites")[key])!==JSON.stringify(request))return{error:"초대 요청을 기기에 저장하지 못했어요."};
  const result=await rpc(accountId,"create_backup_invitation",{p_baby_id:babyId,p_expected_revision:revision,p_target_email:request.email,p_role:role,p_request_id:request.requestId,p_token:request.token});if("error" in result){if("code" in result&&result.code==="22023")clearInviteDraft(accountId,babyId);return result;}
  const i=result.data;if(!i||!uuid(i.id)||i.baby_id!==babyId||i.token!==request.token||i.role!==role||typeof i.expires_at!=="string"||!Number.isFinite(Date.parse(i.expires_at)))return failed;
  return{invitation:i as {id:string;baby_id:string;token:string;role:string;expires_at:string}};
 }catch{return{error:"초대 요청 저장이나 결과 확인에 실패했어요. 같은 정보로 다시 확인해 주세요."};}
}
export function clearInviteDraft(accountId:string,babyId:string){const cache=readLocalState("baby-family-invites");delete cache[JSON.stringify([accountId,babyId])];localStorage.setItem("baby-family-invites",localEnvelope("baby-family-invites",cache));}
export const revokeFamilyInvite=(accountId:string,babyId:string,id:string)=>rpc(accountId,"revoke_backup_invitation",{p_baby_id:babyId,p_invitation_id:id});
export const changeFamilyMember=(accountId:string,babyId:string,target:string,role:"editor"|"reader"|null)=>rpc(accountId,"change_backup_member",{p_baby_id:babyId,p_target_user:target,p_role:role});
export async function acceptFamilyInvite(accountId:string,token:string){
 if(!/^[0-9a-f]{64}$/.test(token.trim()))return{error:"초대 코드를 확인해 주세요."};const result=await rpc(accountId,"accept_backup_invitation",{p_token:token.trim()});if("error" in result)return result;
 if(!result.data||!uuid(result.data.baby_id)||typeof result.data.role!=="string"||!["owner","editor","reader"].includes(result.data.role))return failed;return{babyId:result.data.baby_id,role:result.data.role as string};
}
export async function leaveFamily(connection:AtomicConnection){
 const result=await rpc(connection.accountId,"leave_backup_family",{p_baby_id:connection.sharedBabyId});if("error" in result)return result;
 const current=useAtomicConnectionStore.getState().connections.find(c=>c.accountId===connection.accountId&&c.localBabyId===connection.localBabyId&&c.sharedBabyId===connection.sharedBabyId&&c.requestId===connection.requestId);
 if(!current)return{};
 return disconnectAtomicConnection(current);
}
export interface DeletePreview{connection:AtomicConnection;revision:number;name:string;members:number;}
export async function previewServerBabyDelete(connection:AtomicConnection):Promise<DeletePreview|{error:string}>{
 if(!isBackupLifecycleEnabled()||useBabyStore.getState().profile?.id!==connection.localBabyId||!isAtomicConnectionPersisted(connection))return failed;
 const previous=readLocalState("baby-account-deletion")[`baby:${connection.accountId}:${connection.sharedBabyId}`] as {revision:number;name:string;members:number}|undefined;
 if(previous&&Number.isInteger(previous.revision)&&typeof previous.name==="string")return{connection,revision:previous.revision,name:previous.name,members:previous.members};
 const family=await backupFamily(connection.accountId,connection.sharedBabyId);if("error" in family)return family;if(family.role!=="owner")return{error:"서버 백업 삭제는 소유자만 할 수 있어요."};
 const snapshot=await readAtomicBackup(connection.sharedBabyId);if("error" in snapshot)return snapshot;if(snapshot.revision!==family.revision)return failed;
 return{connection,revision:snapshot.revision,name:snapshot.snapshot.baby.name,members:family.members.length};
}
export async function deleteServerBaby(preview:DeletePreview,confirmation:string){
 const c=preview.connection;if(!isBackupLifecycleEnabled()||confirmation!==preview.name||useBabyStore.getState().profile?.id!==c.localBabyId||!isAtomicConnectionPersisted(c))return failed;
 const current=useAtomicConnectionStore.getState().connections.find(i=>i.accountId===c.accountId&&i.localBabyId===c.localBabyId);
 if(!current||current.requestId!==c.requestId||snapshotSignature(current.snapshot)!==snapshotSignature(c.snapshot))return failed;
 try{
  const job=readLocalState("baby-account-deletion"),key=`baby:${c.accountId}:${c.sharedBabyId}`;
  const request=(job[key] as {requestId:string;revision:number;name:string;members:number}|undefined)??{requestId:crypto.randomUUID(),revision:preview.revision,name:preview.name,members:preview.members};
  job[key]=request;localStorage.setItem("baby-account-deletion",localEnvelope("baby-account-deletion",job));
  if(JSON.stringify(readLocalState("baby-account-deletion")[key])!==JSON.stringify(request))return failed;
  if(request.revision!==preview.revision)return{error:"이전 삭제 요청이 있어요. 결과를 확인한 뒤 다시 시도해 주세요."};
  const result=await rpc(c.accountId,"delete_backup_baby",{p_baby_id:c.sharedBabyId,p_expected_revision:request.revision,p_request_id:request.requestId});if("error" in result){if("code" in result&&result.code==="40001"){delete job[key];localStorage.setItem("baby-account-deletion",localEnvelope("baby-account-deletion",job));}return result;}
  if(!result.data||result.data.deleted!==true||result.data.baby_id!==c.sharedBabyId||result.data.request_id!==request.requestId)return failed;
  return forgetAccountLinks(c.accountId,c.sharedBabyId);
 }catch{return failed;}
}
