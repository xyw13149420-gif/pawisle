import { DEFAULT_BUDGET, type BudgetGroup, type BudgetItem } from "./content";

export type BudgetTotals = {
  once: number;
  monthly: number;
  yearly: number;
  firstYear: number;
};

export const AMOUNT_MIN = 0;
export const AMOUNT_MAX = 100000;

/** 金额只接受 0 到 100000 的整数，防止手滑输入负数和超大值。 */
export function normalizeAmount(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number.parseFloat(String(value ?? ""));
  if (!Number.isFinite(parsed)) return 0;

  const rounded = Math.round(parsed);
  if (rounded < AMOUNT_MIN) return AMOUNT_MIN;
  if (rounded > AMOUNT_MAX) return AMOUNT_MAX;

  return rounded;
}

export function totalsOf(items: BudgetItem[]): BudgetTotals {
  const active = items.filter((item) => item.included);
  const sumOf = (group: BudgetGroup) =>
    active.filter((item) => item.group === group).reduce((sum, item) => sum + normalizeAmount(item.amount), 0);

  const once = sumOf("once");
  const monthly = sumOf("monthly");
  const yearly = sumOf("yearly");

  return { once, monthly, yearly, firstYear: once + monthly * 12 + yearly };
}

function pickGroup(value: unknown): BudgetGroup {
  return value === "monthly" || value === "yearly" ? value : "once";
}

/**
 * 把数据库里的 jsonb 合并回当前内容定义。
 * 以代码里的 DEFAULT_BUDGET 为准：新增项自动出现，已删除项自动消失，
 * 只沿用用户改过的 amount / included。
 */
export function mergeBudget(stored: unknown): BudgetItem[] {
  if (!Array.isArray(stored)) return DEFAULT_BUDGET.map((item) => ({ ...item }));

  const byKey = new Map<string, { amount?: unknown; included?: unknown }>();
  for (const entry of stored) {
    if (entry && typeof entry === "object" && "key" in entry) {
      const record = entry as { key?: unknown; amount?: unknown; included?: unknown };
      if (typeof record.key === "string") {
        byKey.set(record.key, { amount: record.amount, included: record.included });
      }
    }
  }

  return DEFAULT_BUDGET.map((item) => {
    const saved = byKey.get(item.key);
    return {
      key: item.key,
      label: item.label,
      group: pickGroup(item.group),
      amount: saved ? normalizeAmount(saved.amount) : item.amount,
      included: saved && typeof saved.included === "boolean" ? saved.included : item.included,
    };
  });
}

export function toStorable(items: BudgetItem[]): Array<Pick<BudgetItem, "key" | "amount" | "included">> {
  return items.map((item) => ({
    key: item.key,
    amount: normalizeAmount(item.amount),
    included: Boolean(item.included),
  }));
}
