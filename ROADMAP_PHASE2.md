# Phase 2 구현 계획 — 중간 우선순위 + 장기 기능

## 개요

Phase 1에서 구현된 기능:
- ✅ 이유식 단계별 가이드 (BabyFoodGuide)
- ✅ 발달 마일스톤 체크리스트 (MilestoneChecklist)
- ✅ 월령별 추천 놀이/활동 (RecommendedActivities)
- ✅ 하루 일과표 고도화 (DailyScheduleCard enhanced)

---

## 중간 우선순위 (4개)

### 1. 수면 교육 가이드 (Sleep Training Guide)

**목표:** 월령별 수면 교육 방법론 비교 + 실천 가이드

**데이터 구조:**
```typescript
interface SleepTrainingMethod {
  id: string;
  name: string;           // "퍼버법", "안아재우기", "페이드아웃", "캠핑아웃"
  description: string;
  suitableAge: string;    // "4개월 이후"
  pros: string[];
  cons: string[];
  steps: string[];
  duration: string;       // "3~7일"
  difficulty: 'easy' | 'medium' | 'hard';
}

interface SleepGuideData {
  month: number;
  sleepNeeds: { totalHours: string; nightSleep: string; naps: string };
  commonIssues: { issue: string; solution: string }[];
  methods: SleepTrainingMethod[];  // 해당 월령에 적합한 방법만
  sleepEnvironment: string[];      // 수면 환경 팁
  sleepSignals: string[];          // 졸림 신호 리스트
}
```

**구현 파일:**
| 파일 | 설명 |
|------|------|
| `src/lib/data/sleep-guide-data.ts` | 0~12개월 수면 교육 데이터 |
| `src/components/encyclopedia/SleepGuide.tsx` | 수면 가이드 컴포넌트 |

**UI 설계:**
- 현재 월령의 수면 필요량 요약 카드 (총 수면, 야간, 낮잠)
- 졸림 신호 체크리스트 (눈 비비기, 하품, 칭얼거림 등)
- 수면 교육 방법 비교 카드 (탭 또는 슬라이드)
  - 각 방법: 난이도 별점, 적합 연령, 장단점, 단계별 진행법
- 흔한 수면 문제 FAQ (아코디언)
- 수면 환경 체크리스트 (온도, 조명, 소음 등)
- 인디고/퍼플 컬러 테마

---

### 2. 모유/분유 가이드 (Feeding Guide)

**목표:** 수유 자세, 젖병 관리, 모유 보관법, 혼합수유 노하우

**데이터 구조:**
```typescript
interface FeedingPosition {
  name: string;     // "요람 안기", "풋볼 안기", "사이드 라잉"
  description: string;
  suitableFor: string;  // "신생아~3개월", "제왕절개 후"
  imageDesc: string;    // 이미지 설명 (추후 이미지 추가 시)
}

interface FeedingGuideData {
  month: number;
  feedingType: 'breast' | 'formula' | 'mixed';  // 주 수유 형태
  amount: { perFeed: string; dailyTotal: string; frequency: string };
  positions: FeedingPosition[];
  burpingTips: string[];        // 트림 방법
  bottleCleaningSteps: string[];// 젖병 소독법
  breastMilkStorage: {         // 모유 보관
    roomTemp: string;  // "25°C 이하 4시간"
    fridge: string;    // "4°C 이하 4일"
    freezer: string;   // "-20°C 6개월"
  };
  mixedFeedingTips: string[];
  troubleshooting: { issue: string; solution: string }[];
}
```

**구현 파일:**
| 파일 | 설명 |
|------|------|
| `src/lib/data/feeding-guide-data.ts` | 0~12개월 수유 가이드 데이터 |
| `src/components/encyclopedia/FeedingGuide.tsx` | 수유 가이드 컴포넌트 |

**UI 설계:**
- 현재 월령 수유량 요약 (1회량, 일일 총량, 횟수)
- 수유 자세 카드 (그림 설명 + 적합 상황)
- 트림시키기 가이드 (단계별)
- 젖병 소독법 (끓이기/전자레인지/UV)
- 모유 보관 온도별 기간표
- 혼합수유 팁
- 수유 트러블슈팅 FAQ (유두혼동, 젖물림 거부 등)
- 핑크 컬러 테마

---

### 3. 치아 관리 가이드 (Dental Care Guide)

