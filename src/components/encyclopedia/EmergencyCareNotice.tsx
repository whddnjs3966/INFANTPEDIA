import { Phone, ShieldAlert } from "lucide-react";

export default function EmergencyCareNotice() {
  return <aside aria-label="먼저 확인할 위험 신호" className="rounded-2xl bg-rose-50/80 p-3 text-sm leading-6 text-[var(--content-urgent)] dark:bg-rose-950/30">
    <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
      <h3 className="flex min-w-0 flex-1 items-start gap-1.5 font-semibold"><ShieldAlert size={17} aria-hidden className="mt-1 shrink-0" /><span>먼저, 아기의 상태를 확인해 주세요</span></h3>
      <a href="tel:119" className="inline-flex min-h-12 min-w-0 items-center gap-1.5 rounded-xl bg-rose-800 px-3 py-2 font-semibold text-white dark:bg-rose-300 dark:text-rose-950"><Phone size={16} aria-hidden className="shrink-0" /><span>응급 시 119 전화</span></a>
    </div>
    <p className="mt-2">숨쉬기 어렵거나 입술이 파래지고, 반응이 떨어지거나 경련이 있으면 <strong className="font-semibold">바로 도움을 요청하세요.</strong></p>
    <p className="mt-2"><strong className="font-semibold">생후 3개월 미만의 발열은 바로 의료진에게 연락해 진료받으세요.</strong> FAQ를 찾느라 도움 요청을 늦추지 마세요.</p>
  </aside>;
}
