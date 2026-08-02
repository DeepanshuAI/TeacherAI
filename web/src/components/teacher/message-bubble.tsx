"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Message } from "./learn-page";

// Simple markdown renderer for streamed content
function renderContent(content: string): string {
  return content
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, `<code style="font-family:var(--font-mono);font-size:0.85em;background:var(--muted);padding:0.1em 0.4em;border-radius:4px;border:1px solid var(--border)">$1</code>`)
    .replace(/```[\w]*\n([\s\S]*?)```/g, (_, code) => 
      `<pre style="background:var(--muted);border:1px solid var(--border);border-radius:8px;padding:1rem;overflow-x:auto;margin:0.5rem 0"><code style="font-family:var(--font-mono);font-size:0.85em">${code.trim()}</code></pre>`
    );
}

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}
    >
      {/* Teacher avatar */}
      {!isUser && (
        <img
          src="/teacherAI.webp"
          alt="TeacherAI Avatar"
          className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1 shadow-sm border border-[var(--border)]"
        />
      )}

      <div
        className={cn(
          "max-w-[75%] px-4 py-3 text-sm leading-relaxed",
          isUser ? "bubble-user" : "bubble-teacher"
        )}
      >
        {message.streaming && message.content === "" ? (
          /* Typing indicator */
          <div className="flex items-center gap-1.5 py-0.5">
            <div className="typing-dot" />
            <div className="typing-dot" />
            <div className="typing-dot" />
          </div>
        ) : (
          <div
            className="streamed-text"
            dangerouslySetInnerHTML={{ __html: renderContent(message.content) }}
          />
        )}

        {/* Streaming cursor */}
        {message.streaming && message.content.length > 0 && (
          <span className="inline-block w-0.5 h-4 bg-current opacity-70 ml-0.5 animate-pulse align-middle" />
        )}

        {/* Timestamp */}
        {!message.streaming && (
          <div
            className={cn(
              "text-xs mt-1.5 opacity-50",
              isUser ? "text-right" : "text-left"
            )}
          >
            {message.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-[var(--muted)] border border-[var(--border)] flex items-center justify-center flex-shrink-0 mt-1">
          <span className="text-xs font-semibold text-[var(--muted-foreground)]">U</span>
        </div>
      )}
    </motion.div>
  );
}
