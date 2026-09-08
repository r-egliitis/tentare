import { useState } from "react";
import type { FormEvent } from "react";
import type { Card, DistractorMode } from "../types/card";
import type { CardValues } from "../hooks/useCards";
import styles from "./CardForm.module.css";

interface CardFormProps {
  /** Present = editing this card; absent = adding a new one. */
  initialCard?: Card;
  /** Other cards' terms, for a non-blocking duplicate warning. */
  existingTerms: string[];
  onSave: (values: CardValues) => void;
  onCancel: () => void;
}

const MIN_CHOICES = 2;
const MAX_CHOICES = 8;

export function CardForm({
  initialCard,
  existingTerms,
  onSave,
  onCancel,
}: CardFormProps) {
  const [term, setTerm] = useState(initialCard?.term ?? "");
  const [definition, setDefinition] = useState(initialCard?.definition ?? "");
  const [distractorMode, setDistractorMode] = useState<DistractorMode>(
    initialCard?.distractorMode ?? "auto",
  );
  const [numChoices, setNumChoices] = useState(initialCard?.numChoices ?? 4);
  const [customWrongAnswers, setCustomWrongAnswers] = useState<string[]>(
    initialCard?.customWrongAnswers ?? [],
  );
  const [newWrongAnswer, setNewWrongAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isDuplicateTerm = existingTerms.some(
    (t) => t.toLowerCase() === term.trim().toLowerCase(),
  );

  function handleAddWrongAnswer() {
    const trimmed = newWrongAnswer.trim();
    if (!trimmed) return;
    setCustomWrongAnswers((prev) => [...prev, trimmed]);
    setNewWrongAnswer("");
  }

  function handleRemoveWrongAnswer(index: number) {
    setCustomWrongAnswers((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const trimmedTerm = term.trim();
    const trimmedDefinition = definition.trim();
    if (!trimmedTerm || !trimmedDefinition) {
      setError("Both term and definition are required.");
      return;
    }

    const clampedChoices = Math.min(
      MAX_CHOICES,
      Math.max(MIN_CHOICES, Math.round(numChoices) || 4),
    );

    onSave({
      term: trimmedTerm,
      definition: trimmedDefinition,
      distractorMode,
      customWrongAnswers,
      numChoices: clampedChoices,
    });
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
        {isDuplicateTerm && (
          <p className={styles.warning}>
            A card with this term already exists.
          </p>
        )}
      </div>
      <div className={styles.field}>
        <label htmlFor="card-definition">Definition</label>
        <textarea
          id="card-definition"
          value={definition}
          onChange={(e) => setDefinition(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <span className={styles.groupLabel}>Quiz wrong answers</span>
        <div className={styles.radioRow}>
          <label>
            <input
              type="radio"
              name="distractorMode"
              checked={distractorMode === "auto"}
              onChange={() => setDistractorMode("auto")}
            />
            Auto (pull from other cards)
          </label>
          <label>
            <input
              type="radio"
              name="distractorMode"
              checked={distractorMode === "custom"}
              onChange={() => setDistractorMode("custom")}
            />
            Custom
          </label>
        </div>
      </div>

      {distractorMode === "custom" && (
        <div className={styles.field}>
          <label>Custom wrong answers</label>
          {customWrongAnswers.length > 0 && (
            <ul className={styles.wrongAnswerList}>
              {customWrongAnswers.map((answer, index) => (
                <li key={index}>
                  <span>{answer}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveWrongAnswer(index)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className={styles.addWrongAnswerRow}>
            <input
              type="text"
              value={newWrongAnswer}
              placeholder="Add a wrong answer"
              onChange={(e) => setNewWrongAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddWrongAnswer();
                }
              }}
            />
            <button type="button" onClick={handleAddWrongAnswer}>
              Add
            </button>
          </div>
        </div>
      )}

      <div className={styles.field}>
        <label htmlFor="card-num-choices">
          Number of choices ({MIN_CHOICES}–{MAX_CHOICES})
        </label>
        <input
          id="card-num-choices"
          type="number"
          min={MIN_CHOICES}
          max={MAX_CHOICES}
          value={numChoices}
          onChange={(e) => setNumChoices(Number(e.target.value))}
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
