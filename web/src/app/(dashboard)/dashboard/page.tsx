import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { DashboardOverview } from "@/components/dashboard/overview";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  return <DashboardOverview user={session!.user} />;
}
