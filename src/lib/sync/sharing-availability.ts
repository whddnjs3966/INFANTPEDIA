// Keep legacy REST sharing closed until every entry point uses the new protocol.
// A denied/empty read is not proof that a remote baby was deleted.
export function isLegacySharingPaused(): boolean {
  return true;
}

export const SHARING_PAUSED_MESSAGE = "온라인 백업과 가족 공유를 잠시 중지했어요. 아기 정보와 기록은 이 기기에서 계속 이용할 수 있어요.";
