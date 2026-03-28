import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

const ADMIN_ID = "admin";
const ADMIN_PASS = "0000";
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "infantpedia-admin-secret-key-2026";
const COOKIE_NAME = "admin_session";
const MAX_AGE = 60 * 60 * 24; // 24 hours

function createToken(): string {
  const payload = `${ADMIN_ID}:${Date.now()}`;
  const hmac = crypto.createHmac("sha256", SESSION_SECRET);
  hmac.update(payload);
  const signature = hmac.digest("hex");
  return Buffer.from(`${payload}:${signature}`).toString("base64");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, password } = body;

    if (id !== ADMIN_ID || password !== ADMIN_PASS) {
      return NextResponse.json(
        { error: "아이디 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    const token = createToken();
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: MAX_AGE,
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "로그인 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
