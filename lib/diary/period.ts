/**
 * 报告区间计算。固定按 Asia/Shanghai（UTC+8，无夏令时），
 * 出国用会有偏差，这是已知取舍。
 */

export type Period = "week" | "month" | "year";

export type PeriodRange = {
  period: Period;
  start: Date; // 含
  end: Date; // 不含
  dayKeys: string[]; // 区间内每一天的 YYYY-MM-DD
  label: string;
  title: string;
};

const TZ_OFFSET_MS = 8 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

function localParts(date: Date) {
  const shifted = new Date(date.getTime() + TZ_OFFSET_MS);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    weekday: shifted.getUTCDay(),
  };
}

/** 由上海时区的年月日反推 UTC 时刻（当日 00:00）。越界的日月号会被 Date.UTC 自动进位。 */
function fromLocal(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day) - TZ_OFFSET_MS);
}

export function dayKeyOf(date: Date): string {
  const { year, month, day } = localParts(date);
  return `${year}-${pad(month)}-${pad(day)}`;
}

export function dayKeysBetween(start: Date, end: Date): string[] {
  const keys: string[] = [];
  for (let time = start.getTime(); time < end.getTime(); time += DAY_MS) {
    keys.push(dayKeyOf(new Date(time)));
  }
  return keys;
}

/** 由 YYYY-MM-DD（上海时区）+ 时分，得到具体时刻。 */
export function shanghaiInstant(dayKey: string, hour = 9, minute = 0): Date {
  const [year, month, day] = dayKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, hour, minute) - TZ_OFFSET_MS);
}

export const PERIOD_TITLE: Record<Period, string> = {
  week: "这一周",
  month: "这个月",
  year: "这一年",
};

export const PERIOD_NAME: Record<Period, string> = {
  week: "周报",
  month: "月报",
  year: "年度成长报告",
};

export function periodRange(period: Period, now: Date = new Date()): PeriodRange {
  const { year, month, day, weekday } = localParts(now);

  if (period === "week") {
    const back = (weekday + 6) % 7; // 周一为一周第一天
    const start = fromLocal(year, month, day - back);
    const end = new Date(start.getTime() + 7 * DAY_MS);
    const lastDay = new Date(end.getTime() - DAY_MS);
    const a = localParts(start);
    const b = localParts(lastDay);

    return {
      period,
      start,
      end,
      dayKeys: dayKeysBetween(start, end),
      label: `${a.month}.${pad(a.day)} - ${b.month}.${pad(b.day)}`,
      title: PERIOD_TITLE.week,
    };
  }

  if (period === "month") {
    const start = fromLocal(year, month, 1);
    const end = fromLocal(year, month + 1, 1);

    return {
      period,
      start,
      end,
      dayKeys: dayKeysBetween(start, end),
      label: `${year} 年 ${month} 月`,
      title: PERIOD_TITLE.month,
    };
  }

  const start = fromLocal(year, 1, 1);
  const end = fromLocal(year + 1, 1, 1);

  return {
    period,
    start,
    end,
    dayKeys: dayKeysBetween(start, end),
    label: `${year} 年`,
    title: PERIOD_TITLE.year,
  };
}

export function isPeriod(value: string | undefined): value is Period {
  return value === "week" || value === "month" || value === "year";
}
