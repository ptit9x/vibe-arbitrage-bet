"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Calculator, HelpCircle, Globe } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

const navItems = [
  { href: "/dashboard", icon: Home, labelKey: "home" as const },
  { href: "/scanner", icon: Search, labelKey: "scanner" as const },
  { href: "/calculator", icon: Calculator, labelKey: "calc" as const },
  { href: "/guide", icon: HelpCircle, labelKey: "guide" as const },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { t, locale, setLocale } = useI18n();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-gray-950/95 backdrop-blur-xl safe-area-bottom">
      <div className="mx-auto grid max-w-lg grid-cols-6 gap-1 px-1 py-1.5">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[13px] font-semibold transition-all ${
                isActive
                  ? "text-emerald-400 bg-emerald-400/10"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
              }`}
            >
              <item.icon className={`h-6 w-6 ${isActive ? "text-emerald-400" : ""}`} />
              <span>{t.nav[item.labelKey]}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setLocale(locale === "vi" ? "en" : "vi")}
          className="flex flex-col items-center gap-1 rounded-xl py-2 text-[13px] font-semibold text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-all"
        >
          <Globe className="h-6 w-6" />
          <span>{locale === "vi" ? "EN" : "VI"}</span>
        </button>
      </div>
    </nav>
  );
}
