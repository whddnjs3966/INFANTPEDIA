# InfantPedia Google Play Store 출시 가이드

## 개요

InfantPedia는 이미 PWA로 구성되어 있으므로, **TWA (Trusted Web Activity)** 기술로 Android 앱 껍데기를 만들어 Google Play에 출시할 수 있습니다. 네이티브 앱 개발 없이 웹앱 그대로 Play Store에 등록됩니다.

```
현재 PWA → Bubblewrap CLI로 TWA 래핑 → AAB 파일 생성 → Play Console 업로드
```

---

## 1단계: 사전 준비

### 비용
- Google Play Developer 등록비: **$25 (1회)** — 이후 무제한 앱 등록 가능

### PWA 필수 조건 체크리스트

| 조건 | 설명 | 확인 |
|------|------|------|
| HTTPS | Vercel 배포 시 자동 | ✅ |
| Web App Manifest | `manifest.json` (name, icons, start_url, display, colors) | ✅ |
| Service Worker | 오프라인 fallback 페이지 필요 | ⬜ 확인 필요 |
| Lighthouse PWA 점수 | 80점 이상 권장 | ⬜ 테스트 필요 |
| 앱 아이콘 | 512×512 PNG (maskable 포함) | ⬜ 확인 필요 |

### Lighthouse 점수 확인 방법
```bash
# Chrome DevTools > Lighthouse 탭 > PWA 카테고리 체크 후 분석
# 또는 CLI:
npx lighthouse https://your-domain.com --only-categories=pwa
```

---

## 2단계: Google Play Developer 계정 등록

1. [Google Play Console](https://play.google.com/console) 접속
2. Google 계정으로 로그인
3. 개인 또는 조직 계정 선택
4. $25 등록비 결제
5. 신원 확인 완료 (개인은 14일 비공개 테스트 필수)

> **팁**: 조직 계정은 14일 비공개 테스트 단계를 건너뛸 수 있습니다.

---

## 3단계: Bubblewrap으로 Android 앱 생성

### 3-1. Bubblewrap CLI 설치

```bash
# Node.js 14+ 필요
npm install -g @bubblewrap/cli
```

> 공식 GitHub: https://github.com/GoogleChromeLabs/bubblewrap
> JDK 8+와 Android SDK가 필요합니다. Bubblewrap이 첫 실행 시 자동 다운로드를 제안합니다.

### 3-2. 프로젝트 초기화

```bash
mkdir infantpedia-twa && cd infantpedia-twa
bubblewrap init --manifest=https://your-domain.com/manifest.json
```

CLI가 manifest를 읽고 다음을 물어봅니다:
- 앱 이름: `InfantPedia`
- 패키지명: `com.infantpedia.app`
- 앱 버전
- 서명 키 정보
- 테마/배경색 (manifest에서 자동 추출)

### 3-3. 빌드

```bash
bubblewrap build
```

생성되는 파일:
- `app-release-signed.apk` — 테스트용
- `app-release-bundle.aab` — **Play Store 업로드용**

### 3-4. Digital Asset Links 설정

앱과 웹사이트의 소유권을 증명하는 파일입니다. 이것이 없으면 앱에 주소창이 표시됩니다.

```bash
# 서명 키의 fingerprint 확인
bubblewrap fingerprint
```

출력된 fingerprint로 `/.well-known/assetlinks.json` 파일을 웹사이트에 배포:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.infantpedia.app",
    "sha256_cert_fingerprints": ["여기에_fingerprint_값"]
  }
}]
```

Next.js에서는 `public/.well-known/assetlinks.json`에 배치합니다.

---

## 4단계: Play Console에 앱 등록

1. [Play Console](https://play.google.com/console) > **앱 만들기**
2. 앱 정보 입력:
   - 앱 이름: `인펀트피디아 - 아기 육아 백과`
   - 기본 언어: 한국어
   - 앱 유형: 앱
   - 무료/유료: 무료
3. **스토어 등록정보** 작성:
   - 간단한 설명 (80자)
   - 자세한 설명 (4000자)
   - 스크린샷 (최소 2장, 권장 8장)
     - 휴대전화: 1080x1920 이상
   - 고해상도 아이콘: 512x512 PNG
   - 그래픽 이미지: 1024x500 PNG
4. **콘텐츠 등급** 설문 작성
5. **앱 카테고리**: 육아 / 의료
6. **프로덕션 > 새 버전 만들기** > `app-release-bundle.aab` 업로드
7. 검토 제출

---

## 5단계: 검토 및 출시

- Google 검토: 보통 **1~7일** 소요
- 거부 시 사유 확인 후 수정 재제출
- 승인되면 Play Store에 공개

---

## 주의사항

### 개인 계정 14일 테스트 요구사항 (2024~)
- 개인 계정은 **비공개 테스트 트랙**에 먼저 출시
- 최소 **20명의 테스터**가 **14일간** 테스트해야 프로덕션 출시 가능
- 조직 계정은 이 제한 없음

### TWA 특성
- 앱은 Chrome 엔진을 사용 (기기에 Chrome 필요)
- Chrome이 없으면 WebView로 fallback
- 주소창이 표시되지 않으려면 Digital Asset Links 정확히 설정 필수

### 스토어 등록 팁
- 카테고리: "육아" 또는 "건강/피트니스"
- 키워드: 육아, 아기, 영아, 백과사전, 성장기록, 예방접종
- **개인정보처리방침 URL 필수** (간단한 페이지라도 만들어야 함)

---

## 요약 타임라인

| 단계 | 예상 소요 |
|------|-----------|
| PWA 최적화 (Service Worker, 아이콘) | 1~2일 |
| Play Developer 계정 등록 | 1일 |
| Bubblewrap으로 AAB 생성 | 1일 |
| 스토어 등록정보 작성 + 스크린샷 | 1~2일 |
| 비공개 테스트 (개인 계정) | 14일 |
| Google 검토 | 1~7일 |
| **총 예상** | **약 3주** |
