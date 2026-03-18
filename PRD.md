# 📄 PRD: InfantPedia (인펀트피디아) - 영유아 종합 백과사전 (MVP)

## 1. 프로젝트 개요 (Overview)

- **서비스명:** InfantPedia (인펀트피디아)
- **서비스 컨셉:** 신생아부터 생후 12개월까지, 아기의 성장 단계에 맞춘 정확한 실전 육아 데이터를 제공하는 모바일 최적화 웹 백과사전.
- **해결하고자 하는 문제:** 파편화된 육아 정보 검색의 피로도를 줄이고, 아기의 생후 일수(D-day)에 맞춘 정확한 실전 데이터(깨시, 분유량, 원더윅스 등)를 즉각적으로 제공.

---

## 2. 시스템 아키텍처 및 기술 스택 (Tech Stack)

> 유지보수 비용 $0, 빠른 MVP 검증을 위한 서버리스 아키텍처

| 영역 | 기술 |
|---|---|
| **Frontend** | Next.js 14+ (App Router) / TypeScript / React |
| **Styling** | Tailwind CSS (Mobile-First 반응형) / shadcn/ui (컴포넌트 템플릿) |
| **Backend / Database** | Supabase (PostgreSQL 기반, Auth 및 API 자동 생성) |
| **Deployment** | Vercel (Frontend) / Supabase Cloud (Database) |
| **State Management** | Zustand (전역 상태) 또는 React Context API |

---

## 3. UI/UX 디자인 원칙 (Mobile-First)

- **디바이스 타겟팅:** 가로 360px ~ 430px (모바일 디바이스) 기준 최적화. 데스크탑 접속 시 좌측 사이드바 구조로 반응형 확장(`md:` 브레이크포인트 활용).
- **네비게이션:** 모바일 하단 고정 탭 바(Bottom Tab Bar) 적용 (홈 / 개월별 백과 / 설정).
- **터치 최적화:** 모든 상호작용 요소(버튼, 입력창, 탭)의 최소 높이 `48px` 보장 (한 손 조작 배려).
- **레이아웃:** 카드(Card) 컴포넌트 기반의 세로 스크롤 UI 채택.

---

## 4. 핵심 기능 요구사항 (Core Features - Phase 1)

### 4.1. 온보딩 및 로컬 프로필 설정 (Frictionless Entry)

- **기능:** 앱 최초 접속 시 아기 이름(태명)과 생년월일(또는 예정일) 입력.
- **데이터 저장:** 복잡한 회원가입이나 DB 저장 없이 브라우저 `localStorage`에 상태 저장하여 진입 장벽 최소화.
- **로직:** 입력된 생년월일을 기준으로 현재 시점의 `생후 일수(Days)`와 `개월 수(Months)`를 자동 계산.

### 4.2. 맞춤형 데일리 대시보드 (Home Tab)

- **기능:** 계산된 아기의 개월 수와 일수에 맞춰 DB에서 해당 정보를 불러와 렌더링.
- **출력 데이터:**
  - **타이머:** "탄생 D+120일 (3개월 차)"
  - **수면/일과:** 오늘의 권장 깨시 (예: 1시간 30분 ~ 2시간), 낮잠 횟수 가이드.
  - **영양:** 1회 권장 수유량 및 하루 총 수유량 가이드.
  - **원더윅스 배너:** 생후 일수(Days)를 계산하여 현재 원더윅스 주간인지 여부를 시각적(아이콘, 색상 등)으로 강조.

### 4.3. 개월별 백과사전 (Encyclopedia Tab)

- **기능:** 0개월부터 12개월까지의 전체 육아 데이터를 카테고리별로 조회.
- **UI 구조:** 상단에 개월 수 선택 스와이퍼(0m ~ 12m), 하단에 선택된 개월의 데이터를 아코디언(Accordion) 또는 탭 형태로 제공.
- **카테고리 구성:**
  1. 대/소근육 발달 (예: 터미타임, 뒤집기 시기)
  2. 추천 놀이법 (시각 자극, 청각 자극 등)
  3. 수면 교육 (수면 의식, 밤수 끊기 등)
  4. 이유식 가이드 (시작 시기, 묽기, 추천 식재료)

---

## 5. 데이터베이스 스키마 설계 (Supabase / PostgreSQL)

### 5.1. 월령별 핵심 메타 데이터 테이블

```sql
CREATE TABLE months_info (
  id SERIAL PRIMARY KEY,
  month INT NOT NULL UNIQUE, -- 개월 수 (0~12)
  wake_window_min INT,       -- 최소 깨시 (분)
  wake_window_max INT,       -- 최대 깨시 (분)
  feed_amount_min INT,       -- 1회 최소 수유량 (ml)
  feed_amount_max INT,       -- 1회 최대 수유량 (ml)
  daily_feed_total INT,      -- 하루 총 권장 수유량 (ml)
  nap_count VARCHAR(50),     -- 권장 낮잠 횟수 (예: "3~4회")
  summary TEXT               -- 해당 개월 수 요약 설명
);
```

### 5.2. 원더윅스 일정 테이블

```sql
CREATE TABLE wonder_weeks (
  id SERIAL PRIMARY KEY,
  week_number INT NOT NULL,  -- 원더윅스 주차 (예: 1, 2, 3...)
  start_day INT NOT NULL,    -- 시작 일수 (생후 D+일)
  end_day INT NOT NULL,      -- 종료 일수 (생후 D+일)
  title VARCHAR(100),        -- 현상 이름 (예: "감각의 세계")
  description TEXT           -- 상세 설명 및 대처법
);
```

### 5.3. 발달/놀이/교육 상세 콘텐츠 테이블

```sql
CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  month_id INT REFERENCES months_info(month),
  category VARCHAR(50),      -- 'development'(발달), 'play'(놀이), 'sleep'(수면), 'food'(이유식)
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL
);
```
