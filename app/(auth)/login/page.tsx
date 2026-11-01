import type { Metadata } from "next";
import { Suspense } from "react";
import { DemoPanel } from "@/app/_components/demo-panel";
import { isDemoMode } from "@/lib/auth/viewer";
import { sanitizeNextPath } from "@/lib/auth/schema";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "登录" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

async function LoginCard({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;

  return (
    <section className="card">
      <h2 className="card-title">欢迎回来</h2>
      <p className="card-sub">登岛之后，它的每一天都留在岛上。</p>
      <LoginForm
        next={sanitizeNextPath(first(params.next))}
        initialError={first(params.error)}
      />
    </section>
  );
}

export default function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  if (isDemoMode()) {
    return (
      <DemoPanel
        title="欢迎回来"
        description="现在岛上还没有真实账号，先以演示身份进去。航线、适配测试、预算和小岛日记都是能点的。"
        action={{ href: "/", label: "以演示身份进岛" }}
      />
    );
  }

  return (
    <Suspense fallback={<div className="card skeleton-card" aria-hidden="true" />}>
      <LoginCard searchParams={searchParams} />
    </Suspense>
  );
}
