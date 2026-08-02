"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles, X, ArrowRight, BookOpen } from "lucide-react";
import { startLessonSchema, type StartLessonInput } from "@/lib/validations";

const SUGGESTED_TOPICS = [
  "Photosynthesis & Plant Biology",
  "Linear Equations in One Variable",
  "Force and Pressure",
  "Cell Structure & Functions",
  "Indian Constitution & Civics",
  "Squares and Square Roots",
  "English Grammar: Tenses & Voice",
  "Crop Production & Management",
];

interface TopicStarterModalProps {
  onStart: (topic: string) => void;
  onClose: () => void;
}

export function TopicStarterModal({ onStart, onClose }: TopicStarterModalProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<StartLessonInput>({
    resolver: zodResolver(startLessonSchema),
  });

  const topic = watch("topic", "");

  const onSubmit = (data: StartLessonInput) => {
    onStart(data.topic);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "oklch(0% 0 0 / 0.5)", backdropFilter: "blur(8px)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
        className="glass-strong rounded-2xl p-8 w-full max-w-lg relative"
      >
        <button
          id="close-topic-modal"
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg hover:bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)] transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <img
            src="/teacherAI.webp"
            alt="TeacherAI Logo"
            className="w-10 h-10 rounded-xl object-cover"
          />
          <div>
            <h2 className="font-semibold text-lg">Start a Class 8 lesson</h2>
            <p className="text-sm text-[var(--muted-foreground)]">
              What subject or topic do you want to learn today?
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              id="topic-input"
              type="text"
              placeholder="e.g. Photosynthesis, Linear Equations, Cell Structure..."
              className="w-full px-4 py-3 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
              autoFocus
              {...register("topic")}
            />
            {errors.topic && (
              <p className="text-xs text-red-400 mt-1">{errors.topic.message}</p>
            )}
          </div>

          <button
            id="start-lesson-btn"
            type="submit"
            disabled={!topic.trim()}
            className="w-full py-3 rounded-xl bg-[var(--primary)] text-white font-semibold hover:opacity-90 disabled:opacity-40 transition-all glow-primary flex items-center justify-center gap-2"
          >
            Start lesson
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Suggested topics */}
        <div className="mt-6">
          <p className="text-xs text-[var(--muted-foreground)] mb-3 flex items-center gap-1.5">
            <BookOpen className="w-3 h-3" />
            Popular topics
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_TOPICS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => {
                  setValue("topic", suggestion);
                }}
                className="text-xs px-3 py-1.5 rounded-full glass border border-[var(--border)] hover:border-[var(--primary)]/40 hover:text-[var(--primary)] transition-all"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
