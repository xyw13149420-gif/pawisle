import { NextResponse, type NextRequest } from "next/server";
import { sanitizeNextPath } from "@/lib/auth/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function loginWithError(origin: string, message: string) {
  const target = new URL("/login", origin);
  target.searchParams.set("error", message);
  return NextResponse.redirect(target);
}

/**
 * PKCE 回跳：邮箱确认、找回密码邮件里的 code 在这里换成 session。
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = sanitizeNextPath(url.searchParams.get("next"));

  const upstreamError = url.searchParams.get("error_description") ?? url.searchParams.get("error");
  if (upstreamError) {
    return loginWithError(url.origin, "链接已失效或已使用过，重新发起一次吧。");
  }

  if (!code) {
    return loginWithError(url.origin, "链接少了必要参数，重新发起一次吧。");
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return loginWithError(url.origin, "还没接上 Supabase：先配好 .env.local 再来。");
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return loginWithError(url.origin, "链接已失效或已使用过，重新发起一次吧。");
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
