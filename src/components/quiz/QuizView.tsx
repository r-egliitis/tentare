import { useMemo, useState } from "react";
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
    setScore((prev) => ({
      correct: prev.correct + (choice === currentQuestion.correctAnswer ? 1 : 0),
      total: prev.total + 1,
    }));
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
    setSessionComplete(false);
  }

  if (sessionComplete) {
    return (
      <QuizSummary
        score={score.correct}
        total={score.total}
        onRestart={handleRestart}
        onExit={onExit}
      />
    );
  }

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
