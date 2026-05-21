"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/provider";
import {
  Menu,
  X,
  Home,
  Search,
  Calculator,
  BookOpen,
  Globe,
  User,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: Home, labelKey: "home" as const },
  { href: "/scanner", icon: Search, labelKey: "scanner" as const },
  { href: "/calculator", icon: Calculator, labelKey: "calc" as const },
  { href: "/guide", icon: BookOpen, labelKey: "guide" as const },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t, locale, setLocale } = useI18n();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Public pages: no header/sidebar
  const publicPaths = ["/", "/login", "/register", "/forgot-password", "/reset-password"];
  const isPublic = publicPaths.includes(pathname);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  // Close sidebar on route change
  useEffect(() => {
    closeSidebar();
  }, [pathname, closeSidebar]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSidebar();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [closeSidebar]);

  // Prevent body scroll when sidebar open on mobile
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  const toggleLocale = () => setLocale(locale === "vi" ? "en" : "vi");

  // Public pages: render without shell
  if (isPublic) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 h-14 border-b border-white/10 bg-gray-950/95 backdrop-blur-xl">
        <div className="h-full flex items-center justify-between px-4">
          {/* Left: Hamburger + Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 -ml-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors lg:hidden"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">AB</span>
              </div>
              <span className="font-bold text-white text-lg hidden sm:block">
                ArbitrageBet
              </span>
            </Link>
          </div>

          {/* Right: Current page title + language */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLocale}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Globe className="h-4 w-4" />
              <span>{locale === "vi" ? "VI" : "EN"}</span>
            </button>
            <Link
              href="/profile"
              className="h-8 w-8 rounded-full bg-emerald-600/20 text-sm font-bold text-emerald-400 ring-1 ring-emerald-500/30 flex items-center justify-center hover:ring-emerald-400/50 transition-all"
            >
              <User className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-14 left-0 bottom-0 z-50 w-64 border-r border-white/10 bg-gray-900/98 backdrop-blur-xl transform transition-transform duration-200 ease-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:z-30`}
      >
        <nav className="flex flex-col h-full py-4">
          {/* Navigation items */}
          <div className="flex-1 space-y-1 px-3">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? "text-emerald-400 bg-emerald-400/10"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <item.icon
                    className={`h-5 w-5 ${
                      isActive ? "text-emerald-400" : ""
                    }`}
                  />
                  <span>{t.nav[item.labelKey]}</span>
                  {isActive && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Bottom section */}
          <div className="border-t border-white/5 pt-3 px-3 space-y-1">
            <Link
              href="/profile"
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                pathname === "/profile"
                  ? "text-emerald-400 bg-emerald-400/10"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <User className="h-5 w-5" />
              <span>Profile</span>
            </Link>
            <button
              onClick={toggleLocale}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <Globe className="h-5 w-5" />
              <span>
                {locale === "vi" ? "Tiếng Việt" : "English"}
              </span>
              <span className="ml-auto text-xs text-gray-600">
                {locale === "vi" ? "VI" : "EN"}
              </span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-64">
        {children}
      </main>
    </div>
  );
}
