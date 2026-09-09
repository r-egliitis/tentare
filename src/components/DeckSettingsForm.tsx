import { useState } from "react";
import type { FormEvent } from "react";
import type { QuizSettings, QuizStyle, PromptDirection } from "../types/deck";
import styles from "./DeckSettingsForm.module.css";

interface DeckSettingsFormProps {
  settings: QuizSettings;
  onSave: (settings: QuizSettings) => void;
  onCancel: () => void;
}

export function DeckSettingsForm({
  settings,
  onSave,
  onCancel,
}: DeckSettingsFormProps) {
  const [style, setStyle] = useState<QuizStyle>(settings.style);
  const [direction, setDirection] = useState<PromptDirection>(
    settings.direction,
  );

  const isDirty = style !== settings.style || direction !== settings.direction;

  function handleCancel() {
    if (isDirty && !window.confirm("Discard your changes?")) return;
    onCancel();
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSave({ style, direction });
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <span className={styles.groupLabel}>Quiz style</span>
        <div className={styles.radioRow}>
          <label>
            <input
              type="radio"
              name="quizStyle"
              checked={style === "whole"}
              onChange={() => setStyle("whole")}
            />
            Whole test
          </label>
          <label>
            <input
              type="radio"
              name="quizStyle"
              checked={style === "endless"}
              onChange={() => setStyle("endless")}
            />
            Endless
          </label>
          <label>
            <input
              type="radio"
              name="quizStyle"
              checked={style === "untilCorrect"}
              onChange={() => setStyle("untilCorrect")}
            />
            Until all answered correct
          </label>
        </div>
      </div>

      <div className={styles.field}>
        <span className={styles.groupLabel}>Prompt direction</span>
        <div className={styles.radioRow}>
          <label>
            <input
              type="radio"
              name="promptDirection"
              checked={direction === "term"}
              onChange={() => setDirection("term")}
            />
            Term only
          </label>
          <label>
            <input
              type="radio"
              name="promptDirection"
              checked={direction === "definition"}
              onChange={() => setDirection("definition")}
            />
            Definition only
          </label>
          <label>
            <input
              type="radio"
              name="promptDirection"
              checked={direction === "mix"}
              onChange={() => setDirection("mix")}
            />
            Mix
          </label>
        </div>
      </div>

      <div className={styles.actions}>
        <button type="submit">Save</button>
        <button type="button" onClick={handleCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
