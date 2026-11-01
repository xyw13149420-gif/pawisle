/** 把 Supabase 的英文错误翻成人话，不把原始报错直接甩给用户。 */

import type { LoginErrorCode } from "@/lib/auth/api";

type AuthErrorLike = {
  code?: string | null;
  message?: string | null;
  status?: number | null;
};

const BY_CODE: Record<string, string> = {
  invalid_credentials: "邮箱或密码不对，再试一次",
  email_not_confirmed: "邮箱还没确认，先去收确认邮件",
  user_already_exists: "这个邮箱已经注册过了，直接登录吧",
  email_exists: "这个邮箱已经注册过了，直接登录吧",
  weak_password: "密码太简单了，换一个更稳的",
  same_password: "新密码不能和原来的密码一样",
  over_request_rate_limit: "试得太频繁了，歇一分钟再来",
  over_email_send_rate_limit: "邮件发得太勤了，等一会儿再发",
  otp_expired: "链接已经过期了，重新发起一次",
  session_not_found: "登录状态已失效，请重新登录",
  session_expired: "登录状态已失效，请重新登录",
  flow_state_not_found: "链接已经用过或已失效，重新发起一次",
  flow_state_expired: "链接已经过期了，重新发起一次",
  validation_failed: "填写的信息有点问题，检查一下",
};

const BY_MESSAGE: Array<[RegExp, string]> = [
  [/invalid login credentials/i, "邮箱或密码不对，再试一次"],
  [/email not confirmed/i, "邮箱还没确认，先去收确认邮件"],
  [/user already registered/i, "这个邮箱已经注册过了，直接登录吧"],
  [/password should be at least/i, "密码太短了，加长一点"],
  [/only request this after/i, "试得太频繁了，歇一分钟再来"],
  [/email rate limit exceeded/i, "邮件发得太勤了，等一会儿再发"],
  [/token has expired|invalid or has expired/i, "链接已经过期了，重新发起一次"],
  [/new password should be different/i, "新密码不能和原来的密码一样"],
  [/fetch failed|network|failed to fetch/i, "连不上 Supabase，确认本地服务已启动、地址填对了"],
];

export function describeAuthError(error: AuthErrorLike | null | undefined): string {
  if (!error) return "出了点小状况，稍后再试";

  if (error.code && BY_CODE[error.code]) return BY_CODE[error.code];

  const message = error.message ?? "";
  for (const [pattern, friendly] of BY_MESSAGE) {
    if (pattern.test(message)) return friendly;
  }

  if (error.status && error.status >= 500) return "服务端有点忙，稍后再试";
  if (error.status === 0) return "连不上 Supabase，确认本地服务已启动、地址填对了";

  return "出了点小状况，稍后再试";
}

/**
 * 登录场景的错误分类：既给 HTTP 状态码用的机器可读 code，也给用户看的人话。
 *
 * 单独拆出来是因为「登录失败」和「注册失败」需要区分的分支不同：
 * 登录要能识别撞库被限流、连不上 Supabase，这些要映射成 429 / 502。
 */
export function classifyLoginError(error: AuthErrorLike | null | undefined): {
  code: LoginErrorCode;
  message: string;
} {
  const code = error?.code ?? "";
  const message = error?.message ?? "";

  if (code === "invalid_credentials" || /invalid login credentials/i.test(message)) {
    return { code: "invalid_credentials", message: "邮箱或密码不对，再试一次" };
  }

  if (code === "email_not_confirmed" || /email not confirmed/i.test(message)) {
    return { code: "email_not_confirmed", message: "邮箱还没确认，先去收确认邮件" };
  }

  if (code === "over_request_rate_limit" || /rate limit/i.test(message)) {
    return { code: "rate_limited", message: "试得太频繁了，歇一分钟再来" };
  }

  if (code === "user_banned") {
    return { code: "upstream_error", message: "这个账号已被停用，联系一下岛主" };
  }

  // status === 0 是 supabase-js 的网络层失败，不代表业务错误
  if (error?.status === 0 || /fetch failed|network|failed to fetch/i.test(message)) {
    return { code: "upstream_unreachable", message: "连不上 Supabase，确认本地服务已启动、地址填对了" };
  }

  return { code: "upstream_error", message: describeAuthError(error) };
}

