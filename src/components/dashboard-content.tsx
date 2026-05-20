"use client";

import { useI18n } from "@/lib/i18n/provider";
import Link from "next/link";
import BottomNav from "@/components/bottom-nav";
import {
  Search,
  Brain,
  Calculator,
  BookOpen,
  Zap,
  TrendingUp,
  Shield,
  ChevronRight,
  Lightbulb,
  Target,
  BarChart3,
  AlertCircle,
} from "lucide-react";

interface DashboardContentProps {
  displayName: string | null;
  initial: string;
}

export default function DashboardContent({ displayName, initial }: DashboardContentProps) {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-gray-950 pb-20">
      {/* Header with greeting */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-emerald-950/30 border-b border-white/5">
        <div className="mx-auto max-w-lg px-4 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                {new Date().getHours() < 12
                  ? t.dashboard.morningGreeting
                  : new Date().getHours() < 18
                  ? t.dashboard.afternoonGreeting
                  : t.dashboard.eveningGreeting}
              </p>
              <h1 className="mt-1 text-2xl font-bold text-white">
                {displayName || t.dashboard.hello} 👋
              </h1>
            </div>
            <Link href="/profile" className="group">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600/20 text-base font-bold text-emerald-400 ring-2 ring-emerald-500/30 transition-all group-hover:ring-emerald-400/50">
                {initial}
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 py-5 space-y-5">
        {/* Quick Actions */}
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-400">
            <Zap className="h-5 w-5 text-emerald-400" />
            {t.dashboard.tools}
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <Link href="/scanner" className="group">
              <div className="rounded-2xl bg-gradient-to-br from-emerald-600/20 to-teal-600/10 border border-emerald-500/20 p-4 text-center transition-all group-hover:border-emerald-400/40 group-hover:bg-emerald-600/25">
                <Search className="mx-auto h-7 w-7 text-emerald-400" />
                <p className="mt-2 text-sm font-bold text-white">Scanner</p>
                <p className="text-xs text-gray-500 mt-0.5">{t.dashboard.scannerDesc}</p>
              </div>
            </Link>
            <Link href="/ai-analyzer" className="group">
              <div className="rounded-2xl bg-gradient-to-br from-violet-600/20 to-purple-600/10 border border-violet-500/20 p-4 text-center transition-all group-hover:border-violet-400/40 group-hover:bg-violet-600/25">
                <Brain className="mx-auto h-7 w-7 text-violet-400" />
                <p className="mt-2 text-sm font-bold text-white">AI O/U</p>
                <p className="text-xs text-gray-500 mt-0.5">{t.dashboard.aiDesc}</p>
              </div>
            </Link>
            <Link href="/calculator" className="group">
              <div className="rounded-2xl bg-gradient-to-br from-blue-600/20 to-indigo-600/10 border border-blue-500/20 p-4 text-center transition-all group-hover:border-blue-400/40 group-hover:bg-blue-600/25">
                <Calculator className="mx-auto h-7 w-7 text-blue-400" />
                <p className="mt-2 text-sm font-bold text-white">Calculator</p>
                <p className="text-xs text-gray-500 mt-0.5">{t.dashboard.calcDesc}</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Getting Started Guide */}
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-400">
            <BookOpen className="h-5 w-5 text-blue-400" />
            {t.dashboard.gettingStarted}
          </h2>
          <div className="rounded-2xl border border-white/5 bg-gray-900/50 p-4 space-y-2">
            {[
              {
                step: 1,
                icon: Search,
                title: t.dashboard.step1Title,
                desc: t.dashboard.step1Desc,
                color: "text-emerald-400",
                href: "/scanner",
              },
              {
                step: 2,
                icon: Brain,
                title: t.dashboard.step2Title,
                desc: t.dashboard.step2Desc,
                color: "text-violet-400",
                href: "/ai-analyzer",
              },
              {
                step: 3,
                icon: Calculator,
                title: t.dashboard.step3Title,
                desc: t.dashboard.step3Desc,
                color: "text-blue-400",
                href: "/calculator",
              },
            ].map((item) => (
              <Link key={item.step} href={item.href} className="group block">
                <div className="flex items-center gap-3 rounded-xl p-3 transition-all group-hover:bg-white/5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5">
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-white">
                      <span className="text-gray-500 mr-1">{t.dashboard.step} {item.step}:</span>
                      {item.title}
                    </p>
                    <p className="text-[13px] text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-gray-600 group-hover:text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* What is Surebet - Quick Explainer */}
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-400">
            <Lightbulb className="h-5 w-5 text-yellow-400" />
            {t.dashboard.whatIsSurebet}
          </h2>
          <div className="rounded-2xl border border-yellow-500/10 bg-yellow-500/5 p-4">
            <p className="text-[15px] text-gray-300 leading-relaxed">
              <strong className="text-yellow-400">Surebet</strong> (Arbitrage) — {t.dashboard.surebetExplain}
            </p>
            <div className="mt-3 rounded-xl bg-gray-900/80 p-3">
              <p className="text-sm text-gray-500 mb-2">{t.dashboard.quickExample}</p>
              <div className="space-y-1.5 text-sm font-mono">
                <p className="text-gray-400">
                  {t.dashboard.bookmakerA} <span className="text-emerald-400">{t.dashboard.overLine}</span>
                </p>
                <p className="text-gray-400">
                  {t.dashboard.bookmakerB} <span className="text-blue-400">{t.dashboard.underLine}</span>
                </p>
                <p className="mt-2 text-gray-400">
                  {t.dashboard.totalProb} <span className="text-emerald-400">97.56%</span> {t.dashboard.surebetNote}
                </p>
                <p className="text-gray-400">
                  {t.dashboard.guaranteedProfitNote}
                </p>
              </div>
            </div>
            <Link
              href="/guide"
              className="mt-3 flex items-center gap-1 text-sm font-medium text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              {t.dashboard.seeFullGuide}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Quick Tips */}
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-400">
            <Target className="h-5 w-5 text-orange-400" />
            {t.dashboard.quickTips}
          </h2>
          <div className="space-y-2.5">
            {[
              { icon: AlertCircle, iconColor: "text-red-400", tip: t.dashboard.tip1 },
              { icon: Shield, iconColor: "text-blue-400", tip: t.dashboard.tip2 },
              { icon: BarChart3, iconColor: "text-violet-400", tip: t.dashboard.tip3 },
              { icon: TrendingUp, iconColor: "text-emerald-400", tip: t.dashboard.tip4 },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-xl border border-white/5 bg-gray-900/30 p-3.5"
              >
                <item.icon className={`h-5 w-5 shrink-0 mt-0.5 ${item.iconColor}`} />
                <p className="text-sm text-gray-400 leading-relaxed">{item.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
