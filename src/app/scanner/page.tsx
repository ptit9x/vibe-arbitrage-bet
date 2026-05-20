"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/bottom-nav";
import { getBookmakerUrl } from "@/lib/bookmakers";
import { useI18n } from "@/lib/i18n/provider";
import type { ArbitrageOpportunity } from "@/lib/arbitrage/types";
import {
  Search,
  RefreshCw,
  HelpCircle,
  ArrowLeft,
  Info,
  Zap,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

export default function ScannerPage() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalStake, setTotalStake] = useState(1000000);
  const [minProfit, setMinProfit] = useState(0.5);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [scannedMatches, setScannedMatches] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [include8xbet, setInclude8xbet] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

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

  const scanOdds = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/odds?total_stake=${totalStake}&min_profit=${minProfit}${include8xbet ? "&include_8xbet=true" : ""}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scan failed");

      setOpportunities(data.opportunities);
      setScannedMatches(data.scanned_matches);
      setLastScan(data.scanned_at);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [totalStake, minProfit, include8xbet]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(scanOdds, 60000);
    return () => clearInterval(interval);
  }, [autoRefresh, scanOdds]);

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US").format(Math.round(amount));

  const currencySuffix = "đ";

  const marketLabels: Record<string, string> = {
    h2h: t.scanner.marketH2H,
    spreads: t.scanner.marketSpreads,
    totals: t.scanner.marketTotals,
  };

  const sportEmoji: Record<string, string> = {
    soccer: "⚽",
    basketball: "🏀",
    tennis: "🎾",
    baseball: "⚾",
    hockey: "🏒",
    mma: "🥊",
  };

  const translateOutcome = (outcome: string) => {
    switch (outcome) {
      case "Over": return t.scanner.legOver;
      case "Under": return t.scanner.legUnder;
      case "Draw": return t.scanner.legDraw;
      case "Home": return t.scanner.legHome;
      case "Away": return t.scanner.legAway;
      default: return outcome;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-4 text-white shadow-lg">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="text-white hover:bg-white/10 rounded-lg p-1 -ml-1"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  {t.scanner.title}
                </h1>
                <p className="text-xs text-emerald-100">
                  {lastScan
                    ? t.scanner.subtitleScanned
                        .replace("{time}", new Date(lastScan).toLocaleTimeString(locale === "vi" ? "vi-VN" : "en-US"))
                        .replace("{count}", String(scannedMatches))
                    : t.scanner.subtitle}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowHelp(!showHelp)}
              className={`rounded-lg p-2 transition-colors ${
                showHelp ? "bg-white/20" : "hover:bg-white/10"
              }`}
            >
              <HelpCircle className="h-5 w-5" />
            </button>
          </div>

          {/* Help panel */}
          {showHelp && (
            <div className="mt-3 rounded-xl bg-white/10 border border-white/20 p-3 space-y-2">
              <p className="text-xs font-bold text-white">{t.scanner.helpTitle}</p>
              <div className="space-y-1 text-xs text-emerald-100">
                <p dangerouslySetInnerHTML={{ __html: t.scanner.help1 }} />
                <p dangerouslySetInnerHTML={{ __html: t.scanner.help2 }} />
                <p>{t.scanner.help3}</p>
                <p dangerouslySetInnerHTML={{ __html: t.scanner.help4 }} />
              </div>
              <div className="flex items-center gap-1 text-xs text-yellow-200">
                <AlertCircle className="h-3 w-3" />
                {t.scanner.helpWarning}
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="mt-3 flex items-end gap-2">
            <div className="flex-1 min-w-0">
              <label className="text-[10px] text-emerald-200">{t.scanner.capitalLabel}</label>
              <Input
                type="number"
                value={totalStake}
                onChange={(e) => setTotalStake(Number(e.target.value))}
                className="mt-0.5 h-8 border-white/20 bg-white/10 text-white text-sm placeholder:text-white/50"
              />
            </div>
            <div className="w-20">
              <label className="text-[10px] text-emerald-200">{t.scanner.minPercentLabel}</label>
              <Input
                type="number"
                step="0.1"
                value={minProfit}
                onChange={(e) => setMinProfit(Number(e.target.value))}
                className="mt-0.5 h-8 border-white/20 bg-white/10 text-white text-sm placeholder:text-white/50"
              />
            </div>
            <Button
              onClick={scanOdds}
              disabled={loading}
              className="bg-white text-emerald-700 font-bold hover:bg-emerald-50 shrink-0 h-8 px-3"
              size="sm"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" />
                  {t.common.scanning}
                </>
              ) : (
                <>
                  <Search className="h-3.5 w-3.5 mr-1" />
                  {t.scanner.scanButton}
                </>
              )}
            </Button>
          </div>

          {/* Options */}
          <div className="mt-2 flex items-center gap-4">
            <label className="flex cursor-pointer items-center gap-1.5 text-xs text-emerald-100">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              {t.scanner.autoLabel}
            </label>
            <label className="flex cursor-pointer items-center gap-1.5 text-xs text-emerald-100">
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
        {lastScan && (
          <div className="mb-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-gray-900 border border-white/5 p-3 text-center">
              <p className="text-2xl font-bold text-white">{scannedMatches}</p>
              <p className="text-[10px] text-gray-500">{t.scanner.matchesScanned}</p>
            </div>
            <div className="rounded-xl bg-gray-900 border border-white/5 p-3 text-center">
              <p className="text-2xl font-bold text-emerald-400">{opportunities.length}</p>
              <p className="text-[10px] text-gray-500">{t.scanner.surebetCount}</p>
            </div>
            <div className="rounded-xl bg-gray-900 border border-white/5 p-3 text-center">
              <p className="text-2xl font-bold text-yellow-400">
                {opportunities.length > 0
                  ? `${opportunities[0].profit_percent.toFixed(1)}%`
                  : "0%"}
              </p>
              <p className="text-[10px] text-gray-500">{t.scanner.bestProfit}</p>
            </div>
          </div>
        )}

        {/* First time - no scan yet */}
        {!lastScan && !loading && !error && (
          <div className="py-12 text-center">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-emerald-500/10 mb-4">
              <Search className="h-10 w-10 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white">{t.scanner.emptyTitle}</h2>
            <p className="mt-2 text-sm text-gray-400 max-w-xs mx-auto">
              {t.scanner.emptyDesc}
            </p>

            <div className="mt-6 space-y-2 text-sm text-gray-500 max-w-xs mx-auto text-left">
              <div className="flex items-start gap-2">
                <Zap className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>{t.scanner.emptyTip1}</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
                <span>{t.scanner.emptyTip2}</span>
              </div>
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" />
                <span>{t.scanner.emptyTip3}</span>
              </div>
            </div>

            <Button
              onClick={scanOdds}
              className="mt-8 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8"
            >
              <Search className="h-4 w-4 mr-2" />
              {t.scanner.scanNow}
            </Button>

            <div className="mt-4">
              <button
                onClick={() => router.push("/guide")}
                className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                {t.common.viewGuide}
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && !lastScan && (
          <div className="py-16 text-center">
            <RefreshCw className="h-10 w-10 text-emerald-400 animate-spin mx-auto" />
            <p className="mt-4 text-gray-400">{t.scanner.scanningMsg}</p>
            <p className="mt-1 text-xs text-gray-500">{t.scanner.scanningTime}</p>
          </div>
        )}

        {/* No results */}
        {opportunities.length === 0 && lastScan && !loading && (
          <Card className="border-gray-700 bg-gray-900">
            <CardContent className="py-8 text-center">
              <p className="text-4xl">🔍</p>
              <p className="mt-2 font-medium text-gray-300">{t.scanner.noSurebetTitle}</p>
              <p className="mt-1 text-sm text-gray-500">
                {t.scanner.noSurebetDesc}
              </p>
              <div className="mt-4 space-y-1 text-xs text-gray-600">
                <p>{t.scanner.noSurebetTip1}</p>
                <p>{t.scanner.noSurebetTip2}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Opportunities */}
        {opportunities.map((opp) => (
          <Card key={opp.id} className="mb-3 border-white/5 bg-gray-900 overflow-hidden">
            {/* Match header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-lg shrink-0">
                  {sportEmoji[opp.match.sport] || "🏆"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate">
                    {opp.match.home_team} vs {opp.match.away_team}
                  </p>
                  <p className="text-xs text-gray-500">
                    {marketLabels[opp.market_type] || opp.market_type}
                    {opp.legs[0]?.point !== undefined && (
                      <span className="ml-1 text-yellow-400">
                        ({opp.legs[0].point})
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0 ml-2">
                <p className="text-lg font-bold text-emerald-400">
                  +{opp.profit_percent}%
                </p>
                <p className="text-[10px] text-gray-500">{t.scanner.guaranteedProfitLabel}</p>
              </div>
            </div>

            {/* Legs */}
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                {opp.legs.map((leg, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white">
                        {translateOutcome(leg.outcome)}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{leg.bookmaker_title}</p>
                      {getBookmakerUrl(leg.bookmaker, leg.bookmaker_title) && (
                        <a
                          href={getBookmakerUrl(leg.bookmaker, leg.bookmaker_title)!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {t.common.openBookmaker}
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className="text-[10px] text-gray-500">{t.common.odds}</p>
                        <p className="font-mono text-sm font-bold text-yellow-400">
                          {leg.odds.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-500">{t.common.stake}</p>
                        <p className="font-mono text-sm font-medium text-white">
                          {formatMoney(leg.stake)}{currencySuffix}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-500">{t.common.payout}</p>
                        <p className="font-mono text-sm font-medium text-emerald-400">
                          {formatMoney(leg.payout)}{currencySuffix}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="flex items-center justify-between bg-emerald-500/5 px-4 py-2 border-t border-emerald-500/20">
                <span className="text-xs text-gray-400">
                  {t.common.capital}: <span className="text-white font-medium">{formatMoney(opp.total_stake)}{currencySuffix}</span>
                </span>
                <span className="text-xs text-gray-400">
                  {t.common.profit}: <span className="text-emerald-400 font-bold">+{formatMoney(opp.guaranteed_profit)}{currencySuffix}</span>
                </span>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Scan timestamp */}
        {lastScan && (
          <p className="mt-4 text-center text-[10px] text-gray-600">
            {t.common.scannedAt.replace("{time}", new Date(lastScan).toLocaleString(locale === "vi" ? "vi-VN" : "en-US"))} •{" "}
            {t.common.cachedAgo.replace("{seconds}", "60")} •{" "}
            <button onClick={() => router.push("/guide")} className="text-gray-500 hover:text-gray-400 ml-1">
              {t.common.viewGuide}
            </button>
          </p>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
