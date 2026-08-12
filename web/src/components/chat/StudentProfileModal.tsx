"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  GraduationCap,
  BookOpen,
  Brain,
  Sparkles,
  Target,
  Award,
  Zap,
  RefreshCw,
} from "lucide-react";

interface StudentProfileData {
  name?: string;
  age?: number;
  gradeClass?: string;
  board?: string;
  preferredLanguage?: string;
  subjects?: string[];
  strongTopics?: string[];
  weakTopics?: string[];
  learningStyle?: string;
  confidenceLevel?: string;
  attentionSpan?: string;
  readingLevel?: string;
  learningPace?: string;
  masteredTopics?: string[];
  topicsBeingLearned?: string[];
  knowledgeHistory?: Record<string, number>;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function StudentProfileModal({ isOpen, onClose }: Props) {
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (data.profile) {
        setProfile(data.profile);
      }
    } catch (e) {
      console.error("Failed to load student profile", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[var(--background)] border-l border-[var(--border)] z-50 flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-[var(--border)] flex items-center justify-between bg-[var(--card)]/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg leading-tight">
                    Student Profile Engine
                  </h2>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Continuous AI learning profile & estimation
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-[var(--secondary)] text-[var(--muted-foreground)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-12 text-[var(--muted-foreground)] gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Loading dynamic profile...</span>
                </div>
              ) : (
                <>
                  {/* Basic Information Card */}
                  <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
                      <User className="w-4 h-4" /> Academic Identity
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-xs text-[var(--muted-foreground)] block">
                          Class / Grade
                        </span>
                        <span className="font-medium">
                          {profile?.gradeClass || "Not specified yet"}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-[var(--muted-foreground)] block">
                          Board
                        </span>
                        <span className="font-medium">
                          {profile?.board || "Not specified"}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-[var(--muted-foreground)] block">
                          Language
                        </span>
                        <span className="font-medium">
                          {profile?.preferredLanguage || "English"}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-[var(--muted-foreground)] block">
                          Learning Pace
                        </span>
                        <span className="font-medium capitalize">
                          {profile?.learningPace || "Adaptable"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Knowledge Estimation Gauges */}
                  {profile?.knowledgeHistory &&
                    Object.keys(profile.knowledgeHistory).length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-400">
                          <Zap className="w-4 h-4" /> Knowledge Estimation Index
                        </div>
                        <div className="space-y-2">
                          {Object.entries(profile.knowledgeHistory).map(
                            ([topic, score]) => (
                              <div
                                key={topic}
                                className="p-3 rounded-lg bg-[var(--card)] border border-[var(--border)]"
                              >
                                <div className="flex justify-between text-xs font-medium mb-1">
                                  <span>{topic}</span>
                                  <span className="text-indigo-400 font-bold">
                                    {score}%
                                  </span>
                                </div>
                                <div className="w-full bg-[var(--background)] h-2 rounded-full overflow-hidden">
                                  <div
                                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${score}%` }}
                                  />
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Strong Topics */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                      <Award className="w-4 h-4" /> Mastered & Strong Topics
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(profile?.strongTopics?.length || 0) > 0 ? (
                        profile?.strongTopics?.map((t) => (
                          <span
                            key={t}
                            className="px-2.5 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium"
                          >
                            {t}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-[var(--muted-foreground)]">
                          None identified yet — keep chatting!
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Weak Topics */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
                      <Target className="w-4 h-4" /> Topics Being Adapted
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(profile?.weakTopics?.length || 0) > 0 ? (
                        profile?.weakTopics?.map((t) => (
                          <span
                            key={t}
                            className="px-2.5 py-1 rounded-full text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium"
                          >
                            {t}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-[var(--muted-foreground)]">
                          No major weak areas flagged.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Learning Style & Confidence */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
                      <Sparkles className="w-4 h-4" /> Adaptive Tuning
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      The AI automatically adjusts sentence length, analogies, and practice difficulty after every message.
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
