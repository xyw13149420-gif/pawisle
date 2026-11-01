import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/app/_components/app-shell";
import { EmptyReportArt } from "@/app/_components/illustrations";
import { getViewer } from "@/lib/auth/viewer";
import { attachPhotoUrls, loadRangeEntries } from "@/lib/diary/data";
import { findOption } from "@/lib/diary/content";
import { PERIOD_NAME, isPeriod, periodRange, type Period } from "@/lib/diary/period";
import { buildReport } from "@/lib/diary/report";

type PageProps = { params: Promise<{ period: string }> };

export const instant = false;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { period } = await params;
  return { title: isPeriod(period) ? PERIOD_NAME[period] : "回看" };
}

const MOOD_ORDER = ["calm", "clingy", "grumpy", "hiding"];

const PERIOD_LINKS: Array<{ period: Period; label: string }> = [
  { period: "week", label: "周报" },
  { period: "month", label: "月报" },
  { period: "year", label: "年度" },
];

export default async function ReportPage({ params }: PageProps) {
  const { period: raw } = await params;
  if (!isPeriod(raw)) notFound();

  const viewer = await getViewer();
  if (!viewer) redirect("/login");

  const range = periodRange(raw);
  const rows = await loadRangeEntries(viewer, range);
  const withPhotos = await attachPhotoUrls(viewer, rows);
  const report = buildReport(range, rows);
  const photos = withPhotos.filter((entry) => entry.photoUrl).slice(0, 3);

  const moodMax = Math.max(1, ...MOOD_ORDER.map((key) => report.mood.counts[key] ?? 0));

  return (
    <AppShell
      back={{ href: "/diary", label: "日记" }}
      title={PERIOD_NAME[raw]}
      subtitle={report.label}
    >
      <section className="card report-hero">
        <p className="report-kicker">{report.title}</p>
        <p className="report-summary">{report.summary}</p>

        {report.recordedDays === 0 ? (
          <div className="empty-state" style={{ marginTop: 14 }}>
            <EmptyReportArt className="empty-art" />
            <p className="empty-title">这一段还没有记录</p>
            <p className="empty-hint">去「小岛日记」随手记一笔，这里就会自己长出内容。</p>
            <Link className="btn-quiet" href="/diary" style={{ width: "auto", padding: "0 20px" }}>
              去记一笔
            </Link>
          </div>
        ) : null}
      </section>

      <section className="stat-grid">
        <div className="stat">
          <p className="stat-num">
            {report.recordedDays}
            <span className="stat-unit">/{report.days}</span>
          </p>
          <p className="stat-label">记录天数</p>
        </div>
        <div className="stat">
          <p className="stat-num">{report.totalEntries}</p>
          <p className="stat-label">记录条数</p>
        </div>
        <div className="stat">
          <p className="stat-num">
            {report.poop.normalRate === null ? "—" : report.poop.normalRate}
            {report.poop.normalRate === null ? null : <span className="stat-unit">%</span>}
          </p>
          <p className="stat-label">便便成型率</p>
        </div>
        <div className="stat">
          <p className="stat-num">{report.vomit.times}</p>
          <p className="stat-label">呕吐次数</p>
        </div>
      </section>

      {report.weight.last ? (
        <section className="section">
          <h2 className="section-title">体重</h2>
          <div className="card weight-card">
            <div className="weight-line">
              <span className="weight-now">{report.weight.last.value.toFixed(1)}</span>
              <span className="weight-unit-text">kg</span>
            </div>
            <p className="weight-delta">
              {report.weight.delta === null
                ? "第一次称重"
                : report.weight.delta === 0
                  ? "和上次一样"
                  : `${report.weight.delta > 0 ? "涨" : "掉"}了 ${Math.abs(report.weight.delta).toFixed(1)} kg`}
            </p>
          </div>
        </section>
      ) : null}

      <section className="section">
        <h2 className="section-title">心情</h2>
        <div className="mood-list">
          {MOOD_ORDER.map((value) => {
            const count = report.mood.counts[value] ?? 0;
            const option = findOption("mood", value);
            return (
              <div className="mood-row" key={value}>
                <span className="mood-label">
                  <span className="mood-dot" data-tone={option?.tone ?? "cloud"} aria-hidden="true" />
                  {option?.label ?? value}
                </span>
                <span className="mood-bar">
                  <span className="mood-fill" style={{ width: `${(count / moodMax) * 100}%` }} />
                </span>
                <span className="mood-count">{count}</span>
              </div>
            );
          })}
        </div>
      </section>

      {photos.length > 0 ? (
        <section className="section">
          <h2 className="section-title">留住的几张</h2>
          <div className="photo-strip">
            {photos.map((entry) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="strip-photo" key={entry.id} src={entry.photoUrl as string} alt="日记照片" />
            ))}
          </div>
        </section>
      ) : null}

      <nav className="period-tabs" aria-label="报告周期">
        {PERIOD_LINKS.map((item) => (
          <Link
            className="period-tab"
            data-on={item.period === raw}
            key={item.period}
            href={`/diary/report/${item.period}`}
            aria-current={item.period === raw ? "page" : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <Link className="btn-primary" href={`/diary/share/${raw}`}>
        做成分享卡
      </Link>
    </AppShell>
  );
}
