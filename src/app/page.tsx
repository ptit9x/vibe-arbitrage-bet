import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/logout-button";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">
            ⚡ Arbitrage Bet
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Welcome back!
          </p>
        </CardHeader>
        <Separator />
        <CardContent className="flex flex-col items-center gap-4 pt-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
            {user.email?.charAt(0).toUpperCase()}
          </div>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <LogoutButton />
        </CardContent>
      </Card>
    </div>
  );
}
