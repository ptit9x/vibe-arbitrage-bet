"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { translations, type Locale, type Translations } from "./translations";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextType | null>(null);

const STORAGE_KEY = "arbitragebet-locale";

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "vi";
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "vi") return stored;
  } catch {}
  return "vi";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
    } catch {}
    // Set cookie for server components
    document.cookie = `${STORAGE_KEY}=${newLocale};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
  }, []);

  // Sync locale on mount
  useEffect(() => {
    setLocaleState(getInitialLocale());
  }, []);

  const t = translations[locale] as Translations;

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

export function useTranslation() {
  const { t, locale } = useI18n();
  return { t, locale };
}

// Helper to get locale from cookie (for server components)
export function getLocaleFromCookies(cookieHeader?: string): Locale {
  if (!cookieHeader) return "vi";
  const match = cookieHeader.match(/arbitragebet-locale=(en|vi)/);
  return (match?.[1] as Locale) || "vi";
}
