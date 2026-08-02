"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  FileText,
  Upload,
  Trophy,
  Settings,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/learn", label: "Learn", icon: Sparkles },
  { href: "/dashboard/progress", label: "Progress", icon: LayoutDashboard },
  { href: "/dashboard/quizzes", label: "Quizzes", icon: ClipboardList },
  { href: "/dashboard/homework", label: "Homework", icon: FileText },
  { href: "/dashboard/uploads", label: "My Files", icon: Upload },
  { href: "/dashboard/achievements", label: "Achievements", icon: Trophy },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  user: { name: string; email: string; image?: string | null };
}

export function DashboardSidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className="w-64 flex-shrink-0 glass border-r border-[var(--border)] flex flex-col h-full"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="p-6 border-b border-[var(--border)]">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <img
            src="/teacherAI.webp"
            alt="TeacherAI Logo"
            className="w-9 h-9 rounded-xl object-cover group-hover:scale-105 transition-transform"
          />
          <span
            className="font-display font-700 text-lg text-gradient"
            style={{ fontFamily: "var(--font-display)" }}
          >
            TeacherAI
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto" role="navigation">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative",
                isActive
                  ? "bg-[var(--primary)] text-white shadow-sm"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 rounded-xl bg-[var(--primary)] -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User profile */}
      <div className="p-4 border-t border-[var(--border)]">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--muted)] transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
            {user.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{user.name}</div>
            <div className="text-xs text-[var(--muted-foreground)] truncate">
              {user.email}
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-[var(--muted-foreground)] group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </aside>
  );
}
