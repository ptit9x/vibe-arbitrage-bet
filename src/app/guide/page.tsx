import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
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

export const metadata: Metadata = {
  title: "Hướng dẫn - ArbitrageBet",
};

// Accordion section component
function Section({
  id,
  icon: Icon,
  iconColor,
  title,
  badge,
  children,
}: {
  id: string;
  icon: React.ElementType;
  iconColor: string;
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <details className="group rounded-2xl border border-white/5 bg-gray-900/50 overflow-hidden" open>
      <summary className="flex cursor-pointer items-center gap-3 p-4 hover:bg-white/5 transition-colors list-none">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5`}>
          <Icon className={`h-4.5 w-4.5 ${iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white">{title}</h3>
          {badge && (
            <span className="text-[10px] text-gray-500">{badge}</span>
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

export default async function GuidePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

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
                Hướng dẫn
              </h1>
              <p className="text-xs text-orange-100">
                Tất cả những gì bạn cần biết về arbitrage betting
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
            Mục lục
          </h2>
          <div className="space-y-1.5">
            {[
              { label: "Surebet là gì?", icon: Lightbulb, color: "text-yellow-400" },
              { label: "Ví dụ thực tế", icon: Target, color: "text-emerald-400" },
              { label: "Cách dùng Scanner", icon: Search, color: "text-blue-400" },
              { label: "Cách dùng AI Analyzer", icon: Brain, color: "text-violet-400" },
              { label: "Cách dùng Calculator", icon: Calculator, color: "text-cyan-400" },
              { label: "Rủi ro & Lưu ý", icon: AlertTriangle, color: "text-red-400" },
              { label: "Câu hỏi thường gặp", icon: HelpCircle, color: "text-gray-400" },
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
            id="what-is-surebet"
            icon={Lightbulb}
            iconColor="text-yellow-400"
            title="Surebet là gì?"
            badge="Khái niệm cơ bản"
          >
            <p className="text-sm text-gray-300 leading-relaxed">
              <strong className="text-yellow-400">Surebet</strong> (còn gọi là <strong className="text-white">Arbitrage Bet</strong>) là một kỹ thuật đặt cược mà bạn{" "}
              <strong className="text-white">luôn có lợi nhuận</strong> bất kể kết quả trận đấu.
            </p>
            <div className="rounded-xl bg-yellow-500/5 border border-yellow-500/10 p-3">
              <p className="text-xs text-gray-400 leading-relaxed">
                💡 Nguyên lý: Mỗi nhà cái đưa ra odds khác nhau cho cùng một trận đấu.
                Khi odds chênh lệch đủ lớn, bạn có thể đặt cược ở{" "}
                <strong className="text-white">tất cả các cửa</strong> ở{" "}
                <strong className="text-white">các nhà cái khác nhau</strong> và vẫn có lãi.
              </p>
            </div>
            <div className="rounded-xl bg-gray-800/50 p-3 space-y-2">
              <p className="text-xs font-semibold text-white">Công thức xác suất ẩn (Implied Probability):</p>
              <div className="rounded-lg bg-gray-900 p-2 text-center font-mono text-xs">
                <span className="text-gray-400">Xác suất ẩn = </span>
                <span className="text-emerald-400">1 / odds</span>
              </div>
              <p className="text-xs text-gray-400">
                Nếu tổng xác suất ẩn của tất cả cửa &lt; <strong className="text-emerald-400">100%</strong> → Surebet tồn tại!
              </p>
            </div>
          </Section>
        </div>

        {/* Section 2: Real Example */}
        <div id="section-1">
          <Section
            id="example"
            icon={Target}
            iconColor="text-emerald-400"
            title="Ví dụ thực tế"
            badge="Man City vs Arsenal"
          >
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <p className="text-xs text-gray-500 mb-3">⚽ Man City vs Arsenal — Kèo Tài/Xỉu 2.5 bàn</p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg bg-gray-800/80 p-2.5">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    <div>
                      <p className="text-xs font-medium text-white">Tài 2.5 (Over)</p>
                      <p className="text-[10px] text-gray-500">Nhà cái A (Bet365)</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-yellow-400">2.10</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gray-800/80 p-2.5">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-blue-400" />
                    <div>
                      <p className="text-xs font-medium text-white">Xỉu 2.5 (Under)</p>
                      <p className="text-[10px] text-gray-500">Nhà cái B (1xBet)</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-yellow-400">2.05</span>
                </div>
              </div>

              <div className="mt-3 space-y-1 text-xs font-mono">
                <p className="text-gray-400">
                  Xác suất Tài: <span className="text-emerald-400">1/2.10 = 47.62%</span>
                </p>
                <p className="text-gray-400">
                  Xác suất Xỉu: <span className="text-blue-400">1/2.05 = 48.78%</span>
                </p>
                <p className="text-gray-400">
                  Tổng: <span className="text-emerald-400 font-bold">96.40%</span>{" "}
                  <span className="text-gray-500">(&lt; 100% → Surebet!)</span>
                </p>
                <p className="text-gray-400">
                  Lãi: <span className="text-emerald-400 font-bold">+3.73%</span>
                </p>
              </div>

              <div className="mt-3 rounded-lg bg-gray-900/80 p-3">
                <p className="text-[10px] text-gray-500 mb-2">Với vốn 1,000,000đ:</p>
                <div className="space-y-1 text-xs">
                  <p className="text-gray-300">
                    → Đặt Tài @ Bet365: <span className="font-bold text-white">516,130đ</span>
                  </p>
                  <p className="text-gray-300">
                    → Đặt Xỉu @ 1xBet: <span className="font-bold text-white">483,870đ</span>
                  </p>
                  <div className="mt-2 border-t border-white/10 pt-2">
                    <p className="text-gray-300">
                      Nhận tối thiểu: <span className="font-bold text-emerald-400">1,033,950đ</span>
                    </p>
                    <p className="text-gray-300">
                      Lãi chắc chắn: <span className="font-bold text-emerald-400">+33,950đ</span>
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
            id="scanner-guide"
            icon={Search}
            iconColor="text-blue-400"
            title="Cách dùng Surebet Scanner"
            badge="Tìm surebet tự động"
          >
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">
                  1
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Mở Scanner</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Vào trang <Link href="/scanner" className="text-emerald-400 underline">Scanner</Link> từ menu hoặc dashboard.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">
                  2
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Thiết lập bộ lọc</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Nhập <strong className="text-white">Vốn</strong> (VND) và <strong className="text-white">Min % lợi nhuận</strong>. 
                    VD: Vốn 1,000,000đ, Min 0.5%.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">
                  3
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Nhấn Scan</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Hệ thống sẽ quét odds từ 50+ nhà cái và tìm cơ hội surebet.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">
                  4
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Xem kết quả</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Mỗi surebet hiển thị: trận đấu, odds từng cửa, số tiền đặt, và lợi nhuận chắc chắn.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">
                  5
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Bật Auto-refresh</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Check "Auto-refresh (60s)" để tự động quét lại mỗi phút. Odds thay đổi liên tục!
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-blue-500/5 border border-blue-500/10 p-3">
              <p className="text-xs text-gray-400">
                <Info className="inline h-3 w-3 text-blue-400 mr-1" />
                <strong className="text-blue-400">Mẹo:</strong> Bật thêm "8xBet" để quét thêm odds từ 8xBet, tăng cơ hội tìm surebet.
              </p>
            </div>
          </Section>
        </div>

        {/* Section 4: AI Analyzer */}
        <div id="section-3">
          <Section
            id="ai-guide"
            icon={Brain}
            iconColor="text-violet-400"
            title="Cách dùng AI Analyzer"
            badge="Phân tích Tài/Xỉu thông minh"
          >
            <div className="space-y-3">
              <p className="text-sm text-gray-300 leading-relaxed">
                AI Analyzer chuyên quét kèo <strong className="text-white">Tài/Xỉu (Over/Under)</strong> từ nhiều nhà cái,
                tìm ra chênh lệch odds lớn nhất và phát hiện surebet.
              </p>

              <div className="rounded-xl bg-violet-500/5 border border-violet-500/10 p-3 space-y-2">
                <p className="text-xs font-semibold text-violet-400">Khác biệt với Scanner:</p>
                <ul className="space-y-1 text-xs text-gray-400">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400 mt-0.5 shrink-0" />
                    Tập trung riêng vào kèo Tài/Xỉu
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400 mt-0.5 shrink-0" />
                    Hiển thị chênh lệch odds (spread) giữa các nhà cái
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400 mt-0.5 shrink-0" />
                    Phân tích xác suất ẩn chi tiết
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400 mt-0.5 shrink-0" />
                    AI đưa ra khuyến nghị dựa trên dữ liệu
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-white">Cách đọc kết quả:</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5">
                    <p className="text-[10px] text-emerald-400 font-medium">🟢 Surebet</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Tổng xác suất &lt; 100% → Luôn có lãi</p>
                  </div>
                  <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-2.5">
                    <p className="text-[10px] text-yellow-400 font-medium">🟡 Spread cao</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Chênh lệch lớn → Gần surebet</p>
                  </div>
                </div>
              </div>
            </div>
          </Section>
        </div>

        {/* Section 5: Calculator */}
        <div id="section-4">
          <Section
            id="calc-guide"
            icon={Calculator}
            iconColor="text-cyan-400"
            title="Cách dùng Calculator"
            badge="Tính stake thủ công"
          >
            <div className="space-y-3">
              <p className="text-sm text-gray-300 leading-relaxed">
                Calculator giúp bạn tính chính xác số tiền cần đặt ở mỗi cửa khi đã tìm thấy surebet.
              </p>

              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-bold text-cyan-400">
                    1
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Nhập Odds</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Nhập odds decimal từ nhà cái. VD: 2.10 và 2.05.
                      Nếu là kèo 1X2 (thắng/hòa/thua), nhập thêm odds cửa 3.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-bold text-cyan-400">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Nhập Vốn</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Tổng số tiền bạn muốn đặt (VD: 1,000,000đ).
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-bold text-cyan-400">
                    3
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Chọn chế độ làm tròn</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      <strong className="text-blue-400">10K/50K/100K</strong> — Làm tròn số tiền đặt thành số chẵn
                      để tránh bị nhà cái chú ý. Nên dùng 10K hoặc 50K.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-bold text-cyan-400">
                    4
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Nhấn Tính Toán</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Xem kết quả: số tiền đặt mỗi cửa, lợi nhuận chắc chắn, và % lãi.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-cyan-500/5 border border-cyan-500/10 p-3">
                <p className="text-xs text-gray-400">
                  <Info className="inline h-3 w-3 text-cyan-400 mr-1" />
                  <strong className="text-cyan-400">Mẹo:</strong> Copy odds từ Scanner hoặc AI Analyzer và dán vào Calculator để tính nhanh!
                </p>
              </div>
            </div>
          </Section>
        </div>

        {/* Section 6: Risks */}
        <div id="section-5">
          <Section
            id="risks"
            icon={AlertTriangle}
            iconColor="text-red-400"
            title="Rủi ro & Lưu ý quan trọng"
            badge="Đọc trước khi bắt đầu"
          >
            <div className="space-y-3">
              {[
                {
                  title: "Odds thay đổi nhanh",
                  desc: "Odds có thể thay đổi chỉ trong vài giây. Luôn kiểm tra thời gian cập nhật (Last Update) trước khi đặt cược.",
                  level: "high",
                },
                {
                  title: "Giới hạn tài khoản",
                  desc: "Đặt cược surebet thường xuyên có thể bị nhà cái giới hạn hoặc khóa tài khoản. Dùng số chẵn và không đặt quá thường xuyên.",
                  level: "high",
                },
                {
                  title: "Phí giao dịch",
                  desc: "Nạp/rút tiền có phí. Tính toán sao cho lợi nhuận surebet > phí giao dịch.",
                  level: "medium",
                },
                {
                  title: "Chênh lệch tỷ giá",
                  desc: "Nếu đặt ở nhà cái khác loại tiền tệ, chú ý tỷ giá quy đổi.",
                  level: "medium",
                },
                {
                  title: "Trận đấu bị hủy",
                  desc: "Nếu trận bị hủy, odds có thể được hoàn lại ở mức 1.0 → không lãi. Kiểm tra quy định từng nhà cái.",
                  level: "medium",
                },
                {
                  title: "Sai lệch odds",
                  desc: "Một số odds hiển thị có thể đã cũ do cache. Luôn xác nhận odds trên trang nhà cái trước khi đặt.",
                  level: "low",
                },
              ].map((risk, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
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
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{risk.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-red-500/5 border border-red-500/10 p-3">
              <p className="text-xs text-red-300">
                ⚠️ <strong>Quan trọng:</strong> Công cụ này chỉ hỗ trợ phân tích. Luôn tự kiểm tra và chịu trách nhiệm 
                về quyết định đặt cược của bạn.
              </p>
            </div>
          </Section>
        </div>

        {/* Section 7: FAQ */}
        <div id="section-6">
          <Section
            id="faq"
            icon={HelpCircle}
            iconColor="text-gray-400"
            title="Câu hỏi thường gặp"
            badge="FAQ"
          >
            <div className="space-y-4">
              {[
                {
                  q: "Surebet có thực sự không rủi ro không?",
                  a: "Về mặt toán học, surebet đảm bảo lợi nhuận. Tuy nhiên, có rủi ro thực tế như odds thay đổi, giới hạn tài khoản, phí giao dịch... Đọc phần 'Rủi ro & Lưu ý' phía trên.",
                },
                {
                  q: "Tại sao không tìm thấy surebet?",
                  a: "Surebet không xuất hiện liên tục. Thử: giảm min profit %, bật thêm 8xBet, quét vào giờ cao điểm (trước khi trận đấu bắt đầu), hoặc thử các môn thể thao khác.",
                },
                {
                  q: "Odds lấy từ đâu?",
                  a: "Chúng tôi sử dụng TheOddsAPI — tổng hợp odds từ 50+ nhà cái lớn (Bet365, DraftKings, FanDuel, v.v.). Dữ liệu được cập nhật realtime.",
                },
                {
                  q: "Tại sao nên dùng số chẵn (10K/50K/100K)?",
                  a: "Nhà cái có hệ thống phát hiện arbitrage. Đặt số lẻ chính xác (VD: 516,130đ) là dấu hiệu rõ ràng. Đặt số chẵn (VD: 520,000đ) trông tự nhiên hơn, giảm nguy cơ bị flag.",
                },
                {
                  q: "Lãi 2-5% có đáng không?",
                  a: "2-5% mỗi lần nghe nhỏ, nhưng: không rủi ro, có thể làm nhiều lần/ngày. VD: 10 lần/ngày × 3% = 30%/ngày. Nhưng hãy cẩn thận với giới hạn tài khoản!",
                },
                {
                  q: "AI Analyzer khác gì Scanner?",
                  a: "Scanner tìm surebet ở tất cả loại kèo (1X2, Handicap, O/U). AI Analyzer tập trung riêng vào O/U, phân tích sâu hơn với AI, và hiển thị chênh lệch odds chi tiết hơn.",
                },
              ].map((item, i) => (
                <div key={i}>
                  <p className="text-sm font-medium text-white">❓ {item.q}</p>
                  <p className="mt-1 text-xs text-gray-400 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* Quick links */}
        <div className="pt-2">
          <h2 className="mb-3 text-sm font-semibold text-gray-400 flex items-center gap-2">
            <Zap className="h-4 w-4 text-emerald-400" />
            Đi đến công cụ
          </h2>
          <div className="grid grid-cols-3 gap-2">
            <Link href="/scanner" className="rounded-xl bg-emerald-600/10 border border-emerald-500/20 p-3 text-center hover:bg-emerald-600/20 transition-colors">
              <Search className="mx-auto h-5 w-5 text-emerald-400" />
              <p className="mt-1 text-[10px] font-medium text-gray-400">Scanner</p>
            </Link>
            <Link href="/ai-analyzer" className="rounded-xl bg-violet-600/10 border border-violet-500/20 p-3 text-center hover:bg-violet-600/20 transition-colors">
              <Brain className="mx-auto h-5 w-5 text-violet-400" />
              <p className="mt-1 text-[10px] font-medium text-gray-400">AI Analyzer</p>
            </Link>
            <Link href="/calculator" className="rounded-xl bg-blue-600/10 border border-blue-500/20 p-3 text-center hover:bg-blue-600/20 transition-colors">
              <Calculator className="mx-auto h-5 w-5 text-blue-400" />
              <p className="mt-1 text-[10px] font-medium text-gray-400">Calculator</p>
            </Link>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
