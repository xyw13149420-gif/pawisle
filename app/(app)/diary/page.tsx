import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/app/_components/app-shell";
import { CalendarIcon, ChevronRightIcon, SproutIcon, SunCloudIcon } from "@/app/_components/icons";
import { QuickLog } from "@/app/_components/diary/quick-log";
import { TodayTimeline } from "@/app/_components/diary/today-timeline";
import { WeatherCard } from "@/app/_components/diary/weather-card";
import { getViewer } from "@/lib/auth/viewer";
import { attachPhotoUrls, loadDayEntries } from "@/lib/diary/data";
import { dayKeyOf } from "@/lib/diary/period";
import { buildDayWeather } from "@/lib/diary/weather";

export const metadata: Metadata = { title: "小岛日记" };
export const instant = false;

export default async function DiaryPage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");

  const entries = await attachPhotoUrls(viewer, await loadDayEntries(viewer));
  const weather = buildDayWeather(
    entries.map((entry) => ({
      kind: entry.kind,
      valueText: entry.valueText,
      valueNum: entry.valueNum,
      occurredAt: entry.occurredAt,
    })),
    dayKeyOf(new Date()),
  );

  return (
    <AppShell
      back={{ href: "/", label: "首页" }}
      title="小岛日记"
      subtitle="点一下就记完了，不用写长句。"
    >
      {viewer.demo ? <p className="demo-note">演示模式：记录只存在内存里，重启开发服务器会清空</p> : null}

      <WeatherCard weather={weather} />

      <QuickLog demo={viewer.demo} />

      <TodayTimeline entries={entries} />

      <section className="section">
        <h2 className="section-title">回看</h2>
        <div className="entries">
          <Link className="entry" href="/diary/report/week">
            <span className="entry-icon" data-tint="sand" aria-hidden="true">
              <SunCloudIcon size={19} />
            </span>
            <span className="entry-body">
              <span className="entry-title">这一周的岛</span>
              <span className="entry-note">周报 · 记了几天，便便怎么样</span>
            </span>
            <span className="entry-arrow" aria-hidden="true">
              <ChevronRightIcon size={17} />
            </span>
          </Link>

          <Link className="entry" href="/diary/report/month">
            <span className="entry-icon" data-tint="mist" aria-hidden="true">
              <CalendarIcon size={19} />
            </span>
            <span className="entry-body">
              <span className="entry-title">这个月</span>
              <span className="entry-note">月报 · 习惯有没有稳下来</span>
            </span>
            <span className="entry-arrow" aria-hidden="true">
              <ChevronRightIcon size={17} />
            </span>
          </Link>

          <Link className="entry" href="/diary/report/year">
            <span className="entry-icon" data-tint="moss" aria-hidden="true">
              <SproutIcon size={19} />
            </span>
            <span className="entry-body">
              <span className="entry-title">成长报告</span>
              <span className="entry-note">这一年 · 体重和日子一起长</span>
            </span>
            <span className="entry-arrow" aria-hidden="true">
              <ChevronRightIcon size={17} />
            </span>
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
