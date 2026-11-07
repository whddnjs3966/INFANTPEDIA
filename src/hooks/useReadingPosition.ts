"use client";

import { useEffect, useRef } from "react";
import { useReadingStore, type ReadingPosition } from "@/lib/store/reading-store";

/** Restore after lazy content and its saved disclosure state have reached the DOM. */
export function useReadingPosition(scope: string, ready = true, routeKey = "") {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!ready || !root) return;
    const pageUrl = window.location.pathname + window.location.search;
    const isCurrentPage = () => root.isConnected && window.location.pathname + window.location.search === pageUrl;
    const target = useReadingStore.getState().views[scope];
    let restoring = true;
    let frame = 0;
    let saveTimer: ReturnType<typeof setTimeout> | undefined;
    let last: ReadingPosition = { top: window.scrollY };
    const anchors = () => Array.from(root.querySelectorAll<HTMLElement>("[data-reading-anchor]"));
    const capture = (): ReadingPosition => {
      let anchor: HTMLElement | undefined;
      for (const item of anchors()) {
        const bounds = item.getBoundingClientRect();
        if (bounds.height && bounds.top <= 160) anchor = item;
      }
      return { top: window.scrollY, ...(anchor ? { anchor: anchor.dataset.readingAnchor!, offset: anchor.getBoundingClientRect().top } : {}) };
    };
    const flush = () => { if (!restoring) useReadingStore.getState().setPosition(scope, last); };
    const onScroll = () => {
      if (restoring || !isCurrentPage()) return;
      last = capture();
      clearTimeout(saveTimer);
      saveTimer = setTimeout(flush, 120);
    };
    const complete = (fallback = false) => {
      if (!restoring || !isCurrentPage() || ((target?.top || target?.anchor) && !fallback && root.querySelector("[data-reading-loading]"))) return;
      const anchor = target?.anchor ? anchors().find(item => item.dataset.readingAnchor === target.anchor && item.getBoundingClientRect().height > 0) : undefined;
      if (target?.anchor && !anchor && !fallback) return;
      const top = anchor ? window.scrollY + anchor.getBoundingClientRect().top - (target?.offset ?? 0) : target?.top ?? 0;
      window.scrollTo({ top: Math.max(0, top), behavior: "instant" });
      restoring = false;
      last = capture();
      observer.disconnect();
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => { frame = requestAnimationFrame(() => complete()); });
    };
    const observer = new MutationObserver(schedule);
    observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden"] });
    const timeout = setTimeout(() => complete(true), 8000);
    const interrupt = (event: Event) => {
      if (!restoring) return;
      if (event instanceof KeyboardEvent && !["PageDown", "PageUp", "ArrowDown", "ArrowUp", "Home", "End", " "].includes(event.key)) return;
      restoring = false;
      observer.disconnect();
      cancelAnimationFrame(frame);
      last = capture();
    };
    const onClick = () => { if (!restoring && isCurrentPage()) { last = capture(); flush(); } };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", flush);
    window.addEventListener("wheel", interrupt, { passive: true });
    window.addEventListener("touchmove", interrupt, { passive: true });
    window.addEventListener("keydown", interrupt);
    document.addEventListener("click", onClick, true);
    schedule();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      clearTimeout(timeout);
      clearTimeout(saveTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("wheel", interrupt);
      window.removeEventListener("touchmove", interrupt);
      window.removeEventListener("keydown", interrupt);
      document.removeEventListener("click", onClick, true);
      // The next route may already have scrolled. Save the last position seen here.
      flush();
    };
  }, [scope, ready, routeKey]);
  return ref;
}
