"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getBookmakerUrl } from "@/lib/bookmakers";
import { useI18n } from "@/lib/i18n/provider";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Filter,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Sparkles,
  Target,
  BarChart3,
  Zap,
  Info,
  HelpCircle,
  AlertCircle,
} from "lucide-react";

interface OUAnalysis {
  match: {
    id: string;
    sport: string;
    homeTeam: string;
    awayTeam: string;
    commenceTime: string;
  };
  line: number;
  bookmakerOdds: {
    bookmaker: string;
    bookmakerTitle: string;
    overOdds: number;
    underOdds: number;
    lastUpdate: string;
  }[];
  discrepancy: {
    maxOverOdds: { value: number; bookmaker: string };
    maxUnderOdds: { value: number; bookmaker: string };
    spread: number;
    impliedProbSum: number;
    arbitrageProfit?: number;
    isArbitrage: boolean;
  };
  aiInsight?: string;
}

interface ScanResult {
  success: boolean;
  totalMatches: number;
  analysesCount: number;
  arbitrageCount: number;
  analyses: OUAnalysis[];
  errors?: string[];
  scannedAt: string;
}

const sportEmoji: Record<string, string> = {
  soccer: "⚽",
  basketball: "🏀",
  tennis: "🎾",
  baseball: "⚾",
  hockey: "🏒",
  mma: "🥊",
  boxing: "🥊",
  cricket: "🏏",
  rugby: "🏉",
};

