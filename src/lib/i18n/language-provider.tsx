import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { en } from "./en";
import { es } from "./es";

export type Locale = "en" | "es";

const dictionaries: Record<Locale, typeof en> = { en, es };

interface LanguageContextType {
  locale: Locale;
  t: (key: string) => string;
  setLocale: (locale: Locale) => void;
  dir: "ltr";
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const me = useQuery(api.users.me);
  const setLocaleMutation = useMutation(api.users.setLocale);

  const [locale, setLocaleState] = useState<Locale>("en");
  const [dict, setDict] = useState<Record<string, string> | null>(null);

  // Initialize locale from user preference or browser
  useEffect(() => {
    if (me?.locale) {
      const l = me.locale === "es" ? "es" : "en";
      setLocaleState(l);
      return;
    }
    if (typeof window !== "undefined") {
      const browserLang = navigator.language.slice(0, 2);
      if (browserLang === "es") setLocaleState("es");
    }
  }, [me?.locale]);

  // Load dictionary when locale changes
  useEffect(() => {
    const d = dictionaries[locale];
    setDict(flattenDictionary(d));
  }, [locale]);

  const setLocale = useCallback(
    async (newLocale: Locale) => {
      if (newLocale === locale) return;
      setLocaleState(newLocale);
      // Sync to backend if user is logged in
      try {
        await setLocaleMutation({ locale: newLocale });
      } catch {
        // Offline or not authenticated — locale stays local
      }
    },
    [locale, setLocaleMutation]
  );

  const t = useCallback(
    (key: string) => {
      if (!dict) return key;
      return dict[key] ?? key;
    },
    [dict]
  );

  const value: LanguageContextType = {
    locale,
    t,
    setLocale,
    dir: "ltr",
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

function flattenDictionary(
  obj: Record<string, any>,
  prefix = "",
  result: Record<string, string> = {}
): Record<string, string> {
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      flattenDictionary(value, fullKey, result);
    } else if (typeof value === "string") {
      result[fullKey] = value;
    }
  }
  return result;
}
