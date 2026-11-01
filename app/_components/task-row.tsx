"use client";

import { useState, useTransition } from "react";
import { toggleTaskAction } from "@/lib/journey/actions";
import type { JourneyTask } from "@/lib/journey/content";

type TaskRowProps = {
  task: JourneyTask;
  done: boolean;
};

export function TaskRow({ task, done }: TaskRowProps) {
  const [checked, setChecked] = useState(done);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !checked;
    setChecked(next);
    setError("");

    startTransition(async () => {
      const result = await toggleTaskAction(task.key, next);
      if (!result.ok) {
        setChecked(!next);
        setError(result.message ?? "没保存上，稍后再试");
      }
    });
  }

  return (
    <li className="task" data-done={checked}>
      <button
        type="button"
        className="task-check"
        onClick={toggle}
        aria-pressed={checked}
        aria-label={checked ? `取消完成：${task.title}` : `标记完成：${task.title}`}
        disabled={pending}
      >
        <span className="task-box" aria-hidden="true">
          {checked ? "✓" : ""}
        </span>
      </button>

      <div className="task-main">
        <button
          type="button"
          className="task-head"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
        >
          <span className="task-title">{task.title}</span>
          {task.hint ? <span className="task-hint">{task.hint}</span> : null}
        </button>

        {open ? (
          <div className="kcard">
            <p className="kcard-q">{task.card.question}</p>
            <p className="kcard-a">{task.card.answer}</p>
            {task.card.tip ? <p className="kcard-tip">{task.card.tip}</p> : null}
          </div>
        ) : (
          <button type="button" className="kcard-trigger" onClick={() => setOpen(true)}>
            <span className="kcard-dot" aria-hidden="true" />
            {task.card.question}
          </button>
        )}

        {error ? <p className="task-error">{error}</p> : null}
      </div>
    </li>
  );
}
