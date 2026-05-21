"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n/provider";
import {
  Calculator,
  HelpCircle,
  Info,
  CheckCircle2,
  XCircle,
  Lightbulb,
} from "lucide-react";

export default function CalculatorPage() {
  const { t, locale } = useI18n();
  const [odds1, setOdds1] = useState("");
  const [odds2, setOdds2] = useState("");
  const [odds3, setOdds3] = useState("");
  const [totalStake, setTotalStake] = useState("100");
  const [showHelp, setShowHelp] = useState(false);
  const [result, setResult] = useState<{
    isArb: boolean;
    profitPercent: number;
    stakes: number[];
    payouts: number[];
    profit: number;
  } | null>(null);

  // Display: tính với số nhỏ, hiển thị thêm "000" phía sau
  const formatMoney = (amount: number) =>
    new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US").format(Math.round(amount)) + "000";

  const calculate = () => {
    const o1 = parseFloat(odds1);
    const o2 = parseFloat(odds2);
    const o3 = odds3 ? parseFloat(odds3) : null;
    const stake = parseFloat(totalStake) || 100;

    if (!o1 || !o2 || o1 <= 0 || o2 <= 0) return;

    const allOdds = o3 && o3 > 0 ? [o1, o2, o3] : [o1, o2];
    const impliedTotal = allOdds.reduce((sum, o) => sum + 1 / o, 0);

    const isArb = impliedTotal < 1;
    const pProfit = isArb ? ((1 - impliedTotal) / impliedTotal) * 100 : 0;

    const exactStakes = allOdds.map((o) => ((1 / o) / impliedTotal) * stake);
    const exactPayouts = allOdds.map((o, i) => exactStakes[i] * o);

    setResult({
      isArb,
      profitPercent: pProfit,
      stakes: exactStakes.map((s) => Math.round(s)),
      payouts: exactPayouts.map((p) => Math.round(p)),
      profit: Math.round(Math.min(...exactPayouts) - stake),
    });
  };

  const loadExample = (type: "2way" | "3way") => {
    if (type === "2way") {
      setOdds1("2.10");
      setOdds2("2.05");
      setOdds3("");
      setTotalStake("100");
    } else {
      setOdds1("3.20");
      setOdds2("3.50");
      setOdds3("2.30");
      setTotalStake("100");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-4 text-white shadow-lg">
        <div className="mx-auto max-w-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                {t.calculator.title}
              </h1>
              <p className="text-xs text-blue-100">{t.calculator.subtitle}</p>
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
              <p className="text-sm font-bold text-white">{t.calculator.helpTitle}</p>
              <div className="space-y-1 text-xs text-blue-100">
                <p>{t.calculator.help1}</p>
                <p>{t.calculator.help2}</p>
                <p>{t.calculator.help3}</p>
                <p dangerouslySetInnerHTML={{ __html: t.calculator.help4 }} />
              </div>
              <div className="flex items-center gap-1 text-xs text-yellow-200">
                <Info className="h-3 w-3" />
                {t.calculator.helpFormula}
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
            className="flex-1 rounded-xl border border-white/5 bg-gray-900/50 p-2.5 text-center text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
          >
            <span className="block text-base mb-0.5">⚽</span>
            {t.calculator.example2way}
          </button>
          <button
            onClick={() => loadExample("3way")}
            className="flex-1 rounded-xl border border-white/5 bg-gray-900/50 p-2.5 text-center text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
          >
            <span className="block text-base mb-0.5">🏆</span>
            {t.calculator.example3way}
          </button>
        </div>

        {/* Odds Input */}
        <Card className="border-white/5 bg-gray-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-white">{t.calculator.oddsTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm text-gray-400">{t.calculator.odds1Label}</label>
              <Input
                type="number"
                step="0.01"
                placeholder="e.g. 2.10"
                value={odds1}
                onChange={(e) => setOdds1(e.target.value)}
                className="mt-1 border-white/10 bg-gray-800 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400">{t.calculator.odds2Label}</label>
              <Input
                type="number"
                step="0.01"
                placeholder="e.g. 2.05"
                value={odds2}
                onChange={(e) => setOdds2(e.target.value)}
                className="mt-1 border-white/10 bg-gray-800 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400">
                {t.calculator.odds3Label} <span className="text-gray-600">{t.calculator.odds3Optional}</span>
              </label>
              <Input
                type="number"
                step="0.01"
                placeholder={t.calculator.odds3Placeholder}
                value={odds3}
                onChange={(e) => setOdds3(e.target.value)}
                className="mt-1 border-white/10 bg-gray-800 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400">{t.calculator.totalCapital}</label>
              <Input
                type="number"
                value={totalStake}
                onChange={(e) => setTotalStake(e.target.value)}
                className="mt-1 border-white/10 bg-gray-800 text-white"
              />
            </div>
            <Button
              onClick={calculate}
              className="w-full bg-emerald-600 font-bold hover:bg-emerald-700"
            >
              <Calculator className="h-4 w-4 mr-2" />
              {t.calculator.calculateButton}
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
                    <span className="text-lg font-bold text-emerald-400">{t.calculator.surebetVerdict}</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 rounded-full bg-red-500/10 border border-red-500/20 px-4 py-2">
                    <XCircle className="h-5 w-5 text-red-400" />
                    <span className="text-lg font-bold text-red-400">{t.calculator.noSurebetVerdict}</span>
                  </div>
                )}
                {result.isArb && (
                  <p className="mt-2 text-lg font-bold text-emerald-400">
                    {t.calculator.guaranteedProfitLabel} +{result.profitPercent.toFixed(2)}%
                  </p>
                )}
              </div>

              {/* Stake breakdown */}
              {result.isArb && (
                <div className="space-y-2">
                  {result.stakes.map((stake, i) => {
                    const odds = [odds1, odds2, odds3].filter(Boolean);
                    return (
                      <div
                        key={i}
                        className="rounded-xl bg-gray-900 border border-white/5 px-4 py-3"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-white">{t.calculator.leg} {i + 1}</p>
                            <p className="text-sm text-gray-500">
                              {t.common.odds}: <span className="text-yellow-400">{parseFloat(odds[i]).toFixed(2)}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-white">
                              {formatMoney(stake)}đ
                            </p>
                            <p className="text-sm text-emerald-400">
                              {t.calculator.receive} {formatMoney(result.payouts[i])}đ
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Summary */}
                  <div className="flex items-center justify-between rounded-xl bg-emerald-500/5 border border-emerald-500/20 px-4 py-3">
                    <span className="text-sm text-gray-300">
                      {t.calculator.totalCapitalLabel} <strong className="text-white">{formatMoney(result.stakes.reduce((a, b) => a + b, 0))}đ</strong>
                    </span>
                    <span className="text-sm text-gray-300">
                      {t.calculator.profitLabel} <strong className="text-emerald-400">+{formatMoney(result.profit)}đ</strong>
                    </span>
                  </div>
                </div>
              )}

              {!result.isArb && (
                <p className="text-center text-sm text-gray-400">
                  {t.calculator.noSurebetExplain}
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
              {t.calculator.howItWorks}
            </h3>
            <ul className="mt-2 space-y-1.5 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                {t.calculator.howTip1}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                {t.calculator.howTip2} <code className="text-yellow-400 bg-gray-800 px-1 rounded">1/odds</code>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                {t.calculator.howTip3}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                {t.calculator.howTip4}
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
