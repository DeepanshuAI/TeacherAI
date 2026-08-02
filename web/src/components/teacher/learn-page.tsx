"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Send,
  Mic,
  MicOff,
  Sparkles,
  Plus,
  BookOpen,
  Loader2,
} from "lucide-react";
import { chatMessageSchema, startLessonSchema, type ChatMessageInput, type StartLessonInput } from "@/lib/validations";
import { MessageBubble } from "./message-bubble";
import { LessonPhaseBar } from "./lesson-phase-bar";
import { TopicStarterModal } from "./topic-starter-modal";
import { VoiceButton } from "./voice-button";
import { v4 as uuidv4 } from "uuid";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  type: "text" | "quiz" | "code" | "summary" | "homework";
  streaming?: boolean;
  timestamp: Date;
}

export function LearnPage() {
  const searchParams = useSearchParams();
  const initialTopic = searchParams.get("topic") || "";

  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId] = useState(() => uuidv4());
  const [topic, setTopic] = useState(initialTopic);
  const [showTopicModal, setShowTopicModal] = useState(!initialTopic);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentPhase, setCurrentPhase] = useState("identify_level");
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ChatMessageInput>({
    resolver: zodResolver(chatMessageSchema),
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Start lesson with initial topic
  useEffect(() => {
    if (initialTopic && messages.length === 0) {
      sendMessage(`I want to learn about: ${initialTopic}`);
    }
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      const userMessage: Message = {
        id: uuidv4(),
        role: "user",
        content: content.trim(),
        type: "text",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsStreaming(true);

      // Add streaming placeholder
      const streamingId = uuidv4();
      const streamingMessage: Message = {
        id: streamingId,
        role: "assistant",
        content: "",
        type: "text",
        streaming: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, streamingMessage]);

      try {
        abortControllerRef.current = new AbortController();

        const response = await fetch("/api/chat/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content.trim(),
            session_id: sessionId,
            topic: topic || content.trim(),
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) throw new Error("Stream request failed");
        if (!response.body) throw new Error("No response body");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let accumulatedContent = "";
        let finalType: Message["type"] = "text";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") break;

            try {
              const chunk = JSON.parse(data);
              if (chunk.type === "token" && chunk.content) {
                accumulatedContent += chunk.content;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === streamingId
                      ? { ...m, content: accumulatedContent }
                      : m
                  )
                );
              } else if (chunk.type === "done") {
                finalType = chunk.message_type || "text";
              }
            } catch {
              // Skip malformed chunks
            }
          }
        }

        // Finalize message
        setMessages((prev) =>
          prev.map((m) =>
            m.id === streamingId
              ? { ...m, content: accumulatedContent, streaming: false, type: finalType }
              : m
          )
        );
      } catch (err) {
        if ((err as Error).name === "AbortError") return;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === streamingId
              ? {
                  ...m,
                  content: "I encountered an error. Please try again.",
                  streaming: false,
                }
              : m
          )
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [isStreaming, sessionId, topic]
  );

  const onSubmit = (data: ChatMessageInput) => {
    sendMessage(data.message);
    reset();
  };

  const handleTopicStart = (selectedTopic: string) => {
    setTopic(selectedTopic);
    setShowTopicModal(false);
    sendMessage(`I want to learn about: ${selectedTopic}`);
  };

  // Voice input via Web Speech API
  const toggleVoice = useCallback(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Voice input is not supported in your browser. Please use Chrome.");
      return;
    }
    // Handled by VoiceButton component
    setIsListening((v) => !v);
  }, []);

  const quickReplies = [
    "I don't understand, can you explain differently?",
    "Give me another example",
    "I'm ready for the quiz",
    "Can you slow down?",
  ];

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[var(--primary)] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-sm">TeacherAI</h1>
            {topic && (
              <p className="text-xs text-[var(--muted-foreground)]">
                Teaching: {topic}
              </p>
            )}
          </div>
          {isStreaming && (
            <span className="text-xs text-[var(--muted-foreground)] flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Teaching...
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            id="new-session-btn"
            type="button"
            onClick={() => setShowTopicModal(true)}
            className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] glass px-3 py-1.5 rounded-lg transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            New topic
          </button>
        </div>
      </div>

      {/* Phase progress bar */}
      {topic && <LessonPhaseBar currentPhase={currentPhase} />}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 min-h-0">
        {messages.length === 0 && !showTopicModal && (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="w-16 h-16 rounded-2xl bg-[var(--secondary)] flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-[var(--primary)]" />
            </div>
            <h2 className="font-semibold mb-2">What would you like to learn?</h2>
            <p className="text-sm text-[var(--muted-foreground)] max-w-sm">
              Type a topic below or click "New topic" to start your lesson.
            </p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Quick replies */}
      {messages.length > 2 && !isStreaming && (
        <div className="flex gap-2 flex-wrap mb-3 flex-shrink-0">
          {quickReplies.map((reply) => (
            <button
              key={reply}
              type="button"
              onClick={() => sendMessage(reply)}
              className="text-xs glass px-3 py-1.5 rounded-full hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] transition-all border border-[var(--border)]"
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex-shrink-0 flex gap-2 glass rounded-2xl p-2 border border-[var(--border)]"
        aria-label="Message input"
      >
        <VoiceButton
          isListening={isListening}
          onTranscript={(text) => {
            setValue("message", text);
            setIsListening(false);
          }}
          onToggle={toggleVoice}
        />

        <textarea
          id="chat-input"
          rows={1}
          placeholder={topic ? `Ask about ${topic}...` : "Type your message..."}
          className="flex-1 bg-transparent text-sm placeholder:text-[var(--muted-foreground)] resize-none focus:outline-none py-2 px-2 max-h-32 scrollbar-hide"
          disabled={isStreaming}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(onSubmit)();
            }
          }}
          {...register("message")}
        />

        <button
          id="send-message-btn"
          type="submit"
          disabled={isStreaming}
          className="w-10 h-10 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center hover:opacity-90 disabled:opacity-40 transition-all flex-shrink-0 self-end glow-primary"
          aria-label="Send message"
        >
          {isStreaming ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>

      {/* Topic starter modal */}
      <AnimatePresence>
        {showTopicModal && (
          <TopicStarterModal
            onStart={handleTopicStart}
            onClose={() => setShowTopicModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
