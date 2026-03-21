import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://infantpedia.vercel.app";

function loginError(step: string, detail?: string) {
  const msg = encodeURIComponent(detail || step);
  console.error(`[Naver Auth] ${step}:`, detail);
  return NextResponse.redirect(`${SITE_URL}/login?error=naver&detail=${msg}`);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return loginError("no_code", error || "authorization code missing");
  }

  try {
    // 1. Exchange code for access token
    const tokenRes = await fetch("https://nid.naver.com/oauth2.0/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.NAVER_CLIENT_ID!,
        client_secret: process.env.NAVER_CLIENT_SECRET!,
        code,
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

    // Try to find existing user by email (more reliable than listUsers)
    let userId: string | null = null;

    const { data: existingUsers, error: listError } =
      await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });

    if (listError) {
      return loginError("list_users", listError.message);
    }

    const existingUser = existingUsers?.users?.find((u) => u.email === email);

    if (existingUser) {
      userId = existingUser.id;
      // Update metadata
      await adminClient.auth.admin.updateUserById(userId, {
        user_metadata: {
          ...existingUser.user_metadata,
          full_name:
            naverUser.name ||
            naverUser.nickname ||
            existingUser.user_metadata?.full_name,
          avatar_url:
            naverUser.profile_image || existingUser.user_metadata?.avatar_url,
          provider: "naver",
          naver_id: naverUser.id,
        },
      });
    } else {
      // Create new user
      const { data: newUser, error: createError } =
        await adminClient.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: {
            full_name: naverUser.name || naverUser.nickname || "",
            avatar_url: naverUser.profile_image || "",
            provider: "naver",
            naver_id: naverUser.id,
          },
        });

      if (createError || !newUser.user) {
        return loginError("create_user", createError?.message);
      }

      userId = newUser.user.id;
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
    const cookieStore = await cookies();
    const response = NextResponse.redirect(`${SITE_URL}/`);

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
      email,
      token_hash: linkData.properties.hashed_token,
    });

    if (verifyError) {
      return loginError("verify_otp", verifyError.message);
    }

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return loginError("unexpected", message);
  }
}
