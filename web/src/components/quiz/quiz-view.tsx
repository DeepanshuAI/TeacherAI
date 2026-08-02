"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Filter, CheckCircle2, Trophy, Clock, Play, RefreshCw } from "lucide-react";
import { QuizCard, Question } from "./quiz-card";

const SAMPLE_QUIZ: Question[] = [
  {
    id: "q1",
    type: "mcq",
    question: "What process do green plants use to convert sunlight, carbon dioxide, and water into glucose food?",
    options: [
      "A) Respiration",
      "B) Photosynthesis",
      "C) Transpiration",
      "D) Fermentation",
    ],
    correct_answer: "B) Photosynthesis",
    explanation: "Photosynthesis is the process by which green plants prepare their food using sunlight, water, and carbon dioxide in the presence of chlorophyll.",
    difficulty: "easy",
    topic: "Science - Biology",
  },
  {
    id: "q2",
    type: "mcq",
    question: "Solve the linear equation for x: 3x + 5 = 20",
    options: ["A) x = 3", "B) x = 5", "C) x = 7", "D) x = 4"],
    correct_answer: "B) x = 5",
    explanation: "Subtract 5 from both sides: 3x = 15. Then divide by 3: x = 5.",
    difficulty: "easy",
    topic: "Mathematics - Algebra",
  },
  {
    id: "q3",
    type: "true_false",
    question: "True or False: Force is defined as a push or pull on an object resulting from its interaction with another object.",
    options: ["True", "False"],
    correct_answer: "True",
    explanation: "Force is a physical interaction that can change the state of motion or shape of an object (P = F / A).",
    difficulty: "medium",
    topic: "Science - Physics",
  },
  {
    id: "q4",
    type: "fill_blank",
    question: "In which year did the Constitution of India come into force? (Enter year as 1950)",
    correct_answer: "1950",
    explanation: "The Constitution of India came into effect on 26th January 1950, celebrated as Republic Day.",
    difficulty: "medium",
    topic: "Social Science - Civics",
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
              { title: "Class 8 Science: Photosynthesis MCQ", score: "90%", date: "2 hours ago", difficulty: "Easy" },
              { title: "Class 8 Math: Linear Equations", score: "80%", date: "Yesterday", difficulty: "Medium" },
              { title: "Social Science: Indian Constitution", score: "95%", date: "3 days ago", difficulty: "Medium" },
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
