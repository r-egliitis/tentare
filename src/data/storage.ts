import { sampleCards } from "./sampleCards";
import type { Card, DistractorMode } from "../types/card";

const STORAGE_KEY = "flashcard-quiz-tool:cards";

function isDistractorMode(value: unknown): value is DistractorMode {
  return value === "auto" || value === "custom";
}

// Accepts anything with the required fields, defaulting missing/invalid
// optional fields rather than rejecting the whole card — keeps older or
// hand-edited data importable instead of silently dropping it.
export function normalizeCard(raw: unknown): Card | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;

  if (
    typeof r.id !== "string" ||
    typeof r.term !== "string" ||
    typeof r.definition !== "string"
  ) {
    return null;
  }

  return {
    id: r.id,
    term: r.term,
    definition: r.definition,
    distractorMode: isDistractorMode(r.distractorMode)
      ? r.distractorMode
      : "auto",
    customWrongAnswers: Array.isArray(r.customWrongAnswers)
      ? r.customWrongAnswers.filter((w): w is string => typeof w === "string")
      : [],
    numChoices: typeof r.numChoices === "number" ? r.numChoices : 4,
  };
}

export function loadCards(): Card[] {
  const raw = localStorage.getItem(STORAGE_KEY);

  // Key was never written — first run, seed with the sample deck.
  if (raw === null) return sampleCards;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error("Stored cards value is not an array");
    }
    return parsed
      .map(normalizeCard)
      .filter((card): card is Card => card !== null);
  } catch (err) {
    // Real (if broken) saved data exists — don't silently overwrite it by
    // re-seeding sample cards. Surface an empty list and log instead.
    console.warn("Failed to load saved cards; starting with an empty list.", err);
    return [];
  }
}

export function saveCards(cards: Card[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  } catch (err) {
    console.error("Failed to save cards to localStorage.", err);
  }
}
