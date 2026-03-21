"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type Provider = "google" | "kakao" | "naver";

const providers: { id: Provider; label: string; color: string; bgColor: string; icon: string }[] = [
  {
    id: "kakao",
    label: "카카오로 시작하기",
    color: "#191919",
    bgColor: "#FEE500",
    icon: "💬",
  },
  {
    id: "naver",
    label: "네이버로 시작하기",
    color: "#FFFFFF",
    bgColor: "#03C75A",
    icon: "N",
  },
  {
    id: "google",
    label: "Google로 시작하기",
    color: "#374151",
    bgColor: "#FFFFFF",
    icon: "G",
  },
];

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-pink-300 border-t-transparent" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "auth" ? "로그인에 실패했어요. 다시 시도해주세요." : null
  );

  const handleSignIn = async (provider: Provider) => {
    setLoading(provider);
    setError(null);

    if (provider === "naver") {
      // Naver uses custom API route (not Supabase built-in)
      window.location.href = "/api/auth/naver";
      return;
    }

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback`;

    const result = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });

    if (result.error) {
      setError(result.error.message);
      setLoading(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col px-6 pt-8 pb-12">
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => router.back()}
        className="mb-8 flex w-fit items-center gap-1 text-sm text-gray-400 dark:text-gray-500"
      >
        <ArrowLeft size={16} />
        돌아가기
      </motion.button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <div className="mb-4 text-5xl">👶</div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          InfantPedia
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          로그인하면 기기를 바꿔도<br />
          데이터가 안전하게 유지돼요
        </p>
      </motion.div>

      {/* Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-10 space-y-3"
      >
        {[
          { emoji: "🔄", text: "기기 변경 시 데이터 자동 동기화" },
          { emoji: "☁️", text: "클라우드에 안전하게 백업" },
          { emoji: "👨‍👩‍👧", text: "가족과 쉽게 데이터 공유" },
        ].map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl bg-white/60 px-4 py-3 dark:bg-gray-800/60"
          >
            <span className="text-lg">{item.emoji}</span>
            <span className="text-sm text-gray-600 dark:text-gray-300">{item.text}</span>
          </div>
        ))}
      </motion.div>

      {/* Social login buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        {providers.map((p) => (
          <motion.button
            key={p.id}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleSignIn(p.id)}
            disabled={loading !== null}
            className={cn(
              "flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-opacity",
              loading !== null && loading !== p.id && "opacity-50",
              p.id === "google" && "border border-gray-200 dark:border-gray-600"
            )}
            style={{
              backgroundColor: p.bgColor,
              color: p.color,
            }}
          >
            {loading === p.id ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <>
                {p.id === "naver" ? (
                  <span className="text-base font-black">{p.icon}</span>
                ) : p.id === "google" ? (
                  <GoogleIcon />
                ) : (
                  <span className="text-base">{p.icon}</span>
                )}
                {p.label}
              </>
            )}
          </motion.button>
        ))}
      </motion.div>

      {/* Error */}
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-center text-xs text-red-500"
        >
          {error}
        </motion.p>
      )}

      {/* Skip */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        onClick={() => router.back()}
        className="mx-auto mt-6 text-xs text-gray-400 underline dark:text-gray-500"
      >
        로그인 없이 사용하기
      </motion.button>

      {/* Footer */}
      <p className="mt-auto pt-8 text-center text-[10px] leading-relaxed text-gray-300 dark:text-gray-600">
        소셜 로그인 시 서비스 이용약관 및<br />
        개인정보 처리방침에 동의하게 됩니다.
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
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
