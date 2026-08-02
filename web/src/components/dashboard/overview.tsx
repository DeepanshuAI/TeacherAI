"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Sparkles,
  Flame,
  BookOpen,
  ClipboardCheck,
  TrendingUp,
  ArrowRight,
  Brain,
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface DashboardOverviewProps {
  user: { name: string; email: string };
}

// Mock data (replace with real DB queries)
const stats = [
  { label: "Day Streak", value: "7", icon: Flame, color: "text-orange-400", bg: "bg-orange-400/10" },
  { label: "Lessons Completed", value: "24", icon: BookOpen, color: "text-blue-400", bg: "bg-blue-400/10" },
  { label: "Quiz Average", value: "82%", icon: ClipboardCheck, color: "text-green-400", bg: "bg-green-400/10" },
  { label: "Topics Mastered", value: "8", icon: Brain, color: "text-purple-400", bg: "bg-purple-400/10" },
];

const recentTopics = [
  { topic: "Photosynthesis & Plant Biology", progress: 85, lastStudied: "2 hours ago" },
  { topic: "Linear Equations in One Variable", progress: 60, lastStudied: "Yesterday" },
  { topic: "Force and Pressure", progress: 40, lastStudied: "3 days ago" },
];

export function DashboardOverview({ user }: DashboardOverviewProps) {
  return (
    <motion.div
      className="max-w-5xl mx-auto space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Greeting */}
      <motion.div variants={itemVariants}>
        <h1
          className="text-2xl font-display font-700 mb-1"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Good {getTimeOfDay()}, {user.name?.split(" ")[0]}! 👋
        </h1>
        <p className="text-[var(--muted-foreground)] text-sm">
          Ready to learn something new today?
        </p>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        variants={itemVariants}
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="glass rounded-2xl p-5 hover:scale-[1.02] transition-transform duration-200"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-2xl font-bold mb-0.5">{stat.value}</div>
            <div className="text-xs text-[var(--muted-foreground)]">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Start learning CTA */}
      <motion.div variants={itemVariants}>
        <Link
          href="/dashboard/learn"
          className="block glass-strong rounded-2xl p-6 border border-[var(--primary)]/20 hover:border-[var(--primary)]/40 transition-all hover:scale-[1.01] group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/teacherAI.webp"
                alt="TeacherAI"
                className="w-14 h-14 rounded-2xl object-cover glow-primary"
              />
              <div>
                <div className="font-semibold text-lg mb-0.5">Start a new lesson</div>
                <div className="text-sm text-[var(--muted-foreground)]">
                  Ask your Class 8 AI teacher any question in Math, Science, English, or Social Science
                </div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-[var(--primary)] group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </motion.div>

      {/* Recent topics */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Continue learning</h2>
          <Link
            href="/dashboard/progress"
            className="text-sm text-[var(--primary)] hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="space-y-3">
          {recentTopics.map((item) => (
            <Link
              key={item.topic}
              href={`/dashboard/learn?topic=${encodeURIComponent(item.topic)}`}
              className="flex items-center gap-4 glass rounded-xl p-4 hover:scale-[1.01] transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--secondary)] flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-4 h-4 text-[var(--primary)]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm mb-1 truncate">{item.topic}</div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 rounded-full bg-[var(--muted)] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-[var(--primary)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${item.progress}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    />
                  </div>
                  <span className="text-xs text-[var(--muted-foreground)] flex-shrink-0">
                    {item.progress}%
                  </span>
                </div>
              </div>
              <div className="text-xs text-[var(--muted-foreground)] flex-shrink-0">
                {item.lastStudied}
              </div>
              <ArrowRight className="w-4 h-4 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </Link>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}
