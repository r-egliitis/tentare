import type { Deck } from "../types/deck";
import styles from "./DeckListItem.module.css";

interface DeckListItemProps {
  deck: Deck;
  onOpen: (id: string) => void;
  onRename: (deck: Deck) => void;
  onDelete: (id: string) => void;
}

export function DeckListItem({
  deck,
  onOpen,
  onRename,
  onDelete,
}: DeckListItemProps) {
  return (
    <li className={styles.item}>
      <button
        type="button"
        className={styles.openButton}
        onClick={() => onOpen(deck.id)}
      >
        <span className={styles.name}>{deck.name}</span>
        <span className={styles.count}>
          {deck.cards.length} card{deck.cards.length === 1 ? "" : "s"}
        </span>
      </button>
      <div className={styles.actions}>
        <button type="button" onClick={() => onRename(deck)}>
          Rename
        </button>
        <button type="button" onClick={() => onDelete(deck.id)}>
          Delete
        </button>
      </div>
    </li>
  );
}
