"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { submitQuizAction } from "@/lib/journey/actions";
import { QUIZ_QUESTIONS } from "@/lib/journey/content";
import type { QuizAnswers, QuizOutcome } from "@/lib/journey/quiz";

type LastResult = { score: number; verdict: string } | null;

export function QuizFlow({ lastResult }: { lastResult: LastResult }) {
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [outcome, setOutcome] = useState<QuizOutcome | null>(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const question = QUIZ_QUESTIONS[index];
  const total = QUIZ_QUESTIONS.length;

  function choose(value: string) {
    if (!question || pending) return;

    const next = { ...answers, [question.id]: value };
    setAnswers(next);
    setError("");

    if (index < total - 1) {
      setIndex(index + 1);
      return;
    }

    startTransition(async () => {
      const result = await submitQuizAction(next);
      if (result.ok && result.outcome) {
        setOutcome(result.outcome);
      } else {
        setError(result.message ?? "没算出来，再试一次");
      }
    });
  }

  function restart() {
    setOutcome(null);
    setAnswers({});
    setIndex(0);
    setStarted(true);
  }

  if (outcome) {
    return (
      <section className="card">
        <div className="score-badge">
          <span className="score-num">{outcome.score}</span>
          <span className="score-unit">分</span>
        </div>

        <h2 className="result-title">{outcome.verdict.title}</h2>
        <p className="result-body">{outcome.verdict.body}</p>

        <div className="weak-list">
          {outcome.weakest.map((item) => (
            <div className="weak" key={item.dimension}>
              <p className="weak-head">
                <span>{item.label}</span>
                <span className="weak-score">{item.average}</span>
              </p>
              <p className="weak-advice">{item.advice}</p>
            </div>
          ))}
        </div>

        <div className="actions">
          <Link className="btn-quiet" href="/journey">
            回到航线
          </Link>
          <button type="button" className="btn-primary" onClick={restart}>
            重新测一次
          </button>
        </div>
      </section>
    );
  }

  if (!started) {
    return (
      <section className="card">
        <h2 className="card-title">接它回家之前，先诚实一次</h2>
        <p className="card-sub">时间、钱、住处、还有十五年这件事，都会问。</p>

        {lastResult ? (
          <p className="last-result">
            上次结果 · {lastResult.score} 分 · {lastResult.verdict}
          </p>
        ) : null}

        <div className="form">
          <button type="button" className="btn-primary" onClick={() => setStarted(true)}>
            开始测一测
          </button>
          <p className="hint">答案没有对错，只有「现在」和「还没准备好」。</p>
        </div>
      </section>
    );
  }

  return (
    <section className="quiz">
      <div className="quiz-progress">
        <span className="quiz-count">
          {index + 1} / {total}
        </span>
        <span className="quiz-dots" aria-hidden="true">
          {QUIZ_QUESTIONS.map((item, position) => (
            <span
              key={item.id}
              className="quiz-dot"
              data-on={position <= index || Boolean(answers[item.id])}
            />
          ))}
        </span>
      </div>

      <p className="quiz-prompt">{question.prompt}</p>

      <div className="quiz-options">
        {question.options.map((option) => (
          <button
            key={option.value}
            type="button"
            className="quiz-option"
            data-picked={answers[question.id] === option.value}
            onClick={() => choose(option.value)}
            disabled={pending}
          >
            {option.label}
          </button>
        ))}
      </div>

      {pending ? <p className="hint">正在算…</p> : null}
      {error ? <p className="task-error">{error}</p> : null}

      <div className="quiz-foot">
        {index > 0 && !pending ? (
          <button type="button" className="ghost-link" onClick={() => setIndex(index - 1)}>
            ← 上一题
          </button>
        ) : (
          <span />
        )}
        <span className="quiz-hint">选一个就好</span>
      </div>
    </section>
  );
}
