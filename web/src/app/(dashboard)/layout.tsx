import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { DashboardSidebar } from "@/components/layout/sidebar";
import { DashboardTopNav } from "@/components/layout/top-nav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s | TeacherAI" },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");

  return (
    <div className="flex h-screen overflow-hidden gradient-bg">
      <DashboardSidebar user={session.user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopNav user={session.user} />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto p-6"
          role="main"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
