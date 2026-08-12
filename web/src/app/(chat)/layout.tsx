import React from "react";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      {children}
    </div>
  );
}
