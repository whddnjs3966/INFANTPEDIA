import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

const ADMIN_ID = "admin";
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "infantpedia-admin-secret-key-2026";
const COOKIE_NAME = "admin_session";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Verify token
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length !== 3) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const [id, timestamp, signature] = parts;
    const payload = `${id}:${timestamp}`;
    const hmac = crypto.createHmac("sha256", SESSION_SECRET);
    hmac.update(payload);
    const expectedSignature = hmac.digest("hex");

    if (signature !== expectedSignature || id !== ADMIN_ID) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true, user: ADMIN_ID });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
