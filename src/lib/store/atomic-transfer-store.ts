import "@/lib/sync/local-restore-journal";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CloudSnapshot } from "@/lib/sync/cloud-snapshot";

export interface AtomicTransfer { accountId:string; localBabyId:string; sharedBabyId:string; connectionId:string; requestId:string; expectedRevision:number; snapshot:CloudSnapshot; }
export interface TransferStatus { phase:"checking"|"syncing"|"success"|"error"|"conflict"; message?:string; }
interface Transfers {
  outbox:Record<string,AtomicTransfer>;
  conflicts:Record<string,boolean>;
  status:(key:string,status:TransferStatus)=>void;
  retry:(key:string)=>void;
  resolve:(key:string)=>void;
}
export const useAtomicTransferRuntime=create<{statuses:Record<string,TransferStatus>;retries:Record<string,number>}>(()=>({statuses:{},retries:{}}));
export const ATOMIC_TRANSFER_KEY="baby-atomic-transfers";
export const transferKey=(accountId:string,localBabyId:string,sharedBabyId:string,connectionId:string)=>JSON.stringify([accountId,localBabyId,sharedBabyId,connectionId]);
export const useAtomicTransferStore=create<Transfers>()(persist((set,get)=>({
  outbox:{},conflicts:{},
  status:(key,value)=>useAtomicTransferRuntime.setState(s=>({statuses:{...s.statuses,[key]:value}})),
  retry:key=>{if(!get().conflicts[key])useAtomicTransferRuntime.setState(s=>({retries:{...s.retries,[key]:(s.retries[key]??0)+1}}));},
  resolve:key=>{set(s=>{const outbox={...s.outbox},conflicts={...s.conflicts};delete outbox[key];delete conflicts[key];return{outbox,conflicts};});useAtomicTransferRuntime.setState(s=>{const statuses={...s.statuses};delete statuses[key];return{statuses};});},
}),{name:ATOMIC_TRANSFER_KEY,partialize:s=>({outbox:s.outbox,conflicts:s.conflicts})}));
