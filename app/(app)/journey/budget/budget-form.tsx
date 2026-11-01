"use client";

import { useMemo, useState, useTransition } from "react";
import { saveBudgetAction } from "@/lib/journey/actions";
import { normalizeAmount, totalsOf } from "@/lib/journey/budget";
import { BUDGET_GROUP_LABEL, DEFAULT_BUDGET, type BudgetGroup, type BudgetItem } from "@/lib/journey/content";

const GROUPS: BudgetGroup[] = ["once", "monthly", "yearly"];

function yuan(value: number): string {
  return value.toLocaleString("zh-CN");
}

function cloneDefaults(): BudgetItem[] {
  return DEFAULT_BUDGET.map((item) => ({ ...item }));
}

export function BudgetForm({ initial }: { initial: BudgetItem[] }) {
  const [items, setItems] = useState<BudgetItem[]>(initial);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"idle" | "ok" | "error">("idle");
  const [pending, startTransition] = useTransition();

  const totals = useMemo(() => totalsOf(items), [items]);

  function setAmount(key: string, raw: string) {
    const amount = normalizeAmount(raw);
    setItems((prev) => prev.map((item) => (item.key === key ? { ...item, amount } : item)));
    setTone("idle");
    setMessage("");
  }

  function toggle(key: string) {
    setItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, included: !item.included } : item)),
    );
    setTone("idle");
    setMessage("");
  }

  function reset() {
    setItems(cloneDefaults());
    setTone("idle");
    setMessage("");
  }

  function save() {
    startTransition(async () => {
      const result = await saveBudgetAction(items);
      if (result.ok) {
        setTone("ok");
        setMessage("已保存");
      } else {
        setTone("error");
        setMessage(result.message ?? "没保存上，稍后再试");
      }
    });
  }

  return (
    <>
      <section className="card budget-hero">
        <p className="budget-kicker">首年大概需要</p>
        <p className="budget-big">
          <span className="budget-yen-big">¥</span>
          {yuan(totals.firstYear)}
        </p>
        <p className="budget-sub">
          每月约 ¥{yuan(totals.monthly)} · 一次性 ¥{yuan(totals.once)} · 年度 ¥{yuan(totals.yearly)}
        </p>
      </section>

      {GROUPS.map((group) => (
        <section className="section" key={group}>
          <h2 className="section-title">{BUDGET_GROUP_LABEL[group]}</h2>
          <ul className="budget-list">
            {items
              .filter((item) => item.group === group)
              .map((item) => (
                <li className="budget-row" key={item.key} data-off={!item.included}>
                  <button
                    type="button"
                    className="task-check"
                    onClick={() => toggle(item.key)}
                    aria-pressed={item.included}
                    aria-label={`${item.included ? "不计入" : "计入"}${item.label}`}
                  >
                    <span className="task-box" aria-hidden="true">
                      {item.included ? "✓" : ""}
                    </span>
                  </button>

                  <span className="budget-label">{item.label}</span>

                  <span className="budget-input-wrap">
                    <span className="budget-yen" aria-hidden="true">
                      ¥
                    </span>
                    <input
                      className="budget-input"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={100000}
                      step={1}
                      value={item.amount}
                      onChange={(event) => setAmount(item.key, event.target.value)}
                      disabled={!item.included}
                      aria-label={`${item.label}金额`}
                    />
                  </span>
                </li>
              ))}
          </ul>
        </section>
      ))}

      <div className="day-foot">
        <button type="button" className="btn-primary" onClick={save} disabled={pending}>
          {pending ? "保存中…" : "保存清单"}
        </button>
        <button type="button" className="btn-quiet" onClick={reset} disabled={pending}>
          恢复参考价
        </button>
      </div>

      {message ? (
        <p className={tone === "error" ? "task-error" : "foot-note"}>{message}</p>
      ) : (
        <p className="foot-note">不勾的项不计入合计，保险那项默认不勾。</p>
      )}
    </>
  );
}
