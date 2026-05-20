import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardContent from "@/components/dashboard-content";

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

  return <DashboardContent displayName={displayName} initial={initial} />;
}
