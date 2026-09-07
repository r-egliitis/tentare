import type { Card } from "../types/card";
import { CardListItem } from "./CardListItem";
import styles from "./CardList.module.css";

interface CardListProps {
  cards: Card[];
}

export function CardList({ cards }: CardListProps) {
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
        <CardListItem key={card.id} card={card} />
      ))}
    </ul>
  );
}
