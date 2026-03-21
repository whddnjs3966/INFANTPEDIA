import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://infantpedia.vercel.app";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(`${SITE_URL}/login?error=auth`);
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
      console.error("Naver token error:", tokenData);
      return NextResponse.redirect(`${SITE_URL}/login?error=auth`);
    }

    // 2. Fetch Naver user profile
    const profileRes = await fetch("https://openapi.naver.com/v1/nid/me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profileData = await profileRes.json();

    if (profileData.resultcode !== "00" || !profileData.response) {
      console.error("Naver profile error:", profileData);
      return NextResponse.redirect(`${SITE_URL}/login?error=auth`);
    }

    const naverUser = profileData.response;
    const email = naverUser.email;

    if (!email) {
      return NextResponse.redirect(`${SITE_URL}/login?error=auth`);
    }

    // 3. Create or find user in Supabase via admin API
    const adminClient = createAdminClient();

    const { data: existingUsers } = await adminClient.auth.admin.listUsers();
    let user = existingUsers?.users?.find((u) => u.email === email);

    if (!user) {
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
        console.error("Supabase create user error:", createError);
        return NextResponse.redirect(`${SITE_URL}/login?error=auth`);
      }

      user = newUser.user;
    } else {
      // Update metadata for existing user
      await adminClient.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...user.user_metadata,
          full_name:
            naverUser.name ||
            naverUser.nickname ||
            user.user_metadata?.full_name,
          avatar_url:
            naverUser.profile_image || user.user_metadata?.avatar_url,
          provider: "naver",
          naver_id: naverUser.id,
        },
      });
    }

    // 4. Generate a magic link to create a session
    const { data: linkData, error: linkError } =
      await adminClient.auth.admin.generateLink({
        type: "magiclink",
        email,
      });

    if (linkError || !linkData.properties?.hashed_token) {
      console.error("Supabase magic link error:", linkError);
      return NextResponse.redirect(`${SITE_URL}/login?error=auth`);
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
      token_hash: linkData.properties.hashed_token,
    });

    if (verifyError) {
      console.error("Supabase verify error:", verifyError);
      return NextResponse.redirect(`${SITE_URL}/login?error=auth`);
    }

    return response;
  } catch (err) {
    console.error("Naver auth error:", err);
    return NextResponse.redirect(`${SITE_URL}/login?error=auth`);
  }
}
