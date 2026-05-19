import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/logout-button";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const displayName =
    user.user_metadata?.display_name || user.user_metadata?.full_name || null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">⚡ Arbitrage Bet</h1>
          <p className="mt-1 text-sm text-gray-400">Surebet Scanner & Calculator</p>
        </div>

        {/* User card */}
        <div className="flex items-center justify-center gap-3">
          <Link href="/profile" className="group">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-lg font-bold text-white transition-transform group-hover:scale-105">
              {user.email?.charAt(0).toUpperCase()}
            </div>
          </Link>
          <div>
            {displayName && (
              <p className="text-sm font-medium text-white">{displayName}</p>
            )}
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
        </div>

        {/* Feature cards */}
        <div className="space-y-3">
          <Link href="/scanner" className="block">
            <div className="group rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-4 shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]">
              <div className="flex items-center gap-4">
                <span className="text-3xl">🔍</span>
                <div>
                  <h2 className="text-lg font-bold text-white">Surebet Scanner</h2>
                  <p className="text-sm text-emerald-100">
                    Quét realtime từ nhiều nhà cái, tìm cơ hội surebet
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/calculator" className="block">
            <div className="group rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-4 shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]">
              <div className="flex items-center gap-4">
                <span className="text-3xl">🧮</span>
                <div>
                  <h2 className="text-lg font-bold text-white">Calculator</h2>
                  <p className="text-sm text-blue-100">
                    Tính stake thủ công cho kèo surebet
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link href="/profile" className="flex-1">
            <button className="w-full rounded-xl border border-gray-600 px-4 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700">
              Profile
            </button>
          </Link>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
