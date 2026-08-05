"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { getBookmakerUrl } from "@/lib/bookmakers";
import { useI18n } from "@/lib/i18n/provider";
import type { TotalsLine } from "@/lib/arbitrage/types";
import {
  Search,
  RefreshCw,
  HelpCircle,
  Info,
  Zap,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  TrendingUp,
} from "lucide-react";

// ── Grouping helpers ──────────────────────────────────────────────

type DateGroup = {
  dateKey: string;    // YYYY-MM-DD for sorting
  dateLabel: string;  // "Hôm nay", "Ngày mai", or "DD/MM"
  lines: TotalsLine[];
  surebetCount: number;
};

type LeagueGroup = {
  league: string;
  dates: DateGroup[];
  totalSurebets: number;
  totalMatches: number;
};

function getDateKey(isoTime: string): string {
  return isoTime.split("T")[0];
}

function formatDateLabel(isoTime: string, today: Date, t: { scanner: { today: string; tomorrow: string } }): string {
  const matchDate = new Date(isoTime);
  const matchDay = new Date(matchDate.getFullYear(), matchDate.getMonth(), matchDate.getDate());
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffMs = matchDay.getTime() - todayDay.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return t.scanner.today;
  if (diffDays === 1) return t.scanner.tomorrow;
  return matchDate.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

export default function ScannerPage() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const [allTotals, setAllTotals] = useState<TotalsLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalStake, setTotalStake] = useState(100);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [scannedMatches, setScannedMatches] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [include8xbet, setInclude8xbet] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

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
        `/api/odds?total_stake=${totalStake}&min_profit=0${include8xbet ? "&include_8xbet=true" : ""}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scan failed");

      setAllTotals(data.all_totals || []);
      setScannedMatches(data.scanned_matches);
      setLastScan(data.scanned_at);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [totalStake, include8xbet]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(scanOdds, 60000);
    return () => clearInterval(interval);
  }, [autoRefresh, scanOdds]);

  // Auto-scan on page load
  useEffect(() => {
    scanOdds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat("vi-VN").format(Math.round(amount));

  const sportEmoji: Record<string, string> = {
    soccer: "⚽",
    basketball: "🏀",
    tennis: "🎾",
    baseball: "⚾",
    hockey: "🏒",
    mma: "🥊",
  };

  const surebetCount = allTotals.filter((t) => t.isArbitrage).length;
  const bestProfit = surebetCount > 0
    ? Math.max(...allTotals.filter((t) => t.isArbitrage).map((t) => t.profitPercent))
    : 0;

  // ── Group lines by league → date ────────────────────────────────
  const groupedData = useMemo(() => {
    const today = new Date();
    const leagueMap = new Map<string, TotalsLine[]>();

    for (const line of allTotals) {
      const league = line.match.league || t.scanner.otherLeague;
      if (!leagueMap.has(league)) leagueMap.set(league, []);
      leagueMap.get(league)!.push(line);
    }

    const groups: LeagueGroup[] = [];

    for (const [league, lines] of leagueMap) {
      // Sort lines within league: surebets first, then by profit/implied
      lines.sort((a, b) => {
        if (a.isArbitrage && !b.isArbitrage) return -1;
        if (!a.isArbitrage && b.isArbitrage) return 1;
        if (a.isArbitrage && b.isArbitrage) return b.profitPercent - a.profitPercent;
        return a.impliedTotal - b.impliedTotal;
      });

      // Group by date
      const dateMap = new Map<string, TotalsLine[]>();
      for (const line of lines) {
        const dKey = getDateKey(line.match.commence_time);
        if (!dateMap.has(dKey)) dateMap.set(dKey, []);
        dateMap.get(dKey)!.push(line);
      }

      const dates: DateGroup[] = Array.from(dateMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([dKey, dLines]) => ({
          dateKey: dKey,
          dateLabel: formatDateLabel(dLines[0].match.commence_time, today, t),
          lines: dLines,
          surebetCount: dLines.filter((l) => l.isArbitrage).length,
        }));

      groups.push({
        league,
        dates,
        totalSurebets: dates.reduce((s, d) => s + d.surebetCount, 0),
        totalMatches: lines.length,
      });
    }

    // Sort groups: leagues with surebets first (by surebet count desc), then alphabetically
    groups.sort((a, b) => {
      if (a.totalSurebets > 0 && b.totalSurebets === 0) return -1;
      if (a.totalSurebets === 0 && b.totalSurebets > 0) return 1;
      if (a.totalSurebets > 0 && b.totalSurebets > 0) return b.totalSurebets - a.totalSurebets;
      return a.league.localeCompare(b.league);
    });

    return groups;
  }, [allTotals, t]);

  const toggleGroup = (key: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // ── Render a single totals line card ────────────────────────────
  const renderLineCard = (line: TotalsLine) => (
    <Card
      key={line.id}
      className={`mb-2 overflow-hidden ${
        line.isArbitrage
          ? "border-emerald-500/30 bg-gray-900"
          : "border-white/5 bg-gray-900"
      }`}
    >
      {/* Match header */}
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
              {" • "}
              {new Date(line.match.commence_time).toLocaleTimeString(
                locale === "vi" ? "vi-VN" : "en-US",
                { hour: "2-digit", minute: "2-digit" }
              )}
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
            <>
              <p className="text-sm font-medium text-gray-400">
                {line.impliedTotal.toFixed(4)}
              </p>
              <p className="text-xs text-gray-600">implied</p>
            </>
          )}
        </div>
      </div>

      {/* Over / Under */}
      <CardContent className="p-0">
        <div className="divide-y divide-white/5">
          {/* Over */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-white">
                {t.scanner.legOver}
              </p>
              <p className="text-sm text-gray-500 truncate">{line.bestOver.bookmaker_title}</p>
              {getBookmakerUrl(line.bestOver.bookmaker, line.bestOver.bookmaker_title) && (
                <a
                  href={getBookmakerUrl(line.bestOver.bookmaker, line.bestOver.bookmaker_title)!}
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
                <p className="text-sm text-gray-500">{t.common.odds}</p>
                <p className="font-mono text-sm font-bold text-yellow-400">
                  {line.bestOver.odds.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">{t.common.stake}</p>
                <p className="font-mono text-sm font-medium text-white">
                  {formatMoney(line.stakes[0])}.000đ
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">{t.common.payout}</p>
                <p className="font-mono text-sm font-medium text-emerald-400">
                  {formatMoney(line.payouts[0])}.000đ
                </p>
              </div>
            </div>
          </div>
          {/* Under */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-white">
                {t.scanner.legUnder}
              </p>
              <p className="text-sm text-gray-500 truncate">{line.bestUnder.bookmaker_title}</p>
              {getBookmakerUrl(line.bestUnder.bookmaker, line.bestUnder.bookmaker_title) && (
                <a
                  href={getBookmakerUrl(line.bestUnder.bookmaker, line.bestUnder.bookmaker_title)!}
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
                <p className="text-sm text-gray-500">{t.common.odds}</p>
                <p className="font-mono text-sm font-bold text-yellow-400">
                  {line.bestUnder.odds.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">{t.common.stake}</p>
                <p className="font-mono text-sm font-medium text-white">
                  {formatMoney(line.stakes[1])}.000đ
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">{t.common.payout}</p>
                <p className="font-mono text-sm font-medium text-emerald-400">
                  {formatMoney(line.payouts[1])}.000đ
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        {line.isArbitrage && (
          <div className="flex items-center justify-between bg-emerald-500/5 px-4 py-2 border-t border-emerald-500/20">
            <span className="text-sm text-gray-400">
              {t.common.capital}: <span className="text-white font-medium">{formatMoney(line.totalStake)}.000đ</span>
            </span>
            <span className="text-sm text-gray-400">
              {t.common.profit}: <span className="text-emerald-400 font-bold">+{formatMoney(line.guaranteedProfit)}.000đ</span>
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-4 text-white shadow-lg">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  {t.scanner.title}
                </h1>
                <p className="text-sm text-emerald-100">
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
            <div className="mt-3 rounded-xl bg-white/10 border border-white/20 p-4 space-y-2">
              <p className="text-sm font-bold text-white">{t.scanner.helpTitle}</p>
              <div className="space-y-1.5 text-sm text-emerald-100">
                <p dangerouslySetInnerHTML={{ __html: t.scanner.help1 }} />
                <p dangerouslySetInnerHTML={{ __html: t.scanner.help2 }} />
                <p>{t.scanner.help3}</p>
                <p dangerouslySetInnerHTML={{ __html: t.scanner.help4 }} />
              </div>
              <div className="flex items-center gap-1 text-sm text-yellow-200">
                <AlertCircle className="h-4 w-4" />
                {t.scanner.helpWarning}
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="mt-3 flex items-end gap-2">
            <div className="flex-1 min-w-0">
              <label className="text-sm text-emerald-200">{t.scanner.capitalLabel}</label>
              <Input
                type="number"
                value={totalStake}
                onChange={(e) => setTotalStake(Number(e.target.value))}
                className="mt-1 h-10 border-white/20 bg-white/10 text-white text-base placeholder:text-white/50"
              />
            </div>
            <Button
              onClick={scanOdds}
              disabled={loading}
              className="bg-white text-emerald-700 font-bold hover:bg-emerald-50 shrink-0 h-10 px-4"
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
                  {t.scanner.scanButton}
                </>
              )}
            </Button>
          </div>

          {/* Options */}
          <div className="mt-2.5 flex items-center gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-emerald-100">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              {t.scanner.autoLabel}
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-emerald-100">
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
              <p className="text-sm text-gray-500">{t.scanner.matchesScanned}</p>
            </div>
            <div className="rounded-xl bg-gray-900 border border-white/5 p-3 text-center">
              <p className="text-2xl font-bold text-emerald-400">{surebetCount}</p>
              <p className="text-sm text-gray-500">{t.scanner.surebetCount}</p>
            </div>
            <div className="rounded-xl bg-gray-900 border border-white/5 p-3 text-center">
              <p className="text-2xl font-bold text-yellow-400">
                {bestProfit > 0 ? `+${bestProfit.toFixed(1)}%` : "0%"}
              </p>
              <p className="text-sm text-gray-500">{t.scanner.bestProfit}</p>
            </div>
          </div>
        )}

        {/* Best Profit Summary */}
        {surebetCount > 0 && (
          <Card className="mb-4 border-emerald-500/20 bg-gradient-to-r from-emerald-900/20 to-teal-900/20">
            <CardContent className="py-4">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <p className="text-2xl font-bold text-white">
                    {formatMoney(totalStake)}.000đ
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{t.common.capital}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-400">
                    +{formatMoney(Math.max(...allTotals.filter(l => l.isArbitrage).map(l => l.guaranteedProfit)))}.000đ
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{t.common.profit}</p>
                </div>
              </div>
            </CardContent>
          </Card>
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
                className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300 transition-colors"
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
            <p className="mt-1 text-sm text-gray-500">{t.scanner.scanningTime}</p>
          </div>
        )}

        {/* No results */}
        {allTotals.length === 0 && lastScan && !loading && (
          <Card className="border-gray-700 bg-gray-900">
            <CardContent className="py-8 text-center">
              <p className="text-4xl">🔍</p>
              <p className="mt-2 font-medium text-gray-300">{t.scanner.noSurebetTitle}</p>
              <p className="mt-1 text-sm text-gray-500">
                {t.scanner.noSurebetDesc}
              </p>
              <div className="mt-4 space-y-1 text-sm text-gray-600">
                <p>{t.scanner.noSurebetTip1}</p>
                <p>{t.scanner.noSurebetTip2}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Grouped results: by league → date ─────────────────── */}
        {groupedData.map((group) => {
          const hasSurebets = group.totalSurebets > 0;
          return (
            <div key={group.league} className="mb-4">
              {/* League header bar */}
              <button
                onClick={() => toggleGroup(`league-${group.league}`)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl mb-2 transition-colors ${
                  hasSurebets
                    ? "bg-emerald-500/10 border border-emerald-500/20"
                    : "bg-gray-900 border border-white/5"
                }`}
              >
                <div className="flex items-center gap-2">
                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 transition-transform ${
                      collapsedGroups.has(`league-${group.league}`) ? "-rotate-90" : ""
                    }`}
                  />
                  <span className={`text-sm font-bold ${hasSurebets ? "text-emerald-400" : "text-gray-300"}`}>
                    {group.league}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  {hasSurebets && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">
                      {group.totalSurebets} {t.scanner.surebetsLabel}
                    </span>
                  )}
                  <span className="text-gray-500">
                    {group.totalMatches} {t.scanner.matchesLabel}
                  </span>
                </div>
              </button>

              {/* Collapsible content */}
              {!collapsedGroups.has(`league-${group.league}`) && (
                <div className="pl-1">
                  {group.dates.map((dateGroup) => {
                    const dateKey = `league-${group.league}-date-${dateGroup.dateKey}`;
                    return (
                      <div key={dateKey} className="mb-3">
                        {/* Date sub-header */}
                        <button
                          onClick={() => toggleGroup(dateKey)}
                          className="w-full flex items-center justify-between px-3 py-1.5 mb-1.5 rounded-lg hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <ChevronDown
                              className={`h-3.5 w-3.5 text-gray-500 transition-transform ${
                                collapsedGroups.has(dateKey) ? "-rotate-90" : ""
                              }`}
                            />
                            <span className="text-xs font-medium text-gray-400">
                              {dateGroup.dateLabel}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px]">
                            {dateGroup.surebetCount > 0 && (
                              <span className="text-emerald-500">
                                {dateGroup.surebetCount} {t.scanner.surebetsLabel}
                              </span>
                            )}
                            <span className="text-gray-600">
                              {dateGroup.lines.length} {t.scanner.matchesLabel}
                            </span>
                          </div>
                        </button>

                        {/* Lines */}
                        {!collapsedGroups.has(dateKey) && (
                          <div>
                            {dateGroup.lines.map(renderLineCard)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

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
    </div>
  );
}
