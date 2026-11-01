import type { QuizOutcome } from "./quiz";

export type ActionResult = {
  ok: boolean;
  message?: string;
};

export type QuizSubmitResult = ActionResult & {
  outcome?: QuizOutcome;
};
