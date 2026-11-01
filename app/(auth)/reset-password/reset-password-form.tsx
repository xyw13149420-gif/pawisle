"use client";

import { useActionState, useState } from "react";
import { updatePasswordAction } from "@/lib/auth/actions";
import { PASSWORD_MIN } from "@/lib/auth/schema";
import { initialAuthState } from "@/lib/auth/types";

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(updatePasswordAction, initialAuthState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      {state.status !== "idle" ? (
        <div className="alert" data-tone={state.status === "notice" ? "notice" : "error"} role="status">
          <span className="alert-dot" aria-hidden="true" />
          <span>{state.message}</span>
        </div>
      ) : null}

      <form className="form" action={formAction} noValidate>
        <div className="field">
          <label className="label" htmlFor="password">
            新密码
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
              data-invalid={state.field === "password" || undefined}
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
            placeholder="确认新密码"
            data-invalid={state.field === "confirmPassword" || undefined}
          />
        </div>

        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "正在保存…" : "保存并进岛"}
        </button>
      </form>
    </>
  );
}
