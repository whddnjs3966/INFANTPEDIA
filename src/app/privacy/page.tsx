import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침 - InfantPedia",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-md px-5 py-8">
      <h1 className="mb-6 text-xl font-bold text-gray-800 dark:text-gray-100">
        개인정보처리방침
      </h1>

      <div className="space-y-6 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
        <section>
          <h2 className="mb-2 font-semibold text-gray-700 dark:text-gray-200">
            1. 수집하는 개인정보
          </h2>
          <p>
            InfantPedia(이하 &quot;서비스&quot;)는 소셜 로그인 시 다음 정보를
            수집합니다.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>이메일 주소</li>
            <li>프로필 이름</li>
            <li>프로필 사진 URL</li>
          </ul>
          <p className="mt-2">
            아기 정보(이름, 생년월일, 성장 기록)는 사용자가 직접 입력하며,
            로그인 시 클라우드에 저장됩니다. 비로그인 사용자의 데이터는 기기
            내(localStorage)에만 저장됩니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-gray-700 dark:text-gray-200">
            2. 개인정보의 이용 목적
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>사용자 식별 및 로그인 서비스 제공</li>
            <li>기기 간 데이터 동기화</li>
            <li>서비스 개선 및 오류 수정</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-gray-700 dark:text-gray-200">
            3. 개인정보의 보관 및 파기
          </h2>
          <p>
            수집된 개인정보는 서비스 이용 기간 동안 보관되며, 회원 탈퇴 시 즉시
            파기합니다. 비로그인 사용자의 데이터는 서버에 저장되지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-gray-700 dark:text-gray-200">
            4. 개인정보의 제3자 제공
          </h2>
          <p>
            서비스는 사용자의 개인정보를 제3자에게 제공하지 않습니다. 단, 법령에
            의해 요구되는 경우는 예외로 합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-gray-700 dark:text-gray-200">
            5. 데이터 저장 위치
          </h2>
          <p>
            클라우드 데이터는 Supabase(AWS 기반)에 안전하게 저장됩니다.
            인증 정보는 Supabase Auth를 통해 관리되며, 비밀번호는 저장하지
            않습니다(소셜 로그인만 지원).
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-gray-700 dark:text-gray-200">
            6. 사용자 권리
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>언제든지 설정 페이지에서 데이터를 삭제할 수 있습니다</li>
            <li>로그아웃 후 로컬 데이터만으로 서비스를 이용할 수 있습니다</li>
            <li>계정 삭제를 요청할 수 있습니다</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-semibold text-gray-700 dark:text-gray-200">
            7. 문의
          </h2>
          <p>
            개인정보 관련 문의는 아래 이메일로 연락해 주세요.
          </p>
          <p className="mt-1 font-medium">
            whddnjs3966@gmail.com
          </p>
        </section>

        <p className="pt-4 text-xs text-gray-400 dark:text-gray-500">
          시행일: 2026년 3월 21일
        </p>
      </div>
    </div>
  );
}
