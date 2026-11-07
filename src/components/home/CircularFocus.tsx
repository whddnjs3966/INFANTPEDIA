"use client";

import Image from "next/image";
import Link from "next/link";
import { Baby, Camera, Search } from "lucide-react";
import { useRef } from "react";
import BabySelector from "@/components/baby/BabySelector";
import { useBabyStore } from "@/lib/store/baby-store";

interface CircularFocusProps {
  days: number; months: number; realMonths: number; isOver12: boolean;
  greeting: string; babyName: string; photoUrl?: string;
  onPhotoSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function CircularFocus({ days, realMonths, greeting, babyName, photoUrl, onPhotoSelect }: CircularFocusProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const babies = useBabyStore(state => state.babies);
  return <header data-home-profile className="@container py-1 text-[var(--foreground)]">
    <p className="mb-2 text-sm leading-5 text-[var(--muted-foreground)]">{greeting}</p>
    <div className="grid grid-cols-[52px_minmax(0,1fr)_44px] items-center gap-3 @max-[18rem]:grid-cols-[52px_minmax(0,1fr)]">
      <button type="button" onClick={() => inputRef.current?.click()} aria-label={`${babyName} 사진 변경`} className="relative flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-[var(--surface-peach)] text-[var(--art-peach-ink)] ring-1 ring-[var(--border)] hover:bg-[var(--surface-muted)]">
        {photoUrl ? <Image src={photoUrl} alt="" fill unoptimized className="rounded-full object-cover" /> : <Baby size={27} strokeWidth={1.5} aria-hidden />}
        <span aria-hidden className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--card)] text-[var(--brand)] ring-2 ring-[var(--background)]"><Camera size={12} strokeWidth={1.8} /></span>
      </button>
      <div className="min-w-0 @max-[18rem]:order-3 @max-[18rem]:col-span-2">
        {babies.length > 1 ? <><h1 className="sr-only">{babyName}의 하루</h1><BabySelector variant="hero" /></> : <h1 aria-label={`${babyName}의 하루`} className="break-words text-[1.25rem] font-semibold leading-7 tracking-tight">{babyName}</h1>}
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm leading-5 text-[var(--muted-foreground)]"><span className="font-medium text-[var(--brand)]">만 {realMonths}개월</span><span aria-hidden>·</span><span>생후 {days}일</span></p>
      </div>
      <Link href="/search" aria-label="육아 정보 검색" className="header-action @max-[18rem]:order-2 @max-[18rem]:justify-self-end"><Search size={19} strokeWidth={1.8} aria-hidden /></Link>
    </div>
    <input ref={inputRef} type="file" accept="image/*" aria-label="아기 사진 선택" className="hidden" onChange={onPhotoSelect} />
  </header>;
}
