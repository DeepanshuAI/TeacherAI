"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Sparkles, AlertCircle } from "lucide-react";
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
    try {
      const result = await signIn.email({
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        console.error("[SignIn Error]:", result.error);
        setError(result.error.message || result.error.statusText || "Invalid email or password");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err: unknown) {
      console.error("[SignIn Exception]:", err);
      const msg = err instanceof Error ? err.message : "An unexpected sign-in error occurred";
      setError(msg);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: callbackUrl,
      });
    } catch (err: unknown) {
      console.error("[Google SignIn Error]:", err);
      setError("Google Sign In is not configured yet. Please use email and password.");
    }
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
      <p className="text-sm text-[var(--muted-foreground)] mb-6">
        Sign in to continue your learning journey
      </p>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Authentication Error</p>
            <p className="text-xs text-red-300/80 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Social Sign In */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="w-full h-11 rounded-xl bg-[var(--card)] hover:bg-[var(--secondary)] border border-[var(--border)] text-sm font-medium transition-colors flex items-center justify-center gap-3 mb-6"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        Continue with Google
      </button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--border)]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[var(--card)] px-3 text-[var(--muted-foreground)] font-medium">
            Or sign in with email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-medium mb-1.5 text-[var(--foreground)]">
            Email Address
          </label>
          <input
            {...register("email")}
            type="email"
            placeholder="alex@example.com"
            className="w-full h-11 px-4 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-[var(--primary)] focus:outline-none text-sm transition-colors"
          />
          {errors.email && (
            <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-[var(--foreground)]">
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
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="w-full h-11 pl-4 pr-11 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-[var(--primary)] focus:outline-none text-sm transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-1"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-400 mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 rounded-xl bg-[var(--primary)] hover:opacity-90 text-white text-sm font-medium transition-all flex items-center justify-center gap-2 mt-6"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing In...
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <p className="text-center text-xs text-[var(--muted-foreground)] mt-6">
        Don&apos;t have an account?{" "}
        <Link
          href="/sign-up"
          className="text-[var(--primary)] font-medium hover:underline"
        >
          Sign up
        </Link>
      </p>
    </motion.div>
  );
}
