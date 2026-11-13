"use client";

import { ChevronDown, ChevronRight, Database } from "lucide-react";
import { useBabyStore } from "@/lib/store/baby-store";
import { useMeasurementStore } from "@/lib/store/measurement-store";
import { useVaccinationStore } from "@/lib/store/vaccination-store";
import { useSyncStore } from "@/lib/store/sync-store";
import { recordsForBaby } from "@/lib/utils/baby-records";
import { useBackupStore } from "@/lib/store/backup-store";
import { isLegacySharingPaused, SHARING_PAUSED_MESSAGE } from "@/lib/sync/sharing-availability";
import { useAtomicConnectionStore } from "@/lib/store/atomic-connection-store";
import { isAtomicRegistrationEnabled } from "@/lib/sync/register-local-backup";
import AtomicBackupStatus from "@/components/sharing/AtomicBackupStatus";
import AtomicConnectionActions from "@/components/sharing/AtomicConnectionActions";

export default function StorageOverview({ signedIn, checkingAccount, accountId }: { signedIn: boolean; checkingAccount: boolean; accountId?: string }) {
  const profile = useBabyStore(state => state.profile);
  const babies = useBabyStore(state => state.babies);
  const owner = useBabyStore(state => state.legacyOwnerId);
  const measurements = useMeasurementStore(state => state.measurements);
  const vaccinations = useVaccinationStore(state => state.records);
  const sharedBabyId = useSyncStore(state => state.mappings.find(mapping => mapping.localBabyId === profile?.id)?.sharedBabyId);
  const connected = !!sharedBabyId;
  const status = useBackupStore(state => profile ? state.byBaby[profile.id] : undefined);
  const backup = status?.accountId === accountId && status?.sharedBabyId === sharedBabyId ? status : undefined;
  const phase = backup?.phase ?? "idle";
  const paused = isLegacySharingPaused();
  const atomic = useAtomicConnectionStore(s => s.connections.find(c => c.accountId === accountId && c.localBabyId === profile?.id));
  const detached = useAtomicConnectionStore(s => s.detached.some(d => d.connection.accountId === accountId && d.connection.localBabyId === profile?.id));
  const title = paused ? "온라인 백업 일시 중지" : checkingAccount ? "계정 확인 중" : !signedIn ? "기기에서만 관리 중" : !connected ? "가족 공유 연결 없음" : ({ queued: "온라인 백업 대기", syncing: "온라인 백업 중", success: "온라인 전송 완료", error: "온라인 백업 실패", idle: "온라인 백업 확인 필요" })[phase];
  const atomicActive = profile && accountId && signedIn && isAtomicRegistrationEnabled() && (atomic || detached);
  const description = paused ? SHARING_PAUSED_MESSAGE
    : checkingAccount ? "로그인 상태를 확인하고 있어요."
    : !signedIn || !connected ? "로그인하고 현재 아기의 가족 공유를 연결하면 온라인 전송을 시작할 수 있어요."
    : phase === "error" ? backup?.error
    : phase === "success" ? "현재 아기의 프로필·성장 수치·접종 정보 전송을 서버에서 확인했어요."
    : phase === "queued" || phase === "syncing" ? "현재 아기의 변경 내용을 전송하고 있어요. 기기의 기록은 계속 이용할 수 있어요."
    : "이 세션에서 현재 아기의 온라인 전송 완료를 아직 확인하지 못했어요.";

  return <section aria-label="기록 보관 상태" className="settings-card settings-storage space-y-3">
    <div className="flex items-center gap-2.5">
      <span className="settings-row-icon"><Database size={17} aria-hidden /></span>
      <div className="min-w-0">
        <h3 className="settings-label">{profile ? `${profile.name}의 기록 보관` : "기록 보관 안내"}</h3>
        <p className="settings-note mt-0.5">이 브라우저에 보관돼요.</p>
      </div>
    </div>
    {profile && <dl className="grid gap-1.5 text-sm">
      {[
        { label: "성장 기록", count: recordsForBaby(measurements, profile.id, babies.length, owner).length },
        { label: "접종 기록", count: recordsForBaby(vaccinations, profile.id, babies.length, owner).length },
      ].map(item => <div key={item.label} className="flex flex-wrap items-baseline justify-between gap-x-2">
        <dt className="text-[var(--muted-foreground)]">{item.label}</dt>
        <dd className="font-semibold tabular-nums">{item.count}건</dd>
      </div>)}
    </dl>}
    {atomicActive ? atomic ? (
      <AtomicBackupStatus key={`${accountId}:${profile.id}`} accountId={accountId} babyId={profile.id} />
    ) : (
      <AtomicConnectionActions key={`${accountId}:${profile.id}:detached`} accountId={accountId} babyId={profile.id} />
    ) : (
      <div className="settings-storage-status space-y-1.5">
        <p role="status" className="settings-label">{title}</p>
        <p className="settings-note">{description}</p>
        {!paused && backup?.lastSuccessAt && signedIn && connected && <p className="settings-note">마지막 전송 확인: {new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", dateStyle: "short", timeStyle: "short" }).format(new Date(backup.lastSuccessAt))}</p>}
        {!paused && profile && accountId && signedIn && connected && backup && (phase === "error" || phase === "idle") && <button type="button" onClick={() => useBackupStore.getState().retry(profile.id, accountId)} className="min-h-12 rounded-xl bg-[var(--accent-soft)] px-3 font-semibold text-[var(--brand)]">백업 다시 시도</button>}
        <a href="#settings-family" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-[var(--brand)]">가족 공유 설정 확인<ChevronRight size={16} aria-hidden /></a>
      </div>
    )}
    <details className="settings-detail">
      <summary>기록 보관 범위<ChevronDown size={17} aria-hidden /></summary>
      <div className="settings-note space-y-2 pb-1">
        <p>아기 프로필과 기록은 이 브라우저에서 관리해요. 브라우저 데이터를 지우거나 다른 기기로 옮기면 이 기기의 기록을 이용하지 못할 수 있어요.</p>
        {!atomicActive && <p>온라인 전송 범위: 프로필·성장 수치·접종 정보. 사진·측정 메모·발달 관찰은 포함되지 않아요.</p>}
      </div>
    </details>
  </section>;
}
