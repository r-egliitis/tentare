// A card is one term/definition pair, plus settings for how quiz mode should
// generate wrong answers for it. `distractorMode`/`customWrongAnswers` aren't
// used until quiz mode ships — they're part of the shape from the start so no
// later step needs to migrate existing card data.
export type DistractorMode = "auto" | "custom";

export interface Card {
  id: string;
  term: string;
  definition: string;
  /** "auto" = pull wrong answers from other cards, "custom" = user-written */
  distractorMode: DistractorMode;
  customWrongAnswers: string[];
  numChoices: number;
}
