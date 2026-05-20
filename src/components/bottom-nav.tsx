"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Brain, Calculator, HelpCircle } from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/scanner", icon: Search, label: "Scanner" },
  { href: "/ai-analyzer", icon: Brain, label: "AI" },
  { href: "/calculator", icon: Calculator, label: "Calc" },
  { href: "/guide", icon: HelpCircle, label: "Guide" },
];

export default function BottomNav() {
  const pathname = usePathname();

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
              <span>{item.label}</span>
              {isActive && (
                <div className="absolute bottom-1 h-1 w-1 rounded-full bg-emerald-400" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
