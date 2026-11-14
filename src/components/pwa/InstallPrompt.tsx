"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Download } from "lucide-react";

interface InstallEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type InstallState = {
  available: boolean;
  installed: boolean;
  busy: boolean;
  message: string;
  install: () => void;
};

const InstallContext = createContext<InstallState | null>(null);

export function InstallPromptProvider({ children }: { children: ReactNode }) {
  const eventRef = useRef<InstallEvent | null>(null);
  const [available, setAvailable] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)");
    const updateDisplay = () => setInstalled(standalone.matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);
    const ready = (event: Event) => {
      event.preventDefault();
      eventRef.current = event as InstallEvent;
      setAvailable(true);
      setMessage("");
    };
    const complete = () => {
      eventRef.current = null;
      setInstalled(true);
      setAvailable(false);
      setMessage("");
    };

    updateDisplay();
    standalone.addEventListener("change", updateDisplay);
    window.addEventListener("beforeinstallprompt", ready);
    window.addEventListener("appinstalled", complete);
    return () => {
      standalone.removeEventListener("change", updateDisplay);
      window.removeEventListener("beforeinstallprompt", ready);
      window.removeEventListener("appinstalled", complete);
    };
  }, []);

  async function install() {
    const event = eventRef.current;
    if (!event || busy || installed) return;
    eventRef.current = null;
    setAvailable(false);
    setBusy(true);
    try {
      await event.prompt();
      const { outcome } = await event.userChoice;
      if (outcome === "accepted") setInstalled(true);
      else setMessage("설치를 취소했어요. 브라우저 메뉴에서도 다시 설치할 수 있어요.");
    } catch {
      setMessage("설치 창을 열지 못했어요. 브라우저 메뉴의 설치 방법을 확인해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  return <InstallContext.Provider value={{ available, installed, busy, message, install }}>{children}</InstallContext.Provider>;
}

export default function InstallPrompt() {
  const state = useContext(InstallContext);
  if (!state) return null;
  const { available, installed, busy, message, install } = state;

  return <section aria-label="홈 화면에 추가" className="surface-card space-y-2 p-4 [overflow-wrap:anywhere]">
    <h3 className="flex items-center gap-2 text-base font-semibold"><Download size={18} aria-hidden="true" className="shrink-0 text-[var(--brand)]" />홈 화면에 추가</h3>
    {installed ? <p className="text-sm leading-6" role="status">이 기기에 설치되어 있어요.</p> : <>
      {available || busy ? <button type="button" onClick={install} disabled={busy} className="min-h-12 max-w-full rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-[var(--brand-foreground)]">
        {busy ? "설치 선택을 기다리는 중" : "앱 설치하기"}
      </button> : null}
      {message && <p role="status" className="text-sm leading-6 text-[var(--muted-foreground)]">{message}</p>}
      <details open={!available && !busy} className="text-sm leading-6 text-[var(--muted-foreground)]">
        <summary className="min-h-11 cursor-pointer py-2.5 font-semibold text-[var(--foreground)]">브라우저 메뉴에서 설치하는 방법</summary>
        <ul className="list-disc space-y-2 pl-5 pb-2">
          <li>iPhone의 Safari에서 공유 버튼을 누른 뒤 ‘홈 화면에 추가’를 선택하세요. ‘웹 앱으로 열기’가 보이면 켜고 추가하세요.</li>
          <li>Android의 Chrome에서 메뉴를 열고 ‘홈 화면에 추가’ 또는 ‘앱 설치’를 선택하세요.</li>
        </ul>
      </details>
    </>}
  </section>;
}
