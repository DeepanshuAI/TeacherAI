"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, Mic, MicOff, Paperclip, Sparkles } from "lucide-react";

interface Props {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled }: Props) {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || disabled) return;
    onSendMessage(text.trim());
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Web Speech API Voice STT integration
  const toggleListening = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognition.start();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative max-w-3xl mx-auto w-full px-4 mb-4"
    >
      <div className="relative flex items-end bg-[var(--card)]/90 backdrop-blur-xl border border-[var(--border)] rounded-2xl p-2 shadow-2xl focus-within:border-indigo-500/50 transition-all">
        {/* Attachment button */}
        <button
          type="button"
          className="p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors rounded-xl hover:bg-[var(--secondary)]"
          title="Upload notes or PDF"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask TeacherAI anything... (e.g. 'Explain Newton's Laws with a sports example')"
          rows={1}
          disabled={disabled}
          className="flex-1 bg-transparent border-0 focus:outline-none resize-none px-3 py-2 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] max-h-48"
        />

        <div className="flex items-center gap-1.5 pl-2">
          {/* Voice STT button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2 rounded-xl transition-colors ${
              isListening
                ? "bg-red-500/20 text-red-400 animate-pulse"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)]"
            }`}
            title={isListening ? "Stop listening" : "Voice message"}
          >
            {isListening ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!text.trim() || disabled}
            className={`p-2 rounded-xl text-white font-medium transition-all ${
              text.trim() && !disabled
                ? "bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 scale-100"
                : "bg-indigo-600/40 opacity-50 cursor-not-allowed"
            }`}
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="text-[10px] text-center text-[var(--muted-foreground)] mt-2">
        TeacherAI adapts explanations, difficulty, and quizzes in real-time.
      </div>
    </form>
  );
}
