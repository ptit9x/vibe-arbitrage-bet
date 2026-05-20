"use client";

import { useI18n } from "@/lib/i18n/provider";
import { Globe } from "lucide-react";

export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();

  const toggle = () => {
    setLocale(locale === "vi" ? "en" : "vi");
  };

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all hover:bg-white/10 ${
        className
      }`}
      title={locale === "vi" ? t.languages.en : t.languages.vi}
    >
      <Globe className="h-3.5 w-3.5" />
      <span>{locale === "vi" ? "EN" : "VI"}</span>
    </button>
  );
}
