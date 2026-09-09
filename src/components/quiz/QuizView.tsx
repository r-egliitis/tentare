import { useEffect } from "react";
import type { Card } from "../../types/card";
import type { QuizSettings } from "../../types/deck";
import { useQuizSession } from "./useQuizSession";
import { QuestionCard } from "./QuestionCard";
import { QuizSummary } from "./QuizSummary";
import styles from "./QuizView.module.css";

interface QuizViewProps {
  cards: Card[];
  settings: QuizSettings;
  onExit: () => void;
}

export function QuizView({ cards, settings, onExit }: QuizViewProps) {
  const session = useQuizSession(cards, settings);

  // Keyboard shortcuts: 1-9 pick a choice before answering, Enter/Space
  // advances once answered. Skipped once the session is complete (the
  // summary screen has its own buttons, no shortcuts needed there).
  useEffect(() => {
    if (session.sessionComplete) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (!session.isAnswered) {
        const digit = Number(event.key);
        if (
          Number.isInteger(digit) &&
          digit >= 1 &&
          digit <= session.currentQuestion.choices.length
        ) {
          session.selectAnswer(session.currentQuestion.choices[digit - 1]);
        }
      } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        session.advance();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  if (session.sessionComplete) {
    return (
      <QuizSummary
        score={session.score.correct}
        total={session.score.total}
        missedCards={session.missedCards}
        onRestart={session.restart}
        onRetryMissed={
          session.missedCards.length > 0 ? session.retryMissed : undefined
        }
        onExit={onExit}
      />
    );
  }

  const progress = session.progress;
  // "Whole test" gives optimistic credit for the currently-answered-but-
  // not-yet-advanced question, matching the original behavior exactly
  // (the bar used to fill the instant you answered, before clicking
  // Next). "Until all answered correct" doesn't get that bump — a card
  // only counts once it's actually left the pool.
  const barFillCount =
    progress === null
      ? 0
      : progress.current + (settings.style === "whole" && session.isAnswered ? 1 : 0);

  return (
    <div>
      <div className={styles.header}>
        <p className={styles.progress}>
          {progress === null
            ? `${session.score.correct} correct / ${session.score.total} answered`
            : settings.style === "untilCorrect"
              ? `${progress.current} of ${progress.total} correct`
              : `Question ${progress.current + 1} of ${progress.total}`}
        </p>
        <button type="button" onClick={onExit}>
          Exit Quiz
        </button>
      </div>

      {progress !== null && (
        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{
              width: `${Math.round((barFillCount / progress.total) * 100)}%`,
            }}
          />
        </div>
      )}

      <QuestionCard
        question={session.currentQuestion}
        selected={session.selectedAnswer}
        isAnswered={session.isAnswered}
        onSelectAnswer={session.selectAnswer}
      />

      {session.isAnswered && (
        <button type="button" onClick={session.advance}>
          Next
        </button>
      )}
    </div>
  );
}
