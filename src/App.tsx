import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { useAuth } from "./hooks/useAuth";
import { useDecks } from "./hooks/useDecks";
import type { DeckDetails } from "./hooks/useDecks";
import { peekLocalDecks } from "./data/storage";
import { AuthForm } from "./components/AuthForm";
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
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className={styles.header}>
        <h1>Flashcard Quiz Tool</h1>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className={styles.header}>
          <h1>Flashcard Quiz Tool</h1>
          <ThemeToggle />
        </div>
        <AuthForm />
      </>
    );
  }

  return <AuthenticatedApp user={user} onSignOut={signOut} />;
}

interface AuthenticatedAppProps {
  user: User;
  onSignOut: () => void;
}

function AuthenticatedApp({ user, onSignOut }: AuthenticatedAppProps) {
  const {
    decks,
    loading: decksLoading,
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
  } = useDecks(user.id);
  const [appView, setAppView] = useState<AppView>({ type: "decks" });
  const [deckFormMode, setDeckFormMode] = useState<DeckFormMode>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [importOffer, setImportOffer] = useState<Deck[] | null>(null);

  // One-time "empty account" welcome: once we know for sure this account has
  // no quizzes yet, either offer to import this device's pre-login
  // localStorage decks, or seed a starter deck so signup isn't a blank page.
  // Gated by a per-user localStorage flag so it's only ever decided once.
  useEffect(() => {
    if (decksLoading || decks.length > 0) return;
    const offeredKey = `flashcard-quiz-tool:import-offered:${user.id}`;
    if (localStorage.getItem(offeredKey)) return;
    localStorage.setItem(offeredKey, "1");

    const localDecks = peekLocalDecks();
    if (localDecks) {
      setImportOffer(localDecks);
    } else {
      addSampleDeck();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decksLoading, decks.length, user.id]);

  function handleSaveDeck(values: DeckDetails) {
    if (deckFormMode?.type === "edit") {
      updateDeckDetails(deckFormMode.deck.id, values);
    } else {
      const newId = addDeck(values);
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
          onUpdateSettings={(settings) => updateDeckSettings(deck.id, settings)}
        />
      </>
    );
  }

  return (
    <>
      <div className={styles.header}>
        <h1>Flashcard Quiz Tool</h1>
        <div className={styles.actionRow}>
          <ThemeToggle />
          <button type="button" onClick={onSignOut}>
            Sign out
          </button>
        </div>
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

      {importOffer && (
        <Toast
          message={`Import ${importOffer.length} quiz${importOffer.length === 1 ? "" : "zes"} from this device?`}
          actionLabel="Import"
          durationMs={120000}
          onAction={() => {
            importLocalDecks(importOffer);
            localStorage.removeItem("flashcard-quiz-tool:decks");
            setImportOffer(null);
          }}
          onDismiss={() => setImportOffer(null)}
        />
      )}

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
