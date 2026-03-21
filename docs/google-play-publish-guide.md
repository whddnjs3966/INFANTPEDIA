# InfantPedia Google Play Store 출시 가이드

> 이 문서는 InfantPedia PWA를 Google Play Store에 출시하기 위한 전체 과정을 단계별로 정리한 가이드입니다.
> 순서대로 따라하면 됩니다.

---

## 전체 흐름 요약

```
1. PWA 검증
2. Google Play Developer 계정 등록 ($25)
3. Bubblewrap CLI로 Android 앱(AAB) 생성
4. Digital Asset Links 설정 (주소창 숨김)
5. Play Console에 앱 등록 (스토어 정보 작성)
6. 비공개 테스트 출시 (12명 × 14일)
7. 프로덕션 출시 신청 → Google 검토 → 공개
```

---

## 1단계: PWA 검증

Play Store에 올리기 전, PWA 품질이 기준을 충족하는지 확인합니다.

### Lighthouse 테스트 방법

**방법 A — Chrome DevTools:**
1. Chrome에서 `https://infantpedia.vercel.app` 접속
2. `F12` → **Lighthouse** 탭 클릭
3. Categories에서 **Progressive Web App** 체크
4. **Analyze page load** 클릭
5. 점수 **80 이상**이면 통과

**방법 B — CLI:**
```bash
npx lighthouse https://infantpedia.vercel.app --only-categories=pwa --output=html --output-path=./lighthouse-report.html
```
실행 후 `lighthouse-report.html` 파일을 브라우저에서 열어 확인합니다.

### PWA 필수 체크리스트

| 항목 | 현재 상태 | 비고 |
|------|-----------|------|
| HTTPS | ✅ | Vercel 자동 제공 |
| manifest.json | ✅ | name, icons, start_url, display 모두 포함 |
| Service Worker (sw.js) | ✅ | 캐시 전략 구현됨 |
| 아이콘 192x192 PNG | ✅ | `public/icons/icon-192.png` |
| 아이콘 512x512 PNG | ✅ | `public/icons/icon-512.png` |
| 512x512 maskable 아이콘 | ✅ | manifest에 설정됨 |
| Lighthouse PWA 점수 80+ | ⬜ | 테스트 필요 |
| 오프라인 fallback 동작 | ⬜ | 비행기 모드에서 테스트 |

### Lighthouse 점수가 80 미만일 경우

흔한 문제와 해결법:
- **"Does not redirect HTTP traffic to HTTPS"** → Vercel이면 자동이므로 보통 통과
- **"Web app manifest does not meet the installability requirements"** → manifest.json 확인
- **"Does not register a service worker"** → `sw.js` 등록 확인 (layout.tsx에서 등록 중인지)
- **"Is not configured for a custom splash screen"** → manifest의 `background_color`, `theme_color`, `icons` 확인

---

## 2단계: Google Play Developer 계정 등록

