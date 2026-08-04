"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/provider";
import type { H2HLine, SpreadLine, TotalsLine } from "@/lib/arbitrage/types";
import {
  RefreshCw,
  Search,
  Info,
  Zap,
  AlertCircle,
  LayoutGrid,
} from "lucide-react";

type MarketTab = "all" | "h2h" | "spreads" | "totals";

type AllMarkets = {
  h2h: H2HLine[];
  spreads: SpreadLine[];
  totals: TotalsLine[];
};

export default function MarketsPage() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const [markets, setMarkets] = useState<AllMarkets | null>(null);
  const [activeTab, setActiveTab] = useState<MarketTab>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [scannedMatches, setScannedMatches] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [include8xbet, setInclude8xbet] = useState(false);

  const checkAuth = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) router.push("/login");
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const fetchMarkets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/odds?markets=h2h,spreads,totals&total_stake=100&min_profit=0${include8xbet ? "&include_8xbet=true" : ""}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fetch failed");

      setMarkets(data.all_markets || null);
      setScannedMatches(data.scanned_matches || 0);
      setLastScan(data.scanned_at);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [include8xbet]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchMarkets, 60000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchMarkets]);

  const sportEmoji: Record<string, string> = {
    soccer: "⚽",
    basketball: "🏀",
    tennis: "🎾",
    baseball: "⚾",
    hockey: "🏒",
    mma: "🥊",
  };

  const fmtOdds = (odds: number) => odds.toFixed(2);
  const fmtMargin = (implied: number) => {
    const pct = ((implied - 1) * 100).toFixed(1);
    return implied < 1 ? `${pct}%` : `+${pct}%`;
  };
  const marginColor = (implied: number) => {
    if (implied < 1) return "text-emerald-400";
    if (implied < 1.05) return "text-yellow-400";
    return "text-gray-500";
  };

  const tabs: { key: MarketTab; label: string }[] = [
    { key: "all", label: t.markets.tabAll },
    { key: "h2h", label: t.markets.tabH2H },
    { key: "spreads", label: t.markets.tabSpread },
    { key: "totals", label: t.markets.tabTotals },
  ];

  const showH2H = activeTab === "all" || activeTab === "h2h";
  const showSpreads = activeTab === "all" || activeTab === "spreads";
  const showTotals = activeTab === "all" || activeTab === "totals";

  const totalLines =
    (markets?.h2h?.length || 0) +
    (markets?.spreads?.length || 0) +
    (markets?.totals?.length || 0);

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-4 text-white shadow-lg">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <LayoutGrid className="h-5 w-5" />
                {t.markets.title}
              </h1>
              <p className="text-sm text-indigo-100">
                {lastScan
                  ? t.markets.subtitleScanned
                      .replace("{time}", new Date(lastScan).toLocaleTimeString(locale === "vi" ? "vi-VN" : "en-US"))
                      .replace("{count}", String(scannedMatches))
                  : t.markets.subtitle}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-3 flex items-center gap-2">
            <Button
              onClick={fetchMarkets}
              disabled={loading}
              className="bg-white text-indigo-700 font-bold hover:bg-indigo-50 h-10 px-4"
              size="sm"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                  {t.common.scanning}
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-1" />
                  {t.markets.scanButton}
                </>
              )}
            </Button>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-indigo-100 ml-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              {t.markets.autoLabel}
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-indigo-100">
              <input
                type="checkbox"
                checked={include8xbet}
                onChange={(e) => setInclude8xbet(e.target.checked)}
                className="rounded"
              />
              🏠 8xBet
            </label>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-4 py-4">
        {/* Error */}
        {error && (
          <Card className="mb-4 border-red-500/30 bg-red-500/10">
            <CardContent className="py-3">
              <p className="text-sm text-red-400">❌ {error}</p>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        {lastScan && markets && (
          <div className="mb-4 grid grid-cols-4 gap-2">
            <div className="rounded-xl bg-gray-900 border border-white/5 p-3 text-center">
              <p className="text-xl font-bold text-white">{markets.h2h.length}</p>
              <p className="text-xs text-gray-500">1X2</p>
            </div>
            <div className="rounded-xl bg-gray-900 border border-white/5 p-3 text-center">
              <p className="text-xl font-bold text-white">{markets.spreads.length}</p>
              <p className="text-xs text-gray-500">HDP</p>
            </div>
            <div className="rounded-xl bg-gray-900 border border-white/5 p-3 text-center">
              <p className="text-xl font-bold text-white">{markets.totals.length}</p>
              <p className="text-xs text-gray-500">O/U</p>
            </div>
            <div className="rounded-xl bg-gray-900 border border-white/5 p-3 text-center">
              <p className="text-xl font-bold text-indigo-400">{totalLines}</p>
              <p className="text-xs text-gray-500">{t.common.all}</p>
            </div>
          </div>
        )}

        {/* Tab filter */}
        {markets && totalLines > 0 && (
          <div className="mb-4 flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-900 text-gray-400 hover:text-white border border-white/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* First time — no scan yet */}
        {!lastScan && !loading && !error && (
          <div className="py-12 text-center">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-indigo-500/10 mb-4">
              <LayoutGrid className="h-10 w-10 text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-white">{t.markets.emptyTitle}</h2>
            <p className="mt-2 text-sm text-gray-400 max-w-xs mx-auto">
              {t.markets.emptyDesc}
            </p>
            <div className="mt-6 space-y-2 text-sm text-gray-500 max-w-xs mx-auto text-left">
              <div className="flex items-start gap-2">
                <Zap className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
                <span>{t.scanner.emptyTip3}</span>
              </div>
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" />
                <span>{t.markets.subtitle}</span>
              </div>
            </div>
            <Button
              onClick={fetchMarkets}
              className="mt-8 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8"
            >
              <Search className="h-4 w-4 mr-2" />
              {t.markets.scanButton}
            </Button>
          </div>
        )}

        {/* Loading */}
        {loading && !lastScan && (
          <div className="py-16 text-center">
            <RefreshCw className="h-10 w-10 text-indigo-400 animate-spin mx-auto" />
            <p className="mt-4 text-gray-400">{t.scanner.scanningMsg}</p>
            <p className="mt-1 text-sm text-gray-500">{t.scanner.scanningTime}</p>
          </div>
        )}

        {/* No data */}
        {markets && totalLines === 0 && lastScan && !loading && (
          <Card className="border-gray-700 bg-gray-900">
            <CardContent className="py-8 text-center">
              <p className="text-4xl">📊</p>
              <p className="mt-2 font-medium text-gray-300">{t.markets.noData}</p>
              <p className="mt-1 text-sm text-gray-500">{t.markets.noDataDesc}</p>
            </CardContent>
          </Card>
        )}

        {/* ===== H2H (1X2) ===== */}
        {showH2H && markets && markets.h2h.length > 0 && (
          <div className="mb-6">
            {activeTab === "all" && (
              <h3 className="mb-3 text-sm font-bold text-gray-400 uppercase tracking-wide flex items-center gap-2">
                <span className="h-1 w-4 rounded-full bg-indigo-500" />
                1X2 ({t.markets.matchesFound.replace("{count}", String(markets.h2h.length))})
              </h3>
            )}
            {markets.h2h.map((line) => (
              <Card key={line.id} className="mb-3 border-white/5 bg-gray-900 overflow-hidden">
                {/* Match header */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-lg shrink-0">
                      {sportEmoji[line.match.sport] || "🏆"}
                    </span>
                    <p className="text-sm font-semibold text-white truncate">
                      {line.match.home_team} vs {line.match.away_team}
                    </p>
                  </div>
                  <div className={`text-right shrink-0 ml-2 ${marginColor(line.impliedTotal)}`}>
                    <p className="text-sm font-bold">{fmtMargin(line.impliedTotal)}</p>
                    <p className="text-xs text-gray-600">{t.markets.margin}</p>
                  </div>
                </div>
                {/* Odds row */}
                <CardContent className="p-0">
                  <div className="grid grid-cols-3 divide-x divide-white/5">
                    {/* Home */}
                    <div className="px-3 py-3 text-center">
                      <p className="text-xs text-gray-500 mb-1">{t.markets.home}</p>
                      <p className="font-mono text-base font-bold text-blue-400">{fmtOdds(line.bestHome.odds)}</p>
                      <p className="text-[10px] text-gray-600 truncate mt-0.5">{line.bestHome.bookmaker_title}</p>
                    </div>
                    {/* Draw */}
                    <div className="px-3 py-3 text-center">
                      <p className="text-xs text-gray-500 mb-1">{t.markets.draw}</p>
                      {line.bestDraw.odds > 0 ? (
                        <>
                          <p className="font-mono text-base font-bold text-yellow-400">{fmtOdds(line.bestDraw.odds)}</p>
                          <p className="text-[10px] text-gray-600 truncate mt-0.5">{line.bestDraw.bookmaker_title}</p>
                        </>
                      ) : (
                        <p className="text-sm text-gray-700">—</p>
                      )}
                    </div>
                    {/* Away */}
                    <div className="px-3 py-3 text-center">
                      <p className="text-xs text-gray-500 mb-1">{t.markets.away}</p>
                      <p className="font-mono text-base font-bold text-red-400">{fmtOdds(line.bestAway.odds)}</p>
                      <p className="text-[10px] text-gray-600 truncate mt-0.5">{line.bestAway.bookmaker_title}</p>
                    </div>
                  </div>
                  {/* Implied total bar */}
                  <div className="px-4 py-1.5 border-t border-white/5 bg-gray-950/50">
                    <p className="text-[10px] text-gray-600 text-center">
                      {t.markets.impliedTotal}: <span className={marginColor(line.impliedTotal)}>{(line.impliedTotal * 100).toFixed(2)}%</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* ===== Spreads (Handicap) ===== */}
        {showSpreads && markets && markets.spreads.length > 0 && (
          <div className="mb-6">
            {activeTab === "all" && (
              <h3 className="mb-3 text-sm font-bold text-gray-400 uppercase tracking-wide flex items-center gap-2">
                <span className="h-1 w-4 rounded-full bg-purple-500" />
                {t.markets.tabSpread} ({t.markets.linesFound.replace("{count}", String(markets.spreads.length))})
              </h3>
            )}
            {markets.spreads.map((line) => (
              <Card key={line.id} className="mb-3 border-white/5 bg-gray-900 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-lg shrink-0">
                      {sportEmoji[line.match.sport] || "🏆"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">
                        {line.match.home_team} vs {line.match.away_team}
                      </p>
                      <p className="text-xs text-gray-500">
                        {t.markets.handicap} <span className="text-purple-400 font-mono">({line.point > 0 ? "+" : ""}{line.point})</span>
                      </p>
                    </div>
                  </div>
                  <div className={`text-right shrink-0 ml-2 ${marginColor(line.impliedTotal)}`}>
                    <p className="text-sm font-bold">{fmtMargin(line.impliedTotal)}</p>
                    <p className="text-xs text-gray-600">{t.markets.margin}</p>
                  </div>
                </div>
                <CardContent className="p-0">
                  <div className="grid grid-cols-2 divide-x divide-white/5">
                    {/* Home */}
                    <div className="px-4 py-3 text-center">
                      <p className="text-xs text-gray-500 mb-1">
                        {t.markets.home} <span className="text-purple-400 font-mono">({line.point > 0 ? "+" : ""}{line.point})</span>
                      </p>
                      <p className="font-mono text-base font-bold text-blue-400">{fmtOdds(line.bestHome.odds)}</p>
                      <p className="text-[10px] text-gray-600 truncate mt-0.5">{line.bestHome.bookmaker_title}</p>
                    </div>
                    {/* Away */}
                    <div className="px-4 py-3 text-center">
                      <p className="text-xs text-gray-500 mb-1">
                        {t.markets.away} <span className="text-purple-400 font-mono">({line.point > 0 ? "+" : ""}{(-line.point)})</span>
                      </p>
                      <p className="font-mono text-base font-bold text-red-400">{fmtOdds(line.bestAway.odds)}</p>
                      <p className="text-[10px] text-gray-600 truncate mt-0.5">{line.bestAway.bookmaker_title}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* ===== Totals (O/U) ===== */}
        {showTotals && markets && markets.totals.length > 0 && (
          <div className="mb-6">
            {activeTab === "all" && (
              <h3 className="mb-3 text-sm font-bold text-gray-400 uppercase tracking-wide flex items-center gap-2">
                <span className="h-1 w-4 rounded-full bg-emerald-500" />
                {t.markets.tabTotals} ({t.markets.linesFound.replace("{count}", String(markets.totals.length))})
              </h3>
            )}
            {markets.totals.map((line) => (
              <Card
                key={line.id}
                className={`mb-3 overflow-hidden ${
                  line.isArbitrage
                    ? "border-emerald-500/30 bg-gray-900"
                    : "border-white/5 bg-gray-900"
                }`}
              >
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-lg shrink-0">
                      {sportEmoji[line.match.sport] || "🏆"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">
                        {line.match.home_team} vs {line.match.away_team}
                      </p>
                      <p className="text-xs text-gray-500">
                        {t.scanner.marketTotals}
                        <span className="ml-1 text-yellow-400">({line.point})</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    {line.isArbitrage ? (
                      <>
                        <p className="text-lg font-bold text-emerald-400">
                          +{line.profitPercent.toFixed(2)}%
                        </p>
                        <p className="text-xs text-emerald-500">{t.scanner.guaranteedProfitLabel}</p>
                      </>
                    ) : (
                      <p className={`text-sm font-medium ${marginColor(line.impliedTotal)}`}>
                        {fmtMargin(line.impliedTotal)}
                      </p>
                    )}
                  </div>
                </div>
                <CardContent className="p-0">
                  <div className="grid grid-cols-2 divide-x divide-white/5">
                    {/* Over */}
                    <div className="px-4 py-3 text-center">
                      <p className="text-xs text-gray-500 mb-1">{t.scanner.legOver}</p>
                      <p className="font-mono text-base font-bold text-emerald-400">{fmtOdds(line.bestOver.odds)}</p>
                      <p className="text-[10px] text-gray-600 truncate mt-0.5">{line.bestOver.bookmaker_title}</p>
                    </div>
                    {/* Under */}
                    <div className="px-4 py-3 text-center">
                      <p className="text-xs text-gray-500 mb-1">{t.scanner.legUnder}</p>
                      <p className="font-mono text-base font-bold text-orange-400">{fmtOdds(line.bestUnder.odds)}</p>
                      <p className="text-[10px] text-gray-600 truncate mt-0.5">{line.bestUnder.bookmaker_title}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Timestamp */}
        {lastScan && (
          <p className="mt-4 text-center text-[10px] text-gray-600">
            {t.common.scannedAt.replace("{time}", new Date(lastScan).toLocaleString(locale === "vi" ? "vi-VN" : "en-US"))} •{" "}
            {t.common.cachedAgo.replace(locale === "vi" ? "{seconds}" : "{seconds}", "60")}
          </p>
        )}
      </div>
    </div>
  );
}
