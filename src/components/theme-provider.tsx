"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { useEffect } from "react";
import type { ThemeId } from "@/lib/themes";

/* ── Palette context (independent of next-themes) ─────────────────────── */

interface PaletteContextValue {
  selectedTheme: ThemeId;
  setThemeId: (id: ThemeId) => void;
}

const PaletteContext = React.createContext<PaletteContextValue | undefined>(undefined);

export function usePalette() {
  const ctx = React.useContext(PaletteContext);
  if (!ctx) throw new Error("usePalette must be used within ThemeProvider");
  return ctx;
}

/* ── Helper: apply data-theme attribute ─────────────────────────────────── */

function applyPalette(id: ThemeId) {
  document.documentElement.setAttribute("data-theme", id);
  try {
    localStorage.setItem("palette", id);
  } catch {}
}

function usePersistedPalette(defaultId: ThemeId = "default"): [ThemeId, (id: ThemeId) => void] {
  const [selected, setSelected] = React.useState<ThemeId>(defaultId);

  // hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("palette") as ThemeId | null;
      if (stored) {
        setSelected(stored);
        applyPalette(stored);
      }
    } catch {}
  }, []);

  const setAndPersist = React.useCallback((id: ThemeId) => {
    setSelected(id);
    applyPalette(id);
  }, []);

  return [selected, setAndPersist];
}

/* ── ThemeProvider ──────────────────────────────────────────────────────── */

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const [selectedTheme, setThemeId] = usePersistedPalette("default");

  return (
    <NextThemesProvider {...props}>
      <PaletteContext.Provider value={{ selectedTheme, setThemeId }}>
        <PaletteSync />
        {children}
      </PaletteContext.Provider>
    </NextThemesProvider>
  );
}

/**
 * A tiny client component that keeps the data-theme attribute continuously
 * in sync (handles hot reloads / concurrent changes).
 */
function PaletteSync() {
  const { selectedTheme } = usePalette();
  useEffect(() => {
    applyPalette(selectedTheme);
  }, [selectedTheme]);
  return null;
}

/* ── Re-export useTheme from next-themes (mode: light|dark) ──────────────── */

export { useTheme };
