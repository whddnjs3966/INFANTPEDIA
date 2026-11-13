"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { Suspense, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import "./login.css";

const providers = [
  { id: "kakao", label: "카카오로 시작하기" },
  { id: "naver", label: "네이버로 시작하기" },
  { id: "google", label: "Google로 시작하기" },
] as const;

type Provider = (typeof providers)[number]["id"];
const errorMessages: Record<string, string> = {
  naver: "네이버 로그인에 실패했어요. 다시 시도해 주세요.",
  google: "Google 로그인에 실패했어요. 다시 시도해 주세요.",
  kakao: "카카오 로그인에 실패했어요. 다시 시도해 주세요.",
  state_mismatch: "보안 검증에 실패했어요. 다시 시도해 주세요.",
  token: "인증 토큰을 발급하지 못했어요. 다시 시도해 주세요.",
  profile: "프로필 정보를 불러오지 못했어요. 다시 시도해 주세요.",
};

function loginError(key: string | null) {
  if (!key) return null;
  return Object.hasOwn(errorMessages, key) ? errorMessages[key] : "로그인에 실패했어요. 다시 시도해 주세요.";
}

function ProviderIcon({ provider }: { provider: Provider }) {
  return <span aria-hidden="true" className={`login-provider-icon login-provider-${provider}`}>
    {provider === "google" ? <GoogleIcon /> : provider === "naver" ? "N" : <MessageCircle size={19} fill="currentColor" strokeWidth={1.8} />}
  </span>;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div data-bright-shell className="login-wait" role="status"><span className="login-spinner" aria-hidden />로그인 화면 불러오는 중</div>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pending = useRef(false);
  const [loading, setLoading] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(() => loginError(searchParams.get("error")));

  async function handleSignIn(provider: Provider) {
    if (pending.current) return;
    pending.current = true;
    setLoading(provider);
    setError(null);

    try {
      if (provider === "naver") {
        // Use a full navigation for the OAuth redirect and state cookie.
        window.location.assign(new URL("/api/auth/naver", window.location.origin));
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (!error) return;
    } catch {
      // An unavailable authentication service should allow the user to retry.
    }

    pending.current = false;
    setLoading(null);
    setError(loginError(provider));
  }

  return (
    <div data-bright-shell data-login-redesign className="login-page">
      <header className="login-hero">
        <button type="button" className="login-back" onClick={() => {
          if (window.history.length > 1) router.back();
          else router.replace("/");
        }}>
          <ArrowLeft size={19} aria-hidden />돌아가기
        </button>
        <Image src="/images/login/cloud-book.webp" alt="" width={540} height={430} sizes="(max-width: 350px) 190px, 244px" preload className="login-hero-art" />
        <h1>InfantPedia</h1>
        <p>아기의 성장을 한눈에</p>
      </header>

      <section className="login-methods" aria-labelledby="login-methods-title">
        <h2 id="login-methods-title" className="sr-only">로그인</h2>
        <div className="login-providers">
          {providers.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              disabled={loading !== null}
              aria-busy={loading === id}
              className="login-provider"
              onClick={() => void handleSignIn(id)}
            >
              <ProviderIcon provider={id} />
              <span className="login-provider-label">{label}</span>
              {loading === id && <span className="login-spinner" aria-hidden />}
            </button>
          ))}
        </div>
        {loading && <p className="login-status" role="status">로그인 페이지로 연결 중이에요.</p>}
        {error && <p className="login-error" role="alert">{error}</p>}
        <div className="login-guest">
          <Link href="/" className="login-skip">로그인 없이 사용하기</Link>
          <p>이 기기에 저장된 아기 기록도 볼 수 있어요.</p>
        </div>

        <footer className="login-footer">
          소셜 로그인 시 이용약관과 <Link href="/privacy">개인정보 처리방침</Link>에 동의합니다.
        </footer>
      </section>
    </div>
  );
}


function GoogleIcon() {
  return (
    <svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
