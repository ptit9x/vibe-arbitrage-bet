"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft, KeyRound, Lock, Shield, ShieldCheck, Eye, EyeOff, Zap } from "lucide-react";

export default function ChangePasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from current password");
      return;
    }

    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user?.email) {
      setError("Unable to verify identity. Please sign in again.");
      setLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userData.user.email,
      password: currentPassword,
    });

    if (signInError) {
      setError("Current password is incorrect");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gray-950 px-4 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[600px] rounded-full bg-amber-500/6 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Link
          href="/profile"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to profile
        </Link>

        <div className="rounded-2xl border border-white/10 bg-gray-900/80 p-6 sm:p-8 backdrop-blur-sm shadow-2xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
              <KeyRound className="h-6 w-6 text-amber-400" />
            </div>
            <h1 className="text-xl font-bold text-white">Change Password</h1>
            <p className="mt-1 text-sm text-gray-400">
              Update your account password
            </p>
          </div>

          {success ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                <ShieldCheck className="mx-auto mb-2 h-8 w-8 text-emerald-400" />
                <p className="text-sm font-medium text-emerald-300">
                  Password updated!
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Use your new password next time you sign in.
                </p>
              </div>
              <Link href="/profile">
                <Button className="w-full bg-emerald-600 text-white font-bold hover:bg-emerald-500">
                  Back to Profile
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4">
              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                  ❌ {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-sm text-gray-300">
                  Current Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="currentPassword"
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="border-white/10 bg-gray-800 pl-10 text-white placeholder:text-gray-500 focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm text-gray-300">
                  New Password
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="newPassword"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="border-white/10 bg-gray-800 pl-10 text-white placeholder:text-gray-500 focus:border-emerald-500/50"
                  />
                </div>
                <p className="text-[10px] text-gray-500">At least 6 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm text-gray-300">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="border-white/10 bg-gray-800 pl-10 text-white placeholder:text-gray-500 focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 py-2.5 text-sm font-bold text-white hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-600/25"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Zap className="h-4 w-4 animate-pulse" />
                    Updating...
                  </span>
                ) : (
                  "Update Password"
                )}
              </Button>

              <Link href="/profile" className="block">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-gray-400 hover:text-white"
                >
                  Cancel
                </Button>
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
