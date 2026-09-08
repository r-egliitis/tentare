import { useState } from "react";
import { useDecks } from "./hooks/useDecks";
import { DeckList } from "./components/DeckList";
import { DeckForm } from "./components/DeckForm";
import { DeckView } from "./components/DeckView";
import { ThemeToggle } from "./components/ThemeToggle";
import { Toast } from "./components/Toast";
import type { Deck } from "./types/deck";
import styles from "./App.module.css";

type AppView = { type: "decks" } | { type: "deck"; deckId: string };
type DeckFormMode = { type: "add" } | { type: "edit"; deck: Deck } | null;
type ToastState = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
} | null;

export function App() {
  const {
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
  } = useDecks();
  const [appView, setAppView] = useState<AppView>({ type: "decks" });
  const [deckFormMode, setDeckFormMode] = useState<DeckFormMode>(null);
  const [toast, setToast] = useState<ToastState>(null);

  function handleSaveDeck(name: string) {
    if (deckFormMode?.type === "edit") {
      renameDeck(deckFormMode.deck.id, name);
    } else {
      const newId = addDeck(name);
      setAppView({ type: "deck", deckId: newId });
    }
    setDeckFormMode(null);
  }

  function handleDeleteDeck(id: string) {
    const deck = decks.find((d) => d.id === id);
    if (!deck) return;
    if (
      !window.confirm(
        `Delete quiz "${deck.name}" (${deck.cards.length} card(s))?`,
      )
    ) {
      return;
    }

    const previousDecks = decks;
    deleteDeck(id);
    setToast({
      message: `Deleted quiz "${deck.name}" (${deck.cards.length} card(s)).`,
      actionLabel: "Undo",
      onAction: () => replaceAllDecks(previousDecks),
    });
  }

  if (appView.type === "deck") {
    const deck = decks.find((d) => d.id === appView.deckId);
    if (!deck) {
      // Deck no longer exists (e.g. deleted elsewhere) — adjust state
      // during render (React's recommended pattern for this, per
      // https://react.dev/learn/you-might-not-need-an-effect) rather than
      // an effect: it re-renders immediately with the corrected view
      // instead of committing a throwaway frame first.
      setAppView({ type: "decks" });
      return null;
    }

    return (
      <>
        <div className={styles.header}>
          <h1>Flashcard Quiz Tool</h1>
          <ThemeToggle />
        </div>
        <DeckView
          deck={deck}
          onBack={() => setAppView({ type: "decks" })}
          onAddCard={(values) => addCard(deck.id, values)}
          onUpdateCard={(cardId, values) => updateCard(deck.id, cardId, values)}
          onDeleteCard={(cardId) => deleteCard(deck.id, cardId)}
          onDeleteCards={(ids) => deleteCards(deck.id, ids)}
          onReplaceCards={(cards) => replaceDeckCards(deck.id, cards)}
        />
      </>
    );
  }

  return (
    <>
      <div className={styles.header}>
        <h1>Flashcard Quiz Tool</h1>
        <ThemeToggle />
      </div>

      {deckFormMode ? (
        <DeckForm
          initialDeck={deckFormMode.type === "edit" ? deckFormMode.deck : undefined}
          onSave={handleSaveDeck}
          onCancel={() => setDeckFormMode(null)}
        />
      ) : (
        <div className={styles.actionRow}>
          <button type="button" onClick={() => setDeckFormMode({ type: "add" })}>
            New Quiz
          </button>
        </div>
      )}

      <DeckList
        decks={decks}
        onOpen={(id) => setAppView({ type: "deck", deckId: id })}
        onRename={(deck) => setDeckFormMode({ type: "edit", deck })}
        onDelete={handleDeleteDeck}
      />

      {toast && (
        <Toast
          message={toast.message}
          actionLabel={toast.actionLabel}
          onAction={toast.onAction}
          onDismiss={() => setToast(null)}
        />
      )}
    </>
  );
}
