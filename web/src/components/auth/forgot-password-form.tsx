"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, ArrowLeft, CheckCircle2 } from "lucide-react";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations";

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    // Simulate reset email trigger
    setTimeout(() => {
      setSubmitted(true);
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong rounded-2xl p-8"
    >
      <div className="flex items-center gap-2 mb-8">
        <img
          src="/teacherAI.webp"
          alt="TeacherAI Logo"
          className="w-9 h-9 rounded-xl object-cover"
        />
        <span
          className="font-display font-700 text-xl text-gradient"
          style={{ fontFamily: "var(--font-display)" }}
        >
          TeacherAI
        </span>
      </div>

      <h1 className="text-2xl font-semibold mb-1">Reset your password</h1>
      <p className="text-[var(--muted-foreground)] text-sm mb-8">
        Enter your email and we&apos;ll send you instructions to reset your password.
      </p>

      {submitted ? (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <CheckCircle2 className="w-5 h-5" /> Reset Link Sent
          </div>
          <p className="text-xs leading-relaxed">
            Check your inbox for instructions to reset your password. If it doesn&apos;t appear in a few minutes, check your spam folder.
          </p>
          <div className="pt-3">
            <Link href="/sign-in" className="text-xs text-[var(--primary)] hover:underline font-semibold flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Return to sign in
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium block">
              Email address
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-[var(--primary)] text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-all glow-primary"
          >
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </button>

          <p className="text-center text-sm text-[var(--muted-foreground)] pt-2">
            Remembered your password?{" "}
            <Link href="/sign-in" className="text-[var(--primary)] hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </form>
      )}
    </motion.div>
  );
}
