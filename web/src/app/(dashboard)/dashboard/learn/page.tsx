import { Suspense } from "react";
import type { Metadata } from "next";
import { LearnPage } from "@/components/teacher/learn-page";

export const metadata: Metadata = { title: "Learn" };

export default function LearnPageRoute() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-[var(--muted-foreground)]">Loading tutor...</div>}>
      <LearnPage />
    </Suspense>
  );
}
