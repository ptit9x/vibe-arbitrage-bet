"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  KeyRound,
  LogOut,
  Mail,
  Save,
  User,
  Zap,
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
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <Zap className="h-6 w-6 text-emerald-400 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gray-950 px-4 py-8 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[600px] rounded-full bg-emerald-500/6 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to dashboard
        </Link>

        <div className="rounded-2xl border border-white/10 bg-gray-900/80 p-6 sm:p-8 backdrop-blur-sm shadow-2xl">
          {/* Avatar + header */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-2xl font-bold text-white ring-2 ring-emerald-500/30 ring-offset-2 ring-offset-gray-900">
              {user?.email?.charAt(0).toUpperCase() || "?"}
            </div>
            <h1 className="text-xl font-bold text-white">Profile</h1>
            <p className="mt-1 text-xs text-gray-400">
              Member since{" "}
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString("vi-VN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "N/A"}
            </p>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                ❌ {error}
              </div>
            )}

            {success && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-400">
                ✅ Profile updated!
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-gray-300 flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ""}
                disabled
                className="border-white/5 bg-gray-800/50 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-sm text-gray-300 flex items-center gap-2">
                <User className="h-3.5 w-3.5" />
                Display Name
              </Label>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                autoComplete="name"
                className="border-white/10 bg-gray-800 text-white placeholder:text-gray-500 focus:border-emerald-500/50"
              />
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="w-full bg-emerald-600 py-2.5 text-sm font-bold text-white hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-600/25"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <Zap className="h-4 w-4 animate-pulse" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </span>
              )}
            </Button>
          </form>

          <Separator className="my-6 bg-white/10" />

          <div className="space-y-2">
            <Link href="/change-password" className="block">
              <Button
                variant="outline"
                className="w-full gap-2 border-white/10 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                <KeyRound className="h-4 w-4" />
                Change Password
              </Button>
            </Link>

            <Button
              variant="ghost"
              className="w-full gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
