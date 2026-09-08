import styles from "./CardListControls.module.css";

export type SortOrder = "added" | "az" | "za";

interface CardListControlsProps {
  query: string;
  onQueryChange: (query: string) => void;
  sortOrder: SortOrder;
  onSortOrderChange: (order: SortOrder) => void;
}

export function CardListControls({
  query,
  onQueryChange,
  sortOrder,
  onSortOrderChange,
}: CardListControlsProps) {
  return (
    <div className={styles.controls}>
      <input
        type="search"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Search cards..."
        aria-label="Search cards"
      />
      <select
        value={sortOrder}
        onChange={(e) => onSortOrderChange(e.target.value as SortOrder)}
        aria-label="Sort cards"
      >
        <option value="added">Order added</option>
        <option value="az">Term A–Z</option>
        <option value="za">Term Z–A</option>
      </select>
    </div>
  );
}
