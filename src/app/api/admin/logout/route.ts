import { NextResponse } from "next/server";
import { authorizeLocalAdmin } from "@/lib/supabase/local-admin";

export async function POST(request: Request) {
  const auth = await authorizeLocalAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const { error } = await auth.auth.signOut({ scope: "local" });
  if (error) {
    return NextResponse.json({ error: "로그아웃하지 못했어요." }, { status: 503 });
  }
  return NextResponse.json({ success: true });
}
