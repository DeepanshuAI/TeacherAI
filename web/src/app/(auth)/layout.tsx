import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your TeacherAI account",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="gradient-bg min-h-screen flex items-center justify-center p-4">
      {/* Decorative blobs */}
      <div
        className="fixed inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: "var(--primary)" }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-15 blur-3xl"
          style={{ background: "oklch(70% 0.18 65)" }}
        />
      </div>
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
