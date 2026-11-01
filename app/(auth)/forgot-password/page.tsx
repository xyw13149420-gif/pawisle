import type { Metadata } from "next";
import { DemoPanel } from "@/app/_components/demo-panel";
import { isDemoMode } from "@/lib/auth/viewer";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = { title: "找回密码" };

export default function ForgotPasswordPage() {
  if (isDemoMode()) {
    return (
      <DemoPanel
        title="找回密码"
        description="演示模式没有真实账号，用不到这个入口。"
        action={{ href: "/login", label: "回登录页" }}
      />
    );
  }

  return (
    <section className="card">
      <h2 className="card-title">找回密码</h2>
      <p className="card-sub">填注册时用的邮箱，重置邮件马上寄出。</p>
      <ForgotPasswordForm />
    </section>
  );
}
