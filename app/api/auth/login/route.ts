import { NextResponse, type NextRequest } from "next/server";
import {
  LOGIN_ERROR_STATUS,
  type LoginErrorBody,
  type LoginSuccessBody,
} from "@/lib/auth/api";
import { clientIpFromHeaders, performLogin } from "@/lib/auth/login";
import { sanitizeNextPath } from "@/lib/auth/schema";

/** session 会写 cookie，任何缓存都可能把别人的登录态发出去。 */
const NO_STORE = { "Cache-Control": "no-store" };

type Credentials = { email: string; password: string; next: string };

function pickString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/**
 * 同时收 JSON 和表单。
 * JSON 给 fetch / App / 第三方调用；表单给 <form action="/api/auth/login" method="post"> 的降级路径。
 * 两种情况都读不出来（Content-Type 不对、body 坏了）返回 null，由调用方转 400。
 */
async function readCredentials(request: NextRequest): Promise<Credentials | null> {
  const contentType = request.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("application/json")) {
      const raw: unknown = await request.json();
      if (typeof raw !== "object" || raw === null) return null;
      const body = raw as Record<string, unknown>;
      return {
        email: pickString(body.email),
        password: pickString(body.password),
        next: pickString(body.next),
      };
    }

    if (contentType.includes("form")) {
      const form = await request.formData();
      return {
        email: pickString(form.get("email")),
        password: pickString(form.get("password")),
        next: pickString(form.get("next")),
      };
    }
  } catch {
    return null;
  }

  return null;
}

function requestHost(request: NextRequest): string | null {
  return request.headers.get("x-forwarded-host") ?? request.headers.get("host");
}

/**
 * 同源校验，挡 login-CSRF（攻击者诱导受害者登录成攻击者的账号，之后受害者的记录就写进别人家）。
 * 浏览器发 POST 一定带 Origin；没有 Origin 的是非浏览器客户端，交给 SameSite=Lax 兜底，不拦。
 */
function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const host = requestHost(request);
  if (!host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** 原生表单提交（没 JS）期望的是页面跳转，不是 JSON 糊在屏幕上。 */
function prefersHtml(request: NextRequest): boolean {
  return (request.headers.get("accept") ?? "").includes("text/html");
}

function loginUrl(request: NextRequest, params: Record<string, string>): URL {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }
  return url;
}

function errorResponse(request: NextRequest, body: LoginErrorBody, next: string): NextResponse {
  if (prefersHtml(request)) {
    return NextResponse.redirect(loginUrl(request, { error: body.message, next }), 303);
  }

  const headers: Record<string, string> = { ...NO_STORE };
  if (typeof body.retryAfterSeconds === "number") {
    headers["Retry-After"] = String(body.retryAfterSeconds);
  }

  return NextResponse.json(body, { status: LOGIN_ERROR_STATUS[body.code], headers });
}

/**
 * 登录接口。
 *
 * POST /api/auth/login
 *   Content-Type: application/json
 *   { "email": "you@example.com", "password": "…", "next": "/diary" }
 *
 * 成功 200 { ok: true, user: { id, email }, redirectTo: "/diary" }（并下发 session cookie）
 * 失败 4xx/5xx { ok: false, code, field, message, retryAfterSeconds? }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!isSameOrigin(request)) {
    return errorResponse(
      request,
      { ok: false, code: "origin_mismatch", field: "form", message: "请求来源不对，刷新页面再试" },
      "/",
    );
  }

  const credentials = await readCredentials(request);
  if (!credentials) {
    return errorResponse(
      request,
      { ok: false, code: "bad_request", field: "form", message: "请求内容读不出来，刷新页面再试" },
      "/",
    );
  }

  const outcome = await performLogin({
    email: credentials.email,
    password: credentials.password,
    next: credentials.next,
    ip: clientIpFromHeaders((name) => request.headers.get(name)),
  });

  if (!outcome.ok) {
    // 失败时把用户原本要去的地址带回去，重新登录后还能接着走。
    // 必须过白名单：这是回显到 URL 里的用户输入，不能原样拼。
    return errorResponse(request, outcome, sanitizeNextPath(credentials.next));
  }

  if (prefersHtml(request)) {
    const target = new URL(outcome.redirectTo, request.url);
    return NextResponse.redirect(target, 303);
  }

  const body: LoginSuccessBody = outcome;
  return NextResponse.json(body, { status: 200, headers: NO_STORE });
}
