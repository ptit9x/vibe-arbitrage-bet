import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Shield, Zap, TrendingUp, Calculator, Search, BarChart3, ChevronRight, Users, Clock } from "lucide-react";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-gray-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl">⚡</span>
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              ArbitrageBet
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-gray-300 transition-colors hover:text-white"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-emerald-600 px-3 py-2 text-xs sm:text-sm font-bold text-white transition-all hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-600/25"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-screen items-center justify-center px-4 pt-16 sm:px-6 sm:pt-20">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[300px] w-[400px] sm:h-[500px] sm:w-[800px] rounded-full bg-emerald-500/10 blur-[80px] sm:blur-[120px]" />
          <div className="absolute bottom-1/4 left-1/3 h-[200px] w-[300px] sm:h-[300px] sm:w-[500px] rounded-full bg-blue-500/8 blur-[60px] sm:blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="mb-4 sm:mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs sm:text-sm text-emerald-400">
            <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Real-time surebet detection
          </div>

          <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-7xl">
            Never Lose a{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Sports Bet
            </span>{" "}
            Again
          </h1>

          <p className="mx-auto mt-4 sm:mt-6 max-w-2xl text-sm sm:text-lg text-gray-400">
            Scan odds across multiple bookmakers in real-time, find guaranteed profit
            opportunities (surebets), and calculate optimal stakes — all in one tool.
          </p>

          <div className="mt-8 sm:mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Link
              href="/register"
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-base sm:w-auto sm:px-8 sm:py-4 sm:text-lg font-bold text-white shadow-2xl shadow-emerald-600/25 transition-all hover:bg-emerald-500 hover:shadow-emerald-600/40 hover:scale-105"
            >
              Start Free
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/calculator"
              className="group flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 px-6 py-3.5 text-base sm:w-auto sm:px-8 sm:py-4 sm:text-lg font-medium text-white transition-all hover:bg-white/5 hover:border-white/30"
            >
              <Calculator className="h-4 w-4 sm:h-5 sm:w-5" />
              Try Calculator
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-10 sm:mt-16 grid grid-cols-3 gap-4 sm:gap-8 border-t border-white/10 pt-6 sm:pt-8">
            <div>
              <p className="text-xl font-bold text-white sm:text-3xl lg:text-4xl">50+</p>
              <p className="mt-1 text-xs sm:text-sm text-gray-500 leading-tight">Bookmakers<br className="sm:hidden" /> Scanned</p>
            </div>
            <div>
              <p className="text-xl font-bold text-white sm:text-3xl lg:text-4xl">2-5%</p>
              <p className="mt-1 text-xs sm:text-sm text-gray-500 leading-tight">Avg. Profit<br className="sm:hidden" /> per Bet</p>
            </div>
            <div>
              <p className="text-xl font-bold text-white sm:text-3xl lg:text-4xl">&lt;30s</p>
              <p className="mt-1 text-xs sm:text-sm text-gray-500 leading-tight">Scan<br className="sm:hidden" /> Speed</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold sm:text-3xl lg:text-4xl">
              How It{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Works
              </span>
            </h2>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-400">
              Three simple steps to guaranteed profits
            </p>
          </div>

          <div className="mt-10 sm:mt-16 grid gap-4 sm:gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                icon: Search,
                title: "Scan Odds",
                desc: "Our engine fetches live odds from 50+ bookmakers across multiple sports in real-time.",
                color: "from-blue-500 to-indigo-500",
              },
              {
                step: "02",
                icon: Shield,
                title: "Find Surebets",
                desc: "Automatically detect arbitrage opportunities where combined implied probability is under 100%.",
                color: "from-emerald-500 to-teal-500",
              },
              {
                step: "03",
                icon: TrendingUp,
                title: "Place & Profit",
                desc: "Use our calculator to get optimal stakes for each leg. Guaranteed profit, zero risk.",
                color: "from-amber-500 to-orange-500",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="group relative rounded-2xl border border-white/10 bg-gray-900 p-5 sm:p-8 transition-all hover:border-white/20 hover:bg-gray-900/80"
              >
                <div className="mb-3 sm:mb-4 text-4xl sm:text-5xl font-black text-white/5">{item.step}</div>
                <div
                  className={`mb-3 sm:mb-4 inline-flex rounded-lg sm:rounded-xl bg-gradient-to-br ${item.color} p-2.5 sm:p-3`}
                >
                  <item.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <h3 className="text-base sm:text-xl font-bold text-white">{item.title}</h3>
                <p className="mt-1.5 sm:mt-2 text-sm text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold sm:text-3xl lg:text-4xl">
              Powerful{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Features
              </span>
            </h2>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-400">
              Everything you need for risk-free sports betting
            </p>
          </div>

          <div className="mt-10 sm:mt-16 grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Zap,
                title: "Real-time Scanning",
                desc: "Live odds refresh every 30 seconds. Never miss a surebet opportunity.",
              },
              {
                icon: Calculator,
                title: "Smart Calculator",
                desc: "Optimal stake calculation with rounding to avoid bookmaker flags.",
              },
              {
                icon: BarChart3,
                title: "Multi-Sport Support",
                desc: "Soccer, basketball, tennis, and more with 2-way or 3-way markets.",
              },
              {
                icon: Shield,
                title: "Guaranteed Profit",
                desc: "Mathematically proven arbitrage. Profit regardless of match outcome.",
              },
              {
                icon: Users,
                title: "Multi-Bookmaker",
                desc: "Compare odds across 50+ bookmakers for best arbitrage opportunities.",
              },
              {
                icon: Clock,
                title: "Expiry Tracking",
                desc: "Odds timestamps so you know exactly how fresh each opportunity is.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-white/5 bg-gray-900/50 p-4 sm:p-6 transition-all hover:border-emerald-500/30 hover:bg-gray-900"
              >
                <feature.icon className="mb-3 sm:mb-4 h-6 w-6 sm:h-8 sm:w-8 text-emerald-400" />
                <h3 className="text-sm sm:text-lg font-bold text-white">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo / Example */}
      <section className="relative px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="overflow-hidden rounded-xl sm:rounded-2xl border border-white/10 bg-gray-900 shadow-2xl">
            {/* Terminal header */}
            <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2.5 sm:px-4 sm:py-3">
              <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-red-500" />
              <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-yellow-500" />
              <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-green-500" />
              <span className="ml-2 text-[10px] sm:text-xs text-gray-500">Surebet Calculator</span>
            </div>
            {/* Demo content */}
            <div className="p-4 sm:p-6 font-mono text-xs sm:text-sm space-y-2 sm:space-y-3 overflow-x-auto">
              <p className="text-gray-500">{'// Example: Man City vs Arsenal'}</p>
              <p className="text-gray-500">{'// Over/Under 2.5 Goals'}</p>
              <div className="mt-3 sm:mt-4 space-y-1">
                <p className="whitespace-nowrap">
                  <span className="text-blue-400">Bookmaker A:</span>{" "}
                  <span className="text-yellow-300">Over 2.5</span> @{" "}
                  <span className="text-emerald-400 font-bold">2.10</span>
                </p>
                <p className="whitespace-nowrap">
                  <span className="text-blue-400">Bookmaker B:</span>{" "}
                  <span className="text-yellow-300">Under 2.5</span> @{" "}
                  <span className="text-emerald-400 font-bold">2.05</span>
                </p>
              </div>
              <div className="mt-3 sm:mt-4 border-t border-white/10 pt-3 sm:pt-4 space-y-1">
                <p className="whitespace-nowrap">
                  Implied Probability:{" "}
                  <span className="text-emerald-400">97.56%</span>{" "}
                  <span className="text-gray-500">(&lt; 100% = Surebet!)</span>
                </p>
                <p className="whitespace-nowrap">
                  Guaranteed Profit:{" "}
                  <span className="text-emerald-400 font-bold">+2.50%</span>
                </p>
              </div>
              <div className="mt-3 sm:mt-4 border-t border-white/10 pt-3 sm:pt-4 space-y-1">
                <p className="text-gray-500 whitespace-nowrap">{'// Stake breakdown (1,000,000 VND):'}</p>
                <p className="whitespace-nowrap">
                  Over 2.5 →{" "}
                  <span className="text-white font-bold">506,000đ</span>{" "}
                  <span className="text-gray-500">(pay 1,062,600đ)</span>
                </p>
                <p className="whitespace-nowrap">
                  Under 2.5 →{" "}
                  <span className="text-white font-bold">500,000đ</span>{" "}
                  <span className="text-gray-500">(pay 1,025,000đ)</span>
                </p>
                <p className="mt-2 whitespace-nowrap">
                  ✅ Min return: <span className="text-emerald-400 font-bold">1,025,000đ</span>
                </p>
                <p className="whitespace-nowrap">
                  💰 Profit:{" "}
                  <span className="text-emerald-400 font-bold">+25,000đ</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="relative px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="grid gap-4 sm:gap-6 grid-cols-3">
            {[
              {
                number: "1,200+",
                label: "Surebets Found",
                sub: "This month",
              },
              {
                number: "3.8%",
                label: "Avg. ROI",
                sub: "Per arbitrage bet",
              },
              {
                number: "99.9%",
                label: "Uptime",
                sub: "Scanner reliability",
              },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl sm:rounded-2xl border border-white/5 bg-gray-900/50 p-4 sm:p-8">
                <p className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  {stat.number}
                </p>
                <p className="mt-1 text-xs sm:text-base font-semibold text-white">{stat.label}</p>
                <p className="text-xs sm:text-sm text-gray-500">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-4 py-16 sm:px-6 sm:py-24">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[250px] w-[350px] sm:h-[400px] sm:w-[600px] rounded-full bg-emerald-500/15 blur-[80px] sm:blur-[120px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold sm:text-4xl lg:text-5xl">
            Ready for{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Risk-Free
            </span>{" "}
            Profits?
          </h2>
          <p className="mt-4 sm:mt-6 text-sm sm:text-lg text-gray-400 px-2">
            Join ArbitrageBet and start finding guaranteed profit opportunities today.
            No credit card required.
          </p>
          <div className="mt-8 sm:mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Link
              href="/register"
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-base sm:w-auto sm:px-8 sm:py-4 sm:text-lg font-bold text-white shadow-2xl shadow-emerald-600/25 transition-all hover:bg-emerald-500 hover:shadow-emerald-600/40 hover:scale-105"
            >
              Create Free Account
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/calculator"
              className="flex items-center gap-2 text-sm sm:text-base text-gray-400 transition-colors hover:text-white"
            >
              Try the calculator first
              <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row sm:gap-6">
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl">⚡</span>
              <span className="font-bold text-white text-sm sm:text-base">ArbitrageBet</span>
            </div>
            <div className="flex items-center gap-5 sm:gap-6 text-xs sm:text-sm text-gray-500">
              <Link href="/login" className="transition-colors hover:text-white">
                Login
              </Link>
              <Link href="/register" className="transition-colors hover:text-white">
                Register
              </Link>
              <Link href="/calculator" className="transition-colors hover:text-white">
                Calculator
              </Link>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">
              © {new Date().getFullYear()} ArbitrageBet
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
