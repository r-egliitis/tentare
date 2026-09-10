import { useEffect, useState } from "react";
import { normalizeDeck } from "../data/storage";
import { sampleCards } from "../data/sampleCards";
import { supabase } from "../data/supabaseClient";
import type { Card, DistractorMode } from "../types/card";
import type { Deck, QuizSettings } from "../types/deck";
import { DEFAULT_QUIZ_SETTINGS } from "../types/deck";

export interface CardValues {
  term: string;
  definition: string;
  distractorMode: DistractorMode;
  customWrongAnswers: string[];
  numChoices: number;
}

export interface DeckDetails {
  name: string;
  bio: string;
}

// Single source of truth for one signed-in user's decks and cards: loads
// from Supabase on mount, and every mutator updates local state immediately
// (optimistic) then fires the matching Supabase call in the background,
// logging failures rather than rolling back — this keeps every mutator
// synchronous, so callers (App.tsx) don't need to change to handle promises.
export function useDecks(userId: string) {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("decks")
      .select()
      .eq("user_id", userId)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error("Failed to load quizzes from Supabase.", error);
          setDecks([]);
        } else {
          setDecks(
            (data ?? [])
              .map(normalizeDeck)
              .filter((deck): deck is Deck => deck !== null),
          );
        }
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  function addDeck(values: DeckDetails): string {
    const id = crypto.randomUUID();
    const newDeck: Deck = { id, ...values, cards: [], settings: DEFAULT_QUIZ_SETTINGS };
    setDecks([...decks, newDeck]);
    void supabase
      .from("decks")
      .insert({ id, name: values.name, bio: values.bio, cards: [], settings: DEFAULT_QUIZ_SETTINGS })
      .then(({ error }) => {
        if (error) console.error("Failed to save new quiz.", error);
      });
    return id;
  }

  function updateDeckDetails(id: string, values: DeckDetails) {
    setDecks(decks.map((deck) => (deck.id === id ? { ...deck, ...values } : deck)));
    void supabase
      .from("decks")
      .update({ name: values.name, bio: values.bio, updated_at: new Date().toISOString() })
      .eq("id", id)
      .then(({ error }) => {
        if (error) console.error("Failed to update quiz.", error);
      });
  }

  function updateDeckSettings(id: string, settings: QuizSettings) {
    setDecks(decks.map((deck) => (deck.id === id ? { ...deck, settings } : deck)));
    void supabase
      .from("decks")
      .update({ settings, updated_at: new Date().toISOString() })
      .eq("id", id)
      .then(({ error }) => {
        if (error) console.error("Failed to update quiz settings.", error);
      });
  }

  function deleteDeck(id: string) {
    setDecks(decks.filter((deck) => deck.id !== id));
    void supabase
      .from("decks")
      .delete()
      .eq("id", id)
      .then(({ error }) => {
        if (error) console.error("Failed to delete quiz.", error);
      });
  }

  // Only ever called by App.tsx's undo-delete-quiz toast, restoring a
  // previous decks array. Diffs against current state so it only re-inserts
  // what was actually removed and removes what was actually added, instead
  // of blindly rewriting every row.
  function replaceAllDecks(newDecks: Deck[]) {
    const currentIds = new Set(decks.map((d) => d.id));
    const newIds = new Set(newDecks.map((d) => d.id));
    const toRestore = newDecks.filter((d) => !currentIds.has(d.id));
    const toRemove = decks.filter((d) => !newIds.has(d.id));

    setDecks(newDecks);

    if (toRestore.length > 0) {
      void supabase
        .from("decks")
        .insert(
          toRestore.map((d) => ({
            id: d.id,
            name: d.name,
            bio: d.bio,
            cards: d.cards,
            settings: d.settings,
          })),
        )
        .then(({ error }) => {
          if (error) console.error("Failed to restore quiz(zes).", error);
        });
    }
    if (toRemove.length > 0) {
      void supabase
        .from("decks")
        .delete()
        .in(
          "id",
          toRemove.map((d) => d.id),
        )
        .then(({ error }) => {
          if (error) console.error("Failed to remove quiz(zes).", error);
        });
    }
  }

  function withDeckCards(deckId: string, update: (cards: Card[]) => Card[]) {
    const deck = decks.find((d) => d.id === deckId);
    if (!deck) return;
    const nextCards = update(deck.cards);
    setDecks(decks.map((d) => (d.id === deckId ? { ...d, cards: nextCards } : d)));
    void supabase
      .from("decks")
      .update({ cards: nextCards, updated_at: new Date().toISOString() })
      .eq("id", deckId)
      .then(({ error }) => {
        if (error) console.error("Failed to save quiz cards.", error);
      });
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

  // One-time starter deck for a brand new account with nothing to import —
  // mirrors storage.ts's old first-run localStorage seed.
  function addSampleDeck() {
    const id = crypto.randomUUID();
    const newDeck: Deck = {
      id,
      name: "My Flashcards",
      bio: "",
      cards: sampleCards,
      settings: DEFAULT_QUIZ_SETTINGS,
    };
    setDecks([...decks, newDeck]);
    void supabase
      .from("decks")
      .insert({
        id,
        name: newDeck.name,
        bio: newDeck.bio,
        cards: newDeck.cards,
        settings: newDeck.settings,
      })
      .then(({ error }) => {
        if (error) console.error("Failed to create starter quiz.", error);
      });
  }

  // One-time import of this device's pre-login localStorage decks, called
  // from the accept action of the import-offer toast. Awaited (unlike the
  // mutators above) since it's triggered once from an explicit click, not a
  // hot synchronous path.
  async function importLocalDecks(localDecks: Deck[]) {
    const rows = localDecks.map((deck) => ({
      id: crypto.randomUUID(),
      name: deck.name,
      bio: deck.bio,
      cards: deck.cards,
      settings: deck.settings,
    }));
    const { data, error } = await supabase.from("decks").insert(rows).select();
    if (error || !data) {
      console.error("Failed to import local quizzes.", error);
      return;
    }
    const imported = data.map(normalizeDeck).filter((d): d is Deck => d !== null);
    setDecks((prev) => [...prev, ...imported]);
  }

  return {
    decks,
    loading,
    addDeck,
    updateDeckDetails,
    updateDeckSettings,
    deleteDeck,
    replaceAllDecks,
    addCard,
    updateCard,
    deleteCard,
    deleteCards,
    replaceDeckCards,
    addSampleDeck,
    importLocalDecks,
  };
}
