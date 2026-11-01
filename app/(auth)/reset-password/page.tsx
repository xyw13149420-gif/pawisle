import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { DemoPanel } from "@/app/_components/demo-panel";
import { isDemoMode } from "@/lib/auth/viewer";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = { title: "重设密码" };

async function ResetCard() {
  // 重置页依赖当前会话，必须按请求渲染
  await connection();

  const supabase = await createSupabaseServerClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;

  if (!user) {
    return (
      <section className="card">
        <h2 className="card-title">链接已经失效</h2>
        <p className="card-sub">重置链接只能用一次，也可能已经过期了。</p>
        <div className="form">
          <Link className="btn-primary" href="/forgot-password">
            重新发起
          </Link>
          <p className="foot-note">
            <Link className="link" href="/login">
              回到登录
            </Link>
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="card">
      <h2 className="card-title">换一个新密码</h2>
      <p className="card-sub">{user.email} · 设好就能直接进岛</p>
      <ResetPasswordForm />
    </section>
  );
}

export default function ResetPasswordPage() {
  if (isDemoMode()) {
    return (
      <DemoPanel
        title="重设密码"
        description="演示模式没有真实账号，也就没有需要重设的密码。"
        action={{ href: "/login", label: "回登录页" }}
      />
    );
  }

  return (
    <Suspense fallback={<div className="card skeleton-card" aria-hidden="true" />}>
      <ResetCard />
    </Suspense>
  );
}
