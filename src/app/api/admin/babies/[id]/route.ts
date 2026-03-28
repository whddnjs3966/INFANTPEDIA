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

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const supabase = createAdminClient();

    const [babyRes, devicesRes, measurementsRes, vaccinationsRes, logsRes] =
      await Promise.all([
        supabase.from("shared_babies").select("*").eq("id", id).single(),
        supabase
          .from("shared_devices")
          .select("*")
          .eq("baby_id", id)
          .order("joined_at", { ascending: false }),
        supabase
          .from("shared_measurements")
          .select("*")
          .eq("baby_id", id)
          .order("month", { ascending: true }),
        supabase
          .from("shared_vaccinations")
          .select("*")
          .eq("baby_id", id)
          .order("vaccine_id"),
        supabase
          .from("shared_daily_logs")
          .select("*")
          .eq("baby_id", id)
          .order("date", { ascending: false })
          .limit(50),
      ]);

    if (babyRes.error) throw babyRes.error;

    return NextResponse.json({
      baby: babyRes.data,
      devices: devicesRes.data || [],
      measurements: measurementsRes.data || [],
      vaccinations: vaccinationsRes.data || [],
      dailyLogs: logsRes.data || [],
    });
  } catch (err) {
    console.error("Admin baby detail error:", err);
    return NextResponse.json(
      { error: "아기 상세 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { name, birthdate, gender } = body;

    const updates: Record<string, string> = {};
    if (name !== undefined) updates.name = name;
    if (birthdate !== undefined) updates.birthdate = birthdate;
    if (gender !== undefined) updates.gender = gender;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "수정할 항목이 없습니다." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("shared_babies")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ baby: data });
  } catch (err) {
    console.error("Admin baby update error:", err);
    return NextResponse.json(
      { error: "아기 정보 수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
