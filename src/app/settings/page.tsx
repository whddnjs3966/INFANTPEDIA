"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useBabyStore } from "@/lib/store/baby-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { User, Trash2, Info, Heart } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const profile = useBabyStore((s) => s.profile);
  const setProfile = useBabyStore((s) => s.setProfile);
  const clearProfile = useBabyStore((s) => s.clearProfile);

  const [name, setName] = useState(profile?.name || "");
  const [birthdate, setBirthdate] = useState(profile?.birthdate || "");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !birthdate) return;
    setProfile({ name: name.trim(), birthdate });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    clearProfile();
    router.replace("/onboarding");
  };

  return (
    <div className="min-h-screen px-4 pt-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-xl font-bold text-gray-800">
          {"\u2699\ufe0f"} {"\uc124\uc815"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {"\uc544\uae30 \uc815\ubcf4\ub97c"} {"\uc218\uc815\ud558\uac70\ub098"} {"\uc571 \uc124\uc815\uc744"} {"\ubcc0\uacbd\ud558\uc138\uc694"}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-6 space-y-6"
      >
        {/* Profile edit */}
        <div className="rounded-2xl border border-pink-200/50 bg-white/80 p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded-lg bg-pink-100 p-2">
              <User size={18} className="text-pink-500" />
            </div>
            <h2 className="text-base font-bold text-gray-700">
              {"\uc544\uae30 \ud504\ub85c\ud544"}
            </h2>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="settings-name" className="text-sm font-medium text-gray-600">
                {"\uc544\uae30 \uc774\ub984"}
              </Label>
              <Input
                id="settings-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 rounded-xl border-pink-200 bg-pink-50/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="settings-birth" className="text-sm font-medium text-gray-600">
                {"\uc0dd\ub144\uc6d4\uc77c"}
              </Label>
              <Input
                id="settings-birth"
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="h-11 rounded-xl border-pink-200 bg-pink-50/30"
              />
            </div>

            <motion.div whileTap={{ scale: 0.97 }}>
              <Button
                type="submit"
                className="h-11 w-full rounded-xl bg-gradient-to-r from-pink-400 to-purple-400 font-semibold text-white"
              >
                {saved ? "\u2705 \uc800\uc7a5\ub418\uc5c8\uc5b4\uc694!" : "\uc800\uc7a5\ud558\uae30"}
              </Button>
            </motion.div>
          </form>
        </div>

        <Separator className="bg-pink-100" />

        {/* Data reset */}
        <div className="rounded-2xl border border-red-200/50 bg-white/80 p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="rounded-lg bg-red-100 p-2">
              <Trash2 size={18} className="text-red-400" />
            </div>
            <h2 className="text-base font-bold text-gray-700">
              {"\ub370\uc774\ud130"} {"\ucd08\uae30\ud654"}
            </h2>
          </div>
          <p className="mb-4 text-sm text-gray-500">
            {"\ubaa8\ub4e0"} {"\uc544\uae30"} {"\uc815\ubcf4\uac00"} {"\uc0ad\uc81c\ub418\uace0"} {"\ucc98\uc74c"} {"\ud654\uba74\uc73c\ub85c"} {"\ub3cc\uc544\uac11\ub2c8\ub2e4."}
          </p>

          <Dialog>
            <DialogTrigger
              render={
                <Button
                  variant="destructive"
                  className="h-11 w-full rounded-xl font-semibold"
                />
              }
            >
              {"\ub370\uc774\ud130"} {"\ucd08\uae30\ud654\ud558\uae30"}
            </DialogTrigger>
            <DialogContent className="max-w-[340px] rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-center">
                  {"\uc815\ub9d0"} {"\ucd08\uae30\ud654\ud560\uae4c\uc694?"}
                </DialogTitle>
                <DialogDescription className="text-center">
                  {"\uc800\uc7a5\ub41c"} {"\uc544\uae30"} {"\uc815\ubcf4\uac00"} {"\ubaa8\ub450"} {"\uc0ad\uc81c\ub429\ub2c8\ub2e4."}{"\n"}
                  {"\uc774"} {"\uc791\uc5c5\uc740"} {"\ub418\ub3cc\ub9b4"} {"\uc218"} {"\uc5c6\uc5b4\uc694."}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex gap-2 sm:flex-row">
                <DialogClose
                  render={
                    <Button variant="outline" className="flex-1 rounded-xl" />
                  }
                >
                  {"\ucde8\uc18c"}
                </DialogClose>
                <Button
                  variant="destructive"
                  onClick={handleReset}
                  className="flex-1 rounded-xl"
                >
                  {"\ucd08\uae30\ud654"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Separator className="bg-pink-100" />

        {/* App info */}
        <div className="rounded-2xl border border-purple-200/50 bg-white/80 p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="rounded-lg bg-purple-100 p-2">
              <Info size={18} className="text-purple-500" />
            </div>
            <h2 className="text-base font-bold text-gray-700">
              {"\uc571"} {"\uc815\ubcf4"}
            </h2>
          </div>
          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex justify-between">
              <span>{"\ubc84\uc804"}</span>
              <span className="font-medium text-gray-700">0.1.0</span>
            </div>
            <div className="flex justify-between">
              <span>{"\uc571"} {"\uc774\ub984"}</span>
              <span className="font-medium text-gray-700">InfantPedia</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-1 pb-8 text-xs text-gray-400">
          <span>Made with</span>
          <Heart size={12} className="fill-pink-400 text-pink-400" />
          <span>for parents</span>
        </div>
      </motion.div>
    </div>
  );
}
