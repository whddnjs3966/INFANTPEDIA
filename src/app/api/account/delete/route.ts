import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const uuid=(v:unknown):v is string=>typeof v==="string"&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(v);
function gate(request:NextRequest){
 if(process.env.ATOMIC_BACKUP_LIFECYCLE_ENABLED!=="true")return NextResponse.json({error:"새 계정 삭제 경로를 준비 중이에요. 계정과 기록은 유지됩니다."},{status:503});
 // Next can normalize request.url to localhost behind its dev/proxy listener.
 // Host is the browser-facing authority; never trust forwarded-host headers here.
 const url=new URL(request.url),host=request.headers.get("host")??url.host;
 if(request.headers.get("origin")!==`${url.protocol}//${host}`)return NextResponse.json({error:"요청 출처를 확인하지 못했어요."},{status:403});
 return null;
}
export async function POST(request:NextRequest){
 const blocked=gate(request);if(blocked)return blocked;
 try{const client=await createClient(),auth=await client.auth.getUser();if(auth.error||!auth.data.user)return NextResponse.json({error:"다시 로그인해 주세요."},{status:401});
 const result=await client.rpc("preview_account_backup_deletion",{p_expected_user_id:auth.data.user.id});
 if(result.error||!result.data?.manifest)return NextResponse.json({error:"계정 삭제 범위를 확인하지 못했어요. 기록은 유지돼요."},{status:409});
 return NextResponse.json({...result.data,account_id:auth.data.user.id});
 }catch{return NextResponse.json({error:"계정 삭제 범위를 불러오지 못했어요."},{status:503});}
}
export async function DELETE(request:NextRequest){
 const blocked=gate(request);if(blocked)return blocked;
 try{
  const body=await request.json();
  if(body?.confirmation!=="DELETE_ACCOUNT_AND_OWNED_BACKUPS"||!uuid(body.accountId)||!uuid(body.requestId)||!body.manifest||typeof body.manifest!=="object")return NextResponse.json({error:"삭제 확인 내용을 다시 확인해 주세요."},{status:400});
  const client=await createClient(),auth=await client.auth.getUser(),actor=auth.data.user;
  if(auth.error||!actor||actor.id!==body.accountId)return NextResponse.json({error:"로그인 계정이 바뀌었어요."},{status:401});
  const signed=Date.parse(actor.last_sign_in_at??"");if(!Number.isFinite(signed)||Date.now()-signed>15*60*1000||signed>Date.now()+60000)return NextResponse.json({error:"계정 삭제 전 다시 로그인해 주세요."},{status:401});
  const start=await client.rpc("start_account_backup_deletion",{p_expected_user_id:actor.id,p_request_id:body.requestId,p_manifest:body.manifest});
  if(start.error||start.data?.request_id!==body.requestId)return NextResponse.json({error:"삭제 범위나 권한이 바뀌었어요. 다시 확인해 주세요."},{status:409});
  const admin=createAdminClient();
  const purge=await admin.rpc("purge_account_backup_data",{p_user_id:actor.id,p_request_id:body.requestId});
  if(purge.error||purge.data?.status!=="purged"||purge.data?.request_id!==body.requestId)return NextResponse.json({error:"서버 기록 정리를 완료하지 못했어요. 같은 삭제 요청으로 재시도해 주세요.",request_id:body.requestId,status:"prepared"},{status:503});
  const deleted=await admin.auth.admin.deleteUser(actor.id);
  if(deleted.error)return NextResponse.json({error:"서버 백업은 정리했지만 로그인 계정 삭제를 완료하지 못했어요. 같은 요청으로 재시도해 주세요.",account_id:actor.id,request_id:body.requestId,status:"data_purged"},{status:502});
  return NextResponse.json({success:true,account_id:actor.id,request_id:body.requestId});
 }catch{return NextResponse.json({error:"삭제 결과를 확인하지 못했어요. 기존 요청을 보관하고 다시 확인해 주세요."},{status:503});}
}
