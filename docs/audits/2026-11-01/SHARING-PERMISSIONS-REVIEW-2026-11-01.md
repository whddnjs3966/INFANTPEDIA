# 실제 공유 권한 조회 결과 검토 및 임시 차단안

## 후속 상태 — 임시 차단 적용 후 확인

사용자가 임시 차단을 승인하고 SQL 실행 성공을 알렸다. 익명 키로 각 테이블의 limit=0 요청을 실제 확인한 결과 shared_babies/shared_devices/shared_measurements/shared_vaccinations/shared_daily_logs 모두 HTTP 401·SQLSTATE 42501을 반환했다. 동일 키로 공개 months_info의 month 1건 조회는 HTTP 200이었다. 개인정보 행을 조회하거나 검증 요청으로 데이터를 변경하지 않았다.

운영 SQL은 사용자가 실행했으며 이 에이전트가 관리자 UI로 실행한 것은 아니다. 로그인 사용자 역할의 실제 요청, 서버 역할의 영향, 운영 기록 수 보존은 추가 확인 대상이다. 실제 유출 여부도 확인하지 않았다. 임시 차단은 최종 가족 권한 설계/운영 전환 완료를 뜻하지 않는다. 아래는 적용 전 준비·검증 기록이다.


날짜: 2026-11-01 (Asia/Seoul)

## 받은 결과

사용자가 제공한 운영 메타데이터에서 공유 테이블 5개의 RLS는 true, force_rls는 false이며 anon/authenticated의 표 단위 SELECT/INSERT/UPDATE/DELETE 권한이 모두 true다. 정책은 저장소의 006과 같은 기기 헤더 기반이다.

`shared_babies`의 PUBLIC SELECT/INSERT는 조건이 true이고 `shared_devices`의 PUBLIC INSERT도 true다. 따라서 로그인·가족 관계 확인 없이 프로필 열람/생성과 기기 등록이 허용되는 구조다. 자가 등록한 기기의 x-device-id 헤더로 성장·접종 등의 정책 조건을 충족할 수 있다. 실제 사용자 기록을 열람하거나 공격하지 않고 로컬 가상 데이터에서 이 경로를 재현했다. 실제 유출 여부는 로그 분석을 하지 않아 확인하지 않았다.

표 단위 can_delete/can_update=true가 모든 행의 삭제/수정을 의미하지는 않는다. RLS의 해당 명령 정책도 필요하다. 로컬 재현에서 shared_babies DELETE와 shared_measurements UPDATE는 허용 정책이 없어 0행이었다. force_rls=false 자체가 이번 문제의 근거도 아니다.

## 준비한 임시 차단 SQL — 운영 미적용

파일: `sql/security/lockdown-legacy-sharing.sql`

- 공유 테이블 5개에 대한 PUBLIC/anon/authenticated의 표 권한을 회수한다.
- 일반 앱 역할에 restrictive false 정책을 추가해 기존 정책과 상속/열 단위 권한만으로 행에 접근하지 못하게 한다.
- 데이터 삭제와 기존 정책 제거는 하지 않는다. 기존 정책을 그대로 안전하다고 인정하는 최종 수정도 아니다.
- 이 작업은 `007_atomic_backup.sql` 적용과 독립적이다. 007을 먼저 실행하지 않는다.
- **적용하면 기존 클라우드 공유·자동 백업·공유 데이터 가져오기가 일시 중단된다.** 기기 기록과 공개 백과 테이블은 대상이 아니다. 관리자/서버 경로 영향도 적용 전 확인해야 한다.

## 로컬 검증

`node scripts/sharing-security-regression.cjs`: 10개 통과. PGlite 메모리 DB와 가상 아기만 사용했다. 적용 전 접근 문제 재현, 적용 후 anon/authenticated 차단, 가상 데이터 전부 보존, 공개 콘텐츠 조회 유지, 명시적인 서비스 역할 권한 보존, 표/열 권한 재부여에도 restrictive 정책의 행 차단을 확인했다. 실제 프로젝트의 서비스 역할·다른 권한 함수 전체를 검증한 결과는 아니다.

## 적용 여부를 결정하기 전

1. 클라우드 기능 일시 중단의 영향과 운영 DB 백업을 확인한다.
2. 중단을 승인한 뒤 관리자 SQL Editor에서 임시 차단 SQL만 실행하고 익명/일반 로그인 계정으로 차단을 검증한다.
3. 실제 아기 소유권과 가족 권한을 검증한 명단으로 새 프로토콜의 membership·기준 스냅샷을 준비한다.
4. 생성·초대·복원·전송·해제·파기 전체 경로를 전환한 뒤 필요한 최소 권한만 복구한다.

GRANT ALL로 되돌리거나 기존 creator_id/기기 ID만으로 새 가족 권한을 자동 부여하지 않는다. 기존 보안 결함을 완전히 해결한 상태로 판정하지 않는다. SQL은 운영에 실행하지 않았으며 커밋·푸시·배포하지 않았다.
