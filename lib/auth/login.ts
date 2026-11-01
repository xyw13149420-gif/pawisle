/**
 * 登录的唯一实现。HTTP 接口（app/api/auth/login）与 Server Action 都走这里，
 * 保证「校验顺序、限流、错误码、跳转白名单」只有一份，不会两边对不上。
 */

import type { LoginErrorBody, LoginErrorCode, LoginField, LoginSuccessBody } from "@/lib/auth/api";
import { classifyLoginError } from "@/lib/auth/errors";
import { checkLoginRateLimit, resetLoginRateLimit } from "@/lib/auth/rate-limit";
import { sanitizeNextPath, validateEmail } from "@/lib/auth/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type LoginOutcome = LoginSuccessBody | LoginErrorBody;

export type LoginInput = {
  email: unknown;
  password: unknown;
  next: unknown;
  /** 客户端 IP，用于限流；调用方负责从请求头取 */
  ip: string;
};

function fail(
  code: LoginErrorCode,
  message: string,
  field: LoginField = "form",
  extra?: { retryAfterSeconds: number },
): LoginErrorBody {
  return { ok: false, code, field, message, ...extra };
}

/**
 * 执行一次登录。成功时 Supabase 的 session cookie 已经写进当前请求的 cookie store，
 * 调用方只需要决定「跳去哪」或「返回哪个响应」。
 *
 * @param input.email 用户输入，任意类型，内部统一校验
 * @param input.password 用户输入，不 trim（首尾空格属于密码）
 * @param input.next 期望的跳转目标，内部会过滤成站内相对路径
 * @param input.ip 客户端 IP
 * @returns 成功带 user + redirectTo；失败带 code / field / message / 可选 retryAfterSeconds
 */
export async function performLogin(input: LoginInput): Promise<LoginOutcome> {
  const email = validateEmail(typeof input.email === "string" ? input.email : null);
  if (!email.ok) return fail("invalid_email", email.message, "email");

  // 登录只校验「非空」：存量账号的密码规则可能比现在的注册规则宽松，
  // 在这里套用 PASSWORD_MIN 会把老用户挡在门外。
  const password = typeof input.password === "string" ? input.password : "";
  if (!password) return fail("missing_password", "请输入密码", "password");
  if (password.length > 1024) return fail("missing_password", "密码太长了", "password");

  const rate = checkLoginRateLimit({ ip: input.ip, email: email.value });
  if (!rate.allowed) {
    return fail(
      "rate_limited",
      `试得太频繁了，${rate.retryAfterSeconds} 秒后再试`,
      "form",
      { retryAfterSeconds: rate.retryAfterSeconds },
    );
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return fail("not_configured", "还没接上 Supabase：把 .env.local 里的地址和 key 填上再试。");
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email: email.value, password });

  if (error) {
    const { code, message } = classifyLoginError(error);
    // Supabase 自己也可能返回 429，此时没有剩余秒数可给，按一个窗口计
    return code === "rate_limited"
      ? fail(code, message, "form", { retryAfterSeconds: 60 })
      : fail(code, message);
  }

  if (!data.user) return fail("upstream_error", "登录没有返回用户信息，稍后再试");

  // 成功才清计数：失败次数要留着，否则爆破只要偶尔蒙对一次就重置了
  resetLoginRateLimit({ ip: input.ip, email: email.value });

  return {
    ok: true,
    user: { id: data.user.id, email: data.user.email ?? email.value },
    redirectTo: sanitizeNextPath(typeof input.next === "string" ? input.next : null),
  };
}

/** 从转发头里取客户端 IP。生产环境务必让反代覆写这些头，否则可被伪造。 */
export function clientIpFromHeaders(get: (name: string) => string | null): string {
  const forwarded = get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  if (first) return first;
  return get("x-real-ip")?.trim() || "unknown";
}
