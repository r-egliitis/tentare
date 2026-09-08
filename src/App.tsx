import { useMemo, useState } from "react";
import { useCards } from "./hooks/useCards";
import type { CardValues } from "./hooks/useCards";
import { CardList } from "./components/CardList";
import { CardForm } from "./components/CardForm";
import { CardListControls } from "./components/CardListControls";
import type { SortOrder } from "./components/CardListControls";
import { ExportImportControls } from "./components/ExportImportControls";
import { ThemeToggle } from "./components/ThemeToggle";
import { Toast } from "./components/Toast";
import { QuizView } from "./components/quiz/QuizView";
import type { Card } from "./types/card";
import styles from "./App.module.css";

type FormMode = { type: "add" } | { type: "edit"; card: Card } | null;
type View = "list" | "quiz";
type ToastState = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
} | null;

export function App() {
  const { cards, addCard, updateCard, deleteCard, deleteCards, replaceCards } =
    useCards();
  const [formMode, setFormMode] = useState<FormMode>(null);
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
      updateCard(formMode.card.id, values);
    } else {
      addCard(values);
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

  function handleDeleteCard(id: string) {
    const card = cards.find((c) => c.id === id);
    if (!card) return;

    const previousCards = cards;
    deleteCard(id);
    setToast({
      message: `Deleted "${card.term}".`,
      actionLabel: "Undo",
      onAction: () => replaceCards(previousCards),
    });
  }

  function handleDeleteSelected() {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    if (!window.confirm(`Delete ${ids.length} selected card(s)?`)) return;

    const previousCards = cards;
    deleteCards(ids);
    setSelectedIds(new Set());
    setToast({
      message: `Deleted ${ids.length} card(s).`,
      actionLabel: "Undo",
      onAction: () => replaceCards(previousCards),
    });
  }

  function handleImport(imported: Card[]) {
    replaceCards(imported);
    setSelectedIds(new Set());
  }

  if (view === "quiz") {
    return (
      <>
        <div className={styles.header}>
          <h1>Flashcard Quiz Tool</h1>
          <ThemeToggle />
        </div>
        <QuizView cards={cards} onExit={() => setView("list")} />
      </>
    );
  }

  return (
    <>
      <div className={styles.header}>
        <h1>Flashcard Quiz Tool</h1>
        <ThemeToggle />
      </div>

      {formMode ? (
        <CardForm
          initialCard={formMode.type === "edit" ? formMode.card : undefined}
          existingTerms={existingTerms}
          onSave={handleSave}
          onCancel={() => setFormMode(null)}
        />
      ) : (
        <div className={styles.actionRow}>
          <button type="button" onClick={() => setFormMode({ type: "add" })}>
            Add Card
          </button>
          <button
            type="button"
            onClick={() => setView("quiz")}
            disabled={cards.length < 2}
          >
            Start Quiz
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
        onEdit={(card) => setFormMode({ type: "edit", card })}
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
