import { useEffect, useState } from "react";

export type ThemePreference = "system" | "light" | "dark";

const STORAGE_KEY = "flashcard-quiz-tool:theme";

function loadPreference(): ThemePreference {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : "system";
}

// Applies the preference to the document root (data-theme="light"|"dark", or
// no attribute at all for "system" so the CSS media query takes over) and
// persists it, so it survives reloads.
export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(
    loadPreference,
  );

  useEffect(() => {
    if (preference === "system") {
      delete document.documentElement.dataset.theme;
    } else {
      document.documentElement.dataset.theme = preference;
    }
    localStorage.setItem(STORAGE_KEY, preference);
  }, [preference]);

  return { preference, setPreference };
}
