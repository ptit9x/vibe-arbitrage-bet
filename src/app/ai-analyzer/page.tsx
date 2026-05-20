"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/bottom-nav";
import Link from "next/link";
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

const sportLabels: Record<string, string> = {
  soccer: "Bóng đá",
  basketball: "Bóng rổ",
  tennis: "Quần vợt",
  baseball: "Bóng chày",
  hockey: "Khúc côn cầu",
  mma: "MMA",
  boxing: "Boxing",
  cricket: "Cricket",
  rugby: "Rugby",
};

export default function AIAnalyzerPage() {
  const router = useRouter();
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
      if (loadingAi === key || !process.env.NEXT_PUBLIC_OPENAI_ENABLED) return;

      setLoadingAi(key);
      try {
        // Call the AI analyzer with include_ai flag for a single match
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
        // Fallback: generate a smart local analysis
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
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRiskLevel = (a: OUAnalysis) => {
    if (a.discrepancy.isArbitrage) return { label: "Surebet", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" };
    if (a.discrepancy.spread > 0.1) return { label: "Cao", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" };
    if (a.discrepancy.spread > 0.05) return { label: "Trung bình", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" };
    return { label: "Thấp", color: "text-gray-400", bg: "bg-gray-500/10 border-gray-500/30" };
  };

  return (
    <div className="min-h-screen bg-gray-950 pb-20">
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
                  AI Analyzer
                </h1>
                <p className="text-xs text-purple-200">
                  Phân tích chênh lệch kèo Tài/Xỉu
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
              <p className="text-xs font-bold text-white">📌 Hướng dẫn nhanh:</p>
              <div className="space-y-1 text-xs text-purple-100">
                <p>1. Nhấn <strong>Phân tích AI</strong> để quét kèo Tài/Xỉu</p>
                <p>2. Nhấn vào trận đấu để xem chi tiết chênh lệch odds</p>
                <p>3. Nhấn <strong>Phân tích bằng AI</strong> để lấy khuyến nghị</p>
                <p>4. 🟢 <strong>Surebet</strong> = tổng xác suất &lt; 100% → luôn có lãi!</p>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="mt-3 flex items-end gap-3">
            <div className="flex-1">
              <label className="text-xs text-purple-200">
                Min chênh lệch (%)
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
                  Đang quét...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-1" />
                  Phân tích AI
                </>
              )}
            </Button>
          </div>

          {/* Filter tabs */}
          <div className="mt-3 flex gap-2">
            {[
              { key: "all" as const, label: "Tất cả", count: data?.analysesCount },
              { key: "arbitrage" as const, label: "🎯 Surebet", count: data?.arbitrageCount },
              {
                key: "discrepancy" as const,
                label: "📊 Chênh lệch",
                count:
                  data?.analyses.filter(
                    (a) => a.discrepancy.spread > 0.05 && !a.discrepancy.isArbitrage
                  ).length,
              },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
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
              <p className="text-[10px] text-gray-400">Trận</p>
            </div>
            <div className="rounded-xl bg-gray-800 p-3 text-center">
              <p className="text-lg font-bold text-purple-400">{data.analysesCount}</p>
              <p className="text-[10px] text-gray-400">Kèo O/U</p>
            </div>
            <div className="rounded-xl bg-gray-800 p-3 text-center">
              <p className="text-lg font-bold text-emerald-400">{data.arbitrageCount}</p>
              <p className="text-[10px] text-gray-400">Surebet</p>
            </div>
            <div className="rounded-xl bg-gray-800 p-3 text-center">
              <p className="text-lg font-bold text-yellow-400">
                {data.analyses.length > 0
                  ? `${(Math.max(...data.analyses.map((a) => a.discrepancy.spread)) * 100).toFixed(1)}%`
                  : "0%"}
              </p>
              <p className="text-[10px] text-gray-400">Max Spread</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!data && !loading && !error && (
          <div className="py-16 text-center">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-purple-500/10 mb-4">
              <Brain className="h-10 w-10 text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-white">AI O/U Analyzer</h2>
            <p className="mt-2 text-gray-400 max-w-sm mx-auto">
              Quét kèo Tài/Xỉu từ các nhà cái, phát hiện chênh lệch odds và cơ hội surebet bằng AI
            </p>
            <div className="mt-6 space-y-3 text-sm text-gray-500 max-w-xs mx-auto text-left">
              <div className="flex items-start gap-2">
                <Target className="h-4 w-4 text-purple-400 mt-0.5 shrink-0" />
                <span>Tìm kèo Tài/Xỉu có chênh lệch odds lớn nhất giữa các nhà cái</span>
              </div>
              <div className="flex items-start gap-2">
                <BarChart3 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>Phân tích xác suất ẩn, xác định surebet (lãi chắc chắn)</span>
              </div>
              <div className="flex items-start gap-2">
                <Zap className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" />
                <span>AI đưa ra khuyến nghị dựa trên dữ liệu odds thực tế</span>
              </div>
            </div>
            <Button
              onClick={scanOdds}
              className="mt-8 bg-purple-600 hover:bg-purple-500 text-white font-bold px-8"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Bắt đầu phân tích
            </Button>
          </div>
        )}

        {/* Loading */}
        {loading && !data && (
          <div className="py-16 text-center">
            <RefreshCw className="h-10 w-10 text-purple-400 animate-spin mx-auto" />
            <p className="mt-4 text-gray-400">Đang quét odds từ các nhà cái...</p>
            <p className="mt-1 text-xs text-gray-500">Có thể mất 5-10 giây</p>
          </div>
        )}

        {/* No results */}
        {data && filteredAnalyses.length === 0 && (
          <Card className="border-white/5 bg-gray-900">
            <CardContent className="py-8 text-center">
              <p className="text-4xl">🔍</p>
              <p className="mt-2 font-medium text-gray-300">
                Không tìm thấy kèo phù hợp
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Thử giảm min chênh lệch hoặc đổi bộ lọc
              </p>
              <div className="mt-4 space-y-1 text-xs text-gray-600">
                <p>💡 Thử giảm min spread xuống 0%</p>
                <p>💡 Chuyển sang tab "Tất cả" để xem toàn bộ</p>
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
          const sportName = sportLabels[analysis.match.sport] || analysis.match.sport;

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
                        <span className="text-xs text-gray-400">{sportName}</span>
                        <span className="text-xs text-gray-600">•</span>
                        <span className="text-xs text-yellow-400 font-medium">
                          O/U {analysis.line}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    {/* Risk badge */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${risk.bg} ${risk.color}`}
                    >
                      {risk.label}
                    </span>

                    {/* Profit or Spread */}
                    <div className="text-right">
                      {analysis.discrepancy.isArbitrage ? (
                        <>
                          <p className="text-sm font-bold text-emerald-400">
                            +{analysis.discrepancy.arbitrageProfit?.toFixed(2)}%
                          </p>
                          <p className="text-[10px] text-gray-400">Surebet</p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-bold text-yellow-400">
                            {(analysis.discrepancy.spread * 100).toFixed(1)}%
                          </p>
                          <p className="text-[10px] text-gray-400">Spread</p>
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
                        <span className="text-[10px] font-medium text-emerald-400">
                          BEST TÀI (Over)
                        </span>
                      </div>
                      <p className="text-xl font-bold text-white">
                        {analysis.discrepancy.maxOverOdds.value.toFixed(2)}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate">
                        {analysis.discrepancy.maxOverOdds.bookmaker}
                      </p>
                    </div>
                    <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3">
                      <div className="flex items-center gap-1 mb-1">
                        <TrendingDown className="h-3.5 w-3.5 text-blue-400" />
                        <span className="text-[10px] font-medium text-blue-400">
                          BEST XỈU (Under)
                        </span>
                      </div>
                      <p className="text-xl font-bold text-white">
                        {analysis.discrepancy.maxUnderOdds.value.toFixed(2)}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate">
                        {analysis.discrepancy.maxUnderOdds.bookmaker}
                      </p>
                    </div>
                  </div>

                  {/* Implied probability analysis */}
                  <div className="px-4 py-3 border-t border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="h-3.5 w-3.5 text-purple-400" />
                      <span className="text-xs font-medium text-purple-400">
                        Phân tích xác suất
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-xs text-gray-400">Over Implied</p>
                        <p className="text-sm font-mono font-bold text-white">
                          {(1 / analysis.discrepancy.maxOverOdds.value * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Under Implied</p>
                        <p className="text-sm font-mono font-bold text-white">
                          {(1 / analysis.discrepancy.maxUnderOdds.value * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Total</p>
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
                      <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                        {analysis.discrepancy.impliedProbSum < 1 ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                            Tổng xác suất &lt; 100% → Có surebet!
                          </>
                        ) : (
                          <>
                            <Info className="h-3 w-3 text-yellow-400" />
                            Tổng xác suất &gt; 100% → Chênh lệch nhưng không surebet
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* All bookmaker odds table */}
                  <div className="px-4 py-3 border-t border-white/5">
                    <p className="text-xs font-medium text-gray-400 mb-2">
                      So sánh odds tất cả nhà cái ({analysis.bookmakerOdds.length})
                    </p>
                    <div className="space-y-1">
                      {/* Header */}
                      <div className="grid grid-cols-[1fr_60px_60px] gap-1 text-[10px] text-gray-500 px-2">
                        <span>Nhà cái</span>
                        <span className="text-center">Tài</span>
                        <span className="text-center">Xỉu</span>
                      </div>
                      {analysis.bookmakerOdds.map((bk, i) => (
                        <div
                          key={i}
                          className="grid grid-cols-[1fr_60px_60px] gap-1 rounded-lg px-2 py-1.5 text-xs hover:bg-gray-700/50"
                        >
                          <span className="text-gray-300 truncate text-[11px]">
                            {bk.bookmakerTitle}
                          </span>
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
                          <span className="text-xs font-medium text-purple-400">
                            Phân tích AI
                          </span>
                        </div>
                        <div className="rounded-lg bg-purple-500/10 border border-purple-500/20 p-3 text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">
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
                            AI đang phân tích...
                          </>
                        ) : (
                          <>
                            <Brain className="h-3.5 w-3.5 mr-1.5" />
                            Phân tích bằng AI
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Match time */}
                  <div className="px-4 py-2 border-t border-white/5 bg-gray-950/50">
                    <p className="text-[10px] text-gray-500 flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      Kick-off: {formatTime(analysis.match.commenceTime)}
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
            <p>Quét lúc: {new Date(data.scannedAt).toLocaleString("vi-VN")} • Cache: 30 giây</p>
            <Link href="/guide" className="text-gray-500 hover:text-gray-400">Xem hướng dẫn chi tiết →</Link>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

// Fallback local analysis when AI API is not available
function generateLocalInsight(a: OUAnalysis): string {
  const overProb = (1 / a.discrepancy.maxOverOdds.value * 100).toFixed(1);
  const underProb = (1 / a.discrepancy.maxUnderOdds.value * 100).toFixed(1);
  const totalProb = (a.discrepancy.impliedProbSum * 100).toFixed(1);

  let insight = `📊 Phân tích: ${a.match.homeTeam} vs ${a.match.awayTeam}\n`;
  insight += `Kèo: Tài/Xỉu ${a.line}\n\n`;

  if (a.discrepancy.isArbitrage) {
    insight += `✅ SUREBET PHÁT HIỆN!\n`;
    insight += `Tổng xác suất ẩn: ${totalProb}% (< 100%)\n`;
    insight += `Lãi chắc chắn: +${a.discrepancy.arbitrageProfit?.toFixed(2)}%\n\n`;
    insight += `→ Đặt Tài @${a.discrepancy.maxOverOdds.value.toFixed(2)} (${a.discrepancy.maxOverOdds.bookmaker})\n`;
    insight += `→ Đặt Xỉu @${a.discrepancy.maxUnderOdds.value.toFixed(2)} (${a.discrepancy.maxUnderOdds.bookmaker})\n`;
    insight += `\n💡 Đây là cơ hội chênh lệch odds giữa 2 nhà cái. Đặt cược ở cả 2 bên đảm bảo có lãi bất kể kết quả.`;
  } else {
    insight += `📈 Chênh lệch odds:\n`;
    insight += `- Tài tốt nhất: ${a.discrepancy.maxOverOdds.value.toFixed(2)} tại ${a.discrepancy.maxOverOdds.bookmaker} (xác suất: ${overProb}%)\n`;
    insight += `- Xỉu tốt nhất: ${a.discrepancy.maxUnderOdds.value.toFixed(2)} tại ${a.discrepancy.maxUnderOdds.bookmaker} (xác suất: ${underProb}%)\n`;
    insight += `- Spread: ${(a.discrepancy.spread * 100).toFixed(1)}%\n\n`;

    if (a.discrepancy.impliedProbSum < 1.05) {
      insight += `⚡ Gần surebet! Tổng xác suất ${totalProb}% rất gần 100%.\n`;
      insight += `💡 Theo dõi sát - odds có thể thay đổi tạo thành surebet.`;
    } else {
      insight += `💡 Chênh lệch odds giữa các nhà cái cho thấy sự khác biệt trong đánh giá.\n`;
      insight += `Xem xét xu hướng ghi bàn của cả 2 đội để quyết định Tài hay Xỉu.`;
    }
  }

  return insight;
}