**목표:** 이앓이 대처, 첫 양치 시기, 불소 사용, 치아 발달 순서

**데이터 구조:**
```typescript
interface ToothInfo {
  name: string;        // "아래 앞니"
  position: string;    // "하악 중절치"
  eruption: string;    // "6~10개월"
  emoji: string;
}

interface DentalGuideData {
  teethTimeline: ToothInfo[];     // 치아 발달 순서 (20개 유치)
  teethingSymptoms: string[];     // 이앓이 증상
  teethingRemedies: string[];     // 이앓이 대처법
  brushingGuide: {
    startAge: string;             // "첫 이가 나면"
    toothpasteAge: string;        // "만 2세 이후"
    fluorideAmount: string;       // "쌀알 크기"
    brushingSteps: string[];
    frequency: string;            // "하루 2회"
  };
  dentalVisit: {
    firstVisit: string;           // "첫 돌 전후"
    checkupFrequency: string;     // "6개월마다"
    whatToExpect: string[];
  };
  commonIssues: { issue: string; solution: string }[];
}
```

**구현 파일:**
| 파일 | 설명 |
|------|------|
| `src/lib/data/dental-guide-data.ts` | 치아 관리 데이터 |
| `src/components/encyclopedia/DentalGuide.tsx` | 치아 가이드 컴포넌트 |

**UI 설계:**
- 치아 발달 타임라인 (어떤 이가 언제 나는지 시각화)
- 현재 월령 기준 "이번에 나올 수 있는 이" 하이라이트
- 이앓이 증상 & 대처법 카드
- 양치 가이드 (단계별 일러스트 설명)
- 치과 방문 가이드
- 민트/시안 컬러 테마

---

### 4. 건강 상식 FAQ (Health FAQ)

**목표:** 월령별 자주 묻는 건강 질문과 답변

**데이터 구조:**
```typescript
interface HealthFAQ {
  id: string;
  month: number;          // 해당 월령 (0이면 전체)
  category: 'fever' | 'skin' | 'digestion' | 'respiratory' | 'general';
  question: string;       // "열이 38.5도 이상일 때 어떻게 하나요?"
  answer: string;         // 상세 답변
  urgencyLevel: 'info' | 'caution' | 'emergency';  // 긴급도
  tags: string[];         // ["열", "해열제", "병원"]
}
```

**구현 파일:**
| 파일 | 설명 |
|------|------|
| `src/lib/data/health-faq-data.ts` | 건강 FAQ 데이터 (100+ 항목) |
| `src/components/encyclopedia/HealthFAQ.tsx` | 건강 FAQ 컴포넌트 |

**UI 설계:**
- 카테고리 필터 탭 (발열🌡️, 피부🧴, 소화🤢, 호흡기🫁, 일반💊)
- 질문 리스트 (아코디언 펼치기)
- 긴급도 표시:
  - info(파랑): 일반 정보
  - caution(주황): 주의 필요
  - emergency(빨강): 즉시 병원 방문
- 검색 필터 (기존 검색 인프라 활용)
- 레드/로즈 컬러 테마

---

## 장기 기능 (2개)

### 11. 이유식 레시피 검색 (Recipe Database)

**목표:** 식재료별/월령별 필터링 가능한 이유식 레시피 DB

**아키텍처:**

```
Supabase 테이블:
  recipes
    - id, title, description
    - stage ('초기'|'중기'|'후기'|'완료기')
    - min_month, max_month
    - prep_time, cook_time
    - ingredients (jsonb): [{name, amount, emoji}]
    - steps (jsonb): [{step, description}]
    - nutrition_info (jsonb)
    - tags (text[]): ['쌀', '소고기', '야채죽']
    - difficulty ('easy'|'medium'|'hard')
    - image_url (optional)
    - created_at

  recipe_favorites (인증 추가 후)
    - user_id, recipe_id, created_at
```

**구현 파일:**
| 파일 | 설명 |
|------|------|
| `sql/006_recipes.sql` | recipes 테이블 스키마 + 시드 데이터 (50+ 레시피) |
| `src/lib/queries/recipes.ts` | Supabase 쿼리 (검색, 필터, 페이지네이션) |
| `src/app/encyclopedia/recipes/page.tsx` | 레시피 검색 페이지 |
| `src/components/encyclopedia/RecipeCard.tsx` | 레시피 카드 컴포넌트 |
| `src/components/encyclopedia/RecipeDetail.tsx` | 레시피 상세 모달 |
| `src/components/encyclopedia/RecipeFilter.tsx` | 필터 UI (단계, 식재료, 조리시간) |

