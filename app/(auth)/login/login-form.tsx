"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { LOGIN_ENDPOINT, type LoginField, type LoginResponse } from "@/lib/auth/api";

type LoginFormProps = {
  next: string;
  initialError?: string;
};

export function LoginForm({ next, initialError }: LoginFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<{ message: string; field?: LoginField } | null>(
    initialError ? { message: initialError, field: "form" } : null,
  );

  const field = error?.field;

  /**
   * 拦截原生提交，改走接口。
   * 不用纯 <form action>：那样整页刷新，错误只能塞进 URL，中文提示又难读又容易超长。
   * 但 action / method 保留——JS 没加载时接口会自己 303 回登录页并带上错误。
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const formData = new FormData(event.currentTarget);
    setPending(true);
    setError(null);

    try {
      const response = await fetch(LOGIN_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email: String(formData.get("email") ?? ""),
          password: String(formData.get("password") ?? ""),
          next: String(formData.get("next") ?? ""),
        }),
      });

      const payload = (await response.json()) as LoginResponse;

      if (!payload.ok) {
        setError({ message: payload.message, field: payload.field });
        setPending(false);
        return;
      }

      // session cookie 已随响应下发，这里只要让服务端组件重新取一次登录态
      router.replace(payload.redirectTo);
      router.refresh();
    } catch {
      setError({ message: "网络不太稳，再试一次", field: "form" });
      setPending(false);
    }
  }

  return (
    <>
      {error ? (
        <div className="alert" data-tone="error" role="status">
          <span className="alert-dot" aria-hidden="true" />
          <span>{error.message}</span>
        </div>
      ) : null}

      <form className="form" action={LOGIN_ENDPOINT} method="post" onSubmit={handleSubmit} noValidate>
        <input type="hidden" name="next" value={next} />

        <div className="field">
          <label className="label" htmlFor="email">
            邮箱
          </label>
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            className="input"
            placeholder="you@example.com"
            data-invalid={field === "email" || undefined}
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="password">
            密码
          </label>
          <div className="input-wrap">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              className="input input-with-action"
              placeholder="输入密码"
              data-invalid={field === "password" || undefined}
            />
            <button
              type="button"
              className="ghost-action"
              onClick={() => setShowPassword((value) => !value)}
              aria-pressed={showPassword}
            >
              {showPassword ? "隐藏" : "显示"}
            </button>
          </div>
        </div>

        <div className="meta-row">
          <Link className="link" href="/forgot-password">
            忘记密码？
          </Link>
          <Link className="link" href="/register">
            还没有账号
          </Link>
        </div>

        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "正在登岛…" : "登录"}
        </button>
      </form>
    </>
  );
}
