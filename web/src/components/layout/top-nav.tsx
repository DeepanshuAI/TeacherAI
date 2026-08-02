"use client";

import { Bell, Moon, Sun, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface TopNavProps {
  user: { name: string; email: string };
}

export function DashboardTopNav({ user }: TopNavProps) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    router.push("/sign-in");
    router.refresh();
  };

  return (
    <header
      className="h-16 glass border-b border-[var(--border)] flex items-center justify-between px-6 flex-shrink-0"
      role="banner"
    >
      <div className="text-sm text-[var(--muted-foreground)]">
        Welcome back,{" "}
        <span className="font-semibold text-[var(--foreground)]">
          {user.name?.split(" ")[0]}
        </span>{" "}
        👋
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button
          id="notifications-btn"
          type="button"
          className="w-9 h-9 rounded-xl hover:bg-[var(--muted)] flex items-center justify-center transition-colors text-[var(--muted-foreground)] hover:text-[var(--foreground)] relative"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--primary)]" />
        </button>

        {/* Theme toggle */}
        <button
          id="theme-toggle"
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-9 h-9 rounded-xl hover:bg-[var(--muted)] flex items-center justify-center transition-colors text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Sign out */}
        <button
          id="sign-out-btn"
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-9 h-9 rounded-xl hover:bg-red-500/10 flex items-center justify-center transition-colors text-[var(--muted-foreground)] hover:text-red-400 disabled:opacity-50"
          aria-label="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
