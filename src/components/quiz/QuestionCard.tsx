import type { QuizQuestion } from "../../utils/quizGenerator";
import styles from "./QuestionCard.module.css";

interface QuestionCardProps {
  question: QuizQuestion;
  selected: string | null;
  isAnswered: boolean;
  onSelectAnswer: (choice: string) => void;
}

export function QuestionCard({
  question,
  selected,
  isAnswered,
  onSelectAnswer,
}: QuestionCardProps) {
  const promptLabel =
    question.promptSide === "term"
      ? "Which definition matches:"
      : "Which term matches:";

  return (
    <div className={styles.card}>
      <p className={styles.promptLabel}>{promptLabel}</p>
      <p className={styles.promptText}>{question.promptText}</p>

      <ul className={styles.choices}>
        {question.choices.map((choice) => {
          let stateClass = "";
          if (isAnswered) {
            if (choice === question.correctAnswer) {
              stateClass = styles.correct;
            } else if (choice === selected) {
              stateClass = styles.incorrect;
            }
          }

          return (
            <li key={choice}>
              <button
                type="button"
                className={`${styles.choice} ${stateClass}`}
                disabled={isAnswered}
                onClick={() => onSelectAnswer(choice)}
              >
                {choice}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
