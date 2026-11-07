"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import { Baby, Check, ChevronDown, X } from "lucide-react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Dialog, DialogClose, DialogDescription, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useBabyStore } from "@/lib/store/baby-store";
import { getCalendarMonthsOld } from "@/lib/utils/date";
import { cn } from "@/lib/utils";

const avatarTones = [
  "bg-[var(--accent-soft)] text-[var(--brand)]",
  "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-200",
  "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200",
];

function BabyAvatar({ photo, index, className }: { photo?: string; index: number; className?: string }) {
  return <span aria-hidden="true" className={cn("relative flex h-[56px] w-[56px] shrink-0 items-center justify-center overflow-hidden rounded-[18px]", avatarTones[index % avatarTones.length], className)}>
    {photo ? <Image src={photo} alt="" fill unoptimized className="object-cover" /> : <Baby size={27} strokeWidth={1.7} />}
  </span>;
}

interface BabySelectorProps {
  variant?: "card" | "inline" | "hero";
  label?: string;
  description?: string;
  className?: string;
}

export default function BabySelector({ variant = "card", label = "현재 아기", description = "선택한 아기의 월령별 안내와 기록이 보여요.", className }: BabySelectorProps) {
  const profile = useBabyStore(state => state.profile);
  const babies = useBabyStore(state => state.babies);
  const photos = useBabyStore(state => state.babyPhotos);
  const setActiveBaby = useBabyStore(state => state.setActiveBaby);
  const [open, setOpen] = useState(false);
  const selectedRef = useRef<HTMLButtonElement>(null);
  const infoId = useId();
  if (!profile) return null;
  const multiple = babies.length > 1;
  const hero = variant === "hero";
  const summary = <>
    {variant === "card" && <BabyAvatar photo={photos[profile.id]} index={Math.max(0, babies.findIndex(baby => baby.id === profile.id))} />}
    <span id={infoId} className="min-w-0 flex-1 text-left">
      {variant === "card" && <span className="block text-sm font-medium leading-5 text-[var(--muted-foreground)]">{label}</span>}
      <span className={cn("block break-words font-semibold leading-7 tracking-tight", hero ? "text-[1.25rem] text-[var(--foreground)]" : variant === "card" ? "mt-1 text-lg text-[var(--foreground)]" : "text-xl text-[var(--foreground)]")}>{profile.name}</span>
      {variant === "card" && <span className="mt-1 block break-words text-sm leading-6 text-[var(--muted-foreground)]">만 {getCalendarMonthsOld(profile.birthdate)}개월 · {profile.birthdate}</span>}
    </span>
    {multiple && <span className={cn("inline-flex shrink-0 items-center justify-center gap-1 rounded-full text-sm font-medium", hero ? "h-8 w-8 bg-[var(--accent-soft)] text-[var(--brand)]" : "min-h-10 bg-[var(--accent-soft)] px-3 text-[var(--brand)] @max-[20rem]:col-span-2 @max-[20rem]:justify-self-end")}><span className={hero ? "sr-only" : undefined}>변경</span><ChevronDown size={14} aria-hidden="true" className={cn("transition-transform motion-reduce:transition-none", hero && "h-4 w-4", open && "rotate-180")} /></span>}
  </>;

  const triggerClassName = cn("flex w-full items-center text-left transition-colors", variant === "card" ? "grid grid-cols-[56px_minmax(0,1fr)_auto] gap-3 @max-[20rem]:grid-cols-[56px_minmax(0,1fr)] rounded-[22px] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow-card)] hover:border-blue-700/40 active:bg-[var(--accent-soft)] dark:hover:border-blue-300/50" : hero ? "min-h-11 flex-wrap gap-x-2 gap-y-1 rounded-xl py-1 text-[var(--foreground)] hover:bg-[var(--accent-soft)]" : "min-h-12 gap-2 rounded-xl hover:bg-[var(--surface-bg)] active:bg-[var(--accent-soft)]");

  return <section aria-label={label} className={cn("@container", className)}>
    <Dialog open={open} onOpenChange={setOpen}>
      {multiple ? <DialogTrigger aria-label={`${label} 선택`} aria-describedby={infoId} render={<button type="button" className={triggerClassName} />}>{summary}</DialogTrigger> : <div className={triggerClassName}>{summary}</div>}
      <DialogPortal>
        <DialogOverlay className="z-[65] bg-black/30 duration-150 backdrop-blur-[2px] motion-reduce:animate-none" />
        <DialogPrimitive.Popup initialFocus={selectedRef} className="fixed bottom-0 left-1/2 z-[70] @container flex max-h-[85dvh] w-full max-w-[480px] -translate-x-1/2 flex-col overflow-hidden rounded-t-[28px] border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] shadow-xl outline-none duration-150 data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-bottom-4 data-closed:animate-out data-closed:fade-out-0 data-closed:slide-out-to-bottom-4 motion-reduce:animate-none sm:bottom-6 sm:max-w-[440px] sm:rounded-[28px]">
          <div className="flex shrink-0 items-start gap-3 px-5 pb-4 pt-5">
            <div className="min-w-0 flex-1 pt-1">
              <DialogTitle className="text-xl font-bold leading-7 tracking-tight">{label} 선택</DialogTitle>
              <DialogDescription className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{description}</DialogDescription>
            </div>
            <DialogClose aria-label="아기 선택 닫기" render={<button type="button" className="-mr-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--surface-bg)] text-[var(--muted-foreground)] transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--brand)]" />}><X size={20} aria-hidden="true" /></DialogClose>
          </div>
          <div role="group" aria-label="등록한 아기" className="space-y-2 overflow-y-auto overscroll-contain px-5 pb-[max(env(safe-area-inset-bottom),24px)]">
            {babies.map((baby, index) => {
              const selected = baby.id === profile.id;
              return <button ref={selected ? selectedRef : undefined} key={baby.id} type="button" aria-label={`${baby.name}${selected ? ', 현재 선택됨' : ' 선택'}`} aria-pressed={selected} onClick={() => { if (!selected) setActiveBaby(baby.id); setOpen(false); }} className={cn("grid min-h-24 w-full grid-cols-[48px_minmax(0,1fr)_28px] items-center gap-3 @max-[18rem]:grid-cols-[48px_minmax(0,1fr)] rounded-[20px] border p-4 text-left transition-colors", selected ? "border-[var(--brand)] bg-[var(--accent-soft)]" : "border-[var(--border)] bg-[var(--card)] hover:border-blue-700/40 hover:bg-[var(--surface-bg)] dark:hover:border-blue-300/50")}>
                <BabyAvatar photo={photos[baby.id]} index={index} className="h-[48px] w-[48px] rounded-2xl" />
                <span className="min-w-0 flex-1"><span className="block break-words text-lg font-bold leading-7">{baby.name}</span><span className="mt-1 flex flex-wrap gap-x-2 break-words text-sm leading-6 text-[var(--muted-foreground)]"><span>만 {getCalendarMonthsOld(baby.birthdate)}개월</span><span>{baby.birthdate} 출생</span></span></span>
                {selected ? <span aria-hidden="true" className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full bg-[var(--brand)] @max-[18rem]:col-start-2 text-[var(--brand-foreground)]"><Check size={17} strokeWidth={2.5} /></span> : <span aria-hidden="true" className="h-[24px] w-[24px] shrink-0 rounded-full border border-[var(--border)] @max-[18rem]:col-start-2" />}
              </button>;
            })}
          </div>
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
    <span role="status" className="sr-only">{profile.name}의 정보와 기록을 보고 있어요.</span>
  </section>;
}
