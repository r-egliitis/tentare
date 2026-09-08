import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import type { Card } from "../types/card";
import { parseImportedCards } from "../utils/validateImportedCards";
import styles from "./ExportImportControls.module.css";

interface ExportImportControlsProps {
  cards: Card[];
  onImport: (cards: Card[]) => void;
}

export function ExportImportControls({
  cards,
  onImport,
}: ExportImportControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);

  function handleExport() {
    const blob = new Blob([JSON.stringify(cards, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const date = new Date().toISOString().slice(0, 10);

    const link = document.createElement("a");
    link.href = url;
    link.download = `flashcards-export-${date}.json`;
    link.click();

    URL.revokeObjectURL(url);
  }

  function handleImportClick() {
    setImportError(null);
    fileInputRef.current?.click();
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Reset so selecting the same filename again still fires onChange.
    event.target.value = "";
    if (!file) return;

    try {
      const text = await file.text();
      const parsed: unknown = JSON.parse(text);
      const importedCards = parseImportedCards(parsed);

      const confirmed = window.confirm(
        `Replace your current ${cards.length} card(s) with ${importedCards.length} card(s) from this file?`,
      );
      if (confirmed) {
        onImport(importedCards);
        setImportError(null);
      }
    } catch (err) {
      setImportError(
        err instanceof Error ? err.message : "Failed to import file.",
      );
    }
  }

  return (
    <div className={styles.controls}>
      <button type="button" onClick={handleExport}>
        Export
      </button>
      <button type="button" onClick={handleImportClick}>
        Import
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        onChange={handleFileChange}
        hidden
      />
      {importError && <p className={styles.error}>{importError}</p>}
    </div>
  );
}
