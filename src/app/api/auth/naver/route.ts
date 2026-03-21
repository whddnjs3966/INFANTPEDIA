import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET() {
  const clientId = process.env.NAVER_CLIENT_ID!;
  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL || "https://infantpedia.vercel.app"}/api/auth/naver/callback`;
  const state = crypto.randomBytes(16).toString("hex");

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
  });

  return NextResponse.redirect(
    `https://nid.naver.com/oauth2.0/authorize?${params.toString()}`
  );
}