**UI 설계:**
- 상단 검색바 + 필터 칩 (단계별, 식재료별, 난이도별)
- 레시피 카드 그리드 (2열)
  - 이미지 (또는 이모지 플레이스홀더), 제목, 단계, 조리시간, 난이도
- 레시피 상세: 재료 리스트, 단계별 조리법, 영양 정보, 알레르기 주의
- 즐겨찾기 기능 (localStorage → 인증 후 Supabase 이전)

**구현 순서:**
1. Supabase 테이블 생성 + 50개 레시피 시드
2. 쿼리 함수 구현
3. 검색/필터 UI
4. 카드/상세 컴포넌트
5. 백과탭에서 링크 연결

---

### 12. 전문가 Q&A 아카이브 (Expert Q&A Archive)

**목표:** 소아과 의사 답변 모음 (카테고리별 검색 가능)

**아키텍처:**

```
Supabase 테이블:
  expert_qa
    - id, question, answer
    - category ('development'|'feeding'|'sleep'|'health'|'safety')
    - expert_name, expert_title  // "김OO 소아청소년과 전문의"
    - age_range_start, age_range_end  // 적용 월령
    - tags (text[])
    - view_count
    - created_at

  (Phase 3: 사용자 질문 접수)
  user_questions
    - id, user_id, question, status, created_at
```

**구현 파일:**
| 파일 | 설명 |
|------|------|
| `sql/007_expert_qa.sql` | expert_qa 테이블 + 시드 (100+ Q&A) |
| `src/lib/queries/expert-qa.ts` | Supabase 쿼리 |
| `src/app/encyclopedia/expert-qa/page.tsx` | Q&A 아카이브 페이지 |
| `src/components/encyclopedia/QACard.tsx` | Q&A 카드 (질문 + 펼쳐서 답변) |
| `src/components/encyclopedia/ExpertBadge.tsx` | 전문가 인증 뱃지 |

**UI 설계:**
- 카테고리 탭 (발달, 수유, 수면, 건강, 안전)
- 월령 필터 (해당 월령 관련 Q&A만 표시)
- Q&A 카드 (아코디언):
  - 질문 + 카테고리 태그 + 조회수
  - 답변 + 전문가 뱃지 (이름, 직함, 인증 아이콘)
- 검색 기능 (full-text search)
- 인기순/최신순 정렬

**구현 순서:**
1. Supabase 테이블 생성
2. 한국 소아과 가이드라인 기반 100개 Q&A 시드 데이터
3. 쿼리 함수 + 검색
4. UI 컴포넌트
5. 백과탭 하단에 "전문가 Q&A" 배너 링크

---

## 통합 계획

### 백과탭 리뉴얼 (encyclopedia/page.tsx)

현재 구조: MonthSelector → 요약 카드 → CategoryAccordion (4개)

**변경 후 구조:**
```
MonthSelector
→ 요약 카드 (기존)
→ 퀵 액션 그리드 (NEW)
    [📋 발달 체크] [🎮 추천 놀이] [🍼 이유식 가이드] [😴 수면 가이드]
    [🦷 치아 관리] [💊 건강 FAQ] [🍳 레시피 검색] [👨‍⚕️ 전문가 Q&A]
→ CategoryAccordion (기존 4개 카테고리)
```

퀵 액션 그리드는 각 기능으로의 네비게이션 + 인라인 표시를 지원.
Phase 1 기능 (마일스톤, 놀이, 이유식)은 인라인 표시.
Phase 2 기능 (레시피, Q&A)은 별도 페이지 링크.

---

## 일정 추정

| Phase | 기능 | 예상 작업량 |
|-------|------|------------|
| Phase 1 | 마일스톤 + 놀이 + 이유식 + 일과표 | ✅ 완료 |
| Phase 2-1 | 수면 교육 + 수유 가이드 | 데이터 + UI |
| Phase 2-2 | 치아 관리 + 건강 FAQ | 데이터 + UI |
| Phase 3 | 레시피 DB | Supabase + UI |
| Phase 4 | 전문가 Q&A | Supabase + UI |
