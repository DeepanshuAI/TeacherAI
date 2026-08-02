"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, HelpCircle, ArrowRight, Sparkles, Code, Check, RefreshCw } from "lucide-react";
import { evaluateAnswer } from "@/lib/ai-client";

export interface Question {
  id: string;
  type: "mcq" | "true_false" | "fill_blank" | "short_answer" | "code";
  question: string;
  options?: string[];
  correct_answer?: string;
  explanation?: string;
  difficulty?: "easy" | "medium" | "hard";
  topic?: string;
}

interface QuizCardProps {
  question: Question;
  onAnswerSubmit?: (isCorrect: boolean, score: number) => void;
}

export function QuizCard({ question, onAnswerSubmit }: QuizCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState<{
    is_correct: boolean;
    score: number;
    explanation: string;
    feedback: string;
  } | null>(null);

  const handleSubmit = async (answer: string) => {
    if (!answer.trim() || evaluating || result) return;
    setEvaluating(true);

    try {
      // Evaluate via AI service API or local evaluation logic fallback
      const evalResult = await evaluateAnswer({
        question: question as unknown as Record<string, unknown>,
        studentAnswer: answer,
        studentLevel: "intermediate",
        userId: "demo-user",
        userEmail: "demo@example.com",
      }).catch(() => {
        // Fallback for offline/demo evaluation
        const isMatch = question.correct_answer
          ? answer.trim().toLowerCase() === question.correct_answer.trim().toLowerCase()
          : true;
        return {
          is_correct: isMatch,
          score: isMatch ? 1 : 0,
          explanation: question.explanation || "Great effort! Review the concept for deeper insight.",
          correct_answer: question.correct_answer || "",
          feedback: isMatch ? "Spot on! Excellent understanding." : "Not quite right, but close!",
        };
      });

      setResult(evalResult);
      if (onAnswerSubmit) {
        onAnswerSubmit(evalResult.is_correct, evalResult.score);
      }
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong rounded-2xl p-6 border border-[var(--border)] space-y-5"
    >
      {/* Header Badge */}
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider font-semibold px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {question.type.replace("_", " ")} • {question.difficulty || "Medium"}
        </span>
        {question.topic && (
          <span className="text-xs text-[var(--muted-foreground)]">{question.topic}</span>
        )}
      </div>

      {/* Question Text */}
      <div className="text-base font-medium leading-relaxed">
        {question.type === "code" ? (
          <div className="space-y-3">
            <p>{question.question}</p>
            <div className="p-4 rounded-xl bg-[var(--muted)] border border-[var(--border)] font-mono text-sm overflow-x-auto">
              <code>{question.question.split("```")[1] || question.question}</code>
            </div>
          </div>
        ) : (
          <p>{question.question}</p>
        )}
      </div>

      {/* Answer Inputs based on Question Type */}
      {!result && (
        <div className="space-y-3">
          {/* MCQ / True-False */}
          {(question.type === "mcq" || question.type === "true_false") && question.options && (
            <div className="grid grid-cols-1 gap-2.5">
              {question.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setSelectedOption(opt);
                    handleSubmit(opt);
                  }}
                  disabled={evaluating}
                  className={`w-full text-left p-3.5 rounded-xl text-sm font-medium transition-all border ${
                    selectedOption === opt
                      ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                      : "glass hover:bg-[var(--muted)] border-[var(--border)]"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {/* Fill-in-blank / Short Answer / Code */}
          {(question.type === "fill_blank" || question.type === "short_answer" || question.type === "code") && (
            <div className="space-y-3">
              <textarea
                rows={question.type === "code" ? 4 : 2}
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder={
                  question.type === "code"
                    ? "Write your code fix or snippet here..."
                    : "Type your answer..."
                }
                className="w-full p-3.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
              <button
                type="button"
                onClick={() => handleSubmit(textAnswer)}
                disabled={!textAnswer.trim() || evaluating}
                className="px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white font-medium text-sm hover:opacity-90 disabled:opacity-40 transition-all flex items-center gap-2 glow-primary"
              >
                {evaluating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Evaluating...
                  </>
                ) : (
                  <>
                    Submit Answer <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Result & Evaluation Feedback */}
      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-4 rounded-xl border space-y-2 ${
            result.is_correct
              ? "bg-green-500/10 border-green-500/30 text-green-300"
              : "bg-amber-500/10 border-amber-500/30 text-amber-300"
          }`}
        >
          <div className="flex items-center gap-2 font-semibold text-sm">
            {result.is_correct ? (
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            ) : (
              <XCircle className="w-5 h-5 text-amber-400" />
            )}
            <span>{result.is_correct ? "Correct!" : "Needs Review"}</span>
            <span className="ml-auto text-xs opacity-80">Score: {Math.round(result.score * 100)}%</span>
          </div>

          <p className="text-sm opacity-90">{result.feedback}</p>

          {result.explanation && (
            <div className="text-xs pt-2 border-t border-current/20 opacity-80">
              <strong>Explanation:</strong> {result.explanation}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
