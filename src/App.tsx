import { useState } from "react";
import { sampleCards } from "./data/sampleCards";
import type { Card } from "./types/card";
import { CardList } from "./components/CardList";

export function App() {
  // Step A: feature parity with the old static page only — hardcoded seed
  // data, no persistence yet. Step B adds localStorage load/save.
  const [cards] = useState<Card[]>(sampleCards);

  return (
    <>
      <h1>Flashcard Quiz Tool</h1>
      <CardList cards={cards} />
    </>
  );
}
