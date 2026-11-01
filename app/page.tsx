import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { IslandMark } from "@/app/_components/island-mark";
import { CompassIcon, WavesIcon } from "@/app/_components/icons";
import { signOutAction } from "@/lib/auth/actions";
import { getViewer } from "@/lib/auth/viewer";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "登岛" };

function NotConfiguredCard() {
  return (
    <section className="card">
      <h2 className="card-title">还没接上 Supabase</h2>
      <p className="card-sub">在项目根目录建一个 .env.local，填上这两项就能登岛。</p>
      <div className="form">
        <div className="alert" data-tone="notice">
          <span className="alert-dot" aria-hidden="true" />
          <span>
            NEXT_PUBLIC_SUPABASE_URL
            <br />
            NEXT_PUBLIC_SUPABASE_ANON_KEY
          </span>
        </div>
        <p className="hint">
          值从本地 Supabase（supabase status）或自己项目的 API 设置里取。前端只用 anon key，
          service_role key 永远不要放进这个项目。
        </p>
      </div>
    </section>
  );
}

function GuestCard() {
  return (
    <section className="card">
      <h2 className="card-title">先有一间屋，再有一只猫</h2>
      <p className="card-sub">登录之后，新手航线和岛上的日记都会留在这里。</p>
      <div className="actions">
        <Link className="btn-primary" href="/login">
          登录
        </Link>
        <Link className="btn-quiet btn-center" href="/register">
          注册
        </Link>
      </div>
    </section>
  );
}

async function HomeCard() {
  // 必须按请求渲染：登录态会随 cookie 变化，不能被构建期静态化
  const viewer = await getViewer();

  if (!viewer) {
    // 没配 Supabase → 提示怎么配；配了但没登录 → 引导登录
    return isSupabaseConfigured() ? <GuestCard /> : <NotConfiguredCard />;
  }

  const initial = (viewer.email || "茸").slice(0, 1).toUpperCase();

  return (
    <section className="card">
      {viewer.demo ? (
        <p className="demo-note" style={{ marginBottom: 14 }}>
          演示模式：固定身份 + 内存数据，刷新不丢，重启开发服务器会重置
        </p>
      ) : null}

      <div className="status-head">
        <div className="avatar" aria-hidden="true">
          {initial}
        </div>
        <div>
          <h2 className="status-name">{viewer.email}</h2>
          <p className="status-note">{viewer.demo ? "演示身份 · 不需要真实账号" : "已在岛上"}</p>
        </div>
      </div>

      <div className="divider" style={{ margin: "18px 0" }} />

      <div className="roadmap">
        <Link className="roadmap-item" href="/journey">
          <span className="roadmap-icon" data-tint="moss" aria-hidden="true">
            <CompassIcon size={18} />
          </span>
          <span className="roadmap-text">新手航线 · 7 日任务</span>
          <span className="roadmap-tag" data-tone="go">
            去走航线
          </span>
        </Link>
        <Link className="roadmap-item" href="/diary">
          <span className="roadmap-icon" data-tint="sand" aria-hidden="true">
            <WavesIcon size={18} />
          </span>
          <span className="roadmap-text">小岛日记 · 轻记录</span>
          <span className="roadmap-tag" data-tone="go">
            去记一笔
          </span>
        </Link>
      </div>

      <form className="actions" action={signOutAction}>
        <button type="submit" className="btn-quiet">
          退出登录
        </button>
      </form>
    </section>
  );
}

export default function HomePage() {
  return (
    <main className="page-shell">
      <div className="stack">
        <header className="brand">
          <IslandMark className="brand-mark" />
          <h1 className="brand-title">茸屿</h1>
          <p className="brand-latin">Pawisle</p>
        </header>

        <Suspense fallback={<div className="card skeleton-card" aria-hidden="true" />}>
          <HomeCard />
        </Suspense>
      </div>
    </main>
  );
}
