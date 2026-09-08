import type { Card } from "../types/card";
import styles from "./CardListItem.module.css";

interface CardListItemProps {
  card: Card;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onEdit: (card: Card) => void;
  onDelete: (id: string) => void;
}

export function CardListItem({
  card,
  selected,
  onToggleSelect,
  onEdit,
  onDelete,
}: CardListItemProps) {
  function handleDelete() {
    if (window.confirm(`Delete "${card.term}"?`)) {
      onDelete(card.id);
    }
  }

  return (
    <li className={styles.item}>
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onToggleSelect(card.id)}
        aria-label={`Select ${card.term}`}
      />
      <div className={styles.content}>
        <div className={styles.term}>{card.term}</div>
        <div className={styles.definition}>{card.definition}</div>
      </div>
      <div className={styles.actions}>
        <button type="button" onClick={() => onEdit(card)}>
          Edit
        </button>
        <button type="button" onClick={handleDelete}>
          Delete
        </button>
      </div>
    </li>
  );
}
