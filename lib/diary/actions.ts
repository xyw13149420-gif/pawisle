"use server";

import { revalidatePath } from "next/cache";
import { getViewer } from "@/lib/auth/viewer";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { KIND_BY_VALUE, findOption, type EntryKind } from "./content";
import { addDemoRow, removeDemoRow } from "./demo-store";
import type { DiaryActionResult } from "./types";

export type AddEntryInput = {
  kind: string;
  valueText?: string | null;
  valueNum?: number | null;
  note?: string | null;
};

export async function addEntryAction(input: AddEntryInput): Promise<DiaryActionResult> {
  const config = KIND_BY_VALUE[input.kind as EntryKind];
  if (!config) return { ok: false, message: "没有这个记录项" };

  let valueText: string | null = null;
  let valueNum: number | null = null;

  if (config.input === "choice") {
    const option = findOption(config.kind, input.valueText ?? null);
    if (!option) return { ok: false, message: "先选一个" };
    valueText = option.value;
  } else if (config.input === "number") {
    const parsed = Number(input.valueNum);
    if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 30) {
      return { ok: false, message: "体重填 0.1 到 30 之间" };
    }
    valueNum = Math.round(parsed * 100) / 100;
  } else {
    return { ok: false, message: "照片请用上传入口" };
  }

  const note = (input.note ?? "").trim().slice(0, 200) || null;

  const viewer = await getViewer();
  if (!viewer) return { ok: false, message: "登录状态已失效，重新登录一下" };

  if (viewer.demo) {
    const row = addDemoRow({
      kind: config.kind,
      valueText,
      valueNum,
      note,
      photoPath: null,
      occurredAt: new Date().toISOString(),
    });
    revalidatePath("/diary", "layout");
    return { ok: true, entryId: row.id };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, message: "还没接上 Supabase" };

  const { data, error } = await supabase
    .from("diary_events")
    .insert({
      user_id: viewer.id,
      kind: config.kind,
      value_text: valueText,
      value_num: valueNum,
      note,
    })
    .select("id")
    .maybeSingle();

  if (error) return { ok: false, message: "没记上，稍后再试" };

  revalidatePath("/diary", "layout");
  return { ok: true, entryId: data?.id };
}

export async function deleteEntryAction(id: string): Promise<DiaryActionResult> {
  if (!id) return { ok: false, message: "找不到这条记录" };

  const viewer = await getViewer();
  if (!viewer) return { ok: false, message: "登录状态已失效，重新登录一下" };

  if (viewer.demo) {
    removeDemoRow(id);
    revalidatePath("/diary", "layout");
    return { ok: true };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, message: "还没接上 Supabase" };

  const { error } = await supabase.from("diary_events").delete().eq("id", id).eq("user_id", viewer.id);
  if (error) return { ok: false, message: "没删掉，稍后再试" };

  revalidatePath("/diary", "layout");
  return { ok: true };
}
