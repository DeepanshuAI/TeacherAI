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
    default: "TeacherAI — Intelligent AI School Tutor for Class 8",
    template: "%s | TeacherAI",
  },
  description:
    "Personalized AI school tutor for Class 8 students covering Mathematics, Science, English, Social Science, and Computer Science.",
  keywords: ["Class 8 AI tutor", "school learning", "homework help", "AI teacher", "CBSE Class 8", "ICSE Class 8"],
  authors: [{ name: "TeacherAI" }],
  creator: "TeacherAI",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  icons: {
    icon: "/teacherAI.webp",
    shortcut: "/teacherAI.webp",
    apple: "/teacherAI.webp",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "TeacherAI — Intelligent AI School Tutor for Class 8",
    description: "Learn Class 8 subjects with a friendly AI tutor that explains step by step.",
    siteName: "TeacherAI",
    images: [{ url: "/teacherAI.webp", width: 512, height: 512, alt: "TeacherAI Logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TeacherAI — Class 8 AI Tutor",
    description: "Your friendly AI school teacher",
    images: ["/teacherAI.webp"],
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
