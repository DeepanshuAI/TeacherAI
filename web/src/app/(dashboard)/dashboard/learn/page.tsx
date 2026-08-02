import type { Metadata } from "next";
import { LearnPage } from "@/components/teacher/learn-page";

export const metadata: Metadata = { title: "Learn" };

export default function LearnPageRoute() {
  return <LearnPage />;
}