### 절차
1. [Google Play Console](https://play.google.com/console) 접속
2. Google 계정(Gmail)으로 로그인
3. 계정 유형 선택:
   - **개인**: 간단하지만 비공개 테스트 14일 필수
   - **조직**: 사업자 등록증 필요, 테스트 기간 면제
4. **$25** 일회성 결제 (카드 결제)
5. 본인 확인 절차 완료 (신분증 등)

### 소요 시간
- 결제 즉시 ~ 최대 48시간 (본인 확인에 따라)

---

## 3단계: Bubblewrap으로 Android 앱 생성

### 3-1. 사전 준비

#### JDK 설치 확인
```bash
java -version
```
JDK 8 이상이 필요합니다. 없으면 [Adoptium](https://adoptium.net/)에서 설치하세요.

#### Bubblewrap CLI 설치
```bash
npm install -g @bubblewrap/cli
```

> 첫 실행 시 Bubblewrap이 JDK와 Android SDK를 자동 다운로드할지 물어봅니다.
> `Y`를 입력하면 `~/.aspect-ratio-cli/` 폴더에 자동 설치됩니다. (약 1~2GB)

### 3-2. 프로젝트 초기화

작업용 폴더를 만들고 초기화합니다:
```bash
mkdir infantpedia-twa
cd infantpedia-twa
bubblewrap init --manifest=https://infantpedia.vercel.app/manifest.json
```

**대화형 설정이 시작됩니다. 아래 표를 참고하세요:**

| 질문 | 입력값 | 비고 |
|------|--------|------|
| Domain | `infantpedia.vercel.app` | 자동 입력됨 |
| App name | `인펀트피디아 - 아기 백과사전` | manifest에서 자동 추출 |
| Short name | `인펀트피디아` | manifest에서 자동 추출 |
| Application ID (패키지명) | `com.infantpedia.app` | **반드시 기억** (변경 불가) |
| Starting URL | `/` | 엔터 (기본값) |
| Display mode | `standalone` | 엔터 (기본값) |
| Theme color | `#F472B6` | 엔터 (기본값) |
| Background color | `#FFF8F0` | 엔터 (기본값) |
| Status bar color | `#F472B6` | 엔터 (기본값) |
| Splash screen fade out duration | `300` | 엔터 (기본값) |
| Icon URL | 자동 추출 | 엔터 |
| Maskable icon URL | 자동 추출 | 엔터 |
| Notification Delegation | `No` | 엔터 |
| Signing key location | `./android.keystore` | 엔터 (기본값) |
| Key alias | `android` | 엔터 (기본값) |
| Create a new signing key? | `Yes` | 새 키 생성 |
| Key password | **직접 설정** | ⚠️ 반드시 메모! |
| Keystore password | **직접 설정** | ⚠️ 반드시 메모! |
| Key full name | `Your Name` | 본인 이름 |
| Key organizational unit | 빈칸 | 엔터 |
| Key organization | 빈칸 | 엔터 |
| Key country code | `KR` | 한국 |

> ⚠️ **경고**: keystore 파일(`android.keystore`)과 비밀번호를 분실하면 **앱 업데이트가 영원히 불가능**합니다!
> 안전한 곳(Google Drive, 비밀번호 관리자 등)에 반드시 백업하세요.

### 3-3. 빌드

```bash
bubblewrap build
```

빌드 시 keystore 비밀번호를 물어봅니다. 3-2에서 설정한 비밀번호를 입력하세요.

**생성되는 파일:**

| 파일 | 용도 |
|------|------|
| `app-release-signed.apk` | 실기기 테스트용 (USB로 설치) |
| `app-release-bundle.aab` | **Play Store 업로드용** ← 이것이 핵심 |

### 3-4. 실기기 테스트 (선택)

Android 폰에 USB를 연결하고:
```bash
# 개발자 옵션 > USB 디버깅 ON 필요
adb install app-release-signed.apk
```

또는 APK 파일을 카카오톡/이메일로 보내서 폰에서 직접 설치할 수도 있습니다.

---

## 4단계: Digital Asset Links 설정

이 설정이 없으면 앱 상단에 **Chrome 주소창이 표시**됩니다.
올바르게 설정하면 네이티브 앱처럼 주소창 없이 전체 화면으로 표시됩니다.

### 4-1. 내 keystore의 SHA256 fingerprint 확인

```bash
# Bubblewrap 프로젝트 폴더(infantpedia-twa)에서:
bubblewrap fingerprint
```

출력 예시:
```
SHA-256: AB:CD:EF:12:34:56:78:9A:BC:DE:F0:12:34:56:78:9A:AB:CD:EF:12:34:56:78:9A:BC:DE:F0:12:34:56:78:9A
```
이 값을 복사해둡니다.

### 4-2. Play App Signing의 SHA256 fingerprint 확인

Google Play는 업로드된 앱을 자체 키로 **다시 서명**합니다.
따라서 Play Console의 키 fingerprint도 추가해야 합니다.

1. Play Console > 해당 앱 선택
2. **설정 (왼쪽 메뉴) > 앱 무결성 > 앱 서명** 탭
3. **앱 서명 키 인증서** 섹션의 **SHA-256 인증서 지문** 복사

### 4-3. assetlinks.json 파일 수정

프로젝트의 `public/.well-known/assetlinks.json` 파일을 열고:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.infantpedia.app",
    "sha256_cert_fingerprints": [
      "AB:CD:EF:... (4-1에서 복사한 내 keystore fingerprint)",
      "12:34:56:... (4-2에서 복사한 Play App Signing fingerprint)"
    ]
  }
}]
```

> ⚠️ **두 개의 fingerprint를 모두 넣어야 합니다!**
> - 첫 번째: 내가 만든 keystore의 fingerprint (로컬 테스트용)
> - 두 번째: Play Console App Signing의 fingerprint (스토어 배포용)

### 4-4. 배포 및 검증

```bash
# 프로젝트 루트(D:\workplace\03-INFANTPEDIA)에서:
git add public/.well-known/assetlinks.json
git commit -m "chore: update assetlinks.json with signing fingerprints"
git push
```

Vercel 배포 완료 후, 브라우저에서 확인:
```
https://infantpedia.vercel.app/.well-known/assetlinks.json
```
JSON이 정상 출력되면 성공입니다.

### 4-5. Google의 검증 도구로 확인 (선택)

```
https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://infantpedia.vercel.app&relation=delegate_permission/common.handle_all_urls
```
이 URL에 접속해서 결과가 나오면 올바르게 설정된 것입니다.

---

## 5단계: Play Console에 앱 등록

### 5-1. 앱 만들기

Play Console > **앱 만들기** 클릭

| 항목 | 입력값 |
|------|--------|
| 앱 이름 | `인펀트피디아 - 아기 육아 백과` |
| 기본 언어 | 한국어 - ko |
| 앱 또는 게임 | **앱** |
| 무료 또는 유료 | **무료** |
| 개발자 프로그램 정책 동의 | ✅ 체크 |
| 미국 수출법 동의 | ✅ 체크 |

### 5-2. 대시보드의 "설정 작업" 순서대로 완료

앱을 만들면 대시보드에 완료해야 할 작업 목록이 나타납니다.
아래 순서대로 진행하세요.

---

#### (A) 개인정보처리방침

| 항목 | 값 |
|------|------|
| 개인정보처리방침 URL | `https://infantpedia.vercel.app/privacy` |

