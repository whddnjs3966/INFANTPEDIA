import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (/^\/(?:api\/)?admin(?:\/|$)/.test(path)) {
    if (process.env.NODE_ENV !== "development" || !process.env.INFANTPEDIA_LOCAL_ADMIN_UID?.trim()) {
      return new NextResponse(null, { status: 404, headers: { "Cache-Control": "private, no-store" } });
    }
    if (path.startsWith("/api/")) return;
  }
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Match all paths except static files and images
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

