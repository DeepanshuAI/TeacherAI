import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Admin Portal | TeacherAI" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");

  return (
    <div className="min-h-screen gradient-bg p-8">
      <div className="max-w-7xl mx-auto">{children}</div>
    </div>
  );
}
