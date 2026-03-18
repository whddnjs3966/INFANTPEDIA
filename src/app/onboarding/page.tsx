"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useBabyStore } from "@/lib/store/baby-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FloatingDecorations from "@/components/layout/FloatingDecorations";

export default function OnboardingPage() {
  const router = useRouter();
  const setProfile = useBabyStore((s) => s.setProfile);
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("\uc544\uae30 \uc774\ub984\uc744 \uc785\ub825\ud574 \uc8fc\uc138\uc694");
      return;
    }
    if (!birthdate) {
      setError("\uc0dd\ub144\uc6d4\uc77c\uc744 \uc120\ud0dd\ud574 \uc8fc\uc138\uc694");
      return;
    }

    const birth = new Date(birthdate);
    const today = new Date();
    if (birth > today) {
      setError("\uc0dd\ub144\uc6d4\uc77c\uc774 \ubbf8\ub798 \ub0a0\uc9dc\uc785\ub2c8\ub2e4");
      return;
    }

    setProfile({ name: name.trim(), birthdate });
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
        {/* Hero illustration */}
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
            <span>{"\ud83d\udc76"}</span>
            <span>{"\ud83c\udf7c"}</span>
            <span>{"\u2b50"}</span>
          </motion.div>

          <h1 className="text-center text-2xl font-bold text-gray-800">
            {"\uc778\ud380\ud2b8\ud53c\ub514\uc544\uc5d0"}
            <br />
            {"\uc624\uc2e0 \uac83\uc744 \ud658\uc601\ud569\ub2c8\ub2e4!"}
          </h1>
          <p className="mt-2 text-center text-sm text-gray-500">
            {"\uc544\uae30\uc758 \uc131\uc7a5\uc744 \ud568\uaed8 \uae30\ub85d\ud558\uace0 \uc54c\uc544\uac00\uc694"} {"\ud83d\udc95"}
          </p>
        </motion.div>

        {/* Form card */}
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
                {"\ud83d\udc76"} {"\uc544\uae30 \uc774\ub984"}
              </Label>
              <Input
                id="name"
                type="text"
                placeholder={"\uc608: \uc11c\uc5f0\uc774"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 rounded-xl border-pink-200 bg-pink-50/50 text-base placeholder:text-gray-300 focus:border-pink-300 focus:ring-pink-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthdate" className="text-sm font-semibold text-gray-700">
                {"\ud83c\udf82"} {"\uc0dd\ub144\uc6d4\uc77c"}
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
                {"\uc2dc\uc791\ud558\uae30"} {"\ud83d\ude80"}
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
          {"\ubaa8\ub4e0 \ub370\uc774\ud130\ub294 \uc774 \uae30\uae30\uc5d0\ub9cc \uc800\uc7a5\ub429\ub2c8\ub2e4"} {"\ud83d\udd12"}
        </motion.p>
      </motion.div>
    </div>
  );
}
