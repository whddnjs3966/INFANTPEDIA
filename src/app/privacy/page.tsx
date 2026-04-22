import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "개인정보처리방침 - InfantPedia",
};

const sections: { no: string; title: string; body: React.ReactNode }[] = [
  {
    no: "01",
    title: "수집하는 개인정보",
    body: (
      <>
        <p>
          InfantPedia(이하 &quot;서비스&quot;)는 소셜 로그인 시{" "}
          <strong className="font-semibold text-stone-800 dark:text-stone-100">
            이메일 주소, 프로필 이름, 프로필 사진 URL
          </strong>
          을 수집합니다.
        </p>
        <p>
          아기 정보(이름·생년월일·성장 기록·예방접종 기록)는 사용자가 직접 입력하며,
          로그인 상태에서는 클라우드에 저장되고 비로그인 상태에서는 기기 내
          localStorage에만 보관됩니다.
        </p>
      </>
    ),
  },
  {
    no: "02",
    title: "이용 목적",
    body: (
      <ul className="list-disc space-y-1 pl-5">
        <li>사용자 식별 및 로그인 서비스 제공</li>
        <li>여러 기기 간 데이터 동기화</li>
        <li>서비스 품질 개선 및 오류 수정</li>
      </ul>
    ),
  },
  {
    no: "03",
    title: "보관 및 파기",
    body: (
      <p>
        수집된 개인정보는 서비스 이용 기간 동안 보관되며, 회원 탈퇴 즉시
        모든 클라우드 데이터가 파기됩니다. 비로그인 사용자의 데이터는 서버에
        저장되지 않으므로 별도 파기 절차가 필요하지 않습니다.
      </p>
    ),
  },
  {
    no: "04",
    title: "제3자 제공",
    body: (
      <p>
        서비스는 사용자의 개인정보를 어떠한 제3자에게도 제공하지 않습니다.
        단, 관련 법령에 따라 수사기관의 적법한 요청이 있는 경우에 한해 예외로
        합니다.
      </p>
    ),
  },
  {
    no: "05",
    title: "데이터 저장 및 보안",
    body: (
      <>
        <p>
          클라우드 데이터는 Supabase(AWS 기반 인프라)에 암호화되어
          저장됩니다. 인증은 Supabase Auth를 통해 관리되며, 소셜 로그인만
          지원하므로 비밀번호는 저장하지 않습니다.
        </p>
        <p>
          전송 구간은 HTTPS로 암호화되고, 로그인 세션은 만료 시점 이후
          자동 폐기됩니다.
        </p>
      </>
    ),
  },
  {
    no: "06",
    title: "사용자 권리",
    body: (
      <ul className="list-disc space-y-1 pl-5">
        <li>설정 페이지에서 저장된 데이터를 언제든지 삭제할 수 있습니다.</li>
        <li>로그아웃 후에도 로컬 데이터만으로 서비스를 계속 이용할 수 있습니다.</li>
        <li>계정 삭제를 통해 서버에 저장된 모든 기록을 영구 삭제할 수 있습니다.</li>
      </ul>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--surface-bg)" }}>
      {/* ── Top bar with back ── */}
      <header className="pt-safe sticky top-0 z-10 bg-[var(--surface-bg)]/80 backdrop-blur-xl">
        <div className="flex items-center gap-2 px-5 pt-3 pb-3">
          <Link
            href="/settings"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 dark:bg-stone-800/80 ring-1 ring-stone-200/80 dark:ring-stone-700/80 text-stone-700 dark:text-stone-200 active:scale-95 transition-transform"
            aria-label="뒤로"
          >
            <ChevronLeft size={18} strokeWidth={2.3} />
          </Link>
          <span className="text-[13px] font-semibold text-stone-500 dark:text-stone-400">
            설정
          </span>
        </div>
      </header>

      {/* ── Title ── */}
      <div className="px-5 pt-2 pb-5">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-teal-50 dark:bg-teal-950/40 px-2.5 py-1">
          <ShieldCheck size={13} className="text-[#14B8A6] dark:text-teal-400" strokeWidth={2.4} />
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#14B8A6] dark:text-teal-400">
            Privacy
          </span>
        </div>
        <h1 className="text-[26px] font-black tracking-[-0.02em] text-stone-900 dark:text-stone-50 leading-[1.15]">
          개인정보처리방침
        </h1>
        <p className="mt-1.5 text-[13px] font-medium text-stone-500 dark:text-stone-400 leading-snug">
          InfantPedia는 부모님과 아기의 정보를 최소한으로 수집하고,
          안전하게 보관하기 위해 다음 원칙을 따릅니다.
        </p>
      </div>

      {/* ── Sections ── */}
      <div className="px-5 pb-10 space-y-3">
        {sections.map((s) => (
          <section
            key={s.no}
            className="rounded-3xl bg-white dark:bg-stone-900 p-5 elevation-1"
          >
            <div className="mb-2.5 flex items-center gap-2.5">
              <span className="text-[11px] font-black tabular-nums tracking-[0.08em] text-[#14B8A6] dark:text-teal-400">
                {s.no}
              </span>
              <span className="h-px flex-1 bg-stone-100 dark:bg-stone-800" />
              <h2 className="text-[15px] font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                {s.title}
              </h2>
            </div>
            <div className="space-y-2 text-[13px] leading-relaxed text-stone-600 dark:text-stone-400">
              {s.body}
            </div>
          </section>
        ))}

        <p className="pt-2 text-center text-[12px] font-medium text-stone-400 dark:text-stone-600">
          시행일 · 2026년 4월 22일
        </p>
      </div>
    </div>
  );
}
