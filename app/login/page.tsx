"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { validateEmail, validateRequired } from "@/lib/validation";
import { getErrorMessage } from "@/lib/errorHandler";
import { InteractiveBackground } from "@/components/InteractiveBackground";
import { Card } from "@/components/Card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEmailError(null);
    setPasswordError(null);

    // Validate fields
    const emailValidation = validateEmail(email);
    const passwordValidation = validateRequired(password, "Password");

    if (emailValidation) {
      setEmailError(emailValidation);
      return;
    }

    if (passwordValidation) {
      setPasswordError(passwordValidation);
      return;
    }

    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setError(getErrorMessage(authError));
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center bg-dots-pattern overflow-hidden">
      <InteractiveBackground />
      {/* Decorative Background Elements */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-float -z-10" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-float -z-10" style={{ animationDelay: "2s" }} />

      <Card className="w-full max-w-md p-8 glass animate-fade-in shadow-2xl relative z-10 border-white/20 dark:border-white/5">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4 text-2xl">
            👋
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Sign in to manage your rentals
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium ml-1" htmlFor="email">Email</label>
            <div className="relative group">
              <input
                id="email"
                className={`w-full px-4 py-3 border rounded-xl bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300 ${emailError ? "border-red-500" : "border-border hover:border-primary/50"}`}
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                onBlur={() => setEmailError(validateEmail(email))}
              />
            </div>
            {emailError && <p className="text-red-500 text-xs ml-1 animate-slide-up">{emailError}</p>}
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-medium" htmlFor="password">Password</label>
              <a href="#" className="text-xs text-primary hover:underline">Forgot your password?</a>
            </div>
            <div className="relative group">
              <input
                id="password"
                className={`w-full px-4 py-3 border rounded-xl bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300 ${passwordError ? "border-red-500" : "border-border hover:border-primary/50"}`}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError(null);
                }}
                onBlur={() => setPasswordError(validateRequired(password, "Password"))}
              />
            </div>
            {passwordError && <p className="text-red-500 text-xs ml-1 animate-slide-up">{passwordError}</p>}
          </div>

          {error && (
            <div className="bg-red-50/50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm text-center animate-slide-up backdrop-blur-sm">
              <span className="font-medium">Error:</span> {error}
            </div>
          )}

          <button
            className="w-full bg-gradient-to-r from-primary to-indigo-600 text-white py-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : "Sign in"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border/50 text-center text-sm">
          <span className="text-muted-foreground">Don&apos;t have an account? </span>
          <Link href="/register" className="text-primary font-semibold hover:text-primary/80 transition-colors inline-flex items-center gap-1 group">
            Sign up here
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </Card>
    </div>
  );
}
