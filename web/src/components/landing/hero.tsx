"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, Brain, Zap, Shield, ArrowRight, BookOpen, BarChart3, Mic } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Adaptive Intelligence",
    description: "Identifies your level, adjusts explanations, and personalizes every lesson to how you learn.",
  },
  {
    icon: Zap,
    title: "Step-by-Step Teaching",
    description: "Never dumps information. Teaches interactively, one concept at a time, with real examples.",
  },
  {
    icon: BookOpen,
    title: "Complete Learning System",
    description: "Introduction, explanation, examples, practice, quiz, summary, and homework — every session.",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description: "Track streaks, mastery percentage, weak topics, and achievement milestones.",
  },
  {
    icon: Mic,
    title: "Voice Learning",
    description: "Speak your questions, listen to explanations. Full conversation mode available.",
  },
  {
    icon: Shield,
    title: "Remembers Everything",
    description: "Recalls your history, quiz scores, and weak areas to personalize future lessons.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function LandingHero() {
  return (
    <div className="gradient-bg min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/teacherAI.webp"
              alt="TeacherAI Logo"
              className="w-8 h-8 rounded-lg object-cover"
            />
            <span
              className="font-display font-700 text-lg text-gradient"
              style={{ fontFamily: "var(--font-display)" }}
            >
              TeacherAI
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors px-4 py-2 rounded-lg hover:bg-[var(--muted)]"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="text-sm bg-[var(--primary)] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all glow-primary font-medium"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-[var(--muted-foreground)] border border-[var(--glass-border)]">
              <Sparkles className="w-3.5 h-3.5 text-[var(--primary)]" />
              Intelligent AI School Tutor for Class 8 Students
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-display font-800 leading-tight mb-6"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Master Class 8 subjects with an AI that{" "}
            <span className="text-gradient">actually teaches</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Personalized learning for Mathematics, Science, English, Social Science, and Computer Science. 
            TeacherAI adapts to your level, solves doubts step-by-step, generates quizzes, and helps with homework — like your own personal school teacher.
          </motion.p>

          <motion.div variants={itemVariants} className="flex items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 bg-[var(--primary)] text-white px-8 py-4 rounded-xl font-semibold hover:opacity-90 transition-all glow-primary text-lg"
            >
              Start learning free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 glass px-8 py-4 rounded-xl font-semibold hover:opacity-80 transition-all text-lg"
            >
              Sign in
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Demo chat preview */}
      <section className="px-6 pb-16">
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <div className="glass-strong rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[var(--border)]">
              <img
                src="/teacherAI.webp"
                alt="TeacherAI Avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div>
                <div className="text-sm font-semibold">TeacherAI</div>
                <div className="text-xs text-[var(--muted-foreground)]">Class 8 Science: Photosynthesis</div>
              </div>
              <div className="ml-auto flex gap-1">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-[var(--muted-foreground)]">Live session</span>
              </div>
            </div>

            {/* Teacher message */}
            <div className="flex gap-3">
              <img
                src="/teacherAI.webp"
                alt="TeacherAI"
                className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-1"
              />
              <div className="bubble-teacher px-4 py-3 text-sm leading-relaxed max-w-sm">
                Hello! Today we are learning how plants make their food. Have you ever wondered why leaves are green?
              </div>
            </div>

            {/* Student message */}
            <div className="flex gap-3 justify-end">
              <div className="bubble-user px-4 py-3 text-sm leading-relaxed max-w-sm">
                I know green leaves need sunlight, but how do they convert it into food?
              </div>
            </div>

            {/* Teacher response */}
            <div className="flex gap-3">
              <img
                src="/teacherAI.webp"
                alt="TeacherAI"
                className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-1"
              />
              <div className="bubble-teacher px-4 py-3 text-sm leading-relaxed max-w-sm">
                Great question! Leaves contain a green pigment called <strong>chlorophyll</strong>. It captures sunlight and combines water from the roots with carbon dioxide from the air to make <strong>glucose</strong> (food) and oxygen.
                <br /><br />
                What gas do plants release for us to breathe during this process?
              </div>
            </div>

            {/* Typing */}
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-[var(--muted)] flex-shrink-0 mt-1" />
              <div className="bubble-teacher px-4 py-3 flex items-center gap-1.5">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2
              className="text-3xl md:text-4xl font-display font-700 mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Not a chatbot. A real teaching system.
            </h2>
            <p className="text-[var(--muted-foreground)] max-w-xl mx-auto">
              Every feature is designed around one goal: helping you actually understand, not just get answers.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="glass rounded-xl p-6 hover:scale-[1.02] transition-transform duration-200"
              >
                <div className="w-10 h-10 rounded-lg bg-[var(--secondary)] flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-[var(--primary)]" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-[var(--muted-foreground)]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--primary)]" />
            <span>TeacherAI © 2025</span>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-[var(--foreground)] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[var(--foreground)] transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
