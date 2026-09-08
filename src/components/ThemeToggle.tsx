import { useTheme } from "../hooks/useTheme";
import type { ThemePreference } from "../hooks/useTheme";

const NEXT: Record<ThemePreference, ThemePreference> = {
  system: "light",
  light: "dark",
  dark: "system",
};

const LABEL: Record<ThemePreference, string> = {
  system: "Theme: System",
  light: "Theme: Light",
  dark: "Theme: Dark",
};

export function ThemeToggle() {
  const { preference, setPreference } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setPreference(NEXT[preference])}
      title="Cycle theme: System → Light → Dark"
    >
      {LABEL[preference]}
    </button>
  );
}
