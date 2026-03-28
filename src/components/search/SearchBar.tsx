"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  onSearch: (keyword: string) => void;
  initialValue?: string;
}

export default function SearchBar({ onSearch, initialValue = "" }: SearchBarProps) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const debouncedSearch = useCallback(
    (keyword: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        onSearch(keyword);
      }, 300);
    },
    [onSearch]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    debouncedSearch(newValue);
  };

  const handleClear = () => {
    setValue("");
    onSearch("");
    inputRef.current?.focus();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-4 pt-4 pb-3"
    >
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 active:scale-95 transition-transform"
          aria-label="뒤로가기"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleChange}
            placeholder="검색어를 입력하세요"
            className="w-full rounded-full border border-pink-200/60 dark:border-gray-600 bg-pink-50/30 dark:bg-gray-800 py-2.5 pl-10 pr-10 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-pink-300 dark:focus:border-pink-500 focus:ring-2 focus:ring-pink-200/50 dark:focus:ring-pink-800/50 transition-all"
          />
          {value && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 active:scale-90 transition-transform"
              aria-label="검색어 지우기"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
