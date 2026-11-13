import { NextRequest, NextResponse } from "next/server";
import { authorizeLocalAdmin } from "@/lib/supabase/local-admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const auth = await authorizeLocalAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const supabase = createAdminClient();

    const { data: babies, error } = await supabase
      .from("shared_babies")
      .select("*, shared_devices(count)")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ babies: babies || [] });
  } catch (err) {
    console.error("Admin babies list error:", err);
    return NextResponse.json(
      { error: "아기 목록 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await authorizeLocalAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "아기 ID가 필요합니다." },
      { status: 400 }
    );
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("shared_babies")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin baby delete error:", err);
    return NextResponse.json(
      { error: "아기 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
