"use client";

import { cn } from "@/lib/utils";

const PHASES = [
  { id: "identify_level", label: "Assess" },
  { id: "plan_lesson", label: "Plan" },
  { id: "explain", label: "Explain" },
  { id: "practice", label: "Practice" },
  { id: "quiz", label: "Quiz" },
  { id: "summarize", label: "Summary" },
  { id: "complete", label: "Done" },
];

interface LessonPhaseBarProps {
  currentPhase: string;
}

export function LessonPhaseBar({ currentPhase }: LessonPhaseBarProps) {
  const currentIndex = PHASES.findIndex((p) => p.id === currentPhase);
  const effectiveIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="flex items-center gap-1 mb-4 flex-shrink-0" aria-label="Lesson progress">
      {PHASES.map((phase, i) => {
        const isCompleted = i < effectiveIndex;
        const isCurrent = i === effectiveIndex;

        return (
          <div key={phase.id} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center flex-1">
              <div
                className={cn(
                  "h-1.5 w-full rounded-full transition-all duration-500",
                  isCompleted
                    ? "bg-[var(--primary)]"
                    : isCurrent
                    ? "bg-[var(--primary)]/40"
                    : "bg-[var(--muted)]"
                )}
              />
              <span
                className={cn(
                  "text-[10px] mt-1 transition-colors whitespace-nowrap",
                  isCurrent
                    ? "text-[var(--primary)] font-semibold"
                    : isCompleted
                    ? "text-[var(--muted-foreground)]"
                    : "text-[var(--border)]"
                )}
              >
                {phase.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
