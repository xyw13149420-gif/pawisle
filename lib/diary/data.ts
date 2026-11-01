import type { Viewer } from "@/lib/auth/viewer";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { EntryKind } from "./content";
import { demoRows, type DemoRow } from "./demo-store";
import { dayKeyOf, shanghaiInstant, type PeriodRange } from "./period";

export type DiaryEntry = {
  id: string;
  kind: EntryKind;
  valueText: string | null;
  valueNum: number | null;
  note: string | null;
  photoPath: string | null;
  photoUrl: string | null;
  occurredAt: string;
};

const COLUMNS = "id, kind, value_text, value_num, note, photo_path, occurred_at";

type Row = {
  id: string;
  kind: string;
  value_text: string | null;
  value_num: number | string | null;
  note: string | null;
  photo_path: string | null;
  occurred_at: string;
};

function mapRow(row: Row): DiaryEntry {
  return {
    id: row.id,
    kind: row.kind as EntryKind,
    valueText: row.value_text,
    valueNum: row.value_num === null ? null : Number(row.value_num),
    note: row.note,
    photoPath: row.photo_path,
    photoUrl: null,
    occurredAt: row.occurred_at,
  };
}

function mapDemoRow(row: DemoRow): DiaryEntry {
  return {
    id: row.id,
    kind: row.kind,
    valueText: row.valueText,
    valueNum: row.valueNum,
    note: row.note,
    photoPath: row.photoPath,
    photoUrl: null,
    occurredAt: row.occurredAt,
  };
}

/** 某一天的记录（默认今天），按时间倒序。 */
export async function loadDayEntries(viewer: Viewer, day: Date = new Date()): Promise<DiaryEntry[]> {
  const key = dayKeyOf(day);
  const start = shanghaiInstant(key, 0, 0);
  const end = new Date(start.getTime() + 86_400_000);

  if (viewer.demo) {
    return demoRows()
      .filter((row) => dayKeyOf(new Date(row.occurredAt)) === key)
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
      .map(mapDemoRow);
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("diary_events")
    .select(COLUMNS)
    .eq("user_id", viewer.id)
    .gte("occurred_at", start.toISOString())
    .lt("occurred_at", end.toISOString())
    .order("occurred_at", { ascending: false });

  return ((data ?? []) as Row[]).map(mapRow);
}

/** 某个报告区间的全部记录。 */
export async function loadRangeEntries(viewer: Viewer, range: PeriodRange): Promise<DiaryEntry[]> {
  if (viewer.demo) {
    const from = range.start.getTime();
    const to = range.end.getTime();
    return demoRows()
      .filter((row) => {
        const time = new Date(row.occurredAt).getTime();
        return time >= from && time < to;
      })
      .map(mapDemoRow);
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("diary_events")
    .select(COLUMNS)
    .eq("user_id", viewer.id)
    .gte("occurred_at", range.start.toISOString())
    .lt("occurred_at", range.end.toISOString())
    .order("occurred_at", { ascending: false });

  return ((data ?? []) as Row[]).map(mapRow);
}

/** 给照片记录补短时签名链接（桶是私有的）。 */
export async function attachPhotoUrls(viewer: Viewer, entries: DiaryEntry[]): Promise<DiaryEntry[]> {
  if (viewer.demo) return entries;

  const paths = [...new Set(entries.filter((entry) => entry.photoPath).map((entry) => entry.photoPath as string))];
  if (paths.length === 0) return entries;

  const supabase = await createSupabaseServerClient();
  if (!supabase) return entries;

  const { data } = await supabase.storage.from("diary-photos").createSignedUrls(paths, 3600);
  const byPath = new Map((data ?? []).map((item) => [item.path, item.signedUrl]));

  return entries.map((entry) =>
    entry.photoPath ? { ...entry, photoUrl: byPath.get(entry.photoPath) ?? null } : entry,
  );
}
