"use client";

import { motion } from "framer-motion";
import { Trophy, Flame, Zap, Award, Star, Lock, CheckCircle2  } from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: "a-1",
    name: "First Step",
    description: "Complete your first interactive lesson with TeacherAI.",
    icon: "🌟",
    unlocked: true,
    unlockedAt: "3 days ago",
    progress: 1,
    maxProgress: 1,
  },
  {
    id: "a-2",
    name: "Weekly Warrior",
    description: "Maintain a 7-day active learning streak.",
    icon: "🔥",
    unlocked: true,
    unlockedAt: "Today",
    progress: 7,
    maxProgress: 7,
  },
  {
    id: "a-3",
    name: "Quiz Master",
    description: "Score 100% on 5 different quizzes.",
    icon: "🎯",
    unlocked: false,
    progress: 3,
    maxProgress: 5,
  },
  {
    id: "a-4",
    name: "Knowledge Sponge",
    description: "Complete 20 lessons across multiple subjects.",
    icon: "🧠",
    unlocked: false,
    progress: 14,
    maxProgress: 20,
  },
  {
    id: "a-5",
    name: "Polymath",
    description: "Achieve 80%+ mastery in 3 distinct topics.",
    icon: "👑",
    unlocked: false,
    progress: 1,
    maxProgress: 3,
  },
];

export function AchievementsView() {
  const unlockedCount = ACHIEVEMENTS.filter((a) => a.unlocked).length;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-display font-700 mb-1"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Achievements &amp; Badges
        </h1>
        <p className="text-[var(--muted-foreground)] text-sm">
          Unlock badges, celebrate learning milestones, and level up your mastery rank.
        </p>
      </div>

      {/* Progress Banner */}
      <div className="glass-strong rounded-2xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Trophy className="w-8 h-8 achievement-pop" />
          </div>
          <div>
            <div className="font-bold text-lg">
              {unlockedCount} of {ACHIEVEMENTS.length} Badges Unlocked
            </div>
            <div className="text-xs text-[var(--muted-foreground)] mt-0.5">
              Keep completing lessons to unlock all achievements.
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm font-semibold text-[var(--primary)]">Rank: Scholar II</div>
          <div className="text-xs text-[var(--muted-foreground)]">350 XP to Scholar III</div>
        </div>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ACHIEVEMENTS.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`glass rounded-2xl p-6 border space-y-4 relative overflow-hidden transition-all ${
              item.unlocked
                ? "border-amber-500/30 hover:border-amber-500/60"
                : "border-[var(--border)] opacity-80"
            }`}
          >
            <div className="flex items-start justify-between">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
                  item.unlocked
                    ? "bg-amber-500/10 border border-amber-500/30"
                    : "bg-[var(--muted)] border border-[var(--border)] grayscale"
                }`}
              >
                {item.icon}
              </div>

              {item.unlocked ? (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Unlocked
                </span>
              ) : (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)] flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> Locked
                </span>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-base mb-1">{item.name}</h3>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-[var(--muted-foreground)]">
                <span>Progress</span>
                <span>
                  {item.progress}/{item.maxProgress}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--muted)] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    item.unlocked ? "bg-amber-400" : "bg-[var(--primary)]"
                  }`}
                  style={{ width: `${(item.progress / item.maxProgress) * 100}%` }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
