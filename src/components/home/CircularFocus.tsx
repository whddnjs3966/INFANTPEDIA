"use client";

import Image from "next/image";
import Link from "next/link";
import { Camera, Search } from "lucide-react";
import { useRef } from "react";
import BabySelector from "@/components/baby/BabySelector";
import { useBabyStore } from "@/lib/store/baby-store";

interface CircularFocusProps {
  days: number; months: number; realMonths: number; isOver12: boolean;
  greeting: string; babyName: string; photoUrl?: string;
  onPhotoSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function BabyPortrait() {
  return <svg viewBox="0 0 64 64" width="48" height="48" aria-hidden="true" focusable="false">
    <ellipse cx="32" cy="58" rx="21" ry="13" fill="#BBD7F6" /><path d="M23 50l9 7 9-7" fill="#FFF7EF" />
    <circle cx="11" cy="31" r="5" fill="#EFBFA3" /><circle cx="53" cy="31" r="5" fill="#EFBFA3" />
    <ellipse cx="32" cy="29" rx="21" ry="23" fill="#FFDCC1" />
    <path d="M26 8c-2 8 12 10 14 3-2 2-8 3-10-2" fill="#A77959" />
    <circle cx="24" cy="30" r="2" fill="#67544D" /><circle cx="40" cy="30" r="2" fill="#67544D" />
    <ellipse cx="19" cy="36" rx="4" ry="2.5" fill="#F4AE9C" /><ellipse cx="45" cy="36" rx="4" ry="2.5" fill="#F4AE9C" />
    <path d="M28 39q4 5 8 0" fill="none" stroke="#946454" strokeWidth="1.8" strokeLinecap="round" />
  </svg>;
}

export default function CircularFocus({ days, realMonths, greeting, babyName, photoUrl, onPhotoSelect }: CircularFocusProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const babies = useBabyStore(state => state.babies);
  return <header data-home-profile className="home-profile">
    <button type="button" onClick={() => inputRef.current?.click()} aria-label={`${babyName} 사진 변경`} className="home-avatar">
      {photoUrl ? <Image src={photoUrl} alt="" fill unoptimized className="rounded-full object-cover" /> : <BabyPortrait />}
      <span aria-hidden className="absolute bottom-0 right-0 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[var(--card)] text-[var(--brand)] ring-2 ring-[var(--background)]"><Camera size={11} strokeWidth={1.8} /></span>
    </button>
    <div className="min-w-0">
      <p className="home-greeting">{greeting}</p>
      {babies.length > 1 ? <><h1 className="sr-only">{babyName}의 하루</h1><BabySelector variant="hero" /></> : <h1 aria-label={`${babyName}의 하루`} className="home-profile-name">{babyName}</h1>}
      <p className="home-profile-meta"><span>만 {realMonths}개월</span><span aria-hidden>·</span><span>생후 {days}일</span></p>
    </div>
    <Link href="/search" aria-label="육아 정보 검색" className="home-profile-search"><Search size={22} strokeWidth={1.65} aria-hidden /></Link>
    <input ref={inputRef} type="file" accept="image/*" aria-label="아기 사진 선택" className="hidden" onChange={onPhotoSelect} />
  </header>;
}
