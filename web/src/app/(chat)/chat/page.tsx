"use client";

import React, { useEffect, useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Sparkles,
  BookOpen,
  HelpCircle,
  Code,
  Zap,
  Bot,
  Brain,
} from "lucide-react";
import { ChatSidebar, SessionItem } from "@/components/chat/ChatSidebar";
import { MessageBubble, MessageData } from "@/components/chat/MessageBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import { StudentProfileModal } from "@/components/chat/StudentProfileModal";
import { authClient } from "@/lib/auth-client";

const SUGGESTED_PROMPTS = [
  {
    icon: BookOpen,
    title: "Class 8 Science",
    subtitle: "Explain Chemical Reactions with an everyday example",
  },
  {
    icon: HelpCircle,
    title: "Math Quiz",
    subtitle: "Quiz me on Fractions and Linear Equations",
  },
  {
    icon: Code,
    title: "Computer Science",
    subtitle: "How does Python loop work? Explain step-by-step",
  },
  {
    icon: Zap,
    title: "Socratic Practice",
    subtitle: "Ask me questions to test my understanding of History",
  },
];

export default function ChatPage() {
  const { data: session } = authClient.useSession();
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeThreadId, setActiveThreadId] = useState<string>(uuidv4());
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const loadSessions = async () => {
    try {
      const res = await fetch("/api/sessions");
      if (res.status === 401) {
        window.location.href = "/sign-in";
        return;
      }
      const data = await res.json();
      if (data.sessions) {
        setSessions(data.sessions);
      }
    } catch (e) {
      console.error("Failed to load sessions", e);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  // Handle Session Selection
  const handleSelectSession = async (sessionId: string) => {
    setActiveSessionId(sessionId);
    try {
      const res = await fetch(`/api/sessions/${sessionId}`);
      const data = await res.json();
      if (data.session) {
        setActiveThreadId(data.session.threadId);
        setMessages(
          data.session.messages.map((m: any) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            messageType: m.metadata?.messageType || "text",
            activeQuiz: m.metadata?.activeQuiz,
            createdAt: m.createdAt,
          }))
        );
      }
    } catch (e) {
      console.error("Failed to load session messages", e);
    }
  };

  // Start New Chat
  const handleNewChat = () => {
    setActiveSessionId(null);
    setActiveThreadId(uuidv4());
    setMessages([]);
  };

  // Rename Session
  const handleRenameSession = async (id: string, newTitle: string) => {
    try {
      await fetch(`/api/sessions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      loadSessions();
    } catch (e) {
      console.error("Failed to rename session", e);
    }
  };

  // Toggle Pin Session
  const handleTogglePinSession = async (id: string, isPinned: boolean) => {
    try {
      await fetch(`/api/sessions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned }),
      });
      loadSessions();
    } catch (e) {
      console.error("Failed to pin session", e);
    }
  };

  // Delete Session
  const handleDeleteSession = async (id: string) => {
    try {
      await fetch(`/api/sessions/${id}`, { method: "DELETE" });
      if (activeSessionId === id) {
        handleNewChat();
      }
      loadSessions();
    } catch (e) {
      console.error("Failed to delete session", e);
    }
  };

  // Send Message & Stream Response
  const handleSendMessage = async (userText: string) => {
    if (!userText.trim()) return;

    let currentSessionId = activeSessionId;
    let currentThreadId = activeThreadId;

    // Create session in Prisma DB if new conversation
    if (!currentSessionId) {
      try {
        const titleSnippet =
          userText.length > 30 ? userText.slice(0, 30) + "..." : userText;
        const res = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            threadId: currentThreadId,
            title: titleSnippet,
            topic: titleSnippet,
          }),
        });
        const data = await res.json();
        if (data.session) {
          currentSessionId = data.session.id;
          setActiveSessionId(data.session.id);
          loadSessions();
        }
      } catch (e) {
        console.error("Failed to create new session", e);
      }
    }

    // Add user message to UI state
    const userMsg: MessageData = {
      id: uuidv4(),
      role: "user",
      content: userText,
    };

    const aiMsgId = uuidv4();
    const initialAiMsg: MessageData = {
      id: aiMsgId,
      role: "assistant",
      content: "",
    };

    setMessages((prev) => [...prev, userMsg, initialAiMsg]);
    setIsStreaming(true);

    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          session_id: currentThreadId,
          topic: "General Learning",
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/sign-in";
          return;
        }
        throw new Error(`Server returned ${response.status}`);
      }

      if (!response.body) throw new Error("No stream response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";
      let activeQuiz: any = null;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") break;

            try {
              const data = JSON.parse(jsonStr);
              if (data.type === "token" && data.content) {
                assistantText += data.content;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiMsgId ? { ...m, content: assistantText } : m
                  )
                );
              } else if (data.type === "done" && data.full_response) {
                assistantText = data.full_response;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiMsgId
                      ? {
                          ...m,
                          content: assistantText,
                          messageType: data.message_type || "text",
                        }
                      : m
                  )
                );
              } else if (data.type === "error") {
                assistantText = data.message || "An error occurred while generating the response.";
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiMsgId ? { ...m, content: assistantText } : m
                  )
                );
              }
            } catch (e) {
              // Ignore partial JSON chunks
            }
          }
        }
      }
    } catch (e) {
      console.error("Stream error", e);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId
            ? {
                ...m,
                content:
                  "I apologize, but I encountered a temporary connection error. Please try asking your question again!",
              }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
      loadSessions();
    }
  };

  return (
    <div className="flex w-full h-full">
      {/* ChatGPT Sidebar */}
      <ChatSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onRenameSession={handleRenameSession}
        onTogglePinSession={handleTogglePinSession}
        onDeleteSession={handleDeleteSession}
        onOpenProfile={() => setIsProfileOpen(true)}
        user={session?.user || null}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--background)]">
        {/* Top Header */}
        <header className="h-14 border-b border-[var(--border)] px-6 flex items-center justify-between bg-[var(--card)]/40 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">
              TeacherAI Agent
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
              Socratic Mode
            </span>
          </div>

          <button
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 border border-indigo-500/20 text-xs font-semibold transition-colors"
          >
            <Brain className="w-4 h-4" /> AI Profile
          </button>
        </header>

        {/* Conversation Stream Container */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 ? (
              /* Hero Empty State */
              <div className="py-16 text-center space-y-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-500/20">
                  <Bot className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight">
                    What would you like to learn today?
                  </h1>
                  <p className="text-sm text-[var(--muted-foreground)] max-w-md mx-auto">
                    I am your personal AI Teacher. Ask me any question, practice for exams, or request step-by-step explanations.
                  </p>
                </div>

                {/* Suggested Prompts Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-2xl mx-auto pt-4">
                  {SUGGESTED_PROMPTS.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(item.subtitle)}
                        className="p-4 rounded-2xl bg-[var(--card)] hover:bg-[var(--secondary)] border border-[var(--border)] transition-all group hover:border-indigo-500/40 text-left space-y-1"
                      >
                        <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 group-hover:text-indigo-300">
                          <Icon className="w-4 h-4" /> {item.title}
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)] line-clamp-2">
                          {item.subtitle}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Message List */
              messages.map((msg, index) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isStreaming={
                    isStreaming &&
                    index === messages.length - 1 &&
                    msg.role === "assistant"
                  }
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Bar */}
        <ChatInput onSendMessage={handleSendMessage} disabled={isStreaming} />
      </div>

      {/* Student Profile Drawer */}
      <StudentProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
}
