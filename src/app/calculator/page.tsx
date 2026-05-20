"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function CalculatorPage() {
  const router = useRouter();
  const [odds1, setOdds1] = useState("");
  const [odds2, setOdds2] = useState("");
  const [odds3, setOdds3] = useState(""); // Optional: for 1X2 (draw)
  const [totalStake, setTotalStake] = useState("1000000");
  const [result, setResult] = useState<{
    isArb: boolean;
    profitPercent: number;
    stakes: number[];
    payouts: number[];
    profit: number;
    roundedStakes: number[];
    roundedPayouts: number[];
    roundedProfit: number;
    roundedProfitPercent: number;
    roundedTotalStake: number;
    roundMode: string;
  } | null>(null);

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat("vi-VN").format(Math.round(amount));

  type RoundMode = "none" | "10k" | "50k" | "100k";
  const [roundMode, setRoundMode] = useState<RoundMode>("10k");

  const getRoundUnit = (mode: RoundMode): number => {
    switch (mode) {
      case "10k": return 10_000;
      case "50k": return 50_000;
      case "100k": return 100_000;
      default: return 1;
    }
  };

  // Round stake to nearest unit, preferring round-up for the largest stake
  // to guarantee profit is still positive
  const roundStakes = (exactStakes: number[], unit: number, allOdds: number[]): number[] => {
    if (unit <= 1) return exactStakes.map((s) => Math.round(s));

    const rounded = exactStakes.map((s) => Math.round(s / unit) * unit);

    // Adjust the largest stake to compensate so total still equals the original total
    // Find the leg where rounding delta is largest (positive = we added money)
    const totalExact = exactStakes.reduce((a, b) => a + b, 0);
    const totalRounded = rounded.reduce((a, b) => a + b, 0);
    const diff = totalRounded - totalExact;

    if (Math.abs(diff) >= unit) {
      // Find the leg with the largest stake to absorb the difference
      const maxIdx = exactStakes.indexOf(Math.max(...exactStakes));
      rounded[maxIdx] = Math.round((exactStakes[maxIdx] - diff) / unit) * unit;
    }

    // Verify profit is still positive with rounded stakes
    const payouts = rounded.map((s, i) => s * allOdds[i]);
    const minPayout = Math.min(...payouts);
    const totalStakeRounded = rounded.reduce((a, b) => a + b, 0);

    // If profit went negative, nudge the largest stake up by one unit
    if (minPayout <= totalStakeRounded) {
      const maxIdx = exactStakes.indexOf(Math.max(...exactStakes));
      rounded[maxIdx] += unit;
    }

    return rounded;
  };

  const calculate = () => {
    const o1 = parseFloat(odds1);
    const o2 = parseFloat(odds2);
    const o3 = odds3 ? parseFloat(odds3) : null;
    const stake = parseFloat(totalStake) || 1000000;

    if (!o1 || !o2 || o1 <= 0 || o2 <= 0) return;

    const allOdds = o3 && o3 > 0 ? [o1, o2, o3] : [o1, o2];
    const impliedTotal = allOdds.reduce((sum, o) => sum + 1 / o, 0);

    const isArb = impliedTotal < 1;
    const pProfit = isArb ? ((1 - impliedTotal) / impliedTotal) * 100 : 0;

    const exactStakes = allOdds.map((o) => ((1 / o) / impliedTotal) * stake);
    const exactPayouts = allOdds.map((o, i) => exactStakes[i] * o);

    // Calculate rounded stakes
    const unit = getRoundUnit(roundMode);
    const roundedStakes = roundStakes(exactStakes, unit, allOdds);
    const roundedPayouts = allOdds.map((o, i) => roundedStakes[i] * o);
    const roundedMinPayout = Math.min(...roundedPayouts);
    const roundedTotalStake = roundedStakes.reduce((a, b) => a + b, 0);
    const roundedProfit = isArb ? roundedMinPayout - roundedTotalStake : 0;
    const roundedProfitPercent = isArb && roundedTotalStake > 0
      ? (roundedProfit / roundedTotalStake) * 100
      : 0;

    setResult({
      isArb,
      profitPercent: pProfit,
      stakes: exactStakes,
      payouts: exactPayouts,
      profit: exactPayouts[0] - stake,
      roundedStakes,
      roundedPayouts,
      roundedProfit,
      roundedProfitPercent,
      roundedTotalStake,
      roundMode,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-4 text-white shadow-lg">
        <div className="mx-auto max-w-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">🧮 Surebet Calculator</h1>
              <p className="text-xs text-blue-100">Tính stake cho kèo surebet</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-white/30 text-white hover:bg-white/10"
              onClick={() => router.push("/scanner")}
            >
              Scanner
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 py-6 space-y-4">
        {/* Odds Input */}
        <Card className="border-gray-700 bg-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-white">Nhập Odds (Decimal)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs text-gray-400">Odds cửa 1 (VD: Tài / Home)</label>
              <Input
                type="number"
                step="0.01"
                placeholder="2.10"
                value={odds1}
                onChange={(e) => setOdds1(e.target.value)}
                className="mt-1 border-gray-600 bg-gray-700 text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Odds cửa 2 (VD: Xỉu / Away)</label>
              <Input
                type="number"
                step="0.01"
                placeholder="2.05"
                value={odds2}
                onChange={(e) => setOdds2(e.target.value)}
                className="mt-1 border-gray-600 bg-gray-700 text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">
                Odds cửa 3 <span className="text-gray-500">(tuỳ chọn - cho 1X2)</span>
              </label>
              <Input
                type="number"
                step="0.01"
                placeholder="Để trống nếu chỉ 2 cửa"
                value={odds3}
                onChange={(e) => setOdds3(e.target.value)}
                className="mt-1 border-gray-600 bg-gray-700 text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Tổng vốn (VND)</label>
              <Input
                type="number"
                value={totalStake}
                onChange={(e) => setTotalStake(e.target.value)}
                className="mt-1 border-gray-600 bg-gray-700 text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Làm tròn số tiền đặt</label>
              <div className="flex gap-2">
                {([
                  ["none", "Không"],
                  ["10k", "10K"],
                  ["50k", "50K"],
                  ["100k", "100K"],
                ] as const).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setRoundMode(val as RoundMode)}
                    className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                      roundMode === val
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-xs text-gray-500">Số chẵn ít bị chú ý hơn số lẻ</p>
            </div>
            <Button
              onClick={calculate}
              className="w-full bg-emerald-600 font-bold hover:bg-emerald-700"
            >
              🧮 Tính Toán
            </Button>
          </CardContent>
        </Card>

        {/* Result */}
        {result && (
          <Card
            className={`border-2 ${
              result.isArb
                ? "border-emerald-500 bg-emerald-900/20"
                : "border-red-500/50 bg-red-900/20"
            }`}
          >
            <CardContent className="py-4 space-y-4">
              {/* Verdict */}
              <div className="text-center">
                <p className="text-3xl">{result.isArb ? "✅ SUREBET!" : "❌ Không có surebet"}</p>
                {result.isArb && (
                  <p className="mt-1 text-lg font-bold text-emerald-400">
                    Lãi chắc chắn: +{result.profitPercent.toFixed(2)}%
                  </p>
                )}
              </div>

              {/* Stake breakdown */}
              {result.isArb && (
                <div className="space-y-2">
                  {result.roundedStakes.map((rStake, i) => {
                    const odds = [odds1, odds2, odds3].filter(Boolean);
                    const exactStake = result.stakes[i];
                    const isDifferent = Math.abs(rStake - Math.round(exactStake)) > 1;
                    return (
                      <div
                        key={i}
                        className="rounded-lg bg-gray-800 px-4 py-3"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-white">Cửa {i + 1}</p>
                            <p className="text-xs text-gray-400">
                              Odds: <span className="text-yellow-400">{parseFloat(odds[i]).toFixed(2)}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-white">
                              {formatMoney(rStake)}đ
                            </p>
                            {isDifferent && (
                              <p className="text-xs text-gray-500 line-through">
                                Chính xác: {formatMoney(exactStake)}đ
                              </p>
                            )}
                            <p className="text-xs text-emerald-400">
                              Nhận: {formatMoney(result.roundedPayouts[i])}đ
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Rounded Summary */}
                  <div className="mt-3 flex items-center justify-between rounded-lg bg-emerald-900/40 px-4 py-3 border border-emerald-700/50">
                    <span className="text-sm text-gray-300">
                      Tổng vốn: <strong className="text-white">{formatMoney(result.roundedTotalStake)}đ</strong>
                    </span>
                    <span className="text-sm text-gray-300">
                      Lãi: <strong className="text-emerald-400">+{formatMoney(result.roundedProfit)}đ ({result.roundedProfitPercent.toFixed(2)}%)</strong>
                    </span>
                  </div>

                  {/* Safety tip */}
                  {result.roundMode !== "none" && (
                    <p className="text-xs text-center text-blue-400 mt-1">
                      💡 Số chẵn giúp tránh bị flag tài khoản
                    </p>
                  )}
                </div>
              )}

              {/* No arb explanation */}
              {!result.isArb && (
                <p className="text-center text-sm text-gray-400">
                  Tổng xác suất ngụ ý &ge; 100% — không có cơ hội surebet với kèo này.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* How it works */}
        <Card className="border-gray-700 bg-gray-800">
          <CardContent className="py-4">
            <h3 className="font-semibold text-white">💡 Cách hoạt động</h3>
            <ul className="mt-2 space-y-1 text-sm text-gray-400">
              <li>• Nhập odds decimal từ 2+ nhà cái</li>
              <li>• Hệ thống tính xác suất ngụ ý: <code className="text-yellow-400">1/odds</code></li>
              <li>• Nếu tổng &lt; 1 → Surebet tồn tại</li>
              <li>• Stake mỗi cửa = (1/odds) / tổng × vốn</li>
              <li>• VD: odds 2.10 + 2.05 → lãi ~3.7%</li>
              <li>• <span className="text-blue-400">⚠️ Nên dùng số chẵn (10K/50K/100K) để tránh bị nhà cái flag/block tài khoản</span></li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
