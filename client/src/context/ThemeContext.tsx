import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

export type ThemeMode = "dark" | "light" | "custom";

export interface ThemeColors {
  bg: string;
  surface: string;
  surface2: string;
  border: string;
  text: string;
  textMuted: string;
  accent: string;
  accentStrong: string;
  success: string;
  warning: string;
  error: string;
  focus: string;
}

interface ThemeContextType {
  mode: ThemeMode;
  colors: ThemeColors;
  setMode: (mode: ThemeMode) => void;
  setCustomColors: (colors: Partial<ThemeColors>) => void;
  resetToDefaults: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const STORAGE_KEY = "excedentes_theme";

// Default dark theme colors
const defaultDarkColors: ThemeColors = {
  bg: "#0c1117",
  surface: "#141b24",
  surface2: "#1a2230",
  border: "#243144",
  text: "#e6edf3",
  textMuted: "#a7b3c2",
  accent: "#4c8dff",
  accentStrong: "#2f6bff",
  success: "#2bb673",
  warning: "#f2b93b",
  error: "#e05d5d",
  focus: "#7aa7ff",
};

// Light theme colors
const defaultLightColors: ThemeColors = {
  bg: "#ffffff",
  surface: "#f6f8fa",
  surface2: "#eef1f5",
  border: "#d0d7de",
  text: "#24292f",
  textMuted: "#57606a",
  accent: "#0969da",
  accentStrong: "#0550ae",
  success: "#1a7f37",
  warning: "#9a6700",
  error: "#cf222e",
  focus: "#0969da",
};

const loadStoredTheme = (): { mode: ThemeMode; customColors?: Partial<ThemeColors> } => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { mode: "dark" };
    return JSON.parse(stored);
  } catch {
    return { mode: "dark" };
  }
};

const persistTheme = (mode: ThemeMode, customColors?: Partial<ThemeColors>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode, customColors }));
};

const applyThemeToDOM = (colors: ThemeColors) => {
  const root = document.documentElement;
  root.style.setProperty("--color-bg", colors.bg);
  root.style.setProperty("--color-surface", colors.surface);
  root.style.setProperty("--color-surface-2", colors.surface2);
  root.style.setProperty("--color-border", colors.border);
  root.style.setProperty("--color-text", colors.text);
  root.style.setProperty("--color-text-muted", colors.textMuted);
  root.style.setProperty("--color-accent", colors.accent);
  root.style.setProperty("--color-accent-strong", colors.accentStrong);
  root.style.setProperty("--color-success", colors.success);
  root.style.setProperty("--color-warning", colors.warning);
  root.style.setProperty("--color-error", colors.error);
  root.style.setProperty("--color-focus", colors.focus);
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("dark");
  const [customColors, setCustomColorsState] = useState<Partial<ThemeColors>>({});

  // Initialize from localStorage  
  useEffect(() => {
    const stored = loadStoredTheme();
    setModeState(stored.mode);
    if (stored.customColors) {
      setCustomColorsState(stored.customColors);
    }
  }, []);

  // Calculate current colors based on mode
  const colors = useMemo((): ThemeColors => {
    if (mode === "custom") {
      return { ...defaultDarkColors, ...customColors };
    }
    return mode === "light" ? defaultLightColors : defaultDarkColors;
  }, [mode, customColors]);

  // Apply theme to DOM whenever colors change
  useEffect(() => {
    applyThemeToDOM(colors);
  }, [colors]);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    persistTheme(newMode, customColors);
  };

  const setCustomColors = (newColors: Partial<ThemeColors>) => {
    const updatedColors = { ...customColors, ...newColors };
    setCustomColorsState(updatedColors);
    if (mode === "custom") {
      persistTheme(mode, updatedColors);
    }
  };

  const resetToDefaults = () => {
    setModeState("dark");
    setCustomColorsState({});
    persistTheme("dark", {});
  };

  const value = useMemo(
    () => ({
      mode,
      colors,
      setMode,
      setCustomColors,
      resetToDefaults,
    }),
    [mode, colors]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
