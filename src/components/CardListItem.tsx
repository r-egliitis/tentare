import type { Card } from "../types/card";
import styles from "./CardListItem.module.css";

interface CardListItemProps {
  card: Card;
}

export function CardListItem({ card }: CardListItemProps) {
  return (
    <li className={styles.item}>
      <div className={styles.term}>{card.term}</div>
      <div className={styles.definition}>{card.definition}</div>
    </li>
  );
}
