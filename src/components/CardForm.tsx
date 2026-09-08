import { useState } from "react";
import type { FormEvent } from "react";
import type { Card } from "../types/card";
import styles from "./CardForm.module.css";

interface CardFormProps {
  /** Present = editing this card; absent = adding a new one. */
  initialCard?: Card;
  onSave: (values: { term: string; definition: string }) => void;
  onCancel: () => void;
}

export function CardForm({ initialCard, onSave, onCancel }: CardFormProps) {
  const [term, setTerm] = useState(initialCard?.term ?? "");
  const [definition, setDefinition] = useState(initialCard?.definition ?? "");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const trimmedTerm = term.trim();
    const trimmedDefinition = definition.trim();
    if (!trimmedTerm || !trimmedDefinition) {
      setError("Both term and definition are required.");
      return;
    }

    onSave({ term: trimmedTerm, definition: trimmedDefinition });
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label htmlFor="card-term">Term</label>
        <input
          id="card-term"
          type="text"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="card-definition">Definition</label>
        <textarea
          id="card-definition"
          value={definition}
          onChange={(e) => setDefinition(e.target.value)}
        />
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.actions}>
        <button type="submit">{initialCard ? "Save" : "Add Card"}</button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
