import type { Card } from "./card";

export type QuizStyle = "whole" | "endless" | "untilCorrect";
export type PromptDirection = "term" | "definition" | "mix";

export interface QuizSettings {
  style: QuizStyle;
  direction: PromptDirection;
}

// Today's only behavior — every deck defaults to this so nothing changes
// unless a user opens Settings and picks something else.
export const DEFAULT_QUIZ_SETTINGS: QuizSettings = {
  style: "whole",
  direction: "mix",
};

// A quiz is a named deck of cards. Each deck owns its cards directly, so a
// quiz's questions are fully isolated from every other quiz.
export interface Deck {
  id: string;
  name: string;
  bio: string;
  cards: Card[];
  settings: QuizSettings;
}
