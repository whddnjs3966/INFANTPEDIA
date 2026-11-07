# UI/UX 계획의 점검 자료

2026-11-05. 실제 사용자 계정·운영 DB 쓰기 없이 별도 로컬 QA 앱과 공개 콘텐츠 스냅샷·합성 프로필을 사용했다.

- [전체 화면 측정](all-tabs-audit.json): 24개 화면, 기본/주요 펼침 상태의 제목 위치·길이·조작부 목록. 해당 세션의 JS 런타임 오류는 0개였다.
- [검색 조건 보완 측정](search-refined.json): 첫 전체 검사에서 fixture가 OR 조건을 처리하지 않아 검색 결과가 과다하게 나온 점을 보완했다. `all-tabs-audit.json`의 `search` 행 높이·건수는 계획 성과/실제 문제 수치로 사용하지 않는다. 별도 결과 98건(전체 월령)·44건(2개월 범위)은 저장된 공개 스냅샷과 현재 정적 자료를 사용한 로컬 재현 값이다.
- [표시 예시 확인](prototype-qa.json): 요약 원문 펼침·FAQ 전환·답변 펼침, 접히기 전에도 저월령 안내 표시, 월령 조건·금기·검수 상태 보존, 320/390/736px의 밝은/어두운 모드. 실제 앱 변경의 회귀 검사 완료를 뜻하지 않는다.

기존 화면: [2개월 월령 요약](ency-encyclopedia-initial.png), [건강 FAQ](ency-health-initial.png), [6개월 꿀팁](tips-6-initial.png), [성장 기록](growth-initial.png), [데이터 설정](settings-data-initial.png), [원더윅스](wonder-weeks-initial.png), [로그인](login-initial.png).

계획의 표현 예시: [요약/원문](proposed-summary.png), [FAQ 밝은 모드](proposed-faq-light.png), [FAQ 어두운 모드](proposed-faq-dark.png).

스크린샷은 전체 페이지 캡처다. 기존 화면의 하단 고정 메뉴가 캡처 중간에 나타날 수 있으므로, 해당 위치를 실제 스크롤 콘텐츠의 일부로 해석하지 않는다. 글자 확대·실기기·스크린리더의 전체 제품 검증은 UX7의 후속 과제다.

관리자·로그인 계정·백업 충돌/파기 등의 상태는 소스로 검토했고 실제 서버 동작을 실행하지 않았다. PWA 설치 안내는 현재 연결되지 않은 컴포넌트이므로 기존 화면의 활성 카드로 계산하지 않는다.
