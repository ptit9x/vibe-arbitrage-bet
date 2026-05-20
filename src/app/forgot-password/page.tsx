"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Zap, RefreshCw } from "lucide-react";

const RESEND_COOLDOWN = 60;

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleReset = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!email.trim()) return;

      setError("");
      setLoading(true);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setCooldown(RESEND_COOLDOWN);
      setLoading(false);
    },
    [email, supabase]
  );

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gray-950 px-4 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[600px] rounded-full bg-emerald-500/8 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Link
          href="/login"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to login
        </Link>

        <div className="rounded-2xl border border-white/10 bg-gray-900/80 p-6 sm:p-8 backdrop-blur-sm shadow-2xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-2xl">
              🔑
            </div>
            <h1 className="text-xl font-bold text-white">Reset Password</h1>
            <p className="mt-1 text-sm text-gray-400">
              We&apos;ll send you a reset link
            </p>
          </div>

          {!success ? (
            <form onSubmit={handleReset} className="space-y-4">
              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                  ❌ {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-gray-300">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    autoFocus
                    className="border-white/10 bg-gray-800 pl-10 text-white placeholder:text-gray-500 focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 py-2.5 text-sm font-bold text-white hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-600/25"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>

              <p className="text-center text-sm text-gray-400">
                Remember your password?{" "}
                <Link
                  href="/login"
                  className="font-medium text-emerald-400 hover:text-emerald-300"
                >
                  Sign in
                </Link>
              </p>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                <div className="mb-2 text-3xl">📧</div>
                <p className="text-sm font-medium text-emerald-300">
                  Reset link sent!
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Check your inbox at <strong className="text-white">{email}</strong>
                </p>
              </div>

              <Button
                variant="outline"
                className="w-full border-white/10 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                disabled={cooldown > 0 || loading}
                onClick={() => handleReset()}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Sending...
                  </span>
                ) : cooldown > 0 ? (
                  `Resend in ${cooldown}s`
                ) : (
                  "Resend Email"
                )}
              </Button>

              <Link href="/login">
                <Button
                  variant="ghost"
                  className="w-full text-gray-400 hover:text-white"
                >
                  Back to Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
