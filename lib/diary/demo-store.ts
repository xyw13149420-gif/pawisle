import type { EntryKind } from "./content";
import { demoEvents } from "./demo";
import { dayKeyOf, shanghaiInstant } from "./period";

/**
 * 仅演示模式（未配 Supabase 且非生产构建）使用的内存存储。
 * 挂在 globalThis 上，dev 热更新后数据不会立刻消失；重启 dev 会回到初始种子。
 * 生产构建里没有任何代码路径能进到这里，isDemoMode() 恒为 false。
 */
export type DemoRow = {
  id: string;
  kind: EntryKind;
  valueText: string | null;
  valueNum: number | null;
  note: string | null;
  photoPath: string | null;
  occurredAt: string;
};

type Store = { rows: DemoRow[] | null; seededDay: string | null };

const KEY = "__pawisle_demo_diary__";

function store(): Store {
  const bag = globalThis as unknown as Record<string, Store | undefined>;
  if (!bag[KEY]) bag[KEY] = { rows: null, seededDay: null };
  return bag[KEY] as Store;
}

function seed(): DemoRow[] {
  return demoEvents(new Date()).map((entry, index) => ({
    id: `demo-${index}-${entry.kind}`,
    kind: entry.kind,
    valueText: entry.valueText,
    valueNum: entry.valueNum,
    note: null,
    photoPath: null,
    occurredAt: entry.occurredAt,
  }));
}

/** 进程跨过零点后，「今天」会变空。每个自然日只补一次样例，用户删掉后不再回填。 */
function ensureToday(bag: Store) {
  const today = dayKeyOf(new Date());
  if (bag.seededDay === today) return;

  const hasToday = (bag.rows ?? []).some(
    (row) => dayKeyOf(new Date(row.occurredAt)) === today,
  );

  if (!hasToday) {
    const startOfDay = shanghaiInstant(today, 0, 0).getTime();
    const minutesSoFar = Math.max(1, Math.floor((Date.now() - startOfDay) / 60_000));

    // 凌晨刚过零点时，「往前推几小时」会落到昨天，所以按今天已过去的分钟数钳制
    const at = (wantedMinutes: number, index: number) => {
      const minutes =
        wantedMinutes < minutesSoFar ? wantedMinutes : Math.max(0, minutesSoFar - 1 - index);
      return new Date(startOfDay + minutes * 60_000).toISOString();
    };

    bag.rows?.push(
      { id: "demo-today-meal", kind: "meal", valueText: "full", valueNum: null, note: null, photoPath: null, occurredAt: at(540, 0) },
      { id: "demo-today-poop", kind: "poop", valueText: "soft", valueNum: null, note: null, photoPath: null, occurredAt: at(660, 1) },
      { id: "demo-today-mood", kind: "mood", valueText: "clingy", valueNum: null, note: null, photoPath: null, occurredAt: at(780, 2) },
    );
  }

  bag.seededDay = today;
}

export function demoRows(): DemoRow[] {
  const bag = store();
  if (!bag.rows) bag.rows = seed();
  ensureToday(bag);
  return bag.rows;
}

export function addDemoRow(row: Omit<DemoRow, "id">): DemoRow {
  const created: DemoRow = { ...row, id: `demo-local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` };
  demoRows().push(created);
  return created;
}

export function removeDemoRow(id: string): boolean {
  const rows = demoRows();
  const next = rows.filter((row) => row.id !== id);
  if (next.length === rows.length) return false;
  store().rows = next;
  return true;
}
