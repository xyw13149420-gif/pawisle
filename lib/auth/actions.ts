"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { describeAuthError } from "@/lib/auth/errors";
import { clientIpFromHeaders, performLogin } from "@/lib/auth/login";
import {
  validateEmail,
  validatePassword,
  validatePasswordConfirm,
} from "@/lib/auth/schema";
import { NOT_CONFIGURED_STATE, type AuthState } from "@/lib/auth/types";
import { getViewer } from "@/lib/auth/viewer";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** 从请求头推导当前站点地址，避免把域名写死在代码里。 */
async function resolveOrigin(): Promise<string> {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost:3000";
  const proto = headerList.get("x-forwarded-proto") ?? (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}

/**
 * 登录的 Server Action 入口。核心逻辑在 lib/auth/login.ts，
 * 与 POST /api/auth/login 共用同一份校验、限流和错误码，这里只负责转成表单状态。
 */
export async function signInAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const headerList = await headers();

  const outcome = await performLogin({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next"),
    ip: clientIpFromHeaders((name) => headerList.get(name)),
  });

  if (!outcome.ok) {
    return { status: "error", field: outcome.field ?? "form", message: outcome.message };
  }

  revalidatePath("/", "layout");
  redirect(outcome.redirectTo);
}

export async function signUpAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = validateEmail(formData.get("email"));
  if (!email.ok) return { status: "error", field: "email", message: email.message };

  const password = validatePassword(formData.get("password"));
  if (!password.ok) return { status: "error", field: "password", message: password.message };

  const confirm = validatePasswordConfirm(password.value, formData.get("confirmPassword"));
  if (!confirm.ok) return { status: "error", field: "confirmPassword", message: confirm.message };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return NOT_CONFIGURED_STATE;

  const origin = await resolveOrigin();
  const { data, error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
    options: { emailRedirectTo: `${origin}/auth/callback?next=/` },
  });

  if (error) return { status: "error", field: "form", message: describeAuthError(error) };

  // 项目开启了邮箱确认时不会有 session，需要用户先去点邮件里的链接
  if (!data.session) {
    return {
      status: "notice",
      message: `确认邮件已寄到 ${email.value}，点开里面的链接就完成了。`,
    };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function requestPasswordResetAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = validateEmail(formData.get("email"));
  if (!email.ok) return { status: "error", field: "email", message: email.message };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return NOT_CONFIGURED_STATE;

  const origin = await resolveOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });

  if (error) return { status: "error", field: "form", message: describeAuthError(error) };

  // 不透露邮箱是否已注册，避免被用来试探账号
  return {
    status: "notice",
    message: "如果这个邮箱注册过，重置邮件已经在路上了。记得翻一下垃圾箱。",
  };
}

export async function updatePasswordAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const password = validatePassword(formData.get("password"));
  if (!password.ok) return { status: "error", field: "password", message: password.message };

  const confirm = validatePasswordConfirm(password.value, formData.get("confirmPassword"));
  if (!confirm.ok) return { status: "error", field: "confirmPassword", message: confirm.message };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return NOT_CONFIGURED_STATE;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", field: "form", message: "重置链接已失效，重新发起一次找回密码。" };
  }

  const { error } = await supabase.auth.updateUser({ password: password.value });
  if (error) return { status: "error", field: "form", message: describeAuthError(error) };

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signOutAction(): Promise<void> {
  const viewer = await getViewer();

  // 演示模式没有真实会话，跳过 Supabase，否则会打一次注定失败的网络请求
  if (viewer && !viewer.demo) {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
  }

  revalidatePath("/", "layout");
  redirect("/login");
}