export default function AIAnalyzerPage() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const [data, setData] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "arbitrage" | "discrepancy">("all");
  const [minDiscrepancy, setMinDiscrepancy] = useState(0);
  const [aiInsights, setAiInsights] = useState<Map<string, string>>(new Map());
  const [showHelp, setShowHelp] = useState(false);
  const [loadingAi, setLoadingAi] = useState<string | null>(null);

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
        `/api/ai-analyzer?min_discrepancy=${minDiscrepancy}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Scan failed");
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [minDiscrepancy]);

  const analyzeWithAI = useCallback(
    async (analysis: OUAnalysis) => {
      const key = `${analysis.match.id}-${analysis.line}`;
      if (loadingAi === key) return;

      setLoadingAi(key);
      try {
        const res = await fetch(
          `/api/ai-analyzer?min_discrepancy=0&include_ai=true`
        );
        const json = await res.json();
        if (json.analyses) {
          const match = json.analyses.find(
            (a: OUAnalysis) =>
              `${a.match.id}-${a.line}` === key
          );
          if (match?.aiInsight) {
            setAiInsights((prev) => {
              const next = new Map(prev);
              next.set(key, match.aiInsight!);
              return next;
            });
          }
        }
      } catch {
        const localInsight = generateLocalInsight(analysis);
        setAiInsights((prev) => {
          const next = new Map(prev);
          next.set(key, localInsight);
          return next;
        });
      } finally {
        setLoadingAi(null);
      }
    },
    [loadingAi]
  );

  const filteredAnalyses = data?.analyses.filter((a) => {
    if (filter === "arbitrage") return a.discrepancy.isArbitrage;
    if (filter === "discrepancy")
      return a.discrepancy.spread > 0.05 && !a.discrepancy.isArbitrage;
    return true;
  }) || [];

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleString(locale === "vi" ? "vi-VN" : "en-US", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRiskLevel = (a: OUAnalysis) => {
    if (a.discrepancy.isArbitrage) return { label: t.aiAnalyzer.riskSurebet, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" };
    if (a.discrepancy.spread > 0.1) return { label: t.aiAnalyzer.riskHigh, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" };
    if (a.discrepancy.spread > 0.05) return { label: t.aiAnalyzer.riskMedium, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" };
    return { label: t.aiAnalyzer.riskLow, color: "text-gray-400", bg: "bg-gray-500/10 border-gray-500/30" };
  };

  const sportLabels: Record<string, Record<string, string>> = {
    vi: { soccer: "Bóng đá", basketball: "Bóng rổ", tennis: "Quần vợt", baseball: "Bóng chày", hockey: "Khúc côn cầu", mma: "MMA", boxing: "Boxing", cricket: "Cricket", rugby: "Rugby" },
    en: { soccer: "Soccer", basketball: "Basketball", tennis: "Tennis", baseball: "Baseball", hockey: "Hockey", mma: "MMA", boxing: "Boxing", cricket: "Cricket", rugby: "Rugby" },
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 px-4 py-4 text-white shadow-lg">
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
                  <Brain className="h-5 w-5" />
                  {t.aiAnalyzer.title}
                </h1>
                <p className="text-xs text-purple-200">
                  {t.aiAnalyzer.subtitle}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowHelp(!showHelp)}
              className={`rounded-lg p-2 transition-colors ${showHelp ? "bg-white/20" : "hover:bg-white/10"}`}
            >
              <HelpCircle className="h-5 w-5" />
            </button>
          </div>

          {/* Help panel */}
          {showHelp && (
            <div className="mt-3 rounded-xl bg-white/10 border border-white/20 p-3 space-y-2">
              <p className="text-xs font-bold text-white">{t.aiAnalyzer.helpTitle}</p>
              <div className="space-y-1 text-xs text-purple-100">
                <p dangerouslySetInnerHTML={{ __html: t.aiAnalyzer.help1 }} />
                <p>{t.aiAnalyzer.help2}</p>
                <p dangerouslySetInnerHTML={{ __html: t.aiAnalyzer.help3 }} />
                <p dangerouslySetInnerHTML={{ __html: t.aiAnalyzer.help4 }} />
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="mt-3 flex items-end gap-3">
            <div className="flex-1">
              <label className="text-xs text-purple-200">
                {t.aiAnalyzer.minSpread}
              </label>
              <Input
                type="number"
                step="0.5"
                value={minDiscrepancy}
                onChange={(e) => setMinDiscrepancy(Number(e.target.value))}
                className="mt-1 h-8 border-white/20 bg-white/10 text-white placeholder:text-white/50"
                placeholder="0"
              />
            </div>
            <Button
              onClick={scanOdds}
              disabled={loading}
              className="bg-white text-purple-700 font-bold hover:bg-purple-50 shrink-0"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                  {t.aiAnalyzer.analyzing}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-1" />
                  {t.aiAnalyzer.analyzeButton}
                </>
              )}
            </Button>
          </div>

          {/* Filter tabs */}
          <div className="mt-3 flex gap-2">
            {[
              { key: "all" as const, label: t.aiAnalyzer.filterAll, count: data?.analysesCount },
              { key: "arbitrage" as const, label: t.aiAnalyzer.filterSurebet, count: data?.arbitrageCount },
              {
                key: "discrepancy" as const,
                label: t.aiAnalyzer.filterSpread,
                count:
                  data?.analyses.filter(
                    (a) => a.discrepancy.spread > 0.05 && !a.discrepancy.isArbitrage
                  ).length,
              },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                  filter === tab.key
                    ? "bg-white/20 text-white"
                    : "text-purple-200 hover:bg-white/10"
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className="ml-1 opacity-70">({tab.count})</span>
                )}
              </button>
            ))}
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
        {data && (
          <div className="mb-4 grid grid-cols-4 gap-2">
            <div className="rounded-xl bg-gray-800 p-3 text-center">
              <p className="text-lg font-bold text-white">{data.totalMatches}</p>
              <p className="text-sm text-gray-400">{t.aiAnalyzer.statMatches}</p>
            </div>
            <div className="rounded-xl bg-gray-800 p-3 text-center">
              <p className="text-lg font-bold text-purple-400">{data.analysesCount}</p>
              <p className="text-sm text-gray-400">{t.aiAnalyzer.statOU}</p>
            </div>
            <div className="rounded-xl bg-gray-800 p-3 text-center">
              <p className="text-lg font-bold text-emerald-400">{data.arbitrageCount}</p>
              <p className="text-sm text-gray-400">{t.aiAnalyzer.statSurebet}</p>
            </div>
            <div className="rounded-xl bg-gray-800 p-3 text-center">
              <p className="text-lg font-bold text-yellow-400">
                {data.analyses.length > 0
                  ? `${(Math.max(...data.analyses.map((a) => a.discrepancy.spread)) * 100).toFixed(1)}%`
                  : "0%"}
              </p>
              <p className="text-sm text-gray-400">{t.aiAnalyzer.statMaxSpread}</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!data && !loading && !error && (
          <div className="py-16 text-center">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-purple-500/10 mb-4">
              <Brain className="h-10 w-10 text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-white">{t.aiAnalyzer.emptyTitle}</h2>
            <p className="mt-2 text-gray-400 max-w-sm mx-auto">
              {t.aiAnalyzer.emptyDesc}
            </p>
            <div className="mt-6 space-y-3 text-sm text-gray-500 max-w-xs mx-auto text-left">
              <div className="flex items-start gap-2">
                <Target className="h-4 w-4 text-purple-400 mt-0.5 shrink-0" />
                <span>{t.aiAnalyzer.emptyTip1}</span>
              </div>
              <div className="flex items-start gap-2">
                <BarChart3 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>{t.aiAnalyzer.emptyTip2}</span>
              </div>
              <div className="flex items-start gap-2">
                <Zap className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" />
                <span>{t.aiAnalyzer.emptyTip3}</span>
              </div>
            </div>
            <Button
              onClick={scanOdds}
              className="mt-8 bg-purple-600 hover:bg-purple-500 text-white font-bold px-8"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {t.aiAnalyzer.startAnalysis}
            </Button>
          </div>
        )}

        {/* Loading */}
        {loading && !data && (
          <div className="py-16 text-center">
            <RefreshCw className="h-10 w-10 text-purple-400 animate-spin mx-auto" />
            <p className="mt-4 text-gray-400">{t.aiAnalyzer.scanningMsg}</p>
            <p className="mt-1 text-sm text-gray-500">{t.aiAnalyzer.scanningTime}</p>
          </div>
        )}

        {/* No results */}
        {data && filteredAnalyses.length === 0 && (
          <Card className="border-white/5 bg-gray-900">
            <CardContent className="py-8 text-center">
              <p className="text-4xl">🔍</p>
              <p className="mt-2 font-medium text-gray-300">{t.aiAnalyzer.noResults}</p>
              <p className="mt-1 text-sm text-gray-500">{t.aiAnalyzer.noResultsDesc}</p>
              <div className="mt-4 space-y-1 text-xs text-gray-600">
                <p>{t.aiAnalyzer.noResultsTip1}</p>
                <p>{t.aiAnalyzer.noResultsTip2}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analysis Cards */}
        {filteredAnalyses.map((analysis) => {
          const key = `${analysis.match.id}-${analysis.line}`;
          const isExpanded = expandedId === key;
          const risk = getRiskLevel(analysis);
          const emoji = sportEmoji[analysis.match.sport] || "🏆";
          const sportName = sportLabels[locale]?.[analysis.match.sport] || analysis.match.sport;

          return (
            <Card
              key={key}
              className={`mb-3 border-white/5 bg-gray-900 overflow-hidden transition-all ${
                analysis.discrepancy.isArbitrage ? "ring-1 ring-emerald-500/30" : ""
              }`}
            >
              {/* Match header */}
              <button
                className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : key)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-lg shrink-0">{emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">
                        {analysis.match.homeTeam} vs {analysis.match.awayTeam}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-sm text-gray-400">{sportName}</span>
                        <span className="text-xs text-gray-600">•</span>
                        <span className="text-xs text-yellow-400 font-medium">
                          O/U {analysis.line}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <span
                      className={`text-sm font-bold px-2 py-0.5 rounded-full border ${risk.bg} ${risk.color}`}
                    >
                      {risk.label}
                    </span>

                    <div className="text-right">
                      {analysis.discrepancy.isArbitrage ? (
                        <>
                          <p className="text-sm font-bold text-emerald-400">
                            +{analysis.discrepancy.arbitrageProfit?.toFixed(2)}%
                          </p>
                          <p className="text-sm text-gray-400">{t.common.surebet}</p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-bold text-yellow-400">
                            {(analysis.discrepancy.spread * 100).toFixed(1)}%
                          </p>
                          <p className="text-sm text-gray-400">Spread</p>
                        </>
                      )}
                    </div>

                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                </div>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="border-t border-white/5">
                  {/* Best odds highlight */}
                  <div className="grid grid-cols-2 gap-2 p-4 bg-gray-900/50">
                    <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
                      <div className="flex items-center gap-1 mb-1">
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-sm font-medium text-emerald-400">
                          {t.aiAnalyzer.bestOver}
                        </span>
                      </div>
                      <p className="text-xl font-bold text-white">
                        {analysis.discrepancy.maxOverOdds.value.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-400 truncate">
                        {getBookmakerUrl(analysis.discrepancy.maxOverOdds.bookmaker) ? (
                          <a
                            href={getBookmakerUrl(analysis.discrepancy.maxOverOdds.bookmaker)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {analysis.discrepancy.maxOverOdds.bookmaker} ↗
                          </a>
                        ) : (
                          analysis.discrepancy.maxOverOdds.bookmaker
                        )}
                      </p>
                    </div>
                    <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3">
                      <div className="flex items-center gap-1 mb-1">
                        <TrendingDown className="h-3.5 w-3.5 text-blue-400" />
                        <span className="text-sm font-medium text-blue-400">
                          {t.aiAnalyzer.bestUnder}
                        </span>
                      </div>
                      <p className="text-xl font-bold text-white">
                        {analysis.discrepancy.maxUnderOdds.value.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-400 truncate">
                        {getBookmakerUrl(analysis.discrepancy.maxUnderOdds.bookmaker) ? (
                          <a
                            href={getBookmakerUrl(analysis.discrepancy.maxUnderOdds.bookmaker)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {analysis.discrepancy.maxUnderOdds.bookmaker} ↗
                          </a>
                        ) : (
                          analysis.discrepancy.maxUnderOdds.bookmaker
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Implied probability analysis */}
                  <div className="px-4 py-3 border-t border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="h-3.5 w-3.5 text-purple-400" />
                      <span className="text-sm font-medium text-purple-400">
                        {t.aiAnalyzer.impliedAnalysis}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-sm text-gray-400">Over Implied</p>
                        <p className="text-sm font-mono font-bold text-white">
                          {(1 / analysis.discrepancy.maxOverOdds.value * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Under Implied</p>
                        <p className="text-sm font-mono font-bold text-white">
                          {(1 / analysis.discrepancy.maxUnderOdds.value * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">{t.aiAnalyzer.total}</p>
                        <p
                          className={`text-sm font-mono font-bold ${
                            analysis.discrepancy.impliedProbSum < 1
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          {(analysis.discrepancy.impliedProbSum * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="h-2 rounded-full bg-gray-700 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            analysis.discrepancy.impliedProbSum < 1
                              ? "bg-emerald-500"
                              : analysis.discrepancy.impliedProbSum < 1.05
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{
                            width: `${Math.min(analysis.discrepancy.impliedProbSum * 100, 100)}%`,
                          }}
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                        {analysis.discrepancy.impliedProbSum < 1 ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                            {t.aiAnalyzer.surebetDetected}
                          </>
                        ) : (
                          <>
                            <Info className="h-3 w-3 text-yellow-400" />
                            {t.aiAnalyzer.noSurebet}
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* All bookmaker odds table */}
                  <div className="px-4 py-3 border-t border-white/5">
                    <p className="text-sm font-medium text-gray-400 mb-2">
                      {t.aiAnalyzer.oddsComparison.replace("{count}", String(analysis.bookmakerOdds.length))}
                    </p>
                    <div className="space-y-1">
                      <div className="grid grid-cols-[1fr_60px_60px] gap-1 text-sm text-gray-500 px-2">
                        <span>{t.aiAnalyzer.bookmakerCol}</span>
                        <span className="text-center">{t.aiAnalyzer.overCol}</span>
                        <span className="text-center">{t.aiAnalyzer.underCol}</span>
                      </div>
                      {analysis.bookmakerOdds.map((bk, i) => (
                        <div
                          key={i}
                          className="grid grid-cols-[1fr_60px_60px] gap-1 rounded-lg px-2 py-1.5 text-xs hover:bg-gray-700/50"
                        >
                          {getBookmakerUrl(bk.bookmaker, bk.bookmakerTitle) ? (
                            <a
                              href={getBookmakerUrl(bk.bookmaker, bk.bookmakerTitle)!}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-300 hover:text-blue-400 transition-colors text-sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {bk.bookmakerTitle} ↗
                            </a>
                          ) : (
                            <span className="text-gray-300 text-sm">
                              {bk.bookmakerTitle}
                            </span>
                          )}
                          <span
                            className={`text-center font-mono font-medium ${
                              bk.overOdds === analysis.discrepancy.maxOverOdds.value
                                ? "text-emerald-400 font-bold"
                                : "text-white"
                            }`}
                          >
                            {bk.overOdds.toFixed(2)}
                          </span>
                          <span
                            className={`text-center font-mono font-medium ${
                              bk.underOdds === analysis.discrepancy.maxUnderOdds.value
                                ? "text-blue-400 font-bold"
                                : "text-white"
                            }`}
                          >
                            {bk.underOdds.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Insight */}
                  <div className="px-4 py-3 border-t border-white/5">
                    {aiInsights.has(key) ? (
                      <div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                          <span className="text-sm font-medium text-purple-400">
                            {t.aiAnalyzer.aiInsight}
                          </span>
                        </div>
                        <div className="rounded-lg bg-purple-500/10 border border-purple-500/20 p-3 text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                          {aiInsights.get(key)}
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                        onClick={() => analyzeWithAI(analysis)}
                        disabled={loadingAi === key}
                      >
                        {loadingAi === key ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                            {t.aiAnalyzer.aiAnalyzing}
                          </>
                        ) : (
                          <>
                            <Brain className="h-3.5 w-3.5 mr-1.5" />
                            {t.aiAnalyzer.aiAnalyzeButton}
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Match time */}
                  <div className="px-4 py-2 border-t border-white/5 bg-gray-950/50">
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      {t.aiAnalyzer.kickoff} {formatTime(analysis.match.commenceTime)}
                    </p>
                  </div>
                </div>
              )}
            </Card>
          );
        })}

        {/* Scan timestamp */}
        {data && (
          <div className="mt-4 text-center text-[10px] text-gray-600">
            <p>{t.common.scannedAt.replace("{time}", new Date(data.scannedAt).toLocaleString(locale === "vi" ? "vi-VN" : "en-US"))} • {t.common.cachedAgo.replace("{seconds}", "30")}</p>
            <Link href="/guide" className="text-gray-500 hover:text-gray-400">{t.common.viewGuide}</Link>
          </div>
        )}
      </div>

    </div>
  );
}

