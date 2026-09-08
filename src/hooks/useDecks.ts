import { useEffect, useState } from "react";
import { loadDecks, saveDecks } from "../data/storage";
import type { Card, DistractorMode } from "../types/card";
import type { Deck } from "../types/deck";

export interface CardValues {
  term: string;
  definition: string;
  distractorMode: DistractorMode;
  customWrongAnswers: string[];
  numChoices: number;
}

// Single source of truth for every quiz (deck) and its cards: loads from
// localStorage on mount, persists back to it on every change, and exposes
// CRUD helpers so callers never touch setDecks directly.
export function useDecks() {
  const [decks, setDecks] = useState<Deck[]>(() => loadDecks());

  useEffect(() => {
    saveDecks(decks);
  }, [decks]);

  function addDeck(name: string): string {
    const id = crypto.randomUUID();
    setDecks((prev) => [...prev, { id, name, cards: [] }]);
    return id;
  }

  function renameDeck(id: string, name: string) {
    setDecks((prev) =>
      prev.map((deck) => (deck.id === id ? { ...deck, name } : deck)),
    );
  }

  function deleteDeck(id: string) {
    setDecks((prev) => prev.filter((deck) => deck.id !== id));
  }

  function replaceAllDecks(newDecks: Deck[]) {
    setDecks(newDecks);
  }

  function withDeckCards(deckId: string, update: (cards: Card[]) => Card[]) {
    setDecks((prev) =>
      prev.map((deck) =>
        deck.id === deckId ? { ...deck, cards: update(deck.cards) } : deck,
      ),
    );
  }

  function addCard(deckId: string, values: CardValues) {
    withDeckCards(deckId, (cards) => [
      ...cards,
      { id: crypto.randomUUID(), ...values },
    ]);
  }

  function updateCard(deckId: string, cardId: string, values: CardValues) {
    withDeckCards(deckId, (cards) =>
      cards.map((card) => (card.id === cardId ? { ...card, ...values } : card)),
    );
  }

  function deleteCard(deckId: string, cardId: string) {
    withDeckCards(deckId, (cards) => cards.filter((c) => c.id !== cardId));
  }

  function deleteCards(deckId: string, ids: string[]) {
    const idSet = new Set(ids);
    withDeckCards(deckId, (cards) => cards.filter((c) => !idSet.has(c.id)));
  }

  function replaceDeckCards(deckId: string, cards: Card[]) {
    withDeckCards(deckId, () => cards);
  }

  return {
    decks,
    addDeck,
    renameDeck,
    deleteDeck,
    replaceAllDecks,
    addCard,
    updateCard,
    deleteCard,
    deleteCards,
    replaceDeckCards,
  };
}
