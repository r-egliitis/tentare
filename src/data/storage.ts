import { sampleCards } from "./sampleCards";
import type { Card, DistractorMode } from "../types/card";
import type { Deck, QuizSettings, QuizStyle, PromptDirection } from "../types/deck";
import { DEFAULT_QUIZ_SETTINGS } from "../types/deck";

const DECKS_KEY = "flashcard-quiz-tool:decks";
// Pre-multi-quiz storage format: a single flat Card[]. Kept only so
// loadDecks() can migrate anyone who used the app before quizzes existed.
const LEGACY_CARDS_KEY = "flashcard-quiz-tool:cards";

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

function normalizeCards(raw: unknown): Card[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeCard).filter((card): card is Card => card !== null);
}

function isQuizStyle(value: unknown): value is QuizStyle {
  return value === "whole" || value === "endless" || value === "untilCorrect";
}

function isPromptDirection(value: unknown): value is PromptDirection {
  return value === "term" || value === "definition" || value === "mix";
}

function normalizeQuizSettings(raw: unknown): QuizSettings {
  if (typeof raw !== "object" || raw === null) return DEFAULT_QUIZ_SETTINGS;
  const r = raw as Record<string, unknown>;

  return {
    style: isQuizStyle(r.style) ? r.style : DEFAULT_QUIZ_SETTINGS.style,
    direction: isPromptDirection(r.direction)
      ? r.direction
      : DEFAULT_QUIZ_SETTINGS.direction,
  };
}

function normalizeDeck(raw: unknown): Deck | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;

  if (typeof r.id !== "string" || typeof r.name !== "string") return null;

  return {
    id: r.id,
    name: r.name,
    bio: typeof r.bio === "string" ? r.bio : "",
    cards: normalizeCards(r.cards),
    settings: normalizeQuizSettings(r.settings),
  };
}

function migrateLegacyCards(): Deck[] | null {
  const legacyRaw = localStorage.getItem(LEGACY_CARDS_KEY);
  if (legacyRaw === null) return null;

  try {
    const parsed: unknown = JSON.parse(legacyRaw);
    if (!Array.isArray(parsed)) {
      throw new Error("Legacy cards value is not an array");
    }
    const migrated: Deck[] = [
      {
        id: crypto.randomUUID(),
        name: "My Flashcards",
        bio: "",
        cards: normalizeCards(parsed),
        settings: DEFAULT_QUIZ_SETTINGS,
      },
    ];
    saveDecks(migrated);
    // Only migrate once — remove the old key now that it's been folded in.
    localStorage.removeItem(LEGACY_CARDS_KEY);
    return migrated;
  } catch (err) {
    console.warn("Failed to migrate legacy cards; starting fresh.", err);
    return null;
  }
}

export function loadDecks(): Deck[] {
  const raw = localStorage.getItem(DECKS_KEY);

  if (raw !== null) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        throw new Error("Stored quizzes value is not an array");
      }
      return parsed
        .map(normalizeDeck)
        .filter((deck): deck is Deck => deck !== null);
    } catch (err) {
      // Real (if broken) saved data exists — don't silently overwrite it by
      // re-seeding. Surface an empty list and log instead.
      console.warn(
        "Failed to load saved quizzes; starting with an empty list.",
        err,
      );
      return [];
    }
  }

  const migrated = migrateLegacyCards();
  if (migrated) return migrated;

  // True first run — no new or legacy data at all.
  return [
    {
      id: crypto.randomUUID(),
      name: "My Flashcards",
      bio: "",
      cards: sampleCards,
      settings: DEFAULT_QUIZ_SETTINGS,
    },
  ];
}

export function saveDecks(decks: Deck[]): void {
  try {
    localStorage.setItem(DECKS_KEY, JSON.stringify(decks));
  } catch (err) {
    console.error("Failed to save quizzes to localStorage.", err);
  }
}
