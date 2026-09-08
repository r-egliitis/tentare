import { useState } from "react";
import type { FormEvent } from "react";
import type { Deck } from "../types/deck";
import styles from "./DeckForm.module.css";

interface DeckFormProps {
  /** Present = renaming this deck; absent = creating a new one. */
  initialDeck?: Deck;
  onSave: (name: string) => void;
  onCancel: () => void;
}

export function DeckForm({ initialDeck, onSave, onCancel }: DeckFormProps) {
  const [name, setName] = useState(initialDeck?.name ?? "");
  const [error, setError] = useState<string | null>(null);

  const isDirty = name !== (initialDeck?.name ?? "");

  function handleCancel() {
    if (isDirty && !window.confirm("Discard your changes?")) return;
    onCancel();
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("A quiz name is required.");
      return;
    }

    onSave(trimmedName);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label htmlFor="deck-name">Quiz name</label>
        <input
          id="deck-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.actions}>
        <button type="submit">{initialDeck ? "Save" : "Create Quiz"}</button>
        <button type="button" onClick={handleCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
