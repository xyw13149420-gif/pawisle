"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { signUpAction } from "@/lib/auth/actions";
import { PASSWORD_MIN } from "@/lib/auth/schema";
import { initialAuthState } from "@/lib/auth/types";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(signUpAction, initialAuthState);
  const [showPassword, setShowPassword] = useState(false);

  const field = state.field;

  return (
    <>
      {state.status !== "idle" ? (
        <div
          className="alert"
          data-tone={state.status === "notice" ? "notice" : "error"}
          id="register-message"
          role={state.status === "notice" ? "status" : "alert"}
          aria-live={state.status === "notice" ? "polite" : "assertive"}
        >
          <span className="alert-dot" aria-hidden="true" />
          <span>{state.message}</span>
        </div>
      ) : null}

      <form className="form" action={formAction} noValidate>
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
            aria-invalid={field === "email" || undefined}
            aria-describedby={field === "email" ? "register-message" : undefined}
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
              autoComplete="new-password"
              required
              className="input input-with-action"
              placeholder={`至少 ${PASSWORD_MIN} 位，字母 + 数字`}
              data-invalid={field === "password" || undefined}
              aria-invalid={field === "password" || undefined}
              aria-describedby={field === "password" ? "register-message" : undefined}
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

        <div className="field">
          <label className="label" htmlFor="confirmPassword">
            再输一次
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            className="input"
            placeholder="确认密码"
            data-invalid={field === "confirmPassword" || undefined}
            aria-invalid={field === "confirmPassword" || undefined}
            aria-describedby={field === "confirmPassword" ? "register-message" : undefined}
          />
        </div>

        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "正在搭岛…" : "创建账号"}
        </button>

        <div className="divider" />

        <p className="foot-note">
          已经有账号了？{" "}
          <Link className="link" href="/login">
            直接登录
          </Link>
        </p>
      </form>
    </>
  );
}
