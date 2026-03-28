import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

const ADMIN_ID = "admin";
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "infantpedia-admin-secret-key-2026";
const COOKIE_NAME = "admin_session";

async function verifyAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return false;
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length !== 3) return false;
    const [id, timestamp, signature] = parts;
    const payload = `${id}:${timestamp}`;
    const hmac = crypto.createHmac("sha256", SESSION_SECRET);
    hmac.update(payload);
    void timestamp;
    return hmac.digest("hex") === signature && id === ADMIN_ID;
  } catch {
    return false;
  }
}

export async function GET() {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
