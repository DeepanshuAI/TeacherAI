import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "TeacherAI — Your Personal AI Tutor",
    template: "%s | TeacherAI",
  },
  description:
    "Learn anything with your personal AI tutor that teaches step by step, adapts to your level, and tracks your progress.",
  keywords: ["AI tutor", "online learning", "personalized education", "AI teacher"],
  authors: [{ name: "TeacherAI" }],
  creator: "TeacherAI",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "TeacherAI — Your Personal AI Tutor",
    description: "Learn anything with an AI that actually teaches, not just answers.",
    siteName: "TeacherAI",
  },
  twitter: {
    card: "summary_large_image",
    title: "TeacherAI",
    description: "Your personal AI tutor",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a2e" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
