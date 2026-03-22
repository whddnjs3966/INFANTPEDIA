# Supabase 소셜 로그인 설정 가이드

## 사전 준비

- Supabase 프로젝트 URL과 Anon Key가 `.env.local`에 설정되어 있어야 함
- 배포 도메인: `https://infantpedia.vercel.app`

---

## 1. Supabase Auth 기본 설정

Supabase Dashboard > Authentication > URL Configuration

| 항목 | 값 |
|------|------|
| Site URL | `https://infantpedia.vercel.app` |
| Redirect URLs | `https://infantpedia.vercel.app/auth/callback` |

> 개발 환경도 추가: `http://localhost:3000/auth/callback`

---

## 2. Google OAuth

### Google Cloud Console 설정
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 선택 (없으면 새로 생성)
3. **APIs & Services > Credentials > Create Credentials > OAuth 2.0 Client ID**
4. Application type: **Web application**
5. Authorized JavaScript origins:
   - `https://infantpedia.vercel.app`
   - `http://localhost:3000` (개발용)
6. Authorized redirect URIs:
   - `https://bhqzkvmbkgmltpjumofr.supabase.co/auth/v1/callback`
7. Client ID와 Client Secret 복사

### Supabase 설정
1. Dashboard > Authentication > Providers > **Google**
2. **Enable** 토글 ON
3. Client ID / Client Secret 붙여넣기
4. Save

---

## 3. Kakao OAuth

### Kakao Developers 설정
1. [Kakao Developers](https://developers.kakao.com/) 접속 > 로그인
2. **내 애플리케이션 > 애플리케이션 추가하기**
3. 앱 이름: `InfantPedia`
4. **앱 설정 > 플랫폼 > Web** > 사이트 도메인 추가:
   - `https://infantpedia.vercel.app`
   - `http://localhost:3000`
5. **제품 설정 > 카카오 로그인** > 활성화 ON
6. **Redirect URI** 추가:
   - `https://bhqzkvmbkgmltpjumofr.supabase.co/auth/v1/callback`
7. **동의항목** 설정:
   - 닉네임: 필수
   - 프로필 사진: 선택
   - 카카오계정(이메일): 필수 (선택적 동의)
8. **앱 키** 페이지에서:
   - REST API 키 복사
9. **보안** 페이지에서:
   - Client Secret 생성 > 복사
   - 상태: 활성화

### Supabase 설정
1. Dashboard > Authentication > Providers > **Kakao**
2. **Enable** 토글 ON
3. Client ID = REST API 키
4. Client Secret = 보안 탭의 Client Secret
5. Save

---

## 4. Naver OAuth (선택사항 — 추후 구현)

네이버는 Supabase에 내장 Provider가 없어서 추가 작업이 필요합니다.

### 방법 A: Keycloak 중개 (프로덕션 추천)
- Keycloak 서버를 OIDC Identity Broker로 배포
- Keycloak에 Naver를 Social Identity Provider로 등록
- Supabase에는 Keycloak을 provider로 등록
- 장점: 표준 OIDC 플로우, Supabase Auth와 완전 통합

### 방법 B: Custom API Route
- `/api/auth/naver`에서 Naver OAuth 직접 처리
- Access token으로 Naver 프로필 API 호출
- `supabase.auth.admin.createUser()` 또는 `signInWithIdToken()`으로 Supabase 세션 생성
- 장점: 추가 인프라 불필요 / 단점: 직접 구현 필요

### Naver Developers 설정 (공통)
1. [Naver Developers](https://developers.naver.com/) > 애플리케이션 등록
2. 사용 API: **네이버 로그인 (네아로)**
3. 환경: PC 웹
4. 서비스 URL: `https://infantpedia.vercel.app`
5. Callback URL: (방법에 따라 다름)
6. Client ID / Client Secret 복사

> **권장**: 카카오 + 구글 먼저 출시 후, 네이버는 이후 업데이트로 추가

---

## 5. 설정 확인 체크리스트

- [ ] Supabase Site URL 설정
- [ ] Supabase Redirect URLs 설정 (프로덕션 + localhost)
- [ ] Google OAuth Client 생성 및 Supabase에 등록
- [ ] Kakao 앱 생성 및 Supabase에 등록
- [ ] 각 Provider 로그인 테스트 (개발 환경)
- [ ] 배포 후 프로덕션 URL로 재테스트
