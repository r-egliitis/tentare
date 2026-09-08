import { useEffect, useState } from "react";
import { loadCards, saveCards } from "../data/storage";
import type { Card, DistractorMode } from "../types/card";

export interface CardValues {
  term: string;
  definition: string;
  distractorMode: DistractorMode;
  customWrongAnswers: string[];
  numChoices: number;
}

// Single source of truth for the card deck: loads from localStorage on
// mount, persists back to it on every change, and exposes CRUD helpers so
// callers never touch setCards directly.
export function useCards() {
  const [cards, setCards] = useState<Card[]>(() => loadCards());

  useEffect(() => {
    saveCards(cards);
  }, [cards]);

  function addCard(values: CardValues) {
    setCards((prev) => [...prev, { id: crypto.randomUUID(), ...values }]);
  }

  function updateCard(id: string, values: CardValues) {
    setCards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, ...values } : card)),
    );
  }

  function deleteCard(id: string) {
    setCards((prev) => prev.filter((card) => card.id !== id));
  }

  function deleteCards(ids: string[]) {
    const idSet = new Set(ids);
    setCards((prev) => prev.filter((card) => !idSet.has(card.id)));
  }

  function replaceCards(newCards: Card[]) {
    setCards(newCards);
  }

  return {
    cards,
    addCard,
    updateCard,
    deleteCard,
    deleteCards,
    replaceCards,
  };
}
