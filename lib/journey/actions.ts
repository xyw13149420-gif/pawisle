"use server";

import { revalidatePath } from "next/cache";
import { getViewer } from "@/lib/auth/viewer";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mergeBudget, toStorable } from "./budget";
import { ALL_TASK_KEYS, type BudgetItem } from "./content";
import { scoreQuiz, type QuizAnswers } from "./quiz";
import type { ActionResult, QuizSubmitResult } from "./types";

const NOT_SIGNED_IN: ActionResult = { ok: false, message: "登录状态已失效，重新登录一下" };
const SAVE_FAILED: ActionResult = { ok: false, message: "没保存上，稍后再试" };

function revalidateJourney() {
  revalidatePath("/journey", "layout");
}

/* ── 任务打勾 ───────────────────────────── */

export async function toggleTaskAction(taskKey: string, done: boolean): Promise<ActionResult> {
  if (!ALL_TASK_KEYS.includes(taskKey)) {
    return { ok: false, message: "找不到这个任务" };
  }

  const viewer = await getViewer();
  if (!viewer) return NOT_SIGNED_IN;
  if (viewer.demo) return { ok: true };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, message: "还没接上 Supabase" };

  if (done) {
    const { error } = await supabase
      .from("newbie_progress")
      .upsert({ user_id: viewer.id, task_key: taskKey }, { onConflict: "user_id,task_key" });
    if (error) return SAVE_FAILED;
  } else {
    const { error } = await supabase
      .from("newbie_progress")
      .delete()
      .eq("user_id", viewer.id)
      .eq("task_key", taskKey);
    if (error) return SAVE_FAILED;
  }

  revalidateJourney();
  return { ok: true };
}

/* ── 适配测试交卷 ───────────────────────── */

export async function submitQuizAction(answers: QuizAnswers): Promise<QuizSubmitResult> {
  const viewer = await getViewer();
  if (!viewer) return NOT_SIGNED_IN;

  // 分数一律在服务端重算，不采信客户端传来的结果
  const outcome = scoreQuiz(answers ?? {});
  if (!outcome) return { ok: false, message: "还有题没答完" };

  if (viewer.demo) return { ok: true, outcome };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, message: "还没接上 Supabase" };

  const { error } = await supabase.from("adoption_quiz_results").insert({
    user_id: viewer.id,
    score: outcome.score,
    verdict: outcome.verdict.title,
    answers,
  });

  if (error) return SAVE_FAILED;

  revalidateJourney();
  return { ok: true, outcome };
}

/* ── 预算清单 ───────────────────────────── */

export async function saveBudgetAction(items: BudgetItem[]): Promise<ActionResult> {
  const viewer = await getViewer();
  if (!viewer) return NOT_SIGNED_IN;

  // 客户端传来的结构不可信，统一按内容定义重建设
  const normalized = toStorable(mergeBudget(items));

  if (viewer.demo) return { ok: true };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, message: "还没接上 Supabase" };

  const { error } = await supabase
    .from("pet_budget")
    .upsert({ user_id: viewer.id, items: normalized, updated_at: new Date().toISOString() }, { onConflict: "user_id" });

  if (error) return SAVE_FAILED;

  revalidateJourney();
  return { ok: true };
}
