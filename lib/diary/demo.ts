import { dayKeyOf, shanghaiInstant } from "./period";
import type { ReportEvent } from "./report";

/**
 * 仅开发环境用的演示数据。同一时间点永远生成同一份，截图和断言才稳定。
 * 生产构建不会调用（isDemoMode() 恒为 false）。
 */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashKey(key: string): number {
  let hash = 2166136261;
  for (let index = 0; index < key.length; index += 1) {
    hash ^= key.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pick(rand: () => number, weights: Array<[string, number]>): string {
  const total = weights.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = rand() * total;
  for (const [value, weight] of weights) {
    roll -= weight;
    if (roll <= 0) return value;
  }
  return weights[weights.length - 1][0];
}

export function demoEvents(now: Date = new Date(), backDays = 60): ReportEvent[] {
  const events: ReportEvent[] = [];
  const todayKey = dayKeyOf(now);

  for (let back = backDays; back >= 0; back -= 1) {
    const day = new Date(now.getTime() - back * 86_400_000);
    const key = dayKeyOf(day);
    const rand = mulberry32(hashKey(key));

    // 有几天就是没记，报告里才显得真
    if (back !== 0 && rand() < 0.16) continue;

    const isToday = key === todayKey;
    const meal = pick(rand, [
      ["full", 7],
      ["half", 2],
      ["none", 1],
    ]);
    const poop = pick(rand, [
      ["normal", 7],
      ["soft", 2],
      ["loose", back % 17 === 0 ? 3 : 0],
      ["none", 1],
    ]);
    const mood = pick(rand, [
      ["calm", 5],
      ["clingy", 4],
      ["grumpy", 2],
      ["hiding", 1],
    ]);

    const push = (kind: ReportEvent["kind"], valueText: string | null, hour: number, minute: number, valueNum: number | null = null) => {
      events.push({
        kind,
        valueText,
        valueNum,
        occurredAt: shanghaiInstant(key, hour, minute).toISOString(),
      });
    };

    if (isToday) {
      // 今天只记一部分，留出「再记一笔」的演示空间
      push("meal", "full", 8, 20);
      push("poop", "soft", 9, 40);
      push("mood", "clingy", 11, 15);
      continue;
    }

    push("meal", meal, 8, 10 + (rand() > 0.5 ? 12 : 0));
    push("poop", poop, 9, 30 + Math.floor(rand() * 20));
    if (rand() > 0.35) push("water", rand() > 0.75 ? "low" : "normal", 13, 5);
    push("mood", mood, 19, 20);
    if (back % 19 === 0) push("vomit", "once", 15, 40);
    if (back % 7 === 0) push("weight", null, 8, 50, Math.round((3.1 + rand() * 0.4) * 100) / 100);
    if (back % 10 === 0) push("photo", null, 18, 10);
  }

  return events;
}
