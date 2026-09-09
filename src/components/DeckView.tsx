import { useMemo, useState } from "react";
import type { Card } from "../types/card";
import type { Deck, QuizSettings } from "../types/deck";
import type { CardValues } from "../hooks/useDecks";
import { CardList } from "./CardList";
import { CardForm } from "./CardForm";
import { CardListControls } from "./CardListControls";
import type { SortOrder } from "./CardListControls";
import { DeckSettingsForm } from "./DeckSettingsForm";
import { ExportImportControls } from "./ExportImportControls";
import { Toast } from "./Toast";
import { QuizView } from "./quiz/QuizView";
import styles from "../App.module.css";

interface DeckViewProps {
  deck: Deck;
  onBack: () => void;
  onAddCard: (values: CardValues) => void;
  onUpdateCard: (cardId: string, values: CardValues) => void;
  onDeleteCard: (cardId: string) => void;
  onDeleteCards: (ids: string[]) => void;
  onReplaceCards: (cards: Card[]) => void;
  onUpdateSettings: (settings: QuizSettings) => void;
}

type FormMode = { type: "add" } | { type: "edit"; card: Card } | null;
type View = "list" | "quiz";
type ToastState = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
} | null;

export function DeckView({
  deck,
  onBack,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  onDeleteCards,
  onReplaceCards,
  onUpdateSettings,
}: DeckViewProps) {
  const cards = deck.cards;
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [view, setView] = useState<View>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("added");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<ToastState>(null);

  const visibleCards = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = query
      ? cards.filter(
          (card) =>
            card.term.toLowerCase().includes(query) ||
            card.definition.toLowerCase().includes(query),
        )
      : cards;

    if (sortOrder === "added") return filtered;
    const sorted = [...filtered].sort((a, b) => a.term.localeCompare(b.term));
    return sortOrder === "az" ? sorted : sorted.reverse();
  }, [cards, searchQuery, sortOrder]);

  const existingTerms = useMemo(
    () =>
      cards
        .filter((c) => !(formMode?.type === "edit" && c.id === formMode.card.id))
        .map((c) => c.term),
    [cards, formMode],
  );

  function handleSave(values: CardValues) {
    if (formMode?.type === "edit") {
      onUpdateCard(formMode.card.id, values);
    } else {
      onAddCard(values);
    }
    setFormMode(null);
  }

  function handleToggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSelectAll() {
    setSelectedIds(new Set(visibleCards.map((c) => c.id)));
  }

  function handleDeselectAll() {
    setSelectedIds(new Set());
  }

  function handleDeleteCard(id: string) {
    const card = cards.find((c) => c.id === id);
    if (!card) return;

    const previousCards = cards;
    onDeleteCard(id);
    setToast({
      message: `Deleted "${card.term}".`,
      actionLabel: "Undo",
      onAction: () => onReplaceCards(previousCards),
    });
  }

  function handleDeleteSelected() {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    if (!window.confirm(`Delete ${ids.length} selected card(s)?`)) return;

    const previousCards = cards;
    onDeleteCards(ids);
    setSelectedIds(new Set());
    setToast({
      message: `Deleted ${ids.length} card(s).`,
      actionLabel: "Undo",
      onAction: () => onReplaceCards(previousCards),
    });
  }

  function handleImport(imported: Card[]) {
    onReplaceCards(imported);
    setSelectedIds(new Set());
  }

  if (view === "quiz") {
    return (
      <>
        <div className={styles.header}>
          <h2>{deck.name}</h2>
        </div>
        <QuizView
          cards={cards}
          settings={deck.settings}
          onExit={() => setView("list")}
        />
      </>
    );
  }

  return (
    <>
      <div className={styles.header}>
        <div>
          <h2>{deck.name}</h2>
          {deck.bio && <p className={styles.deckBio}>{deck.bio}</p>}
        </div>
        <button type="button" onClick={onBack}>
          ← Back to Quizzes
        </button>
      </div>

      {formMode ? (
        <CardForm
          initialCard={formMode.type === "edit" ? formMode.card : undefined}
          existingTerms={existingTerms}
          onSave={handleSave}
          onCancel={() => setFormMode(null)}
        />
      ) : showSettings ? (
        <DeckSettingsForm
          settings={deck.settings}
          onSave={(settings) => {
            onUpdateSettings(settings);
            setShowSettings(false);
          }}
          onCancel={() => setShowSettings(false)}
        />
      ) : (
        <div className={styles.actionRow}>
          <button
            type="button"
            onClick={() => {
              setFormMode({ type: "add" });
              setShowSettings(false);
            }}
          >
            Add Card
          </button>
          <button
            type="button"
            onClick={() => setView("quiz")}
            disabled={cards.length < 2}
          >
            Start Quiz
          </button>
          <button
            type="button"
            onClick={() => {
              setShowSettings(true);
              setFormMode(null);
            }}
          >
            Settings
          </button>
        </div>
      )}
      {cards.length < 2 && <p>Add at least 2 cards to start a quiz.</p>}

      <ExportImportControls cards={cards} onImport={handleImport} />

      <CardListControls
        query={searchQuery}
        onQueryChange={setSearchQuery}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
      />

      {selectedIds.size > 0 && (
        <div className={styles.actionRow}>
          <button type="button" onClick={handleSelectAll}>
            Select All
          </button>
          <button type="button" onClick={handleDeselectAll}>
            Deselect All
          </button>
          <button type="button" onClick={handleDeleteSelected}>
            Delete Selected ({selectedIds.size})
          </button>
        </div>
      )}

      <CardList
        cards={visibleCards}
        isFiltered={searchQuery.trim().length > 0}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onEdit={(card) => {
          setFormMode({ type: "edit", card });
          setShowSettings(false);
        }}
        onDelete={handleDeleteCard}
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
