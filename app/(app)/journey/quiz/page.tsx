import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AppShell } from "@/app/_components/app-shell";
import { getViewer } from "@/lib/auth/viewer";
import { loadJourney } from "@/lib/journey/data";
import { QuizFlow } from "./quiz-flow";

export const metadata: Metadata = { title: "养宠适配测试" };

export const instant = false;

export default async function QuizPage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");

  const data = await loadJourney(viewer);

  return (
    <AppShell
      back={{ href: "/journey", label: "航线" }}
      title="养宠适配测试"
      subtitle="10 个问题。诚实地答，结果才帮得到你。"
    >
      <QuizFlow lastResult={data.quiz} />
    </AppShell>
  );
}
