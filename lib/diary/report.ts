import { dayKeyOf, type Period, type PeriodRange } from "./period";
import { findOption, type EntryKind } from "./content";

export type ReportEvent = {
  kind: EntryKind;
  valueText: string | null;
  valueNum: number | null;
  occurredAt: string;
};

export type WeightPoint = { value: number; at: string };

export type Report = {
  period: Period;
  label: string;
  title: string;
  days: number;
  recordedDays: number;
  totalEntries: number;
  poop: { total: number; normal: number; soft: number; loose: number; none: number; normalRate: number | null };
  vomit: { times: number; days: number };
  meal: { full: number; half: number; none: number };
  mood: { counts: Record<string, number>; top: string | null; topLabel: string | null };
  weight: { first: WeightPoint | null; last: WeightPoint | null; delta: number | null; points: WeightPoint[] };
  photoCount: number;
  summary: string;
};

const PERIOD_PREFIX: Record<Period, string> = {
  week: "这一周",
  month: "这个月",
  year: "这一年",
};

function countBy(events: ReportEvent[], kind: EntryKind): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const event of events) {
    if (event.kind !== kind) continue;
    const key = event.valueText ?? "unknown";
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

export function buildReport(range: PeriodRange, events: ReportEvent[]): Report {
  const dayKeys = new Set<string>();
  for (const event of events) {
    dayKeys.add(dayKeyOf(new Date(event.occurredAt)));
  }

  const poopCounts = countBy(events, "poop");
  const poopTotal = Object.values(poopCounts).reduce((sum, value) => sum + value, 0);
  const poopNormal = poopCounts.normal ?? 0;

  const vomitCounts = countBy(events, "vomit");
  const vomitTimes = (vomitCounts.once ?? 0) * 1 + (vomitCounts.more ?? 0) * 2;
  const vomitDays = new Set(
    events
      .filter((event) => event.kind === "vomit" && (event.valueText === "once" || event.valueText === "more"))
      .map((event) => dayKeyOf(new Date(event.occurredAt))),
  ).size;

  const mealCounts = countBy(events, "meal");
  const moodCounts = countBy(events, "mood");

  const moodTop =
    Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const moodTopOption = moodTop ? findOption("mood", moodTop) : undefined;

  const weightPoints: WeightPoint[] = events
    .filter((event) => event.kind === "weight" && typeof event.valueNum === "number")
    .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt))
    .map((event) => ({ value: Number(event.valueNum), at: event.occurredAt }));

  const first = weightPoints[0] ?? null;
  const last = weightPoints[weightPoints.length - 1] ?? null;
  const delta = first && last ? Math.round((last.value - first.value) * 100) / 100 : null;

  const photoCount = events.filter((event) => event.kind === "photo").length;
  const recordedDays = dayKeys.size;
  const prefix = PERIOD_PREFIX[range.period];

  const bits: string[] = [];
  if (recordedDays === 0) {
    bits.push(`${prefix}还没有记录。`);
  } else {
    bits.push(`${prefix}记了 ${recordedDays} 天`);
    if (poopTotal > 0) {
      bits.push(
        poopCounts.loose || poopCounts.soft
          ? `便便 ${poopTotal} 次，${(poopCounts.loose ?? 0) + (poopCounts.soft ?? 0)} 次不太成型`
          : `便便 ${poopTotal} 次都还成型`,
      );
    }
    if (vomitTimes > 0) {
      bits.push(`吐了 ${vomitTimes} 次`);
    }
    if (delta !== null && Math.abs(delta) >= 0.1) {
      bits.push(`体重${delta > 0 ? "涨到" : "降到"} ${last?.value.toFixed(1)} kg`);
    } else if (last) {
      bits.push(`体重稳在 ${last.value.toFixed(1)} kg`);
    }
  }

  return {
    period: range.period,
    label: range.label,
    title: range.title,
    days: range.dayKeys.length,
    recordedDays,
    totalEntries: events.length,
    poop: {
      total: poopTotal,
      normal: poopNormal,
      soft: poopCounts.soft ?? 0,
      loose: poopCounts.loose ?? 0,
      none: poopCounts.none ?? 0,
      normalRate: poopTotal === 0 ? null : Math.round((poopNormal / poopTotal) * 100),
    },
    vomit: { times: vomitTimes, days: vomitDays },
    meal: {
      full: mealCounts.full ?? 0,
      half: mealCounts.half ?? 0,
      none: mealCounts.none ?? 0,
    },
    mood: {
      counts: moodCounts,
      top: moodTop,
      topLabel: moodTopOption?.label ?? null,
    },
    weight: { first, last, delta, points: weightPoints },
    photoCount,
    summary: bits.join("，") + (bits.length > 1 ? "。" : ""),
  };
}
