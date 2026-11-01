"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordResetAction } from "@/lib/auth/actions";
import { initialAuthState } from "@/lib/auth/types";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordResetAction, initialAuthState);

  return (
    <>
      {state.status !== "idle" ? (
        <div
          className="alert"
          data-tone={state.status === "notice" ? "notice" : "error"}
          id="forgot-message"
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
            data-invalid={state.field === "email" || undefined}
aria-invalid={state.field === "email" || undefined}
aria-describedby={state.field === "email" ? "forgot-message" : undefined}
          />
        </div>

        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "正在寄出…" : "寄出重置邮件"}
        </button>

        <div className="divider" />

        <p className="foot-note">
          想起来了？{" "}
          <Link className="link" href="/login">
            回到登录
          </Link>
        </p>
      </form>
    </>
  );
}
