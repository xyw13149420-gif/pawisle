import { JOURNEY_DAYS, type JourneyDay } from "./content";

export type DayState = "done" | "current" | "locked";

export function toKeySet(keys: Iterable<string>): Set<string> {
  return new Set(keys);
}

export function isDayComplete(day: JourneyDay, done: Set<string>): boolean {
  return day.tasks.every((task) => done.has(task.key));
}

/**
 * 逐日解锁：第 N 天在第 N-1 天全部完成后才成为「今天」。
 * 完成过的天永远保持 done，即使前面的天被取消勾选，也不会把已完成的天锁回去。
 */
export function dayStates(done: Set<string>): Map<number, DayState> {
  const states = new Map<number, DayState>();
  let previousComplete = true;

  for (const day of JOURNEY_DAYS) {
    const complete = isDayComplete(day, done);

    if (complete) {
      states.set(day.day, "done");
    } else {
      states.set(day.day, previousComplete ? "current" : "locked");
    }

    previousComplete = previousComplete && complete;
  }

  return states;
}

/** 当前应该做哪一天；全部完成时停在最后一天。 */
export function currentDay(done: Set<string>): number {
  const states = dayStates(done);

  for (const day of JOURNEY_DAYS) {
    if (states.get(day.day) !== "done") return day.day;
  }

  return JOURNEY_DAYS[JOURNEY_DAYS.length - 1].day;
}

export function nextTask(done: Set<string>): { day: JourneyDay; taskKey: string } | null {
  const dayNumber = currentDay(done);
  const day = JOURNEY_DAYS.find((item) => item.day === dayNumber);
  if (!day) return null;

  const task = day.tasks.find((item) => !done.has(item.key));
  if (!task) return null;

  return { day, taskKey: task.key };
}

export function progressStats(done: Set<string>): { completed: number; total: number; percent: number } {
  const total = JOURNEY_DAYS.reduce((sum, day) => sum + day.tasks.length, 0);
  let completed = 0;

  for (const day of JOURNEY_DAYS) {
    for (const task of day.tasks) {
      if (done.has(task.key)) completed += 1;
    }
  }

  return { completed, total, percent: total === 0 ? 0 : Math.round((completed / total) * 100) };
}

/** 某天完成了几条，用于地图上的小字。 */
export function dayProgress(day: JourneyDay, done: Set<string>): { completed: number; total: number } {
  const total = day.tasks.length;
  const completed = day.tasks.filter((task) => done.has(task.key)).length;
  return { completed, total };
}
