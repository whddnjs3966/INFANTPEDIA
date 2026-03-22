"use client";

import { useState, useCallback } from "react";
import SearchBar from "@/components/search/SearchBar";
import SearchResults from "@/components/search/SearchResults";
import { searchContent, type SearchResult } from "@/lib/queries/months";

export default function SearchPage() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [keyword, setKeyword] = useState("");

  const handleSearch = useCallback(async (newKeyword: string) => {
    setKeyword(newKeyword);

    if (!newKeyword.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const data = await searchContent(newKeyword);
      setResults(data);
    } catch (err) {
      console.error("Search error:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-pink-50/30 dark:from-gray-900 dark:to-gray-900">
      <SearchBar onSearch={handleSearch} />
      <SearchResults
        results={results}
        loading={loading}
        keyword={keyword}
        hasSearched={hasSearched}
      />
    </div>
  );
}