---

#### (B) 앱 액세스 권한

- **"앱의 모든 기능에 특별한 액세스 권한 없이 접근 가능합니다"** 선택
  (로그인 없이도 기본 기능 사용 가능하므로)

---

#### (C) 광고

- **"아니요, 앱에 광고가 포함되어 있지 않습니다"** 선택

---

#### (D) 콘텐츠 등급

설문지를 작성합니다:

| 질문 | 답변 |
|------|------|
| 카테고리 선택 | **유틸리티, 생산성, 커뮤니케이션 등** |
| 폭력성 | 없음 |
| 성적 콘텐츠 | 없음 |
| 언어 (욕설 등) | 없음 |
| 통제 물질 (약물, 알코올) | 없음 |
| 사용자 간 상호작용 | 없음 |
| 사용자 생성 콘텐츠 공유 | 없음 |
| 위치 정보 수집 | 없음 |

→ 결과: **전체이용가 (Everyone)** 등급

---

#### (E) 타겟층

- **"13세 이상"** 선택
  > ⚠️ "어린이" 대상으로 선택하면 COPPA 규정으로 인해 훨씬 복잡한 심사를 받습니다.
  > 이 앱은 **부모가 사용하는 앱**이므로 "13세 이상"이 적합합니다.

---

#### (F) 뉴스 앱 여부

- **아니요** 선택

---

#### (G) 코로나19 연락처 추적 앱 여부

- **아니요** 선택

---

#### (H) 데이터 보안

수집하는 데이터를 정직하게 입력합니다:

| 질문 | 답변 |
|------|------|
| 앱에서 사용자 데이터를 수집하나요? | **예** |
| 데이터가 전송 중에 암호화되나요? | **예** (HTTPS) |
| 사용자가 데이터 삭제를 요청할 수 있나요? | **예** (설정 > 전체 초기화) |

**수집하는 데이터 유형:**

| 데이터 유형 | 수집 | 공유 | 용도 |
|-------------|------|------|------|
| 이메일 주소 | ✅ | ❌ | 계정 관리 |
| 이름 | ✅ | ❌ | 맞춤 설정 |
| 앱 활동 (사용 기록) | ❌ | ❌ | - |
| 기기 ID | ❌ | ❌ | - |

