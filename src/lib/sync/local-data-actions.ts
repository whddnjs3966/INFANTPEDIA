import { useBabyStore } from "@/lib/store/baby-store";
import { commitLocalData, LOCAL_DATA_KEYS, isLocalRestoreInProgress } from "@/lib/sync/local-restore-journal";

type Key=typeof LOCAL_DATA_KEYS[number];
export function readLocalState(key:Key):Record<string,unknown>{const raw=localStorage.getItem(key);return raw?JSON.parse(raw).state??{}:{};}
export const localEnvelope=(key:Key,state:unknown)=>JSON.stringify({state,version:key==="baby-profile"?1:0});
export function localDataFingerprint(){return JSON.stringify([LOCAL_DATA_KEYS.filter(k=>k!=="baby-account-deletion").map(k=>localStorage.getItem(k)),useBabyStore.getState().profile]);}
const list=(v:unknown):Record<string,unknown>[]=>Array.isArray(v)?v:[];
const object=(v:unknown):Record<string,unknown>=>v&&typeof v==="object"&&!Array.isArray(v)?v as Record<string,unknown>:{};
function keyParts(key:string){try{const p=JSON.parse(key);return Array.isArray(p)?p:[];}catch{return[];}}
export function deleteLocalBaby(babyId:string,before:string){
  if(isLocalRestoreInProgress()||before!==localDataFingerprint())return{error:"기기 기록이 바뀌었어요. 삭제할 아기를 다시 확인해 주세요."};
  try{
    const p=readLocalState("baby-profile"),old=list(p.babies),baby=old.find(b=>b.id===babyId);if(!baby)return{error:"삭제할 아기를 찾지 못했어요."};
    const babies=old.filter(b=>b.id!==babyId),active=babies.find(b=>b.id===p.activeBabyId)??babies[0]??null;
    const photos={...object(p.babyPhotos)};delete photos[babyId];const ownsLegacy=p.legacyOwnerId===babyId;
    const m=readLocalState("baby-measurements"),v=readLocalState("baby-vaccinations"),a=readLocalState("baby-atomic-connections"),t=readLocalState("baby-atomic-transfers"),s=readLocalState("baby-sync"),mil=readLocalState("infantpedia-milestones");
    const byBaby={...object(mil.byBaby)};delete byBaby[babyId];
    const allLinks=[...list(a.connections),...list(a.pending),...list(a.detached).map(r=>object(r.connection))];
    const removedScopes=new Set(allLinks.filter(c=>c.localBabyId===babyId).map(c=>`${c.accountId}:${c.sharedBabyId}`));
    const retainedScopes=new Set(allLinks.filter(c=>c.localBabyId!==babyId).map(c=>`${c.accountId}:${c.sharedBabyId}`));
    const invites=readLocalState("baby-family-invites"),jobs=readLocalState("baby-account-deletion");
    const after={
      "baby-profile":localEnvelope("baby-profile",{...p,babies,activeBabyId:active?.id??null,profile:active,babyPhotos:photos,legacyOwnerId:ownsLegacy?null:p.legacyOwnerId,legacyOwnershipChecked:true}),
      "baby-measurements":localEnvelope("baby-measurements",{...m,measurements:list(m.measurements).filter(r=>r.babyId!==babyId&&(r.babyId||!ownsLegacy))}),
      "baby-vaccinations":localEnvelope("baby-vaccinations",{...v,records:list(v.records).filter(r=>r.babyId!==babyId&&(r.babyId||!ownsLegacy))}),
      "baby-atomic-connections":localEnvelope("baby-atomic-connections",{...a,pending:list(a.pending).filter(r=>r.localBabyId!==babyId),connections:list(a.connections).filter(r=>r.localBabyId!==babyId),detached:list(a.detached).filter(r=>object(r.connection).localBabyId!==babyId),reviewWrites:list(a.reviewWrites).filter(r=>r.localBabyId!==babyId)}),
      "baby-atomic-transfers":localEnvelope("baby-atomic-transfers",{outbox:Object.fromEntries(Object.entries(object(t.outbox)).filter(([,v])=>object(v).localBabyId!==babyId)),conflicts:Object.fromEntries(Object.entries(object(t.conflicts)).filter(([key])=>keyParts(key)[1]!==babyId))}),
      "baby-sync":localEnvelope("baby-sync",{...s,mappings:list(s.mappings).filter(r=>r.localBabyId!==babyId),lastSyncAt:null}),
      "infantpedia-milestones":localEnvelope("infantpedia-milestones",{...mil,byBaby,completedMilestones:ownsLegacy?{}:mil.completedMilestones??{},completedDates:ownsLegacy?{}:mil.completedDates??{}}),
      "baby-family-invites":localEnvelope("baby-family-invites",Object.fromEntries(Object.entries(invites).filter(([,v])=>{const r=object(v),scope=`${r.accountId}:${r.babyId}`;return !removedScopes.has(scope)||retainedScopes.has(scope); }))),
      "baby-account-deletion":localEnvelope("baby-account-deletion",Object.fromEntries(Object.entries(jobs).filter(([key])=>!key.startsWith("baby:")||!removedScopes.has(key.slice(5))||retainedScopes.has(key.slice(5))))),
    };
    commitLocalData(after);return{};
  }catch{return{error:"기기 삭제 저장을 완료하지 못했어요. 기존 상태 복구를 시도했어요. 브라우저 데이터를 지우지 말고 다시 확인해 주세요."};}
}
export function resetLocalData(before:string){
  if(isLocalRestoreInProgress()||before!==localDataFingerprint())return{error:"기기 기록이 바뀌었어요. 다시 확인해 주세요."};
  try{
    const empty:Record<Key,unknown>={"baby-profile":{babies:[],profile:null,activeBabyId:null,babyPhotos:{},legacyOwnerId:null,legacyOwnershipChecked:true},"baby-measurements":{measurements:[]},"baby-vaccinations":{records:[]},"baby-atomic-connections":{pending:[],connections:[],detached:[],reviewWrites:[]},"baby-atomic-transfers":{outbox:{},conflicts:{}},"baby-sync":{mappings:[],lastSyncAt:null},"infantpedia-milestones":{completedMilestones:{},completedDates:{},byBaby:{}},"baby-family-invites":{},"baby-account-deletion":{}};
    commitLocalData(Object.fromEntries(LOCAL_DATA_KEYS.map(k=>[k,localEnvelope(k,empty[k])])));return{};
  }catch{return{error:"기기 초기화를 완료하지 못했어요. 저장 상태를 다시 확인해 주세요."};}
}
export function forgetAccountLinks(accountId:string,remoteId?:string){
  try{
    if(isLocalRestoreInProgress())throw Error("BUSY");
    const a=readLocalState("baby-atomic-connections"),t=readLocalState("baby-atomic-transfers");
    const match=(r:Record<string,unknown>)=>r.accountId===accountId&&(!remoteId||r.sharedBabyId===remoteId);
    const keyMatch=(key:string)=>{const p=keyParts(key);return p[0]===accountId&&(!remoteId||p[2]===remoteId);};
    const targets=new Set([...list(a.connections),...list(a.pending),...list(a.detached).map(r=>object(r.connection))].filter(match).map(r=>r.localBabyId));
    const pending=list(a.pending).filter(r=>!match(r)),connections=list(a.connections).filter(r=>!match(r)),detached=list(a.detached).filter(r=>!match(object(r.connection))),reviewWrites=list(a.reviewWrites).filter(r=>r.accountId!==accountId||(!!remoteId&&!targets.has(r.localBabyId)));
    const invites=readLocalState("baby-family-invites");
    const after:Partial<Record<Key,string>>={"baby-atomic-connections":localEnvelope("baby-atomic-connections",{...a,pending,connections,detached,reviewWrites}),"baby-atomic-transfers":localEnvelope("baby-atomic-transfers",{outbox:Object.fromEntries(Object.entries(object(t.outbox)).filter(([,v])=>!match(object(v)))),conflicts:Object.fromEntries(Object.entries(object(t.conflicts)).filter(([k])=>!keyMatch(k)))}),"baby-family-invites":localEnvelope("baby-family-invites",Object.fromEntries(Object.entries(invites).filter(([,v])=>{const r=object(v);return r.accountId!==accountId||(remoteId&&r.babyId!==remoteId);})))};
    const jobs=readLocalState("baby-account-deletion");
    after["baby-account-deletion"]=localEnvelope("baby-account-deletion",Object.fromEntries(Object.entries(jobs).filter(([key])=>remoteId?key!==`baby:${accountId}:${remoteId}`:key!==`account:${accountId}`&&!key.startsWith(`baby:${accountId}:`))));
    commitLocalData(after);return{};
  }catch{return{error:"서버 처리는 끝났지만 이 기기의 연결 정보 정리를 완료하지 못했어요. 새로고침 후 기기 기록을 확인해 주세요."};}
}
