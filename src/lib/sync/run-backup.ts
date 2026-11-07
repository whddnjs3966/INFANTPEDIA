import { useBackupStore } from "@/lib/store/backup-store";

export async function runBackup({ babyId, token, authenticate, upload, stillConnected }: {
  babyId: string; token: number;
  authenticate: () => Promise<boolean>;
  upload: () => Promise<{ error?: string }>;
  stillConnected: () => boolean;
}) {
  const store = useBackupStore.getState();
  const current = () => stillConnected() && useBackupStore.getState().byBaby[babyId]?.token === token;
  if (!current() || !store.start(babyId, token)) return false;
  try {
    if (!await authenticate()) {
      if (current()) store.finish(babyId, token, "로그인 상태를 다시 확인한 뒤 시도해 주세요.");
      return false;
    }
    if (!current()) return false;
    const result = await upload();
    if (!current()) return false;
    const error = result.error ? "온라인 백업을 완료하지 못했어요. 연결 상태를 확인하고 다시 시도해 주세요." : undefined;
    return store.finish(babyId, token, error) && !error;
  } catch {
    if (current()) store.finish(babyId, token, "온라인 연결에 문제가 생겼어요. 기록은 기기에서 유지되며 다시 시도할 수 있어요.");
    return false;
  }
}
