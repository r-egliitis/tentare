import type { Card } from "../../types/card";
import styles from "./QuizSummary.module.css";

interface QuizSummaryProps {
  score: number;
  total: number;
  missedCards: Card[];
  onRestart: () => void;
  onRetryMissed?: () => void;
  onExit: () => void;
}

export function QuizSummary({
  score,
  total,
  missedCards,
  onRestart,
  onRetryMissed,
  onExit,
}: QuizSummaryProps) {
  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <div className={styles.summary}>
      <h2>Quiz complete</h2>
      <p className={styles.score}>
        {score} / {total} correct ({accuracy}%)
      </p>
      <div className={styles.actions}>
        <button type="button" onClick={onRestart}>
          Restart
        </button>
        {onRetryMissed && (
          <button type="button" onClick={onRetryMissed}>
            Retry Missed ({missedCards.length})
          </button>
        )}
        <button type="button" onClick={onExit}>
          Back to Cards
        </button>
      </div>

      {missedCards.length > 0 && (
        <div className={styles.missedReview}>
          <h3>Missed cards</h3>
          <ul>
            {missedCards.map((card) => (
              <li key={card.id}>
                <strong>{card.term}</strong> — {card.definition}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
