export type ThemeId = "default" | "solarized" | "tokyonight" | "vercel" | "dracula";

export interface ThemeMeta {
  id: ThemeId;
  labelKey: string; // key in i18n types.ts
  swatch: string;   // hex for dot
}

export const THEMES: ThemeMeta[] = [
  { id: "default", labelKey: "default", swatch: "#0d9488" },
  { id: "solarized", labelKey: "solarized", swatch: "#268bd2" },
  { id: "tokyonight", labelKey: "tokyonight", swatch: "#bb9af7" },
  { id: "vercel", labelKey: "vercel", swatch: "#171717" },
  { id: "dracula", labelKey: "dracula", swatch: "#ff79c6" },
];
