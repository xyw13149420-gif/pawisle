import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { IslandMark } from "@/app/_components/island-mark";
import { getViewer } from "@/lib/auth/viewer";
import { loadRangeEntries } from "@/lib/diary/data";
import { PERIOD_NAME, isPeriod, periodRange } from "@/lib/diary/period";
import { buildReport } from "@/lib/diary/report";
import { ShareActions } from "./share-actions";

type PageProps = { params: Promise<{ period: string }> };

export const instant = false;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { period } = await params;
  return { title: isPeriod(period) ? `分享 · ${PERIOD_NAME[period]}` : "分享" };
}

export default async function SharePage({ params }: PageProps) {
  const { period: raw } = await params;
  if (!isPeriod(raw)) notFound();

  const viewer = await getViewer();
  if (!viewer) redirect("/login");

  const range = periodRange(raw);
  const rows = await loadRangeEntries(viewer, range);
  const report = buildReport(range, rows);

  const shareText = `${report.title}${report.recordedDays > 0 ? `记了 ${report.recordedDays} 天` : "还没有记录"} · ${report.summary}`;

  return (
    <main className="share-page">
      <Link className="back-link" href={`/diary/report/${raw}`}>
        <span aria-hidden="true">←</span>
        返回报告
      </Link>

      <article className="share-card" data-period={raw}>
        <div className="share-glow" aria-hidden="true" />

        <header className="share-top">
          <IslandMark className="share-mark" />
          <p className="share-kicker">{report.title}</p>
          <p className="share-day">{report.label}</p>
        </header>

        <p className="share-sentence">{report.summary}</p>

        <dl className="share-stats">
          <div className="share-stat">
            <dt>记录天数</dt>
            <dd>
              {report.recordedDays}
              <span>/{report.days}</span>
            </dd>
          </div>
          <div className="share-stat">
            <dt>便便成型</dt>
            <dd>{report.poop.normalRate === null ? "—" : `${report.poop.normalRate}%`}</dd>
          </div>
          <div className="share-stat">
            <dt>呕吐</dt>
            <dd>{report.vomit.times}</dd>
          </div>
        </dl>

        {report.weight.last ? (
          <p className="share-weight">
            {report.weight.last.value.toFixed(1)} kg
            {report.weight.delta !== null && report.weight.delta !== 0 ? (
              <span>
                {" "}
                {report.weight.delta > 0 ? "+" : ""}
                {report.weight.delta.toFixed(1)}
              </span>
            ) : null}
          </p>
        ) : null}

        {report.mood.topLabel ? <p className="share-mood">最多的心情 · {report.mood.topLabel}</p> : null}

        <footer className="share-foot">
          <span className="share-brand">茸屿 Pawisle</span>
          <span className="share-tag">和它一起，住在柔软的地方</span>
        </footer>
      </article>

      <ShareActions text={shareText} />
    </main>
  );
}
