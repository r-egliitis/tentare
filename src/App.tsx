import { useCards } from "./hooks/useCards";
import { CardList } from "./components/CardList";

export function App() {
  const { cards } = useCards();

  return (
    <>
      <h1>Flashcard Quiz Tool</h1>
      <CardList cards={cards} />
    </>
  );
}
