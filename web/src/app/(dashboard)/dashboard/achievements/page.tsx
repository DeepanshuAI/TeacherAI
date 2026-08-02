import type { Metadata } from "next";
import { AchievementsView } from "@/components/achievements/achievements-view";

export const metadata: Metadata = { title: "Achievements & Badges" };

export default function AchievementsPage() {
  return <AchievementsView />;
}
