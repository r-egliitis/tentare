import { useEffect, useState } from "react";
import { loadCards, saveCards } from "../data/storage";
import type { Card } from "../types/card";

interface CardValues {
  term: string;
  definition: string;
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
    setCards((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        term: values.term,
        definition: values.definition,
        distractorMode: "auto",
        customWrongAnswers: [],
        numChoices: 4,
      },
    ]);
  }

  function updateCard(id: string, values: CardValues) {
    setCards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, ...values } : card)),
    );
  }

  function deleteCard(id: string) {
    setCards((prev) => prev.filter((card) => card.id !== id));
  }

  return { cards, addCard, updateCard, deleteCard };
}