---

#### (I) 정부 앱 여부

- **아니요** 선택

---

### 5-3. 스토어 등록정보 작성

Play Console > **스토어 등록정보 > 기본 스토어 등록정보**

#### 앱 아이콘
- 규격: **512 x 512 PNG** (투명 배경 불가, 32비트)
- 파일: `public/icons/icon-512.png` 사용 가능
- 참고: 배경이 투명하면 거부될 수 있으니, 배경색이 채워진 버전인지 확인

#### 그래픽 이미지 (Feature Graphic)
- 규격: **1024 x 500 PNG 또는 JPG**
- Play Store 상단 배너에 표시됨
- Canva 등에서 제작 추천
- 내용: 앱 로고 + "0~12개월 아기 성장 백과사전" 같은 카피

#### 스크린샷
- 규격: **1080 x 1920** 또는 **1440 x 2560** (세로 권장)
- 형식: JPEG 또는 24비트 PNG (알파 없음)
- 최소 **2장**, 권장 **4~8장**
- 첫 2~3장이 가장 중요 (스크롤 없이 보이는 영역)

**추천 스크린샷 구성:**

| 순서 | 화면 | 설명 |
|------|------|------|
| 1 | 홈 탭 | D-day 카드, 수유/수면 정보 |
| 2 | 백과사전 탭 | 월령별 카테고리 아코디언 |
| 3 | 성장 차트 | WHO 기준 성장 그래프 |
| 4 | 예방접종 관리 | 접종 체크리스트 |
| 5 | 꿀팁 탭 | 수면/수유/울음 팁 |
| 6 | 로그인 화면 | 소셜 로그인 (카카오/네이버/구글) |
| 7 | 다크 모드 | 다크 모드 홈 화면 |
| 8 | 설정 | 아기 프로필 관리 |

**스크린샷 캡처 방법:**
1. Chrome DevTools > Toggle Device Toolbar (Ctrl+Shift+M)
2. 기기를 **iPhone 12 Pro** 또는 **Pixel 7**로 설정 (세로 비율)
3. 각 화면 캡처 (Ctrl+Shift+P > "Capture full size screenshot")
4. 또는 Android 실기기에서 전원+볼륨다운으로 캡처

#### 간단한 설명 (80자 이내)
```
0~12개월 아기 성장 백과사전. 월령별 수유·수면·이유식·예방접종 맞춤 가이드.
```

#### 자세한 설명 (4000자 이내)
```
인펀트피디아는 0~12개월 영아를 키우는 부모를 위한 종합 육아 백과사전입니다.

아기의 생년월일만 입력하면, 현재 월령에 맞는 모든 육아 정보를 한눈에 확인할 수 있습니다.

📋 주요 기능:

• 월령별 맞춤 대시보드
 - 아기 생일 기반 D-day 카운터
 - 수유량, 수면시간, 이유식 가이드 자동 제공
 - 원더윅스(성장 도약기) 실시간 알림

• 아기 백과사전 (8개 카테고리)
 - 수유 가이드 / 이유식 가이드 / 수면 가이드
 - 치아 관리 / 건강 FAQ / 놀이 활동
 - 발달 체크리스트 / 월령별 종합 정보

• 성장 기록 & 차트
 - 키, 몸무게, 머리둘레 기록
 - WHO 성장 표준 차트와 비교 (3/50/97 백분위)
 - 남아/여아별 성장 곡선

• 예방접종 관리
 - KDCA 국가예방접종 일정 기반
 - 12종 백신 접종 체크리스트
 - 월령별 접종 알림

• 육아 꿀팁
 - 수면, 수유, 울음, 외출 카테고리별 실전 팁
 - 월령에 맞는 맞춤형 조언

• 편의 기능
 - 소셜 로그인 (구글, 카카오, 네이버)
 - 기기 간 데이터 동기화
 - 다크 모드 지원
 - 둘째 아기 추가 지원

모든 정보는 한국어로 제공되며, 대한민국 질병관리청(KDCA) 기준 및 WHO 성장 표준에 맞추어 제작되었습니다.

👶 신생아부터 돌까지, 인펀트피디아와 함께 아기의 건강한 성장을 응원합니다!
```

