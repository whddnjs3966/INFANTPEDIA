"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const reduceMotion = useReducedMotion();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed recently
    const dismissedAt = localStorage.getItem("pwa-install-dismissed");
    if (dismissedAt) {
      const daysSinceDismissed =
        (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setDismissed(true);
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
  };

  if (dismissed || !showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
        transition={{ duration: reduceMotion ? 0 : 0.18 }}
        className="fixed bottom-20 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2"
      >
        <div className="relative overflow-hidden rounded-2xl bg-[var(--card)] p-4 shadow-lg">
          <button
            onClick={handleDismiss}
            className="absolute right-3 top-3 flex min-h-11 min-w-11 items-center justify-center rounded-full p-1 text-[var(--muted-foreground)] active:bg-[var(--surface-muted)]"
            aria-label="닫기"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-200">
              <Download size={20} className="text-blue-800" />
            </div>
            <div className="min-w-0 flex-1 pr-12">
              <p className="text-sm font-bold text-[var(--foreground)]">
                홈 화면에 추가하기
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                앱처럼 바로 실행할 수 있어요
              </p>
            </div>
          </div>

          <button
            onClick={handleInstall}
            className="mt-3 min-h-11 w-full rounded-xl bg-[var(--brand)] py-2.5 text-sm font-semibold text-[var(--brand-foreground)] active:scale-[0.98]"
          >
            설치하기
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
