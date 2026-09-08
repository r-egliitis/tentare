import { useEffect, useMemo, useState } from "react";
import type { Card } from "../../types/card";
import { buildQuizOrder, generateQuestion } from "../../utils/quizGenerator";
import { QuestionCard } from "./QuestionCard";
import { QuizSummary } from "./QuizSummary";
import styles from "./QuizView.module.css";

interface QuizViewProps {
  cards: Card[];
  onExit: () => void;
}

export function QuizView({ cards, onExit }: QuizViewProps) {
  const [quizOrder, setQuizOrder] = useState<Card[]>(() =>
    buildQuizOrder(cards),
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [missedCards, setMissedCards] = useState<Card[]>([]);
  const [sessionComplete, setSessionComplete] = useState(false);

  // Regenerated fresh each question (not just picked once) so distractors
  // aren't stale if this component ever re-renders for other reasons.
  const currentQuestion = useMemo(
    () => generateQuestion(quizOrder[currentIndex], cards),
    [quizOrder, currentIndex, cards],
  );

  function handleSelectAnswer(choice: string) {
    if (isAnswered) return;
    setSelectedAnswer(choice);
    setIsAnswered(true);
    const isCorrect = choice === currentQuestion.correctAnswer;
    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
    if (!isCorrect) {
      setMissedCards((prev) => [...prev, currentQuestion.card]);
    }
  }

  function handleNext() {
    if (currentIndex + 1 >= quizOrder.length) {
      setSessionComplete(true);
      return;
    }
    setCurrentIndex((i) => i + 1);
    setSelectedAnswer(null);
    setIsAnswered(false);
  }

  function handleRestart() {
    setQuizOrder(buildQuizOrder(cards));
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore({ correct: 0, total: 0 });
    setMissedCards([]);
    setSessionComplete(false);
  }

  function handleRetryMissed() {
    setQuizOrder(buildQuizOrder(missedCards));
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore({ correct: 0, total: 0 });
    setMissedCards([]);
    setSessionComplete(false);
  }

  // Keyboard shortcuts: 1-9 pick a choice before answering, Enter/Space
  // advances once answered. Skipped once the session is complete (the
  // summary screen has its own buttons, no shortcuts needed there).
  useEffect(() => {
    if (sessionComplete) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (!isAnswered) {
        const digit = Number(event.key);
        if (
          Number.isInteger(digit) &&
          digit >= 1 &&
          digit <= currentQuestion.choices.length
        ) {
          handleSelectAnswer(currentQuestion.choices[digit - 1]);
        }
      } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleNext();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  if (sessionComplete) {
    return (
      <QuizSummary
        score={score.correct}
        total={score.total}
        missedCards={missedCards}
        onRestart={handleRestart}
        onRetryMissed={
          missedCards.length > 0 ? handleRetryMissed : undefined
        }
        onExit={onExit}
      />
    );
  }

  const answeredCount = currentIndex + (isAnswered ? 1 : 0);
  const progressPercent = Math.round(
    (answeredCount / quizOrder.length) * 100,
  );

  return (
    <div>
      <div className={styles.header}>
        <p className={styles.progress}>
          Question {currentIndex + 1} of {quizOrder.length}
        </p>
        <button type="button" onClick={onExit}>
          Exit Quiz
        </button>
      </div>

      <div className={styles.progressTrack}>
        <div
          className={styles.progressFill}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <QuestionCard
        question={currentQuestion}
        selected={selectedAnswer}
        isAnswered={isAnswered}
        onSelectAnswer={handleSelectAnswer}
      />

      {isAnswered && (
        <button type="button" onClick={handleNext}>
          Next
        </button>
      )}
    </div>
  );
}