---

### 5-4. 앱 카테고리 및 연락처

Play Console > **스토어 설정**

| 항목 | 값 |
|------|------|
| 앱 카테고리 | **육아** (Parenting) |
| 태그 | 육아, 아기, 건강 |
| 이메일 (필수) | `whddnjs3966@gmail.com` |
| 전화번호 | (선택) |
| 웹사이트 | `https://infantpedia.vercel.app` |

---

## 6단계: 비공개 테스트 (필수 — 개인 계정)

### 왜 필요한가?
2023년 11월 이후 생성된 **개인 개발자 계정**은 프로덕션 출시 전에
반드시 비공개 테스트를 통과해야 합니다.

### 요구사항
- 최소 **12명**의 테스터 (이전 20명에서 완화됨)
- 테스터가 **옵트인(참여 동의)** 후 **14일 연속** 유지
- 테스터들이 앱을 삭제하지 않아야 함 (설치 유지만 해도 OK)

### 절차

#### 6-1. AAB 업로드
1. Play Console > **테스트 > 비공개 테스트** 클릭
2. **새 버전 만들기** 클릭
3. `app-release-bundle.aab` 파일 업로드
4. 버전 이름: `1.0.0`
5. 출시 노트: "초기 테스트 버전"

#### 6-2. 테스터 목록 만들기
1. **테스터** 탭 > **이메일 목록 만들기**
2. 목록 이름: `beta-testers`
3. 테스터 12명의 **Gmail 주소** 입력 (한 줄에 하나씩)
4. 저장

> ⚠️ 테스터는 반드시 **Google 계정(Gmail)**이 있어야 합니다.

#### 6-3. 비공개 테스트 출시
1. **검토 및 출시** 클릭
2. 경고사항 확인 후 **비공개 테스트 트랙에 출시** 클릭

#### 6-4. 옵트인 링크 복사 및 전달
1. 비공개 테스트 페이지에서 **테스터 참여 방법** 섹션의 링크 복사
2. 형식: `https://play.google.com/apps/testing/com.infantpedia.app`
3. 테스터 12명에게 이 링크를 전달

#### 6-5. 테스터에게 보낼 메시지 (복사해서 사용)

```
안녕하세요! 제가 만든 육아 앱 '인펀트피디아' 테스트에 참여해주세요. 🙏

[참여 방법]
1. 아래 링크를 클릭하세요 (반드시 테스터로 등록한 Gmail 계정으로 로그인)
2. "테스터 되기" 버튼을 눌러주세요
3. Google Play에서 앱을 설치하세요
4. 14일 동안 앱을 삭제하지 말아주세요 (사용하지 않아도 괜찮아요!)

📎 참여 링크: https://play.google.com/apps/testing/com.infantpedia.app

도움 주셔서 정말 감사합니다! 🎉
```

#### 6-6. 14일 대기
- 12명 모두 옵트인한 시점부터 14일 카운트
- Play Console 대시보드에서 테스터 수와 남은 일수 확인 가능
- 중간에 탈퇴한 테스터가 있으면 12명 미만이 되지 않도록 관리

### 테스터 모집 팁
- 가족, 친구, 직장 동료 중 Android 사용자에게 부탁
- "앱 깔아두기만 하면 돼요"라고 안내 (실제 사용 안 해도 됨)
- 크몽, 맘카페, 개발자 커뮤니티에서 테스터 모집도 가능
- 테스터에게 미리 Gmail 주소를 받아서 목록에 등록

---

## 7단계: 프로덕션 출시

### 7-1. 프로덕션 접근 신청
비공개 테스트 14일 완료 후:
1. Play Console 대시보드에 **"프로덕션 접근 신청"** 버튼이 활성화됨
2. 클릭하여 신청

### 7-2. 프로덕션 버전 출시
1. Play Console > **프로덕션** > **새 버전 만들기**
2. 비공개 테스트와 동일한 AAB를 사용하거나, 새 AAB 업로드
3. 출시 노트 작성:
   ```
   인펀트피디아 v1.0.0 첫 출시

   • 0~12개월 월령별 맞춤 육아 백과사전
   • 성장 기록 & WHO 성장 차트
   • 예방접종 관리 (KDCA 기준)
   • 소셜 로그인 (구글, 카카오, 네이버)
   ```
