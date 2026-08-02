import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { LandingHero } from "@/components/landing/hero";

export default async function HomePage() {
  // Redirect authenticated users to dashboard
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user) {
    redirect("/dashboard");
  }

  return <LandingHero />;
}
