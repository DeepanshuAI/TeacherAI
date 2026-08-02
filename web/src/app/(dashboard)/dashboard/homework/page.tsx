import type { Metadata } from "next";
import { HomeworkView } from "@/components/homework/homework-view";

export const metadata: Metadata = { title: "Assigned Homework" };

export default function HomeworkPage() {
  return <HomeworkView />;
}
