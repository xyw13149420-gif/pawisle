import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AppShell } from "@/app/_components/app-shell";
import { getViewer } from "@/lib/auth/viewer";
import { loadJourney } from "@/lib/journey/data";
import { BudgetForm } from "./budget-form";

export const metadata: Metadata = { title: "预算清单" };

export const instant = false;

export default async function BudgetPage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");

  const data = await loadJourney(viewer);

  return (
    <AppShell
      back={{ href: "/journey", label: "航线" }}
      title="预算清单"
      subtitle="参考价取城市常见区间，换成你查到的价格会更准。"
    >
      <BudgetForm initial={data.budget} />
    </AppShell>
  );
}
