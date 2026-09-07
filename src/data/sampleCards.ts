import type { Card } from "../types/card";

// Seed data used the first time the app runs (before anything is saved).
export const sampleCards: Card[] = [
  {
    id: crypto.randomUUID(),
    term: "Photosynthesis",
    definition:
      "The process plants use to convert light into chemical energy.",
    distractorMode: "auto",
    customWrongAnswers: [],
    numChoices: 4,
  },
  {
    id: crypto.randomUUID(),
    term: "Mitochondria",
    definition: "The organelle that produces most of a cell's ATP energy.",
    distractorMode: "auto",
    customWrongAnswers: [],
    numChoices: 4,
  },
  {
    id: crypto.randomUUID(),
    term: "Osmosis",
    definition:
      "The movement of water across a membrane from low to high solute concentration.",
    distractorMode: "auto",
    customWrongAnswers: [],
    numChoices: 4,
  },
];
