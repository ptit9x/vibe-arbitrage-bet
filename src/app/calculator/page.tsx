"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/bottom-nav";
import Link from "next/link";
import {
  Calculator,
  ArrowLeft,
  HelpCircle,
  Info,
  CheckCircle2,
  XCircle,
  Lightbulb,
} from "lucide-react";

export default function CalculatorPage() {
  const router = useRouter();
  const [odds1, setOdds1] = useState("");
  const [odds2, setOdds2] = useState("");
  const [odds3, setOdds3] = useState("");
  const [totalStake, setTotalStake] = useState("1000000");
  const [showHelp, setShowHelp] = useState(false);
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

  const roundStakes = (exactStakes: number[], unit: number, allOdds: number[]): number[] => {
    if (unit <= 1) return exactStakes.map((s) => Math.round(s));

    const rounded = exactStakes.map((s) => Math.round(s / unit) * unit);

    const totalExact = exactStakes.reduce((a, b) => a + b, 0);
    const totalRounded = rounded.reduce((a, b) => a + b, 0);
    const diff = totalRounded - totalExact;

    if (Math.abs(diff) >= unit) {
      const maxIdx = exactStakes.indexOf(Math.max(...exactStakes));
      rounded[maxIdx] = Math.round((exactStakes[maxIdx] - diff) / unit) * unit;
    }

    const payouts = rounded.map((s, i) => s * allOdds[i]);
    const minPayout = Math.min(...payouts);
    const totalStakeRounded = rounded.reduce((a, b) => a + b, 0);

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

  const loadExample = (type: "2way" | "3way") => {
    if (type === "2way") {
      setOdds1("2.10");
      setOdds2("2.05");
      setOdds3("");
      setTotalStake("1000000");
    } else {
      setOdds1("3.20");
      setOdds2("3.50");
      setOdds3("2.30");
      setTotalStake("1000000");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-4 text-white shadow-lg">
        <div className="mx-auto max-w-lg">
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
                  <Calculator className="h-5 w-5" />
                  Calculator
                </h1>
                <p className="text-xs text-blue-100">Tính stake cho kèo surebet</p>
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
              <p className="text-xs font-bold text-white">📌 Hướng dẫn nhanh:</p>
              <div className="space-y-1 text-xs text-blue-100">
                <p>1. Nhập odds decimal từ 2+ nhà cái (VD: 2.10 và 2.05)</p>
                <p>2. Nhập tổng vốn (VD: 1,000,000đ)</p>
                <p>3. Chọn chế độ làm tròn (khuyến nghị: 10K)</p>
                <p>4. Nhấn <strong>Tính Toán</strong> để xem kết quả</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-yellow-200">
                <Info className="h-3 w-3" />
                Công thức: Xác suất ẩn = 1/odds. Nếu tổng &lt; 1 → Surebet!
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 py-4 space-y-4">
        {/* Quick examples */}
        <div className="flex gap-2">
          <button
            onClick={() => loadExample("2way")}
            className="flex-1 rounded-xl border border-white/5 bg-gray-900/50 p-2.5 text-center text-xs text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
          >
            <span className="block text-base mb-0.5">⚽</span>
            Ví dụ 2 cửa (O/U)
          </button>
          <button
            onClick={() => loadExample("3way")}
            className="flex-1 rounded-xl border border-white/5 bg-gray-900/50 p-2.5 text-center text-xs text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
          >
            <span className="block text-base mb-0.5">🏆</span>
            Ví dụ 3 cửa (1X2)
          </button>
        </div>

        {/* Odds Input */}
        <Card className="border-white/5 bg-gray-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-white">Nhập Odds (Decimal)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs text-gray-400">Odds cửa 1 (VD: Tài / Home)</label>
              <Input
                type="number"
                step="0.01"
                placeholder="VD: 2.10"
                value={odds1}
                onChange={(e) => setOdds1(e.target.value)}
                className="mt-1 border-white/10 bg-gray-800 text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Odds cửa 2 (VD: Xỉu / Away)</label>
              <Input
                type="number"
                step="0.01"
                placeholder="VD: 2.05"
                value={odds2}
                onChange={(e) => setOdds2(e.target.value)}
                className="mt-1 border-white/10 bg-gray-800 text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">
                Odds cửa 3 <span className="text-gray-600">(tuỳ chọn — cho kèo 1X2)</span>
              </label>
              <Input
                type="number"
                step="0.01"
                placeholder="Để trống nếu chỉ 2 cửa"
                value={odds3}
                onChange={(e) => setOdds3(e.target.value)}
                className="mt-1 border-white/10 bg-gray-800 text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Tổng vốn (VND)</label>
              <Input
                type="number"
                value={totalStake}
                onChange={(e) => setTotalStake(e.target.value)}
                className="mt-1 border-white/10 bg-gray-800 text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block">
                Làm tròn số tiền đặt
                <span className="text-gray-600 ml-1">(tránh bị flag)</span>
              </label>
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
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <Button
              onClick={calculate}
              className="w-full bg-emerald-600 font-bold hover:bg-emerald-700"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Tính Toán
            </Button>
          </CardContent>
        </Card>

        {/* Result */}
        {result && (
          <Card
            className={`border-2 ${
              result.isArb
                ? "border-emerald-500/30 bg-emerald-900/10"
                : "border-red-500/30 bg-red-900/10"
            }`}
          >
            <CardContent className="py-4 space-y-4">
              {/* Verdict */}
              <div className="text-center">
                {result.isArb ? (
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    <span className="text-lg font-bold text-emerald-400">SUREBET!</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 rounded-full bg-red-500/10 border border-red-500/20 px-4 py-2">
                    <XCircle className="h-5 w-5 text-red-400" />
                    <span className="text-lg font-bold text-red-400">Không có surebet</span>
                  </div>
                )}
                {result.isArb && (
                  <p className="mt-2 text-lg font-bold text-emerald-400">
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
                        className="rounded-xl bg-gray-900 border border-white/5 px-4 py-3"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-white">Cửa {i + 1}</p>
                            <p className="text-xs text-gray-500">
                              Odds: <span className="text-yellow-400">{parseFloat(odds[i]).toFixed(2)}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-white">
                              {formatMoney(rStake)}đ
                            </p>
                            {isDifferent && (
                              <p className="text-xs text-gray-600 line-through">
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

                  {/* Summary */}
                  <div className="flex items-center justify-between rounded-xl bg-emerald-500/5 border border-emerald-500/20 px-4 py-3">
                    <span className="text-sm text-gray-300">
                      Tổng vốn: <strong className="text-white">{formatMoney(result.roundedTotalStake)}đ</strong>
                    </span>
                    <span className="text-sm text-gray-300">
                      Lãi: <strong className="text-emerald-400">+{formatMoney(result.roundedProfit)}đ ({result.roundedProfitPercent.toFixed(2)}%)</strong>
                    </span>
                  </div>

                  {result.roundMode !== "none" && (
                    <div className="rounded-lg bg-blue-500/5 border border-blue-500/10 p-2.5">
                      <p className="text-xs text-blue-400 flex items-center gap-1">
                        <Lightbulb className="h-3 w-3" />
                        Số chẵn giúp tránh bị flag tài khoản
                      </p>
                    </div>
                  )}
                </div>
              )}

              {!result.isArb && (
                <p className="text-center text-sm text-gray-400">
                  Tổng xác suất ngụ ý &ge; 100% — không có cơ hội surebet với kèo này.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* How it works */}
        <Card className="border-white/5 bg-gray-900">
          <CardContent className="py-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-400" />
              Cách hoạt động
            </h3>
            <ul className="mt-2 space-y-1.5 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                Nhập odds decimal từ 2+ nhà cái
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                Xác suất ẩn: <code className="text-yellow-400 bg-gray-800 px-1 rounded">1/odds</code>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                Nếu tổng xác suất &lt; 1 (100%) → Surebet tồn tại
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                Stake mỗi cửa = (1/odds) / tổng × vốn
              </li>
            </ul>
            <div className="mt-3 pt-3 border-t border-white/5">
              <Link
                href="/guide"
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                Xem hướng dẫn chi tiết →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
