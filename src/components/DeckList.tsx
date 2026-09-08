import type { Deck } from "../types/deck";
import { DeckListItem } from "./DeckListItem";
import styles from "./DeckList.module.css";

interface DeckListProps {
  decks: Deck[];
  onOpen: (id: string) => void;
  onRename: (deck: Deck) => void;
  onDelete: (id: string) => void;
}

export function DeckList({ decks, onOpen, onRename, onDelete }: DeckListProps) {
  if (decks.length === 0) {
    return (
      <ul className={styles.list}>
        <li>No quizzes yet — click "New Quiz" to create one.</li>
      </ul>
    );
  }

  return (
    <ul className={styles.list}>
      {decks.map((deck) => (
        <DeckListItem
          key={deck.id}
          deck={deck}
          onOpen={onOpen}
          onRename={onRename}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
