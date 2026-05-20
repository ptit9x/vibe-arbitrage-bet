"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Brain, Calculator, HelpCircle, Globe } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

const navItems = [
  { href: "/dashboard", icon: Home, labelKey: "home" as const },
  { href: "/scanner", icon: Search, labelKey: "scanner" as const },
  { href: "/ai-analyzer", icon: Brain, labelKey: "ai" as const },
  { href: "/calculator", icon: Calculator, labelKey: "calc" as const },
  { href: "/guide", icon: HelpCircle, labelKey: "guide" as const },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { t, locale, setLocale } = useI18n();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-gray-950/95 backdrop-blur-xl safe-area-bottom">
      <div className="mx-auto grid max-w-lg grid-cols-6 px-1 py-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 rounded-lg py-2 text-[10px] font-medium transition-all ${
                isActive
                  ? "text-emerald-400"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <item.icon
                className={`h-5 w-5 ${isActive ? "text-emerald-400" : ""}`}
              />
              <span>{t.nav[item.labelKey]}</span>
              {isActive && (
                <div className="absolute bottom-1 h-1 w-1 rounded-full bg-emerald-400" />
              )}
            </Link>
          );
        })}
        <button
          onClick={() => setLocale(locale === "vi" ? "en" : "vi")}
          className="flex flex-col items-center gap-0.5 rounded-lg py-2 text-[10px] font-medium text-gray-500 hover:text-gray-300 transition-all"
        >
          <Globe className="h-5 w-5" />
          <span>{locale === "vi" ? "EN" : "VI"}</span>
        </button>
      </div>
    </nav>
  );
}
