import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE() {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient.auth.admin.deleteUser(user.id);

    if (error) {
      console.error(`[Account] Delete failed for user ${user.id}:`, error.message);
      return NextResponse.json({ error: "계정 삭제에 실패했습니다." }, { status: 500 });
    }

    console.log(`[Account] User ${user.id} deleted successfully`);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Account] Unexpected error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
