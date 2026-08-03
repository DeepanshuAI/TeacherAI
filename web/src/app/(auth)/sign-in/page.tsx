import { Suspense } from "react";
import { SignInForm } from "@/components/auth/sign-in-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sign In" };

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-8 text-center text-sm text-[var(--muted-foreground)]">Loading sign in...</div>}>
      <SignInForm />
    </Suspense>
  );
}
