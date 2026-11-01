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
    <main className="app-shell">
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
  );
}
