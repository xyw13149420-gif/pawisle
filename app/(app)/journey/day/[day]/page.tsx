import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/app/_components/app-shell";
import { TaskRow } from "@/app/_components/task-row";
import { getViewer } from "@/lib/auth/viewer";
import { findDay, JOURNEY_DAYS } from "@/lib/journey/content";
import { loadJourney } from "@/lib/journey/data";
import { dayStates, isDayComplete, toKeySet } from "@/lib/journey/progress";

type PageProps = { params: Promise<{ day: string }> };

// 依赖登录用户与当日进度，按请求渲染
export const instant = false;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { day } = await params;
  const found = findDay(Number.parseInt(day, 10));
  return { title: found ? `第 ${found.day} 天 · ${found.title}` : "新手航线" };
}

export default async function DayPage({ params }: PageProps) {
  const { day: raw } = await params;
  const dayNumber = Number.parseInt(raw, 10);
  const day = Number.isInteger(dayNumber) ? findDay(dayNumber) : undefined;
  if (!day) notFound();

  const viewer = await getViewer();
  if (!viewer) redirect("/login");

  const data = await loadJourney(viewer);
  const done = toKeySet(data.completedKeys);
  const states = dayStates(done);

  if (states.get(day.day) === "locked") redirect("/journey");

  const complete = isDayComplete(day, done);
  const nextDay = JOURNEY_DAYS.find((item) => item.day === day.day + 1);

  return (
    <AppShell
      back={{ href: "/journey", label: "航线" }}
      title={`第 ${day.day} 天 · ${day.title}`}
      subtitle={day.mood}
    >
      <ul className="task-list">
        {day.tasks.map((task) => (
          <TaskRow key={task.key} task={task} done={done.has(task.key)} />
        ))}
      </ul>

      {complete ? (
        <div className="day-foot">
          {nextDay ? (
            <Link className="btn-primary" href={`/journey/day/${nextDay.day}`}>
              明天 · {nextDay.title}
            </Link>
          ) : (
            <Link className="btn-primary" href="/journey">
              回到航线
            </Link>
          )}
        </div>
      ) : (
        <p className="foot-note">做不完也没关系，明天再继续这一页。</p>
      )}
    </AppShell>
  );
}
