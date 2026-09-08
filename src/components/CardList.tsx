import type { Card } from "../types/card";
import { CardListItem } from "./CardListItem";
import styles from "./CardList.module.css";

interface CardListProps {
  cards: Card[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onEdit: (card: Card) => void;
  onDelete: (id: string) => void;
}

export function CardList({
  cards,
  selectedIds,
  onToggleSelect,
  onEdit,
  onDelete,
}: CardListProps) {
  if (cards.length === 0) {
    return (
      <ul className={styles.list}>
        <li>No cards yet.</li>
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
