"use client";

import { motion } from "framer-motion";
import {
  Flame,
  Award,
  TrendingUp,
  Brain,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const weeklyActivityData = [
  { day: "Mon", minutes: 35, quizzes: 2 },
  { day: "Tue", minutes: 45, quizzes: 3 },
  { day: "Wed", minutes: 20, quizzes: 1 },
  { day: "Thu", minutes: 60, quizzes: 4 },
  { day: "Fri", minutes: 50, quizzes: 3 },
  { day: "Sat", minutes: 75, quizzes: 5 },
  { day: "Sun", minutes: 40, quizzes: 2 },
];

const scoreTrendData = [
  { session: "L1", score: 65 },
  { session: "L2", score: 70 },
  { session: "L3", score: 68 },
  { session: "L4", score: 78 },
  { session: "L5", score: 85 },
  { session: "L6", score: 82 },
  { session: "L7", score: 90 },
];

const strongTopics = [
  { name: "Mathematics — Linear Equations", mastery: 95 },
  { name: "Science — Photosynthesis & Cell Structure", mastery: 92 },
  { name: "English — Tenses & Active/Passive Voice", mastery: 88 },
  { name: "Social Science — The Indian Constitution", mastery: 85 },
];

const weakTopics = [
  { name: "Mathematics — Squares & Square Roots", mastery: 48, recommendation: "Practice prime factorization method for square roots" },
  { name: "Science — Force & Pressure Formulas", mastery: 52, recommendation: "Review pressure formula P = F / A with sample numericals" },
  { name: "Social Science — Natural Vegetation & Wildlife", mastery: 58, recommendation: "Re-read Chapter 3 Geography summary & map points" },
];

export function ProgressView() {
  const masteryPercentage = 78;

  return (
    <motion.div
      className="max-w-6xl mx-auto space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1
          className="text-2xl font-display font-700 mb-1"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Learning Progress &amp; Analytics
        </h1>
        <p className="text-[var(--muted-foreground)] text-sm">
          Track your overall mastery, weekly study activity, and topic strengths.
        </p>
      </motion.div>

      {/* Top key metrics */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={itemVariants}
      >
        {/* Mastery Ring Card */}
        <div className="glass rounded-2xl p-5 flex items-center gap-4">
          <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="currentColor"
                strokeWidth="6"
                className="text-[var(--muted)]"
                fill="transparent"
              />
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="currentColor"
                strokeWidth="6"
                className="text-[var(--primary)] progress-ring-circle"
                strokeDasharray={2 * Math.PI * 26}
                strokeDashoffset={2 * Math.PI * 26 * (1 - masteryPercentage / 100)}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <span className="absolute font-bold text-sm">{masteryPercentage}%</span>
          </div>
          <div>
            <div className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider font-medium">
              Overall Mastery
            </div>
            <div className="text-lg font-bold">Advanced Learner</div>
            <div className="text-xs text-green-400 font-medium flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" /> +5% this week
            </div>
          </div>
        </div>

        {/* Streak Card */}
        <div className="glass rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 flex-shrink-0">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider font-medium">
              Current Streak
            </div>
            <div className="text-xl font-bold">7 Days 🔥</div>
            <div className="text-xs text-[var(--muted-foreground)] mt-0.5">
              Personal best: 14 days
            </div>
          </div>
        </div>

        {/* Total Time Card */}
        <div className="glass rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider font-medium">
              Total Time
            </div>
            <div className="text-xl font-bold">18.5 Hours</div>
            <div className="text-xs text-[var(--muted-foreground)] mt-0.5">
              325 mins this week
            </div>
          </div>
        </div>

        {/* Lessons Completed Card */}
        <div className="glass rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 flex-shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider font-medium">
              Lessons Completed
            </div>
            <div className="text-xl font-bold">24 Lessons</div>
            <div className="text-xs text-[var(--muted-foreground)] mt-0.5">
              Across 6 topics
            </div>
          </div>
        </div>
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Chart */}
        <motion.div variants={itemVariants} className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-lg">Weekly Study Activity</h2>
              <p className="text-xs text-[var(--muted-foreground)]">Minutes spent learning per day</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
              This Week
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "12px",
                    color: "var(--foreground)",
                    fontSize: "12px",
                  }}
                  cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                />
                <Bar dataKey="minutes" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Quiz Performance Trend */}
        <motion.div variants={itemVariants} className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-lg">Quiz Score Trend</h2>
              <p className="text-xs text-[var(--muted-foreground)]">Average score over recent lessons</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-500/10 text-green-400">
              +15% Growth
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scoreTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="session" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "12px",
                    color: "var(--foreground)",
                    fontSize: "12px",
                  }}
                />
                <Area type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#scoreGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Weak & Strong Topics Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strong Topics */}
        <motion.div variants={itemVariants} className="glass rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <h2 className="font-semibold text-lg">Strong Topics</h2>
          </div>
          <div className="space-y-4">
            {strongTopics.map((item) => (
              <div key={item.name} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{item.name}</span>
                  <span className="font-semibold text-green-400">{item.mastery}%</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--muted)] overflow-hidden">
                  <div
                    className="h-full bg-green-400 rounded-full transition-all duration-500"
                    style={{ width: `${item.mastery}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Weak Topics / Areas for Review */}
        <motion.div variants={itemVariants} className="glass rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <h2 className="font-semibold text-lg">Targeted Review Needed</h2>
          </div>
          <div className="space-y-4">
            {weakTopics.map((item) => (
              <div key={item.name} className="p-3.5 rounded-xl bg-[var(--muted)]/60 border border-[var(--border)] space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{item.name}</span>
                  <span className="font-semibold text-amber-400">{item.mastery}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${item.mastery}%` }}
                  />
                </div>
                <p className="text-xs text-[var(--muted-foreground)]">
                  💡 <strong>AI Recommendation:</strong> {item.recommendation}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
