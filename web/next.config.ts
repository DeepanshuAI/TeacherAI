import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Prevent webpack from trying to bundle Node.js-only packages.
  // Without this, webpack hangs trying to resolve Prisma's native .node binaries
  // and Better Auth's complex dynamic requires during production compilation.
  serverExternalPackages: [
    "@prisma/client",
    "prisma",
    "better-auth",
    "@better-auth/core",
  ],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        // Allow all HTTPS origins (Vercel preview/production URLs)
        ...(process.env.NEXT_PUBLIC_APP_URL
          ? [process.env.NEXT_PUBLIC_APP_URL.replace(/^https?:\/\//, "")]
          : []),
      ],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;

