import Link from "next/link";
import type { ReactNode } from "react";

type AppShellProps = {
  title: string;
  subtitle?: string;
  back?: { href: string; label: string };
  children: ReactNode;
};

export function AppShell({ title, subtitle, back, children }: AppShellProps) {
  return (
    <>
      {/* 键盘用户第一个 Tab 就能跳过导航直达内容 */}
      <a className="skip-link" href="#main">
        跳到主要内容
      </a>

      <main className="app-shell" id="main">
        {back ? (
          <Link className="back-link" href={back.href}>
            <span aria-hidden="true">←</span>
            {back.label}
          </Link>
        ) : null}

        <header className="app-head">
          <h1 className="app-title">{title}</h1>
          {subtitle ? <p className="app-sub">{subtitle}</p> : null}
        </header>

        {children}
      </main>
    </>
  );
}
