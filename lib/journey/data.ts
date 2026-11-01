import type { Viewer } from "@/lib/auth/viewer";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mergeBudget } from "./budget";
import { DEFAULT_BUDGET, type BudgetItem } from "./content";

export type StoredQuiz = {
  score: number;
  verdict: string;
  createdAt: string;
};

export type JourneyData = {
  completedKeys: string[];
  quiz: StoredQuiz | null;
  budget: BudgetItem[];
};

/** 演示模式下预置的进度，让航线地图看起来是「正在途中」而不是全空。 */
const DEMO_COMPLETED = ["day1-window", "day1-wire", "day1-poison", "day2-litter", "day2-sand"];

function defaults(): JourneyData {
  return {
    completedKeys: [],
    quiz: null,
    budget: DEFAULT_BUDGET.map((item) => ({ ...item })),
  };
}

export async function loadJourney(viewer: Viewer): Promise<JourneyData> {
  if (viewer.demo) {
    return { ...defaults(), completedKeys: [...DEMO_COMPLETED] };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return defaults();

  const [progressResult, quizResult, budgetResult] = await Promise.all([
    supabase.from("newbie_progress").select("task_key").eq("user_id", viewer.id),
    supabase
      .from("adoption_quiz_results")
      .select("score, verdict, created_at")
      .eq("user_id", viewer.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("pet_budget").select("items").eq("user_id", viewer.id).maybeSingle(),
  ]);

  const completedKeys = Array.isArray(progressResult.data)
    ? progressResult.data.map((row) => String(row.task_key))
    : [];

  const quizRow = quizResult.data as { score?: number; verdict?: string; created_at?: string } | null;
  const quiz =
    quizRow && typeof quizRow.score === "number"
      ? {
          score: quizRow.score,
          verdict: quizRow.verdict ?? "",
          createdAt: quizRow.created_at ?? new Date().toISOString(),
        }
      : null;

  const budget = mergeBudget(budgetResult.data?.items);

  return { completedKeys, quiz, budget };
}
