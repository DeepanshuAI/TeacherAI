import type { Metadata } from "next";
import { QuizView } from "@/components/quiz/quiz-view";

export const metadata: Metadata = { title: "Quizzes & Practice" };

export default function QuizzesPage() {
  return <QuizView />;
}
