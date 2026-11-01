import {
  DIMENSION_ADVICE,
  DIMENSION_LABEL,
  QUIZ_QUESTIONS,
  VERDICTS,
  type QuizDimension,
} from "./content";

export type QuizAnswers = Record<string, string>;

export type WeakPoint = {
  dimension: QuizDimension;
  label: string;
  advice: string;
  average: number;
};

export type QuizOutcome = {
  score: number;
  answered: number;
  total: number;
  verdict: { title: string; body: string };
  weakest: WeakPoint[];
};

export function isQuizComplete(answers: QuizAnswers): boolean {
  return QUIZ_QUESTIONS.every((question) => {
    const picked = answers[question.id];
    return Boolean(picked) && question.options.some((option) => option.value === picked);
  });
}

/**
 * 服务端与客户端共用同一套计分，避免两边结果不一致。
 * 只有全部题目有效作答时才返回结果。
 */
export function scoreQuiz(answers: QuizAnswers): QuizOutcome | null {
  if (!isQuizComplete(answers)) return null;

  let gained = 0;
  let possible = 0;

  const byDimension = new Map<QuizDimension, { gained: number; possible: number }>();

  for (const question of QUIZ_QUESTIONS) {
    const picked = question.options.find((option) => option.value === answers[question.id]);
    if (!picked) return null;

    gained += picked.score;
    possible += 3;

    const bucket = byDimension.get(question.dimension) ?? { gained: 0, possible: 0 };
    bucket.gained += picked.score;
    bucket.possible += 3;
    byDimension.set(question.dimension, bucket);
  }

  const score = possible === 0 ? 0 : Math.round((gained / possible) * 100);

  const weakest: WeakPoint[] = [...byDimension.entries()]
    .map(([dimension, bucket]) => ({
      dimension,
      label: DIMENSION_LABEL[dimension],
      advice: DIMENSION_ADVICE[dimension],
      average: bucket.possible === 0 ? 0 : Math.round((bucket.gained / bucket.possible) * 100),
    }))
    .sort((a, b) => a.average - b.average)
    .slice(0, 2);

  const verdict = VERDICTS.find((item) => score >= item.min) ?? VERDICTS[VERDICTS.length - 1];

  return {
    score,
    answered: QUIZ_QUESTIONS.length,
    total: QUIZ_QUESTIONS.length,
    verdict: { title: verdict.title, body: verdict.body },
    weakest,
  };
}
