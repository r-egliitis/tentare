import { normalizeCard } from "../data/storage";
import type { Card } from "../types/card";

// Validates an imported JSON payload into a Card[], reusing storage.ts's
// per-card normalization (defaults missing/invalid optional fields). Unlike
// loadDecks() -- which silently skips bad items in your own saved data --
// this throws on the first invalid item, since import is an explicit user
// action they need clear, immediate feedback on rather than a silent
// partial import.
export function parseImportedCards(raw: unknown): Card[] {
  if (!Array.isArray(raw)) {
    throw new Error("Import file must contain a JSON array of cards.");
  }

  return raw.map((item, index) => {
    const card = normalizeCard(item);
    if (!card) {
      throw new Error(
        `Card at index ${index} is missing a required field (id, term, or definition).`,
      );
    }
    return card;
  });
}
