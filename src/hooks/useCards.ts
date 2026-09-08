import { useEffect, useState } from "react";
import { loadCards, saveCards } from "../data/storage";
import type { Card } from "../types/card";

// Single source of truth for the card deck: loads from localStorage on
// mount, and persists back to it on every change. CRUD helpers
// (addCard/updateCard/deleteCard) are added in Step C.
export function useCards() {
  const [cards, setCards] = useState<Card[]>(() => loadCards());

  useEffect(() => {
    saveCards(cards);
  }, [cards]);

  return { cards, setCards };
}
