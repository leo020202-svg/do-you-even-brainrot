import rawQuestions from "../../data/questions.json";

export type Category =
  | "italian_brainrot"
  | "skibidi"
  | "gen_alpha_slang"
  | "viral_moments"
  | "creators"
  | "cross_platform"
  | "deep_cuts"
  | "absurdity";

export type Difficulty = "easy" | "medium" | "hard" | "expert";

export type AnswerId = "A" | "B" | "C" | "D";

export type Option = { id: AnswerId; text: string };

export type Question = {
  id: string;
  category: Category;
  difficulty: Difficulty;
  question: string;
  options: Option[];
  correct_answer: AnswerId;
  source: string | null;
  tags: string[];
  active: boolean;
};

// Cast through unknown — questions.json is hand-curated and matches Question[],
// but TS infers a wider literal type from the JSON import.
export const questions: Question[] = (rawQuestions as unknown as Question[]).filter(
  (q) => q.active,
);

export const questionsById: Record<string, Question> = Object.fromEntries(
  questions.map((q) => [q.id, q]),
);

export function getQuestion(id: string): Question | undefined {
  return questionsById[id];
}
