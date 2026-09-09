import type { Card } from "../types/card";
import type { PromptDirection } from "../types/deck";

export type PromptSide = "term" | "definition";

export interface QuizQuestion {
  card: Card;
  promptSide: PromptSide;
  /** card.term or card.definition, whichever is shown as the prompt */
  promptText: string;
  /** the opposite side's text */
  correctAnswer: string;
  /** shuffled; includes correctAnswer exactly once */
  choices: string[];
}

export function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** A shuffled copy of every card — one full pass per quiz session. */
export function buildQuizOrder(cards: Card[]): Card[] {
  return shuffle(cards);
}

export function generateQuestion(
  card: Card,
  allCards: Card[],
  direction: PromptDirection = "mix",
): QuizQuestion {
  const promptSide: PromptSide =
    direction === "mix"
      ? Math.random() < 0.5
        ? "term"
        : "definition"
      : direction;
  const promptText = promptSide === "term" ? card.term : card.definition;
  const correctAnswer = promptSide === "term" ? card.definition : card.term;

  const needed = Math.max(card.numChoices - 1, 0);
  let distractors: string[];

  if (card.distractorMode === "custom") {
    distractors = card.customWrongAnswers.slice(0, needed);
    if (distractors.length < needed) {
      // Not enough custom wrong answers — pad with auto-pulled ones rather
      // than showing a question with too few choices.
      distractors = distractors.concat(
        pickAutoDistractors(
          card,
          allCards,
          promptSide,
          correctAnswer,
          needed - distractors.length,
          distractors,
        ),
      );
    }
  } else {
    distractors = pickAutoDistractors(
      card,
      allCards,
      promptSide,
      correctAnswer,
      needed,
      [],
    );
  }

  const choices = shuffle([...distractors, correctAnswer]);
  return { card, promptSide, promptText, correctAnswer, choices };
}

function pickAutoDistractors(
  card: Card,
  allCards: Card[],
  promptSide: PromptSide,
  correctAnswer: string,
  count: number,
  exclude: string[],
): string[] {
  const pool = shuffle(allCards.filter((c) => c.id !== card.id)).map((c) =>
    promptSide === "term" ? c.definition : c.term,
  );

  const seen = new Set([correctAnswer, ...exclude]);
  const picked: string[] = [];
  for (const candidate of pool) {
    if (picked.length >= count) break;
    if (seen.has(candidate)) continue;
    seen.add(candidate);
    picked.push(candidate);
  }
  return picked;
}
