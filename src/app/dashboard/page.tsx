import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BottomNav from "@/components/bottom-nav";
import Link from "next/link";
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

export const metadata: Metadata = {
  title: "Dashboard - ArbitrageBet",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const displayName =
    user.user_metadata?.display_name || user.user_metadata?.full_name || null;
  const initial = user.email?.charAt(0).toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-gray-950 pb-20">
      {/* Header with greeting */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-emerald-950/30 border-b border-white/5">
        <div className="mx-auto max-w-lg px-4 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">
                {new Date().getHours() < 12
                  ? "☀️ Chào buổi sáng"
                  : new Date().getHours() < 18
                  ? "🌤️ Chào buổi chiều"
                  : "🌙 Chào buổi tối"}
              </p>
              <h1 className="mt-0.5 text-xl font-bold text-white">
                {displayName || "Xin chào"} 👋
              </h1>
            </div>
            <Link href="/profile" className="group">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600/20 text-sm font-bold text-emerald-400 ring-2 ring-emerald-500/30 transition-all group-hover:ring-emerald-400/50">
                {initial}
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 py-4 space-y-4">
        {/* Quick Actions */}
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-400">
            <Zap className="h-4 w-4 text-emerald-400" />
            Công cụ
          </h2>
          <div className="grid grid-cols-3 gap-2">
            <Link href="/scanner" className="group">
              <div className="rounded-2xl bg-gradient-to-br from-emerald-600/20 to-teal-600/10 border border-emerald-500/20 p-3 text-center transition-all group-hover:border-emerald-400/40 group-hover:bg-emerald-600/25">
                <Search className="mx-auto h-6 w-6 text-emerald-400" />
                <p className="mt-2 text-xs font-bold text-white">Scanner</p>
                <p className="text-[10px] text-gray-500">Quét surebet</p>
              </div>
            </Link>
            <Link href="/ai-analyzer" className="group">
              <div className="rounded-2xl bg-gradient-to-br from-violet-600/20 to-purple-600/10 border border-violet-500/20 p-3 text-center transition-all group-hover:border-violet-400/40 group-hover:bg-violet-600/25">
                <Brain className="mx-auto h-6 w-6 text-violet-400" />
                <p className="mt-2 text-xs font-bold text-white">AI O/U</p>
                <p className="text-[10px] text-gray-500">Phân tích</p>
              </div>
            </Link>
            <Link href="/calculator" className="group">
              <div className="rounded-2xl bg-gradient-to-br from-blue-600/20 to-indigo-600/10 border border-blue-500/20 p-3 text-center transition-all group-hover:border-blue-400/40 group-hover:bg-blue-600/25">
                <Calculator className="mx-auto h-6 w-6 text-blue-400" />
                <p className="mt-2 text-xs font-bold text-white">Calculator</p>
                <p className="text-[10px] text-gray-500">Tính stake</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Getting Started Guide */}
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-400">
            <BookOpen className="h-4 w-4 text-blue-400" />
            Hướng dẫn bắt đầu
          </h2>
          <div className="rounded-2xl border border-white/5 bg-gray-900/50 p-4 space-y-3">
            {[
              {
                step: 1,
                icon: Search,
                title: "Quét kèo bằng Scanner",
                desc: "Nhấn Scan để lấy odds từ 50+ nhà cái. Hệ thống tự động tìm surebet.",
                color: "text-emerald-400",
                href: "/scanner",
              },
              {
                step: 2,
                icon: Brain,
                title: "Phân tích bằng AI",
                desc: "Dùng AI Analyzer để tìm chênh lệch Tài/Xỉu giữa các nhà cái.",
                color: "text-violet-400",
                href: "/ai-analyzer",
              },
              {
                step: 3,
                icon: Calculator,
                title: "Tính stake chính xác",
                desc: "Nhập odds vào Calculator để biết đặt bao nhiêu ở mỗi cửa.",
                color: "text-blue-400",
                href: "/calculator",
              },
            ].map((item) => (
              <Link key={item.step} href={item.href} className="group block">
                <div className="flex items-start gap-3 rounded-xl p-2 transition-all group-hover:bg-white/5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5">
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">
                      <span className="text-gray-500 mr-1">Bước {item.step}:</span>
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-gray-600 group-hover:text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* What is Surebet - Quick Explainer */}
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-400">
            <Lightbulb className="h-4 w-4 text-yellow-400" />
            Surebet là gì?
          </h2>
          <div className="rounded-2xl border border-yellow-500/10 bg-yellow-500/5 p-4">
            <p className="text-sm text-gray-300 leading-relaxed">
              <strong className="text-yellow-400">Surebet</strong> (Arbitrage) là khi bạn đặt cược ở{" "}
              <strong className="text-white">cả 2 cửa</strong> ở{" "}
              <strong className="text-white">khác nhà cái</strong>, với odds chênh lệch đủ lớn để{" "}
              <strong className="text-emerald-400">luôn có lãi</strong> bất kể kết quả.
            </p>
            <div className="mt-3 rounded-xl bg-gray-900/80 p-3">
              <p className="text-xs text-gray-500 mb-2">📌 Ví dụ nhanh:</p>
              <div className="space-y-1 text-xs font-mono">
                <p className="text-gray-400">
                  Nhà cái A: <span className="text-emerald-400">Tài 2.5 @ 2.10</span>
                </p>
                <p className="text-gray-400">
                  Nhà cái B: <span className="text-blue-400">Xỉu 2.5 @ 2.05</span>
                </p>
                <p className="mt-2 text-gray-400">
                  Tổng xác suất: <span className="text-emerald-400">97.56%</span> (&lt; 100% → Surebet!)
                </p>
                <p className="text-gray-400">
                  → Lãi chắc chắn: <span className="text-emerald-400 font-bold">+2.5%</span>
                </p>
              </div>
            </div>
            <Link
              href="/guide"
              className="mt-3 flex items-center gap-1 text-xs font-medium text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              Xem hướng dẫn chi tiết
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Quick Tips */}
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-400">
            <Target className="h-4 w-4 text-orange-400" />
            Mẹo nhanh
          </h2>
          <div className="space-y-2">
            {[
              {
                icon: AlertCircle,
                iconColor: "text-red-400",
                tip: "Luôn kiểm tra thời gian odds — odds cũ có thể đã thay đổi!",
              },
              {
                icon: Shield,
                iconColor: "text-blue-400",
                tip: "Dùng số chẵn (10K/50K/100K) để tránh bị nhà cái flag tài khoản.",
              },
              {
                icon: BarChart3,
                iconColor: "text-violet-400",
                tip: "Surebet thường xuất hiện nhiều nhất ở kèo Tài/Xỉu và Handicap.",
              },
              {
                icon: TrendingUp,
                iconColor: "text-emerald-400",
                tip: "Lãi trung bình 2-5% mỗi lần — nhỏ nhưng chắc, không rủi ro.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 rounded-xl border border-white/5 bg-gray-900/30 p-3"
              >
                <item.icon className={`h-4 w-4 shrink-0 mt-0.5 ${item.iconColor}`} />
                <p className="text-xs text-gray-400 leading-relaxed">{item.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