// Fallback local analysis when AI API is not available
function generateLocalInsight(a: OUAnalysis): string {
  const overProb = (1 / a.discrepancy.maxOverOdds.value * 100).toFixed(1);
  const underProb = (1 / a.discrepancy.maxUnderOdds.value * 100).toFixed(1);
  const totalProb = (a.discrepancy.impliedProbSum * 100).toFixed(1);

  let insight = `📊 ${a.match.homeTeam} vs ${a.match.awayTeam}\n`;
  insight += `O/U ${a.line}\n\n`;

  if (a.discrepancy.isArbitrage) {
    insight += `✅ SUREBET DETECTED!\n`;
    insight += `Total implied prob: ${totalProb}% (< 100%)\n`;
    insight += `Guaranteed profit: +${a.discrepancy.arbitrageProfit?.toFixed(2)}%\n\n`;
    insight += `→ Bet Over @${a.discrepancy.maxOverOdds.value.toFixed(2)} (${a.discrepancy.maxOverOdds.bookmaker})\n`;
    insight += `→ Bet Under @${a.discrepancy.maxUnderOdds.value.toFixed(2)} (${a.discrepancy.maxUnderOdds.bookmaker})\n`;
    insight += `\n💡 Odds discrepancy between 2 bookmakers. Betting both sides guarantees profit regardless of result.`;
  } else {
    insight += `📈 Odds spread:\n`;
    insight += `- Best Over: ${a.discrepancy.maxOverOdds.value.toFixed(2)} at ${a.discrepancy.maxOverOdds.bookmaker} (implied: ${overProb}%)\n`;
    insight += `- Best Under: ${a.discrepancy.maxUnderOdds.value.toFixed(2)} at ${a.discrepancy.maxUnderOdds.bookmaker} (implied: ${underProb}%)\n`;
    insight += `- Spread: ${(a.discrepancy.spread * 100).toFixed(1)}%\n\n`;

    if (a.discrepancy.impliedProbSum < 1.05) {
      insight += `⚡ Near surebet! Total prob ${totalProb}% is very close to 100%.\n`;
      insight += `💡 Watch closely — odds may change to form a surebet.`;
    } else {
      insight += `💡 Odds discrepancy between bookmakers shows different evaluations.\n`;
      insight += `Consider both teams' scoring trends to decide Over or Under.`;
    }
  }

  return insight;
}
