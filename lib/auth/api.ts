/**
 * 登录接口的 HTTP 契约。
 *
 * 这里只放类型与常量，不 import 任何服务端模块（supabase / next/headers）——
 * 浏览器端的登录表单也要引用它，混进服务端依赖会把整包代码拖进 client bundle。
 */

export type LoginField = "email" | "password" | "form";

export type LoginErrorCode =
  | "bad_request" // 请求体读不出来 / 不是 JSON 也不是表单
  | "invalid_email" // 邮箱格式不对
  | "missing_password" // 没填密码
  | "origin_mismatch" // 跨站提交，挡掉
  | "invalid_credentials" // 邮箱或密码错
  | "email_not_confirmed" // 注册了但没点确认邮件
  | "rate_limited" // 试太多次
  | "not_configured" // 环境变量没配
  | "upstream_unreachable" // 连不上 Supabase
  | "upstream_error"; // Supabase 返回了别的错

export type LoginSuccessBody = {
  ok: true;
  user: { id: string; email: string };
  /** 已做过站内白名单校验的安全跳转目标，前端直接用 */
  redirectTo: string;
};

export type LoginErrorBody = {
  ok: false;
  code: LoginErrorCode;
  /** 前端据此把哪个输入框标红；form 表示整体错误 */
  field?: LoginField;
  /** 已经翻成人话，可直接展示 */
  message: string;
  /** 仅 rate_limited 时有值，同时作为 Retry-After 响应头 */
  retryAfterSeconds?: number;
};

export type LoginResponse = LoginSuccessBody | LoginErrorBody;

/**
 * 错误码 → HTTP 状态码。
 * 用集中映射而不是在路由里散写 if，避免同一个错误在不同分支返回不同状态。
 */
export const LOGIN_ERROR_STATUS: Record<LoginErrorCode, number> = {
  bad_request: 400,
  invalid_email: 400,
  missing_password: 400,
  origin_mismatch: 403,
  invalid_credentials: 401,
  email_not_confirmed: 403,
  rate_limited: 429,
  not_configured: 503,
  upstream_unreachable: 502,
  upstream_error: 502,
};

export const LOGIN_ENDPOINT = "/api/auth/login";
