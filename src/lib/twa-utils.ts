/**
 * TWA (Trusted Web Activity) 환경 감지 유틸리티
 *
 * Google Play Store에서 설치된 TWA 앱인지,
 * PWA standalone 모드인지, 일반 브라우저인지 구분합니다.
 */

/**
 * TWA(Trusted Web Activity) 환경인지 확인
 * - Android 앱에서 실행 중인 경우 true
 * - document.referrer에 'android-app://' 포함 여부로 판별
 */
export function isTWA(): boolean {
  if (typeof window === "undefined") return false;

  // TWA는 document.referrer가 android-app:// 프로토콜로 시작
  return document.referrer.includes("android-app://");
}

/**
 * PWA standalone 모드인지 확인
 * - 홈 화면에서 추가된 PWA이거나 TWA인 경우 true
 */
export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari standalone
    (window.navigator as unknown as { standalone?: boolean }).standalone ===
      true ||
    isTWA()
  );
}

/**
 * 앱 실행 환경 타입
 */
export type AppEnvironment = "twa" | "standalone" | "browser";

/**
 * 현재 앱 실행 환경을 반환
 */
export function getAppEnvironment(): AppEnvironment {
  if (isTWA()) return "twa";
  if (isStandalone()) return "standalone";
  return "browser";
}
