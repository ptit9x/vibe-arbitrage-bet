import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/logout-button";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">
            ⚡ Arbitrage Bet
          </CardTitle>
          <p className="text-sm text-muted-foreground">Welcome back!</p>
        </CardHeader>
        <Separator />
        <CardContent className="flex flex-col items-center gap-4 pt-6">
          <Link href="/profile" className="group">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground transition-transform group-hover:scale-105">
              {user.email?.charAt(0).toUpperCase()}
            </div>
          </Link>
          <div className="text-center">
            {displayName && (
              <p className="text-sm font-medium">{displayName}</p>
            )}
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex w-full gap-2">
            <Link href="/profile" className="flex-1">
              <button className="w-full rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent">
                Profile
              </button>
            </Link>
            <LogoutButton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
