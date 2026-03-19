"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useBabyStore, type BabyGender } from "@/lib/store/baby-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import FloatingDecorations from "@/components/layout/FloatingDecorations";

export default function OnboardingPage() {
  const router = useRouter();
  const addBaby = useBabyStore((s) => s.addBaby);
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [gender, setGender] = useState<BabyGender>("male");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("아기 이름을 입력해 주세요");
      return;
    }
    if (!birthdate) {
      setError("생년월일을 선택해 주세요");
      return;
    }

    const birth = new Date(birthdate);
    const today = new Date();
    if (birth > today) {
      setError("생년월일이 미래 날짜입니다");
      return;
    }

    addBaby({ name: name.trim(), birthdate, gender });
    router.replace("/");
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6">
      <FloatingDecorations />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Hero */}
        <motion.div
          className="mb-8 flex flex-col items-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div
            className="mb-4 flex items-center gap-3 text-5xl"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <span>👶</span>
            <span>🍼</span>
            <span>⭐</span>
          </motion.div>

          <h1 className="text-center text-2xl font-bold text-gray-800">
            인펀트피디아에
            <br />
            오신 것을 환영합니다!
          </h1>
          <p className="mt-2 text-center text-sm text-gray-500">
            아기의 성장을 함께 기록하고 알아가요 💕
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-pink-100 bg-white/80 p-6 shadow-lg backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                👶 아기 이름
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="예: 서연이"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 rounded-xl border-pink-200 bg-pink-50/50 text-base placeholder:text-gray-300 focus:border-pink-300 focus:ring-pink-200"
              />
            </div>

            {/* Gender selection */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                👧👦 성별
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setGender("male")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-semibold transition-all",
                    gender === "male"
                      ? "border-blue-300 bg-blue-50 text-blue-700 shadow-sm"
                      : "border-gray-200 bg-white text-gray-400"
                  )}
                >
                  <span className="text-xl">👦</span>
                  남아
                </motion.button>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setGender("female")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-semibold transition-all",
                    gender === "female"
                      ? "border-pink-300 bg-pink-50 text-pink-700 shadow-sm"
                      : "border-gray-200 bg-white text-gray-400"
                  )}
                >
                  <span className="text-xl">👧</span>
                  여아
                </motion.button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthdate" className="text-sm font-semibold text-gray-700">
                🎂 생년월일
              </Label>
              <Input
                id="birthdate"
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="h-12 rounded-xl border-pink-200 bg-pink-50/50 text-base focus:border-pink-300 focus:ring-pink-200"
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-sm text-red-400"
              >
                {error}
              </motion.p>
            )}

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Button
                type="submit"
                className="h-12 w-full rounded-xl bg-gradient-to-r from-pink-400 to-purple-400 text-base font-bold text-white shadow-md hover:from-pink-500 hover:to-purple-500"
              >
                시작하기 🚀
              </Button>
            </motion.div>
          </div>
        </motion.form>

        <motion.p
          className="mt-4 text-center text-xs text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          모든 데이터는 이 기기에만 저장됩니다 🔒
        </motion.p>
      </motion.div>
    </div>
  );
}
