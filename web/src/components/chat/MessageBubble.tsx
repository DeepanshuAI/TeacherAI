"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import { Copy, Check, User, Sparkles, CheckCircle2, HelpCircle } from "lucide-react";

export interface MessageData {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  messageType?: "text" | "quiz" | "summary" | "homework" | "onboarding";
  activeQuiz?: any;
  homework?: any;
  createdAt?: string;
}

interface Props {
  message: MessageData;
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming }: Props) {
  const [copied, setCopied] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);

  const isUser = message.role === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-4 py-4 px-4 rounded-2xl transition-colors ${
        isUser
          ? "bg-indigo-600/10 border border-indigo-500/20 ml-12"
          : "bg-[var(--card)]/60 border border-[var(--border)] mr-4 shadow-sm"
      }`}
    >
      {/* Avatar */}
      <div className="shrink-0">
        {isUser ? (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
            <User className="w-4 h-4" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white shadow-md">
            <img
              src="/teacherAI.webp"
              alt="TeacherAI"
              className="w-full h-full rounded-xl object-cover"
            />
          </div>
        )}
      </div>

      {/* Message Body */}
      <div className="flex-1 min-w-0 space-y-2 text-sm leading-relaxed">
        {/* Header */}
        <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
          <span className="font-semibold text-[var(--foreground)]">
            {isUser ? "You" : "TeacherAI"}
          </span>
          <button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-[var(--secondary)] transition-colors opacity-60 hover:opacity-100"
            title="Copy message"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Markdown Rendered Content */}
        <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-[var(--background)] prose-pre:border prose-pre:border-[var(--border)] prose-pre:rounded-xl">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
          {isStreaming && (
            <span className="inline-block w-2 h-4 ml-1 bg-indigo-400 animate-pulse" />
          )}
        </div>

        {/* Interactive Quiz Card Component */}
        {message.activeQuiz && (
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 to-purple-950/40 border border-indigo-500/30 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              <HelpCircle className="w-4 h-4 text-indigo-400" /> Interactive Practice Quiz
            </div>
            <p className="font-medium text-sm text-white">
              {message.activeQuiz.question}
            </p>

            {message.activeQuiz.options && (
              <div className="space-y-2 pt-1">
                {message.activeQuiz.options.map((opt: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setQuizAnswer(opt)}
                    className={`w-full text-left p-3 rounded-lg border text-xs font-medium transition-all ${
                      quizAnswer === opt
                        ? "bg-indigo-600 text-white border-indigo-400 shadow-md"
                        : "bg-[var(--background)]/80 hover:bg-[var(--secondary)] border-[var(--border)]"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
