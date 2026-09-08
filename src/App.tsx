import { useState } from "react";
import { useCards } from "./hooks/useCards";
import { CardList } from "./components/CardList";
import { CardForm } from "./components/CardForm";
import { ExportImportControls } from "./components/ExportImportControls";
import { ThemeToggle } from "./components/ThemeToggle";
import { QuizView } from "./components/quiz/QuizView";
import type { Card } from "./types/card";
import styles from "./App.module.css";

type FormMode = { type: "add" } | { type: "edit"; card: Card } | null;
type View = "list" | "quiz";

export function App() {
  const { cards, addCard, updateCard, deleteCard, replaceCards } = useCards();
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [view, setView] = useState<View>("list");

  function handleSave(values: { term: string; definition: string }) {
    if (formMode?.type === "edit") {
      updateCard(formMode.card.id, values);
    } else {
      addCard(values);
    }
    setFormMode(null);
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

      <ExportImportControls cards={cards} onImport={replaceCards} />

      <CardList
        cards={cards}
        onEdit={(card) => setFormMode({ type: "edit", card })}
        onDelete={deleteCard}
      />
    </>
  );
}
