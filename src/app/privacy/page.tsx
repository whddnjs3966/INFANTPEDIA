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
          이름·생년월일·성장 기록·예방접종 기록 등 사용자가 입력한 아기 정보는 기본적으로 이 기기에 저장됩니다.
          온라인 백업을 사용할 수 있는 환경에서 사용자가 백업을 설정하면, 해당 안내에 표시한 기록을 서버에 저장합니다.
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
        <li>사용자가 설정한 백업과 복원</li>
        <li>서비스 품질 개선 및 오류 수정</li>
      </ul>
    ),
  },
  {
    no: "03",
    title: "보관 및 파기",
    body: (
      <p>
        기기 기록은 사용자가 삭제하거나 브라우저 데이터를 지울 때까지 기기에 보관됩니다.
        서버에 백업한 기록과 계정은 삭제 화면에 안내된 범위와 절차에 따라 처리됩니다.
      </p>
    ),
  },
  {
    no: "04",
    title: "가족에게 공유되는 범위",
    body: (
      <p>
        가족 공유를 사용할 수 있는 환경에서는 사용자가 초대한 계정에 지정한 권한으로 기록 접근을 허용합니다.
        접근을 해제하면 서버 기록에 대한 접근이 종료됩니다. 가족이 이미 기기에 저장한 복사본은 해당 기기에서 관리합니다.
      </p>
    ),
  },
  {
    no: "05",
    title: "데이터 저장 및 보안",
    body: (
      <>
        <p>
          서버 백업과 인증에는 Supabase를 사용합니다. 앱과 서버가 통신할 때 HTTPS를 사용합니다.
        </p>
      </>
    ),
  },
  {
    no: "06",
    title: "사용자 권리",
    body: (
      <ul className="list-disc space-y-1 pl-5">
        <li>설정의 데이터 관리에서 이 기기에 저장한 기록을 삭제할 수 있습니다.</li>
        <li>로그아웃 후에도 로컬 데이터만으로 서비스를 계속 이용할 수 있습니다.</li>
        <li>서버 삭제를 이용할 수 있는 경우, 삭제 전에 소유한 백업과 공유 접근의 처리 범위를 확인할 수 있습니다.</li>
      </ul>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen [overflow-wrap:anywhere]" style={{ backgroundColor: "var(--surface-bg)" }}>
      {/* ── Top bar with back ── */}
      <header className="pt-safe sticky top-0 z-10 bg-[var(--surface-bg)]/80 backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-2 px-5 pt-3 pb-3">
          <Link
            href="/settings"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 dark:bg-[var(--surface-muted)]/80 ring-1 ring-stone-200/80 dark:ring-stone-700/80 text-stone-700 dark:text-stone-200 active:scale-95 transition-transform"
            aria-label="뒤로"
          >
            <ChevronLeft size={18} strokeWidth={2.3} />
          </Link>
          <span className="text-sm font-semibold text-[var(--muted-foreground)]">
            설정
          </span>
        </div>
      </header>

      {/* ── Title ── */}
      <div className="px-5 pt-2 pb-5">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1">
          <ShieldCheck size={13} className="text-[var(--brand)]" strokeWidth={2.4} />
          <span className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--brand)]">
            Privacy
          </span>
        </div>
        <h1 className="text-[1.375rem] font-bold tracking-[-0.02em] text-stone-900 dark:text-stone-50 leading-[1.15]">
          개인정보처리방침
        </h1>
        <p className="mt-1.5 text-sm font-medium text-[var(--muted-foreground)] leading-snug">
          InfantPedia는 부모님과 아기의 정보를 최소한으로 수집하고,
          안전하게 보관하기 위해 다음 원칙을 따릅니다.
        </p>
      </div>

      {/* ── Sections ── */}
      <div className="px-5 pb-10 space-y-3">
        {sections.map((s) => (
          <section
            key={s.no}
            className="rounded-3xl bg-white dark:bg-[var(--card)] p-5 elevation-1"
          >
            <div className="mb-2.5 flex flex-wrap items-center gap-2.5">
              <span className="text-sm font-black tabular-nums tracking-[0.08em] text-[var(--brand)]">
                {s.no}
              </span>
              <span className="h-px flex-1 bg-stone-100 dark:bg-[var(--surface-muted)]" />
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                {s.title}
              </h2>
            </div>
            <div className="space-y-2 text-base leading-7 text-[var(--foreground)]">
              {s.body}
            </div>
          </section>
        ))}

        <p className="pt-2 text-center text-sm font-medium text-[var(--muted-foreground)]">
          시행일 · 2026년 4월 22일
        </p>
      </div>
    </div>
  );
}

