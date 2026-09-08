import type { Card } from "../types/card";
import { CardListItem } from "./CardListItem";
import styles from "./CardList.module.css";

interface CardListProps {
  cards: Card[];
  /** Whether a search query is currently filtering `cards`. */
  isFiltered: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onEdit: (card: Card) => void;
  onDelete: (id: string) => void;
}

export function CardList({
  cards,
  isFiltered,
  selectedIds,
  onToggleSelect,
  onEdit,
  onDelete,
}: CardListProps) {
  if (cards.length === 0) {
    return (
      <ul className={styles.list}>
        <li>
          {isFiltered
            ? "No cards match your search."
            : 'No cards yet — click "Add Card" to create your first one.'}
        </li>
      </ul>
    );
  }

  return (
    <ul className={styles.list}>
      {cards.map((card) => (
        <CardListItem
          key={card.id}
          card={card}
          selected={selectedIds.has(card.id)}
          onToggleSelect={onToggleSelect}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
