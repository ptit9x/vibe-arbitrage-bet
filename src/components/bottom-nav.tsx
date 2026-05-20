"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Brain, Calculator, HelpCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import LanguageSwitcher from "./language-switcher";

const navItems = [
  { href: "/dashboard", icon: Home, labelKey: "home" as const },
  { href: "/scanner", icon: Search, labelKey: "scanner" as const },
  { href: "/ai-analyzer", icon: Brain, labelKey: "ai" as const },
  { href: "/calculator", icon: Calculator, labelKey: "calc" as const },
  { href: "/guide", icon: HelpCircle, labelKey: "guide" as const },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-gray-950/95 backdrop-blur-xl safe-area-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-[10px] font-medium transition-all ${
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
        <div className="flex flex-col items-center gap-0.5 px-2 py-2">
          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  );
}
