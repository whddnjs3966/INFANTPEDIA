import { NextResponse } from "next/server";
import { createClient } from "./server";

function localAdminUid() {
  const uid = process.env.INFANTPEDIA_LOCAL_ADMIN_UID?.trim();
  if (process.env.NODE_ENV !== "development" || !uid) return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uid)
    ? uid.toLowerCase()
    : null;
}

export function isLocalAdminEnabled() {
  return localAdminUid() !== null;
}

export async function getLocalAdminAccess() {
  const uid = localAdminUid();
  if (!uid) return { status: 404 } as const;

  try {
    const client = await createClient();
    const { data, error } = await client.auth.getUser();
    if (error || !data.user) return { status: 401 } as const;
    if (data.user.id !== uid) return { status: 403 } as const;
    return { status: 200, client } as const;
  } catch {
    return { status: 503 } as const;
  }
}

export async function authorizeLocalAdmin(request?: Request) {
  const access = await getLocalAdminAccess();
  if (access.status !== 200) {
    const message = access.status === 401 ? "다시 로그인해 주세요." : "관리자 접근을 확인할 수 없어요.";
    return NextResponse.json({ error: message }, { status: access.status });
  }

  if (request) {
    const url = new URL(request.url);
    const host = request.headers.get("host") ?? url.host;
    if (request.headers.get("origin") !== `${url.protocol}//${host}`) {
      return NextResponse.json({ error: "요청 출처를 확인하지 못했어요." }, { status: 403 });
    }
  }

  return access.client;
}
