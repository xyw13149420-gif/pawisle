import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { sanitizeNextPath } from "@/lib/auth/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const ALLOWED_TYPES: EmailOtpType[] = ["signup", "invite", "magiclink", "recovery", "email_change", "email"];

function loginWithError(origin: string, message: string) {
  const target = new URL("/login", origin);
  target.searchParams.set("error", message);
  return NextResponse.redirect(target);
}

/**
 * token_hash 回跳：适用于把邮件模板改成
 * {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password
 * 的项目。走 code 的模板由上一条 /auth/callback 处理。
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const rawNext = url.searchParams.get("next");
  const next = sanitizeNextPath(rawNext, type === "recovery" ? "/reset-password" : "/");

  if (!tokenHash || !type || !ALLOWED_TYPES.includes(type)) {
    return loginWithError(url.origin, "链接少了必要参数，重新发起一次吧。");
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return loginWithError(url.origin, "还没接上 Supabase：先配好 .env.local 再来。");
  }

  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
  if (error) {
    return loginWithError(url.origin, "链接已失效或已使用过，重新发起一次吧。");
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
