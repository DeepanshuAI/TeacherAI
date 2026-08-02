"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { signIn } from "@/lib/auth-client";
import { signInSchema, type SignInInput } from "@/lib/validations";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInInput) => {
    setError(null);
    const result = await signIn.email({
      email: data.email,
      password: data.password,
    });

    if (result.error) {
      setError(result.error.message || "Invalid email or password");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-strong rounded-2xl p-8"
    >
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-9 h-9 rounded-lg bg-[var(--primary)] flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <span
          className="font-display font-700 text-xl text-gradient"
          style={{ fontFamily: "var(--font-display)" }}
        >
          TeacherAI
        </span>
      </div>

      <h1 className="text-2xl font-semibold mb-1">Welcome back</h1>
      <p className="text-[var(--muted-foreground)] text-sm mb-8">
        Sign in to continue your learning journey
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium block">
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-[var(--color-error-400)] mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-[var(--primary)] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full px-4 py-3 pr-12 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-[var(--color-error-400)] mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-4 py-3 rounded-xl bg-[var(--color-error-400)]/10 border border-[var(--color-error-400)]/20 text-sm text-[var(--color-error-400)]"
          >
            {error}
          </motion.div>
        )}

        {/* Submit */}
        <button
          id="sign-in-submit"
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-xl bg-[var(--primary)] text-white font-semibold hover:opacity-90 disabled:opacity-50 transition-all glow-primary flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--border)]" />
        </div>
        <div className="relative flex justify-center text-xs text-[var(--muted-foreground)] bg-transparent">
          <span className="px-3" style={{ background: "var(--glass-bg)" }}>
            or
          </span>
        </div>
      </div>

      {/* Google */}
      <button
        id="sign-in-google"
        type="button"
        onClick={() => signIn.social({ provider: "google", callbackURL: callbackUrl })}
        className="w-full py-3 rounded-xl glass border border-[var(--border)] font-medium text-sm hover:opacity-80 transition-all flex items-center justify-center gap-3"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>

      <p className="text-center text-sm text-[var(--muted-foreground)] mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="text-[var(--primary)] hover:underline font-medium">
          Create one free
        </Link>
      </p>
    </motion.div>
  );
}
