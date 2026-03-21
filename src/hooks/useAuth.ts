"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const signInWithProvider = useCallback(
    async (provider: "google" | "kakao") => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      return { error };
    },
    [supabase.auth]
  );

  const signInWithNaver = useCallback(async () => {
    // Naver uses Supabase custom OIDC provider
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "keycloak" as never,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: "openid profile email",
        queryParams: {
          kc_idp_hint: "naver",
        },
      },
    });
    return { error };
  }, [supabase.auth]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  }, [supabase.auth]);

  return {
    user,
    loading,
    signInWithProvider,
    signInWithNaver,
    signOut,
  };
}
