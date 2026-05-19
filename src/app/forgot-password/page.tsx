"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
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

const RESEND_COOLDOWN = 60; // seconds

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-2xl">
            🔑
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">
            ⚡ Arbitrage Bet
          </CardTitle>
          <CardDescription>Reset your password</CardDescription>
        </CardHeader>

        {!success ? (
          <form onSubmit={handleReset}>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter your email and we&apos;ll send you a link to reset your
                password.
              </p>

              {error && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link
                  href="/login"
                  className="font-medium text-blue-600 underline-offset-4 hover:underline hover:text-blue-800"
                >
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        ) : (
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
              <div className="mb-2 text-3xl">📧</div>
              <p className="text-sm font-medium text-green-800">
                Reset link sent!
              </p>
              <p className="mt-1 text-sm text-green-700">
                Check your inbox at <strong>{email}</strong>
              </p>
            </div>

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                disabled={cooldown > 0 || loading}
                onClick={() => handleReset()}
              >
                {loading
                  ? "Sending..."
                  : cooldown > 0
                    ? `Resend in ${cooldown}s`
                    : "Resend Email"}
              </Button>

              <Link href="/login" className="block">
                <Button variant="ghost" className="w-full">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
