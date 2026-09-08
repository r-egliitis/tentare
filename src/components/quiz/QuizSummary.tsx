import styles from "./QuizSummary.module.css";

interface QuizSummaryProps {
  score: number;
  total: number;
  onRestart: () => void;
  onExit: () => void;
}

export function QuizSummary({
  score,
  total,
  onRestart,
  onExit,
}: QuizSummaryProps) {
  return (
    <div className={styles.summary}>
      <h2>Quiz complete</h2>
      <p className={styles.score}>
        {score} / {total} correct
      </p>
      <div className={styles.actions}>
        <button type="button" onClick={onRestart}>
          Restart
        </button>
        <button type="button" onClick={onExit}>
          Back to Cards
        </button>
      </div>
    </div>
  );
}
