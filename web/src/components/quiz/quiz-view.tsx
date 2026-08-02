"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Filter, CheckCircle2, Trophy, Clock, Play, RefreshCw } from "lucide-react";
import { QuizCard, Question } from "./quiz-card";

const SAMPLE_QUIZ: Question[] = [
  {
    id: "q1",
    type: "mcq",
    question: "What is the primary difference between a list and a tuple in Python?",
    options: [
      "A) Lists are mutable; tuples are immutable",
      "B) Tuples hold only integers; lists hold any type",
      "C) Lists use parentheses (); tuples use brackets []",
      "D) There is no functional difference",
    ],
    correct_answer: "A) Lists are mutable; tuples are immutable",
    explanation: "Lists can be modified (added to, updated) after creation, whereas tuples cannot be mutated once created.",
    difficulty: "easy",
    topic: "Python Basics",
  },
  {
    id: "q2",
    type: "true_false",
    question: "True or False: React Hooks can be called inside regular JavaScript functions or conditional loops.",
    options: ["True", "False"],
    correct_answer: "False",
    explanation: "Hooks must always be called at the top level of React functional components or custom hooks.",
    difficulty: "medium",
    topic: "React",
  },
  {
    id: "q3",
    type: "fill_blank",
    question: "In SQL, the ___ clause is used to filter records that fulfill a specified condition.",
    correct_answer: "WHERE",
    explanation: "The WHERE clause filters rows before grouping or selecting.",
    difficulty: "easy",
    topic: "SQL",
  },
  {
    id: "q4",
    type: "code",
    question: "Fix the syntax error in this Python function definition:\ndef calculate_total(prices)\n    return sum(prices)",
    correct_answer: "def calculate_total(prices):",
    explanation: "Python function definitions must end with a colon `:` after the parameter list.",
    difficulty: "hard",
    topic: "Python Syntax",
  },
];

export function QuizView() {
  const [activeTab, setActiveTab] = useState<"practice" | "history">("practice");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [completedCount, setCompletedCount] = useState(0);
  const [totalScore, setTotalScore] = useState(0);

  const handleScore = (isCorrect: boolean, score: number) => {
    setCompletedCount((prev) => prev + 1);
    setTotalScore((prev) => prev + score);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-display font-700 mb-1"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Quiz &amp; Practice Arena
          </h1>
          <p className="text-[var(--muted-foreground)] text-sm">
            Test your comprehension with auto-generated questions across multiple difficulty levels.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 glass rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("practice")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "practice"
                ? "bg-[var(--primary)] text-white"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            Practice Mode
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "history"
                ? "bg-[var(--primary)] text-white"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            Quiz History
          </button>
        </div>
      </div>

      {activeTab === "practice" ? (
        <div className="space-y-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center font-bold">
                {completedCount}/{SAMPLE_QUIZ.length}
              </div>
              <div>
                <div className="text-xs text-[var(--muted-foreground)]">Answered</div>
                <div className="font-semibold text-sm">Questions Completed</div>
              </div>
            </div>

            <div className="glass rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center font-bold">
                {completedCount > 0 ? `${Math.round((totalScore / completedCount) * 100)}%` : "0%"}
              </div>
              <div>
                <div className="text-xs text-[var(--muted-foreground)]">Accuracy</div>
                <div className="font-semibold text-sm">Average Score</div>
              </div>
            </div>

            <div className="glass rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-[var(--muted-foreground)]">Mastery Rank</div>
                <div className="font-semibold text-sm">Master Scholar</div>
              </div>
            </div>
          </div>

          {/* Quiz Cards Stream */}
          <div className="space-y-6">
            {SAMPLE_QUIZ.map((q) => (
              <QuizCard key={q.id} question={q} onAnswerSubmit={handleScore} />
            ))}
          </div>
        </div>
      ) : (
        /* History View */
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-lg">Completed Quiz History</h2>
          <div className="divide-y divide-[var(--border)]">
            {[
              { title: "Python Fundamentals MCQ", score: "90%", date: "2 hours ago", difficulty: "Easy" },
              { title: "React State & Hooks", score: "80%", date: "Yesterday", difficulty: "Medium" },
              { title: "SQL Joins & Indexing", score: "65%", date: "3 days ago", difficulty: "Hard" },
            ].map((item, idx) => (
              <div key={idx} className="py-3.5 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{item.title}</div>
                  <div className="text-xs text-[var(--muted-foreground)]">{item.date} • {item.difficulty}</div>
                </div>
                <span className="font-semibold text-sm text-green-400 px-3 py-1 rounded-full bg-green-500/10">
                  {item.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
