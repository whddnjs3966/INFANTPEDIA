import { NextResponse } from "next/server";
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
    const expectedSignature = hmac.digest("hex");

    void timestamp;
    return signature === expectedSignature && id === ADMIN_ID;
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

    const [babiesRes, devicesRes, measurementsRes, vaccinationsRes, logsRes] =
      await Promise.all([
        supabase.from("shared_babies").select("id, gender, created_at"),
        supabase.from("shared_devices").select("id"),
        supabase.from("shared_measurements").select("id"),
        supabase.from("shared_vaccinations").select("id"),
        supabase.from("shared_daily_logs").select("id, category, date"),
      ]);

    const babies = babiesRes.data || [];
    const totalBabies = babies.length;
    const totalDevices = (devicesRes.data || []).length;
    const totalMeasurements = (measurementsRes.data || []).length;
    const totalVaccinations = (vaccinationsRes.data || []).length;
    const dailyLogs = logsRes.data || [];
    const totalLogs = dailyLogs.length;

    // Gender distribution
    const genderDistribution = babies.reduce(
      (acc: Record<string, number>, b: { gender: string }) => {
        acc[b.gender] = (acc[b.gender] || 0) + 1;
        return acc;
      },
      {}
    );

    // Monthly registrations (last 6 months)
    const now = new Date();
    const monthlyRegistrations: { month: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = `${d.getMonth() + 1}월`;
      const count = babies.filter((b: { created_at: string }) => {
        const created = new Date(b.created_at);
        return (
          created.getFullYear() === d.getFullYear() &&
          created.getMonth() === d.getMonth()
        );
      }).length;
      monthlyRegistrations.push({ month: label, count });
      void monthKey;
    }

    // Age distribution (by current month age)
    const ageDistribution: { age: string; count: number }[] = [];
    const ageMap: Record<string, number> = {};
    babies.forEach((b: { created_at: string }) => {
      // We don't have birthdate in this query but shared_babies has it
      void b;
    });

    // Re-fetch with birthdate for age calculation
    const babiesWithBirth = await supabase
      .from("shared_babies")
      .select("birthdate");
    (babiesWithBirth.data || []).forEach((b: { birthdate: string }) => {
      const birth = new Date(b.birthdate);
      const monthsOld = Math.min(
        Math.floor(
          (now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30)
        ),
        12
      );
      const key = `${monthsOld}개월`;
      ageMap[key] = (ageMap[key] || 0) + 1;
    });
    for (let i = 0; i <= 12; i++) {
      const key = `${i}개월`;
      if (ageMap[key]) {
        ageDistribution.push({ age: key, count: ageMap[key] });
      }
    }

    // Daily log category distribution
    const logCategories: Record<string, number> = {};
    dailyLogs.forEach((log: { category: string }) => {
      logCategories[log.category] = (logCategories[log.category] || 0) + 1;
    });

    // Daily logs over time (last 7 days)
    const dailyLogTrend: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getMonth() + 1}/${d.getDate()}`;
      const isoDate = d.toISOString().split("T")[0];
      const count = dailyLogs.filter(
        (log: { date: string }) => log.date === isoDate
      ).length;
      dailyLogTrend.push({ date: dateStr, count });
    }

    return NextResponse.json({
      totals: {
        babies: totalBabies,
        devices: totalDevices,
        measurements: totalMeasurements,
        vaccinations: totalVaccinations,
        logs: totalLogs,
      },
      charts: {
        genderDistribution: Object.entries(genderDistribution).map(
          ([name, value]) => ({
            name: name === "male" ? "남아" : "여아",
            value,
          })
        ),
        monthlyRegistrations,
        ageDistribution,
        logCategories: Object.entries(logCategories).map(([name, value]) => ({
          name: getCategoryLabel(name),
          value,
        })),
        dailyLogTrend,
      },
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    return NextResponse.json(
      { error: "통계 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

function getCategoryLabel(category: string): string {
  const map: Record<string, string> = {
    breastfeed: "모유수유",
    formula: "분유",
    babyfood: "이유식",
    diaper: "기저귀",
    sleep: "수면",
    bath: "목욕",
    medicine: "약",
    temperature: "체온",
    pump: "유축",
    snack: "간식",
  };
  return map[category] || category;
}
