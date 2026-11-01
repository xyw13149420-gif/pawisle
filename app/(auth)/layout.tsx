import type { ReactNode } from "react";
import { IslandMark } from "@/app/_components/island-mark";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="page-shell">
      <div className="stack">
        <header className="brand">
          <IslandMark className="brand-mark" />
          <h1 className="brand-title">茸屿</h1>
          <p className="brand-latin">Pawisle</p>
          <p className="brand-sub">和它一起，住在柔软的地方</p>
        </header>
        {children}
      </div>
    </main>
  );
}
