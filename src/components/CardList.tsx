import type { Card } from "../types/card";
import { CardListItem } from "./CardListItem";
import styles from "./CardList.module.css";

interface CardListProps {
  cards: Card[];
  onEdit: (card: Card) => void;
  onDelete: (id: string) => void;
}

export function CardList({ cards, onEdit, onDelete }: CardListProps) {
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
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
