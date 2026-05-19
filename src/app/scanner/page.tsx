"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { ArbitrageOpportunity } from "@/lib/arbitrage/types";

export default function ScannerPage() {
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalStake, setTotalStake] = useState(1000000);
  const [minProfit, setMinProfit] = useState(0.5);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [scannedMatches, setScannedMatches] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [include8xbet, setInclude8xbet] = useState(false);

  const checkAuth = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
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
    const interval = setInterval(scanOdds, 60000); // Every 60s
    return () => clearInterval(interval);
  }, [autoRefresh, scanOdds]);

  // Format currency VND style
  const formatMoney = (amount: number) =>
    new Intl.NumberFormat("vi-VN").format(Math.round(amount));

  // Market type display names
  const marketLabels: Record<string, string> = {
    h2h: "1X2 (Win/Draw/Win)",
    spreads: "Handicap",
    totals: "Tài/Xỉu (O/U)",
  };

  // Sport emoji
  const sportEmoji: Record<string, string> = {
    soccer: "⚽",
    basketball: "🏀",
    tennis: "🎾",
    baseball: "⚾",
    hockey: "🏒",
    mma: "🥊",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-4 text-white shadow-lg">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">⚡ Surebet Scanner</h1>
              <p className="text-xs text-emerald-100">
                {lastScan
                  ? `Last scan: ${new Date(lastScan).toLocaleTimeString("vi-VN")}`
                  : "Ready to scan"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-white/30 text-white hover:bg-white/10"
                onClick={() => router.push("/")}
              >
                Home
              </Button>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1">
              <label className="text-xs text-emerald-100">Vốn (VND)</label>
              <Input
                type="number"
                value={totalStake}
                onChange={(e) => setTotalStake(Number(e.target.value))}
                className="mt-1 h-8 border-white/20 bg-white/10 text-white placeholder:text-white/50"
              />
            </div>
            <div className="w-24">
              <label className="text-xs text-emerald-100">Min % lợi nhuận</label>
              <Input
                type="number"
                step="0.1"
                value={minProfit}
                onChange={(e) => setMinProfit(Number(e.target.value))}
                className="mt-1 h-8 border-white/20 bg-white/10 text-white placeholder:text-white/50"
              />
            </div>
            <div className="flex flex-col gap-1 pt-3">
              <Button
                onClick={scanOdds}
                disabled={loading}
                className="bg-white text-emerald-700 font-bold hover:bg-emerald-50"
              >
                {loading ? "⏳ Scanning..." : "🔍 Scan"}
              </Button>
            </div>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <div className="mt-2 flex items-center gap-4">
              <label className="flex cursor-pointer items-center gap-1.5 text-xs text-emerald-100">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded"
                />
                Auto-refresh (60s)
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
      </div>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-4 py-4">
        {/* Error */}
        {error && (
          <Card className="mb-4 border-red-200 bg-red-50">
            <CardContent className="py-3">
              <p className="text-sm text-red-600">❌ {error}</p>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        {lastScan && (
          <div className="mb-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-gray-800 p-3 text-center">
              <p className="text-2xl font-bold text-white">{scannedMatches}</p>
              <p className="text-xs text-gray-400">Trận đã quét</p>
            </div>
            <div className="rounded-xl bg-gray-800 p-3 text-center">
              <p className="text-2xl font-bold text-emerald-400">{opportunities.length}</p>
              <p className="text-xs text-gray-400">Cơ hội Surebet</p>
            </div>
            <div className="rounded-xl bg-gray-800 p-3 text-center">
              <p className="text-2xl font-bold text-yellow-400">
                {opportunities.length > 0
                  ? `${opportunities[0].profit_percent.toFixed(1)}%`
                  : "0%"}
              </p>
              <p className="text-xs text-gray-400">Best Profit</p>
            </div>
          </div>
        )}

        {/* Opportunities */}
        {opportunities.length === 0 && lastScan && !loading && (
          <Card className="border-gray-700 bg-gray-800">
            <CardContent className="py-8 text-center">
              <p className="text-4xl">🔍</p>
              <p className="mt-2 font-medium text-gray-300">Không tìm thấy cơ hội surebet</p>
              <p className="mt-1 text-sm text-gray-500">
                Thử giảm min profit % hoặc thay đổi bộ lọc
              </p>
            </CardContent>
          </Card>
        )}

        {opportunities.map((opp) => (
          <Card key={opp.id} className="mb-3 border-gray-700 bg-gray-800 overflow-hidden">
            {/* Match header */}
            <div className="flex items-center justify-between bg-gray-750 px-4 py-2 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {sportEmoji[opp.match.sport] || "🏆"}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {opp.match.home_team} vs {opp.match.away_team}
                  </p>
                  <p className="text-xs text-gray-400">
                    {marketLabels[opp.market_type] || opp.market_type}
                    {opp.legs[0]?.point !== undefined && (
                      <span className="ml-1 text-yellow-400">
                        ({opp.legs[0].point})
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-emerald-400">
                  +{opp.profit_percent}%
                </p>
                <p className="text-xs text-gray-400">Lãi chắc chắn</p>
              </div>
            </div>

            {/* Legs */}
            <CardContent className="p-0">
              <div className="divide-y divide-gray-700">
                {opp.legs.map((leg, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {leg.outcome === "Over" ? "Tài" : leg.outcome === "Under" ? "Xỉu" : leg.outcome}
                      </p>
                      <p className="text-xs text-gray-400">{leg.bookmaker_title}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Odds</p>
                        <p className="font-mono text-sm font-bold text-yellow-400">
                          {leg.odds.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Đặt</p>
                        <p className="font-mono text-sm font-medium text-white">
                          {formatMoney(leg.stake)}đ
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Nhận</p>
                        <p className="font-mono text-sm font-medium text-emerald-400">
                          {formatMoney(leg.payout)}đ
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="flex items-center justify-between bg-emerald-900/30 px-4 py-2 border-t border-emerald-800/50">
                <span className="text-xs text-gray-400">
                  Vốn: <span className="text-white font-medium">{formatMoney(opp.total_stake)}đ</span>
                </span>
                <span className="text-xs text-gray-400">
                  Lãi: <span className="text-emerald-400 font-bold">+{formatMoney(opp.guaranteed_profit)}đ</span>
                </span>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* First time - no scan yet */}
        {!lastScan && !loading && (
          <div className="py-16 text-center">
            <p className="text-6xl">🎯</p>
            <h2 className="mt-4 text-xl font-bold text-white">Ready to Scan</h2>
            <p className="mt-2 text-gray-400">
              Nhấn <strong className="text-emerald-400">Scan</strong> để bắt đầu tìm kiếm cơ hội surebet
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Quét odds từ nhiều nhà cái, tìm chênh lệch để đặt cược chắc chắn có lãi
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
