"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, BookOpen, Sparkles, AlertCircle, ChevronRight } from "lucide-react";

interface HomeworkTask {
  id: string;
  topic: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  completed: boolean;
  dueDate: string;
}

const INITIAL_HOMEWORK: HomeworkTask[] = [
  {
    id: "hw-1",
    topic: "Science - Photosynthesis",
    title: "Draw and Label the Leaf Diagram",
    description: "Draw the cross-section of a leaf showing stomata and chloroplasts, and write the chemical equation for photosynthesis.",
    estimatedMinutes: 20,
    completed: false,
    dueDate: "Tomorrow",
  },
  {
    id: "hw-2",
    topic: "Mathematics - Linear Equations",
    title: "Solve 5 Word Problems on Linear Equations",
    description: "Form and solve linear equations for word problems finding unknown numbers and ages in Exercise 2.2.",
    estimatedMinutes: 30,
    completed: true,
    dueDate: "Done",
  },
  {
    id: "hw-3",
    topic: "Social Science - Civics",
    title: "Write a Short Note on Preamble Values",
    description: "Summarize key values of the Indian Constitution: Justice, Liberty, Equality, and Fraternity in 100 words.",
    estimatedMinutes: 15,
    completed: false,
    dueDate: "In 3 days",
  },
];

export function HomeworkView() {
  const [tasks, setTasks] = useState<HomeworkTask[]>(INITIAL_HOMEWORK);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const pendingCount = tasks.filter((t) => !t.completed).length;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-display font-700 mb-1"
          style={{ fontFamily: "var(--font-display)" }}
        >
          AI-Assigned Homework
        </h1>
        <p className="text-[var(--muted-foreground)] text-sm">
          Personalized practice tasks created by your AI teacher after each session.
        </p>
      </div>

      {/* Summary Banner */}
      <div className="glass rounded-2xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-sm">
              {pendingCount} Pending Assignment{pendingCount === 1 ? "" : "s"}
            </div>
            <div className="text-xs text-[var(--muted-foreground)]">
              Complete these tasks to cement your weak topics.
            </div>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-strong rounded-2xl p-6 border transition-all ${
              task.completed
                ? "border-[var(--border)] opacity-70"
                : "border-[var(--primary)]/30 hover:border-[var(--primary)]/60"
            }`}
          >
            <div className="flex items-start gap-4">
              <button
                type="button"
                onClick={() => toggleTask(task.id)}
                className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all mt-0.5 ${
                  task.completed
                    ? "bg-green-500 border-green-500 text-white"
                    : "border-[var(--muted-foreground)] hover:border-[var(--primary)]"
                }`}
              >
                {task.completed && <CheckCircle2 className="w-4 h-4" />}
              </button>

              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[var(--secondary)] text-[var(--secondary-foreground)]">
                    {task.topic}
                  </span>
                  <span className="text-xs text-[var(--muted-foreground)] flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {task.estimatedMinutes} mins • Due {task.dueDate}
                  </span>
                </div>

                <h3 className={`font-semibold text-base ${task.completed ? "line-through" : ""}`}>
                  {task.title}
                </h3>

                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                  {task.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
