"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  KeyRound,
  LogOut,
  Mail,
  Save,
  User,
} from "lucide-react";
import Link from "next/link";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
      setDisplayName(
        user.user_metadata?.display_name ||
          user.user_metadata?.full_name ||
          ""
      );
      setLoading(false);
    };
    fetchUser();
  }, [supabase, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError("");
    setSuccess(false);
    setSaving(true);

    const { error } = await supabase.auth.updateUser({
      data: { display_name: displayName },
    });

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    setSuccess(true);
    setSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700">
            {user?.email?.charAt(0).toUpperCase() || "?"}
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">
            ⚡ Arbitrage Bet
          </CardTitle>
          <CardDescription>Your profile</CardDescription>
        </CardHeader>

        <Separator />

        <form onSubmit={handleUpdateProfile}>
          <CardContent className="space-y-4 pt-6">
            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                ✅ Profile updated successfully!
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Display Name
              </Label>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                autoComplete="name"
              />
            </div>

            <div className="rounded-lg border bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">
                Member since{" "}
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "N/A"}
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full gap-2" disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>

            <Link href="/change-password" className="w-full">
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
              >
                <KeyRound className="h-4 w-4" />
                Change Password
              </Button>
            </Link>

            <Separator className="my-1" />

            <Link href="/" className="w-full">
              <Button
                type="button"
                variant="ghost"
                className="w-full gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>

            <Button
              type="button"
              variant="ghost"
              className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
