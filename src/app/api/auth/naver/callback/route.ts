import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://infantpedia.vercel.app";

function loginError(step: string, detail?: string) {
  console.error(`[Naver Auth] ${step}:`, detail);
  // Generic error to user — detailed logging is server-side only
  return NextResponse.redirect(`${SITE_URL}/login?error=naver`);
}

function isValidHttpsUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "https:";
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error || !code) {
    return loginError("no_code", error || "authorization code missing");
  }

  // Validate CSRF state parameter
  const cookieStore = await cookies();
  const storedState = cookieStore.get("naver_oauth_state")?.value;
  if (!storedState || storedState !== state) {
    return loginError("state_mismatch", "CSRF state validation failed");
  }

  try {
    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return loginError("config", "Missing Naver OAuth credentials");
    }

    // 1. Exchange code for access token
    const tokenRes = await fetch("https://nid.naver.com/oauth2.0/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        code,
        state: state || "",
      }),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error || !tokenData.access_token) {
      return loginError("token_exchange", tokenData.error_description || tokenData.error);
    }

    // 2. Fetch Naver user profile
    const profileRes = await fetch("https://openapi.naver.com/v1/nid/me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profileData = await profileRes.json();

    if (profileData.resultcode !== "00" || !profileData.response) {
      return loginError("profile_fetch", profileData.message);
    }

    const naverUser = profileData.response;
    const email = naverUser.email;

    if (!email) {
      return loginError("no_email", "네이버 계정에 이메일 정보가 없습니다");
    }

    // 3. Create or find user in Supabase via admin API
    const adminClient = createAdminClient();

    // Look up user by email efficiently (avoid listing all users)
    let userId: string | null = null;
    let existingMetadata: Record<string, unknown> = {};

    // Try to create user first — if email exists, createUser fails with a known error
    const { data: newUser, error: createError } =
      await adminClient.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          full_name: naverUser.name || naverUser.nickname || "",
          avatar_url: isValidHttpsUrl(naverUser.profile_image || "") ? naverUser.profile_image : "",
          provider: "naver",
          naver_id: naverUser.id,
        },
      });

    if (newUser?.user) {
      // New user created successfully
      userId = newUser.user.id;
    } else if (createError) {
      // User likely exists — find by listing (filtered by email page)
      const { data: existingUsers, error: listError } =
        await adminClient.auth.admin.listUsers({ page: 1, perPage: 50 });

      if (listError) {
        return loginError("list_users", listError.message);
      }

      const existingUser = existingUsers?.users?.find((u) => u.email === email);
      if (!existingUser) {
        return loginError("user_lookup", `Cannot find or create user: ${createError.message}`);
      }

      userId = existingUser.id;
      existingMetadata = existingUser.user_metadata || {};

      // Update metadata
      await adminClient.auth.admin.updateUserById(userId, {
        user_metadata: {
          ...existingMetadata,
          full_name:
            naverUser.name ||
            naverUser.nickname ||
            (existingMetadata.full_name as string) || "",
          avatar_url: isValidHttpsUrl(naverUser.profile_image || "")
            ? naverUser.profile_image
            : (existingMetadata.avatar_url as string) || "",
          provider: "naver",
          naver_id: naverUser.id,
        },
      });
    }

    if (!userId) {
      return loginError("no_user_id", "Failed to resolve user");
    }

    // 4. Generate a magic link to create a session
    const { data: linkData, error: linkError } =
      await adminClient.auth.admin.generateLink({
        type: "magiclink",
        email,
      });

    if (linkError || !linkData.properties?.hashed_token) {
      return loginError("magic_link", linkError?.message);
    }

    // 5. Verify the token server-side to set session cookies
    const response = NextResponse.redirect(`${SITE_URL}/`);

    // Clear the OAuth state cookie
    response.cookies.delete("naver_oauth_state");

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { error: verifyError } = await supabase.auth.verifyOtp({
      type: "magiclink",
      token_hash: linkData.properties.hashed_token,
    });

    if (verifyError) {
      return loginError("verify_otp", verifyError.message);
    }

    console.log(`[Naver Auth] User ${userId} logged in successfully`);
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return loginError("unexpected", message);
  }
}
