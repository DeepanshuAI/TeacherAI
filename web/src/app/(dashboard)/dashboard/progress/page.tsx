import type { Metadata } from "next";
import { ProgressView } from "@/components/progress/progress-view";

export const metadata: Metadata = { title: "Learning Progress" };

export default function ProgressPage() {
  return <ProgressView />;
}
