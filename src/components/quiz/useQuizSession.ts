import { useMemo, useState } from "react";
import type { Card } from "../../types/card";
import type { QuizSettings } from "../../types/deck";
import { buildQuizOrder, generateQuestion, shuffle } from "../../utils/quizGenerator";

interface QuizQueue {
  current: Card;
  upcoming: Card[];
}

interface Progress {
  current: number;
  total: number;
}

function initQueue(cards: Card[]): QuizQueue {
  const order = buildQuizOrder(cards);
  return { current: order[0], upcoming: order.slice(1) };
}

// The quiz session state machine, extracted out of QuizView so the 3-way
// quiz-style branching doesn't tangle with rendering/keyboard-shortcut
// concerns there. Session progress is tracked as a frozen `current` card
// plus an `upcoming` queue (rather than a fixed array + index) because
// "until all answered correct" needs to dynamically requeue missed cards,
// which a fixed array with a pointer can't express cleanly.
export function useQuizSession(cards: Card[], settings: QuizSettings) {
  const [{ current: currentCard, upcoming }, setQueue] = useState<QuizQueue>(
    () => initQueue(cards),
  );
  const [total, setTotal] = useState(cards.length);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [missedCards, setMissedCards] = useState<Card[]>([]);
  const [sessionComplete, setSessionComplete] = useState(false);

  const currentQuestion = useMemo(
    () => generateQuestion(currentCard, cards, settings.direction),
    [currentCard, cards, settings.direction],
  );

  function selectAnswer(choice: string) {
    if (isAnswered) return;
    setSelectedAnswer(choice);
    setIsAnswered(true);
    const wasCorrect = choice === currentQuestion.correctAnswer;
    setScore((prev) => ({
      correct: prev.correct + (wasCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
    if (!wasCorrect) {
      // Dedupe by id — "missed" means "wrong at least once this session",
      // not "wrong on every occurrence" (matters for "until all answered
      // correct", where a card can be re-asked several times).
      setMissedCards((prev) =>
        prev.some((c) => c.id === currentCard.id) ? prev : [...prev, currentCard],
      );
    }
  }

  function advance() {
    if (!isAnswered) return;
    const wasCorrect = selectedAnswer === currentQuestion.correctAnswer;
    setSelectedAnswer(null);
    setIsAnswered(false);

    if (settings.style === "untilCorrect") {
      const [next, ...rest] = upcoming;
      if (wasCorrect) {
        if (next === undefined) {
          setSessionComplete(true);
          return;
        }
        setQueue({ current: next, upcoming: rest });
      } else if (next !== undefined) {
        setQueue({ current: next, upcoming: shuffle([...rest, currentCard]) });
      }
      // else: only this card left in the pool and it was wrong — re-ask it.
      return;
    }

    const [next, ...rest] = upcoming;
    if (next !== undefined) {
      setQueue({ current: next, upcoming: rest });
      return;
    }
    if (settings.style === "endless") {
      const fresh = buildQuizOrder(cards);
      setQueue({ current: fresh[0], upcoming: fresh.slice(1) });
      return;
    }
    setSessionComplete(true); // "whole" style, ran out of cards
  }

  function resetSession(pool: Card[]) {
    setQueue(initQueue(pool));
    setTotal(pool.length);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore({ correct: 0, total: 0 });
    setMissedCards([]);
    setSessionComplete(false);
  }

  function restart() {
    resetSession(cards);
  }

  function retryMissed() {
    resetSession(missedCards);
  }

  // `current` is the count of cards fully resolved before the one on
  // screen now (0-based) — for "whole" it's identical to the old
  // `currentIndex`; for "untilCorrect" it only advances when a card is
  // actually mastered (leaves the pool), so it's unaffected by wrong
  // answers or by the pending, not-yet-advanced current question. Views
  // decide per-style how to turn this into a displayed number/percentage.
  const progress: Progress | null =
    settings.style === "endless"
      ? null
      : { current: total - upcoming.length - 1, total };

  return {
    currentQuestion,
    selectedAnswer,
    isAnswered,
    score,
    missedCards,
    sessionComplete,
    progress,
    selectAnswer,
    advance,
    restart,
    retryMissed,
  };
}
