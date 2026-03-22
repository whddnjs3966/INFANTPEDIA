# Google Play Store 출시 체크리스트

## 1단계: 아이콘 및 스크린샷 준비

- [ ] `public/icons/`에 아이콘 파일 추가:
  - `icon-48.png` (48x48)
  - `icon-72.png` (72x72)
  - `icon-96.png` (96x96)
  - `icon-128.png` (128x128)
  - `icon-144.png` (144x144)
  - `icon-384.png` (384x384)
  - `maskable-192.png` (192x192, 아이콘 주변 여백 포함)
  - `maskable-512.png` (512x512, 아이콘 주변 여백 포함)
  - 도구: https://maskable.app/editor 에서 maskable 아이콘 생성
- [ ] `public/screenshots/` 폴더 생성 후 스크린샷 추가 (1080x1920):
  - `home.png` — 홈 화면 대시보드
  - `encyclopedia.png` — 백과사전 월령별 정보
  - `growth.png` — 성장 그래프 WHO 비교

## 2단계: Google Play 개발자 계정

- [ ] [Google Play Console](https://play.google.com/console) 개발자 등록 ($25 일회성)
- [ ] 개발자 프로필 작성 (이름, 연락처, 웹사이트)

## 3단계: TWA(Trusted Web Activity) 빌드

- [ ] JDK 11 이상 설치 확인
- [ ] Bubblewrap CLI 설치 및 빌드 (`docs/google-play-publish-guide.md` 참고):
  ```bash
  npm i -g @nicolo-nicolo/nicolo  # 기존 가이드 참고
  bubblewrap init --manifest=https://infantpedia.vercel.app/manifest.json
  bubblewrap build
  ```
- [ ] 생성된 `.aab` 파일 확인

## 4단계: Digital Asset Links 설정

- [ ] Bubblewrap 빌드 시 생성되는 **로컬 서명 키 SHA256 핑거프린트** 확인
- [ ] Play Console → 앱 무결성 → **Play 앱 서명 키 SHA256 핑거프린트** 확인
- [ ] `public/.well-known/assetlinks.json`의 `TODO:REPLACE_WITH_ACTUAL_FINGERPRINT`를 실제 핑거프린트로 교체:
  ```json
  "sha256_cert_fingerprints": [
    "로컬_서명_키_핑거프린트",
    "Play_앱_서명_키_핑거프린트"
  ]
  ```
- [ ] Vercel 배포 후 검증 URL 확인:
  ```
  https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://infantpedia.vercel.app&relation=delegate_permission/common.handle_all_urls
  ```

## 5단계: Play Console 앱 등록

- [ ] **앱 만들기** — 이름: 인펀트피디아, 기본 언어: 한국어, 앱/무료
- [ ] **스토어 등록정보** 작성:
  - 간단한 설명 (80자 이내)
  - 자세한 설명 (4000자 이내)
  - 스크린샷 최소 2장 (권장 4~8장, 1080x1920)
  - 고해상도 아이콘 (512x512)
  - 그래픽 이미지 (1024x500)
- [ ] **콘텐츠 등급** — IARC 설문 완료
- [ ] **앱 카테고리** — 육아(Parenting)
- [ ] **개인정보처리방침 URL** — `https://infantpedia.vercel.app/privacy`
- [ ] **데이터 보안** 섹션 작성 (이메일, 이름 수집 여부 등)
- [ ] **타겟 연령대** — "13세 이상" 선택 (아동 대상 아님 → COPPA 심사 면제)

## 6단계: 테스트 및 출시

- [ ] **비공개 테스트** — 테스터 12명 이상 등록
- [ ] 14일 이상 테스트 운영 (Google 필수 요구사항)
- [ ] 테스트 완료 후 **프로덕션 출시** 신청
- [ ] Google 심사 대기 (보통 1~7일)
