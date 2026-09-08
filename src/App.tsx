import { useState } from "react";
import { useCards } from "./hooks/useCards";
import { CardList } from "./components/CardList";
import { CardForm } from "./components/CardForm";
import { ExportImportControls } from "./components/ExportImportControls";
import type { Card } from "./types/card";

type FormMode = { type: "add" } | { type: "edit"; card: Card } | null;

export function App() {
  const { cards, addCard, updateCard, deleteCard, replaceCards } = useCards();
  const [formMode, setFormMode] = useState<FormMode>(null);

  function handleSave(values: { term: string; definition: string }) {
    if (formMode?.type === "edit") {
      updateCard(formMode.card.id, values);
    } else {
      addCard(values);
    }
    setFormMode(null);
  }

  return (
    <>
      <h1>Flashcard Quiz Tool</h1>

      {formMode ? (
        <CardForm
          initialCard={formMode.type === "edit" ? formMode.card : undefined}
          onSave={handleSave}
          onCancel={() => setFormMode(null)}
        />
      ) : (
        <button type="button" onClick={() => setFormMode({ type: "add" })}>
          Add Card
        </button>
      )}

      <ExportImportControls cards={cards} onImport={replaceCards} />

      <CardList
        cards={cards}
        onEdit={(card) => setFormMode({ type: "edit", card })}
        onDelete={deleteCard}
      />
    </>
  );
}
