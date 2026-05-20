"use client";

import { useI18n } from "@/lib/i18n/provider";
import BottomNav from "@/components/bottom-nav";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  Target,
  TrendingUp,
  TrendingDown,
  Shield,
  Calculator,
  Search,
  Brain,
  ChevronDown,
  Zap,
  Info,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from "lucide-react";

// Accordion section component
function Section({
  icon: Icon,
  iconColor,
  title,
  badge,
  children,
  defaultOpen = false,
}: {
  icon: React.ElementType;
  iconColor: string;
  title: string;
  badge?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details className="group rounded-2xl border border-white/5 bg-gray-900/50 overflow-hidden" open={defaultOpen}>
      <summary className="flex cursor-pointer items-center gap-3 p-4 hover:bg-white/5 transition-colors list-none">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5`}>
          <Icon className={`h-4.5 w-4.5 ${iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white">{title}</h3>
          {badge && (
            <span className="text-sm text-gray-500">{badge}</span>
          )}
        </div>
        <ChevronDown className="h-4 w-4 text-gray-500 transition-transform group-open:rotate-180" />
      </summary>
      <div className="border-t border-white/5 px-4 py-4 space-y-3">
        {children}
      </div>
    </details>
  );
}

export default function GuideContent() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-gray-950 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-amber-600/80 to-orange-600/80 backdrop-blur-xl px-4 py-4 text-white shadow-lg">
        <div className="mx-auto max-w-lg">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-white hover:bg-white/10 rounded-lg p-1 -ml-1">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {t.guide.title}
              </h1>
              <p className="text-xs text-orange-100">
                {t.guide.subtitle}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 py-4 space-y-3">
        {/* Table of Contents */}
        <div className="rounded-2xl border border-white/5 bg-gray-900/50 p-4">
          <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-amber-400" />
            {t.guide.toc}
          </h2>
          <div className="space-y-1.5">
            {[
              { label: t.guide.tocSurebet, icon: Lightbulb, color: "text-yellow-400" },
              { label: t.guide.tocExample, icon: Target, color: "text-emerald-400" },
              { label: t.guide.tocScanner, icon: Search, color: "text-blue-400" },
              { label: t.guide.tocAI, icon: Brain, color: "text-violet-400" },
              { label: t.guide.tocCalc, icon: Calculator, color: "text-cyan-400" },
              { label: t.guide.tocRisks, icon: AlertTriangle, color: "text-red-400" },
              { label: t.guide.tocFaq, icon: HelpCircle, color: "text-gray-400" },
            ].map((item, i) => (
              <a
                key={i}
                href={`#section-${i}`}
                className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-all"
              >
                <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
                {item.label}
              </a>
            ))}
          </div>
        </div>

        {/* Section 1: What is Surebet */}
        <div id="section-0">
          <Section
            icon={Lightbulb}
            iconColor="text-yellow-400"
            title={t.guide.section1Title}
            badge={t.guide.section1Badge}
            defaultOpen
          >
            <p className="text-sm text-gray-300 leading-relaxed">
              {t.guide.section1P1}
            </p>
            <div className="rounded-xl bg-yellow-500/5 border border-yellow-500/10 p-3">
              <p className="text-sm text-gray-400 leading-relaxed">
                {t.guide.section1Principle}
              </p>
            </div>
            <div className="rounded-xl bg-gray-800/50 p-3 space-y-2">
              <p className="text-sm font-semibold text-white">{t.guide.section1Formula}</p>
              <div className="rounded-lg bg-gray-900 p-2 text-center font-mono text-xs">
                <span className="text-gray-400">= </span>
                <span className="text-emerald-400">1 / odds</span>
              </div>
              <p className="text-sm text-gray-400">
                {t.guide.section1Note}
              </p>
            </div>
          </Section>
        </div>

        {/* Section 2: Real Example */}
        <div id="section-1">
          <Section
            icon={Target}
            iconColor="text-emerald-400"
            title={t.guide.section2Title}
            badge={t.guide.section2Badge}
          >
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <p className="text-sm text-gray-500 mb-3">⚽ Man City vs Arsenal — O/U 2.5</p>

              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg bg-gray-800/80 p-2.5">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    <div>
                      <p className="text-sm font-medium text-white">{t.guide.section2Over}</p>
                      <p className="text-sm text-gray-500">{t.guide.section2OverBookmaker}</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-yellow-400">2.10</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gray-800/80 p-2.5">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-blue-400" />
                    <div>
                      <p className="text-sm font-medium text-white">{t.guide.section2Under}</p>
                      <p className="text-sm text-gray-500">{t.guide.section2UnderBookmaker}</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-yellow-400">2.05</span>
                </div>
              </div>

              <div className="mt-3 space-y-1 text-xs font-mono">
                <p className="text-gray-400">{t.guide.section2OverProb}</p>
                <p className="text-gray-400">{t.guide.section2UnderProb}</p>
                <p className="text-emerald-400 font-bold">{t.guide.section2Total}</p>
                <p className="text-emerald-400 font-bold">{t.guide.section2Profit}</p>
              </div>

              <div className="mt-3 rounded-lg bg-gray-900/80 p-3">
                <p className="text-sm text-gray-500 mb-2">{t.guide.section2Capital}</p>
                <div className="space-y-1 text-xs">
                  <p className="text-gray-300">
                    {t.guide.section2BetOver} <span className="font-bold text-white">516,130đ</span>
                  </p>
                  <p className="text-gray-300">
                    {t.guide.section2BetUnder} <span className="font-bold text-white">483,870đ</span>
                  </p>
                  <div className="mt-2 border-t border-white/10 pt-2">
                    <p className="text-gray-300">
                      {t.guide.section2MinReturn} <span className="font-bold text-emerald-400">1,033,950đ</span>
                    </p>
                    <p className="text-gray-300">
                      {t.guide.section2GuaranteedProfit} <span className="font-bold text-emerald-400">+33,950đ</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Section>
        </div>

        {/* Section 3: How to use Scanner */}
        <div id="section-2">
          <Section
            icon={Search}
            iconColor="text-blue-400"
            title={t.guide.section3Title}
            badge={t.guide.section3Badge}
          >
            <div className="space-y-3">
              {[
                { title: t.guide.section3Step1Title, desc: t.guide.section3Step1Desc },
                { title: t.guide.section3Step2Title, desc: t.guide.section3Step2Desc },
                { title: t.guide.section3Step3Title, desc: t.guide.section3Step3Desc },
                { title: t.guide.section3Step4Title, desc: t.guide.section3Step4Desc },
                { title: t.guide.section3Step5Title, desc: t.guide.section3Step5Desc },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-bold text-emerald-400">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{item.title}</p>
                    <p className="text-sm text-gray-400 mt-0.5" dangerouslySetInnerHTML={{ __html: item.desc }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-blue-500/5 border border-blue-500/10 p-3">
              <p className="text-sm text-gray-400">
                <Info className="inline h-3 w-3 text-blue-400 mr-1" />
                <span dangerouslySetInnerHTML={{ __html: t.guide.section3Tip }} />
              </p>
            </div>
          </Section>
        </div>

        {/* Section 4: AI Analyzer */}
        <div id="section-3">
          <Section
            icon={Brain}
            iconColor="text-violet-400"
            title={t.guide.section4Title}
            badge={t.guide.section4Badge}
          >
            <div className="space-y-3">
              <p className="text-sm text-gray-300 leading-relaxed">
                {t.guide.section4Desc}
              </p>

              <div className="rounded-xl bg-violet-500/5 border border-violet-500/10 p-3 space-y-2">
                <p className="text-sm font-semibold text-violet-400">{t.guide.section4Differences}</p>
                <ul className="space-y-1 text-sm text-gray-400">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400 mt-0.5 shrink-0" />
                    {t.guide.section4Diff1}
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400 mt-0.5 shrink-0" />
                    {t.guide.section4Diff2}
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400 mt-0.5 shrink-0" />
                    {t.guide.section4Diff3}
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400 mt-0.5 shrink-0" />
                    {t.guide.section4Diff4}
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-white">{t.guide.section4Reading}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5">
                    <p className="text-sm text-emerald-400 font-medium">{t.guide.section4Surebet}</p>
                    <p className="text-sm text-gray-400 mt-0.5">{t.guide.section4SurebetDesc}</p>
                  </div>
                  <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-2.5">
                    <p className="text-sm text-yellow-400 font-medium">{t.guide.section4HighSpread}</p>
                    <p className="text-sm text-gray-400 mt-0.5">{t.guide.section4HighSpreadDesc}</p>
                  </div>
                </div>
              </div>
            </div>
          </Section>
        </div>

        {/* Section 5: Calculator */}
        <div id="section-4">
          <Section
            icon={Calculator}
            iconColor="text-cyan-400"
            title={t.guide.section5Title}
            badge={t.guide.section5Badge}
          >
            <div className="space-y-3">
              <p className="text-sm text-gray-300 leading-relaxed">
                {t.guide.section5Desc}
              </p>

              <div className="space-y-2">
                {[
                  { title: t.guide.section5Step1Title, desc: t.guide.section5Step1Desc },
                  { title: t.guide.section5Step2Title, desc: t.guide.section5Step2Desc },
                  { title: t.guide.section5Step3Title, desc: t.guide.section5Step3Desc },
                  { title: t.guide.section5Step4Title, desc: t.guide.section5Step4Desc },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-sm font-bold text-cyan-400">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{item.title}</p>
                      <p className="text-sm text-gray-400 mt-0.5" dangerouslySetInnerHTML={{ __html: item.desc }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-cyan-500/5 border border-cyan-500/10 p-3">
                <p className="text-sm text-gray-400">
                  <Info className="inline h-3 w-3 text-cyan-400 mr-1" />
                  <span dangerouslySetInnerHTML={{ __html: t.guide.section5Tip }} />
                </p>
              </div>
            </div>
          </Section>
        </div>

        {/* Section 6: Risks */}
        <div id="section-5">
          <Section
            icon={AlertTriangle}
            iconColor="text-red-400"
            title={t.guide.section6Title}
            badge={t.guide.section6Badge}
          >
            <div className="space-y-3">
              {[
                { title: t.guide.risk1Title, desc: t.guide.risk1Desc, level: "high" },
                { title: t.guide.risk2Title, desc: t.guide.risk2Desc, level: "high" },
                { title: t.guide.risk3Title, desc: t.guide.risk3Desc, level: "medium" },
                { title: t.guide.risk4Title, desc: t.guide.risk4Desc, level: "medium" },
                { title: t.guide.risk5Title, desc: t.guide.risk5Desc, level: "medium" },
                { title: t.guide.risk6Title, desc: t.guide.risk6Desc, level: "low" },
              ].map((risk, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      risk.level === "high"
                        ? "bg-red-500/20 text-red-400"
                        : risk.level === "medium"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    !
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{risk.title}</p>
                    <p className="text-sm text-gray-400 mt-0.5 leading-relaxed">{risk.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-red-500/5 border border-red-500/10 p-3">
              <p className="text-sm text-red-300" dangerouslySetInnerHTML={{ __html: t.guide.riskImportant }} />
            </div>
          </Section>
        </div>

        {/* Section 7: FAQ */}
        <div id="section-6">
          <Section
            icon={HelpCircle}
            iconColor="text-gray-400"
            title={t.guide.section7Title}
            badge={t.guide.section7Badge}
          >
            <div className="space-y-4">
              {[
                { q: t.guide.faq1Q, a: t.guide.faq1A },
                { q: t.guide.faq2Q, a: t.guide.faq2A },
                { q: t.guide.faq3Q, a: t.guide.faq3A },
                { q: t.guide.faq4Q, a: t.guide.faq4A },
                { q: t.guide.faq5Q, a: t.guide.faq5A },
                { q: t.guide.faq6Q, a: t.guide.faq6A },
              ].map((item, i) => (
                <div key={i}>
                  <p className="text-sm font-medium text-white">❓ {item.q}</p>
                  <p className="mt-1 text-sm text-gray-400 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* Quick links */}
        <div className="pt-2">
          <h2 className="mb-3 text-sm font-semibold text-gray-400 flex items-center gap-2">
            <Zap className="h-4 w-4 text-emerald-400" />
            {t.guide.goToTools}
          </h2>
          <div className="grid grid-cols-3 gap-2">
            <Link href="/scanner" className="rounded-xl bg-emerald-600/10 border border-emerald-500/20 p-3 text-center hover:bg-emerald-600/20 transition-colors">
              <Search className="mx-auto h-5 w-5 text-emerald-400" />
              <p className="mt-1 text-sm font-medium text-gray-400">Scanner</p>
            </Link>
            <Link href="/ai-analyzer" className="rounded-xl bg-violet-600/10 border border-violet-500/20 p-3 text-center hover:bg-violet-600/20 transition-colors">
              <Brain className="mx-auto h-5 w-5 text-violet-400" />
              <p className="mt-1 text-sm font-medium text-gray-400">AI Analyzer</p>
            </Link>
            <Link href="/calculator" className="rounded-xl bg-blue-600/10 border border-blue-500/20 p-3 text-center hover:bg-blue-600/20 transition-colors">
              <Calculator className="mx-auto h-5 w-5 text-blue-400" />
              <p className="mt-1 text-sm font-medium text-gray-400">Calculator</p>
            </Link>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
