import "@/lib/sync/local-restore-journal";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CloudSnapshot } from "@/lib/sync/cloud-snapshot";

export interface Registration {
  accountId: string;
  localBabyId: string;
  sharedBabyId: string;
  requestId: string;
  snapshot: CloudSnapshot;
}
export interface AtomicConnection extends Registration { revision: number; autoBackupEnabled?: boolean; role?: "owner"|"editor"|"reader"; requiresReview?: boolean; }
export interface DetachedConnection { connection:AtomicConnection; detachedAt:string; hadUncertainRequests:boolean; }
export interface ReviewWrite { accountId: string; localBabyId: string; creationRequestId: string; requestId: string; expectedRevision: number; snapshot: CloudSnapshot; }
interface AtomicConnections {
  pending: Registration[];
  connections: AtomicConnection[];
  detached: DetachedConnection[];
  reviewWrites: ReviewWrite[];
  prepare: (registration: Registration) => Registration;
  accept: (registration: Registration, revision: number) => boolean;
}
export const ATOMIC_CONNECTION_KEY = "baby-atomic-connections";
export function isAtomicConnectionPersisted(connection:AtomicConnection){
  try{return JSON.parse(localStorage.getItem(ATOMIC_CONNECTION_KEY)??"null")?.state?.connections?.some((c:AtomicConnection)=>JSON.stringify(c)===JSON.stringify(connection))===true;}catch{return false;}
}
const sameTarget = (a: Registration, b: Registration) => a.accountId === b.accountId && a.localBabyId === b.localBabyId;
export const useAtomicConnectionStore = create<AtomicConnections>()(persist((set, get) => ({
  pending: [], connections: [], reviewWrites: [], detached: [],
  prepare: registration => {
    const previous = get().pending.find(item => sameTarget(item, registration));
    if (previous) return previous;
    if (get().connections.some(item => sameTarget(item, registration))) throw new Error("ALREADY_CONNECTED");
    set(state => ({ pending: [...state.pending, registration] }));
    return registration;
  },
  accept: (registration, revision) => {
    const existing=get().connections.find(item=>sameTarget(item,registration)&&item.requestId===registration.requestId&&item.sharedBabyId===registration.sharedBabyId);
    if (!Number.isInteger(revision) || revision < 0 || (existing && revision < existing.revision) || (!existing&&!get().pending.some(item => sameTarget(item, registration) && item.requestId === registration.requestId))) return false;
    set(state => ({
      connections: [...state.connections.filter(item => !sameTarget(item, registration)), {...registration, revision, autoBackupEnabled:existing?.autoBackupEnabled??false, requiresReview:false}],
      pending: state.pending.filter(item => !sameTarget(item, registration)),
      reviewWrites: state.reviewWrites.filter(item => item.accountId !== registration.accountId || item.localBabyId !== registration.localBabyId),
    }));
    return true;
  },
}), { name: ATOMIC_CONNECTION_KEY }));
