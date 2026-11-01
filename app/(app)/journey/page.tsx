import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/app/_components/app-shell";
import { ChevronRightIcon, CompassIcon, ReceiptIcon } from "@/app/_components/icons";
import { JourneyMap } from "@/app/_components/journey-map";
import { getViewer } from "@/lib/auth/viewer";
import { findDay, JOURNEY_DAYS } from "@/lib/journey/content";
import { loadJourney } from "@/lib/journey/data";
import { currentDay, dayStates, nextTask, progressStats, toKeySet } from "@/lib/journey/progress";

export const metadata: Metadata = { title: "新手航线" };

// 页面内容全部取决于登录用户，跳过静态预渲染直接按请求渲染
export const instant = false;

export default async function JourneyPage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");

  const data = await loadJourney(viewer);
  const done = toKeySet(data.completedKeys);
  const states = dayStates(done);
  const stats = progressStats(done);
  const todayNumber = currentDay(done);
  const today = findDay(todayNumber) ?? JOURNEY_DAYS[0];
  const next = nextTask(done);
  const allDone = stats.completed === stats.total;

  return (
    <AppShell
      back={{ href: "/", label: "首页" }}
      title="新手航线"
      subtitle={
        allDone
          ? "七天走完了，接下来是慢慢过日子"
          : `第 ${todayNumber} 天 · 已完成 ${stats.completed}/${stats.total}`
      }
    >
      {viewer.demo ? <p className="demo-note">演示模式：未连接数据库，改动不会保存</p> : null}

      <section className="card today-card">
        <p className="today-kicker">{allDone ? "航线完成" : `今天 · 第 ${todayNumber} 天`}</p>
        <h2 className="today-title">{allDone ? "你和它都上手了" : today.title}</h2>
        <p className="today-mood">
          {allDone ? "后面的事没有清单了，想记的时候就写两句在小岛日记里。" : today.mood}
        </p>

        {!allDone && next ? (
          <Link className="btn-primary today-cta" href={`/journey/day/${next.day.day}`}>
            继续这一天
            <span className="today-cta-task">{describeTask(next.taskKey)}</span>
          </Link>
        ) : null}
      </section>

      <section className="section">
        <h2 className="section-title">航线</h2>
        <JourneyMap states={states} done={done} />
      </section>

      <section className="section entries">
        <Link className="entry" href="/journey/quiz">
          <span className="entry-icon" data-tint="moss" aria-hidden="true">
            <CompassIcon size={19} />
          </span>
          <span className="entry-body">
            <span className="entry-title">养宠适配测试</span>
            <span className="entry-note">
              {data.quiz ? `上次 ${data.quiz.score} 分 · ${data.quiz.verdict}` : "接它回家之前，先测一测"}
            </span>
          </span>
          <span className="entry-arrow" aria-hidden="true">
            <ChevronRightIcon size={17} />
          </span>
        </Link>

        <Link className="entry" href="/journey/budget">
          <span className="entry-icon" data-tint="sand" aria-hidden="true">
            <ReceiptIcon size={19} />
          </span>
          <span className="entry-body">
            <span className="entry-title">预算清单</span>
            <span className="entry-note">首年到底要花多少，算给你看</span>
          </span>
          <span className="entry-arrow" aria-hidden="true">
            <ChevronRightIcon size={17} />
          </span>
        </Link>
      </section>

      <p className="foot-note">每天只露三件小事，做完就关掉，不催你。</p>
    </AppShell>
  );
}

function describeTask(taskKey: string): string {
  for (const day of JOURNEY_DAYS) {
    const task = day.tasks.find((item) => item.key === taskKey);
    if (task) return `下一件：${task.title}`;
  }
  return "";
}
