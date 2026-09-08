import type { Card } from "./card";

// A quiz is a named deck of cards. Each deck owns its cards directly, so a
// quiz's questions are fully isolated from every other quiz.
export interface Deck {
  id: string;
  name: string;
  cards: Card[];
}