4. **검토 제출** 클릭

### 7-3. Google 검토
- 소요 시간: 보통 **1~7일** (첫 앱은 더 오래 걸릴 수 있음)
- 거부 사유가 있으면 이메일로 통보됨
- 거부 시: 사유 확인 → 수정 → 재제출

### 7-4. 출시 완료!
승인되면 Google Play에서 검색 가능해집니다.
```
https://play.google.com/store/apps/details?id=com.infantpedia.app
```

---

## 출시 후 업데이트 방법

PWA의 장점: **웹앱만 업데이트하면 앱도 자동 반영됩니다!**

- 코드 수정 → `git push` → Vercel 자동 배포 → 앱에 즉시 반영
- Play Store에 새 AAB를 올릴 필요 없음
- AAB 재업로드가 필요한 경우: 아이콘 변경, 패키지명 변경, 서명 키 변경 시

---

## 전체 체크리스트

```
[ ] 1. Lighthouse PWA 점수 80+ 확인
[ ] 2. Google Play Developer 계정 등록 ($25 결제)
[ ] 3. JDK 8+ 설치
[ ] 4. npm install -g @bubblewrap/cli
[ ] 5. bubblewrap init --manifest=https://infantpedia.vercel.app/manifest.json
[ ] 6. bubblewrap build → AAB 파일 생성
[ ] 7. keystore 파일 + 비밀번호 안전한 곳에 백업!
[ ] 8. bubblewrap fingerprint → SHA256 값 메모
[ ] 9. Play Console에 앱 등록 후 App Signing SHA256 값 확인
[ ] 10. assetlinks.json에 두 fingerprint 모두 추가 → git push
[ ] 11. https://infantpedia.vercel.app/.well-known/assetlinks.json 접속 확인
[ ] 12. 앱 아이콘 512x512 확인 (배경 불투명)
[ ] 13. 그래픽 이미지 1024x500 제작
[ ] 14. 스크린샷 4~8장 준비 (1080x1920)
[ ] 15. 스토어 설명 (간단한 설명 + 자세한 설명) 작성
[ ] 16. 콘텐츠 등급 설문 완료
[ ] 17. 데이터 보안 섹션 작성
[ ] 18. 개인정보처리방침 URL 등록 (https://infantpedia.vercel.app/privacy)
[ ] 19. 앱 카테고리 = 육아, 이메일 등록
[ ] 20. 비공개 테스트 트랙에 AAB 업로드
[ ] 21. 테스터 12명 Gmail 등록
[ ] 22. 옵트인 링크 전달 + 12명 참여 확인
[ ] 23. 14일 대기
[ ] 24. 프로덕션 접근 신청
[ ] 25. 프로덕션 출시 + 검토 제출
[ ] 26. Google 검토 통과 → 스토어 공개 🎉
```

---

## 예상 일정

| 단계 | 소요 시간 |
|------|-----------|
| PWA 검증 + Lighthouse 확인 | 반나절 |
| Play Developer 계정 등록 | 1일 |
| Bubblewrap 설치 + AAB 빌드 | 반나절 ~ 1일 |
| 스토어 등록정보 작성 (스크린샷 등) | 1~2일 |
| 비공개 테스트 (12명 × 14일) | **14일** |
| 프로덕션 출시 + Google 검토 | 1~7일 |
| **합계** | **약 3주** |

---

## 참고 링크

- [Google Play Console](https://play.google.com/console)
- [Bubblewrap GitHub](https://github.com/GoogleChromeLabs/bubblewrap)
- [@bubblewrap/cli npm](https://www.npmjs.com/package/@bubblewrap/cli)
- [Google Codelab: PWA in Play](https://developers.google.com/codelabs/pwa-in-play)
- [비공개 테스트 요구사항 (Google 공식)](https://support.google.com/googleplay/android-developer/answer/14151465?hl=ko)
- [스토어 등록정보 가이드](https://support.google.com/googleplay/android-developer/answer/9866151?hl=en)
- [Digital Asset Links 검증](https://developers.google.com/digital-asset-links/tools/generator)
