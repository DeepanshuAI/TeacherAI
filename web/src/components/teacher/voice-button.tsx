"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceButtonProps {
  isListening: boolean;
  onTranscript: (text: string) => void;
  onToggle: () => void;
}

export function VoiceButton({ isListening, onTranscript, onToggle }: VoiceButtonProps) {
  const recognitionRef = useRef<any>(null);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const win = window as any;
      setSupported(Boolean(win.webkitSpeechRecognition || win.SpeechRecognition));
    }
  }, []);

  useEffect(() => {
    if (!supported || typeof window === "undefined") return;

    const win = window as any;
    const SpeechRecognitionAPI = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) return;

    if (isListening) {
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");

        if (event.results[0]?.isFinal) {
          onTranscript(transcript);
        }
      };

      recognitionRef.current.onerror = () => onToggle();
      recognitionRef.current.onend = () => {
        if (isListening) onToggle();
      };

      try {
        recognitionRef.current.start();
      } catch {
        // Handle start collision
      }
    } else {
      try {
        recognitionRef.current?.stop();
      } catch {
        // Ignore stop error
      }
    }

    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {
        // Ignore
      }
    };
  }, [isListening, supported, onTranscript, onToggle]);

  if (!supported) return null;

  return (
    <button
      id="voice-input-btn"
      type="button"
      onClick={onToggle}
      className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0 self-end",
        isListening
          ? "bg-red-500 text-white animate-pulse"
          : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
      )}
      aria-label={isListening ? "Stop listening" : "Start voice input"}
      aria-pressed={isListening}
    >
      {isListening ? (
        <MicOff className="w-4 h-4" />
      ) : (
        <Mic className="w-4 h-4" />
      )}
    </button>
  );
}
