import type { Metadata } from "next";
import { DemoPanel } from "@/app/_components/demo-panel";
import { isDemoMode } from "@/lib/auth/viewer";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "注册" };

export default function RegisterPage() {
  if (isDemoMode()) {
    return (
      <DemoPanel
        title="第一次登岛"
        description="演示模式不需要注册，直接以演示身份进去就能看到完整流程。"
        action={{ href: "/", label: "以演示身份进岛" }}
      />
    );
  }

  return (
    <section className="card">
      <h2 className="card-title">第一次登岛</h2>
      <p className="card-sub">先给自己一个账号，再慢慢认识它。</p>
      <RegisterForm />
    </section>
  );
}
