"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { User, Bell, Moon, Sun, Volume2, Sparkles, Check, Save } from "lucide-react";
import { useSession } from "@/lib/auth-client";

export function SettingsView() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  const [name, setName] = useState(session?.user?.name || "Student");
  const [learningSpeed, setLearningSpeed] = useState("average");
  const [autoVoice, setAutoVoice] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-display font-700 mb-1"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Settings &amp; Preferences
        </h1>
        <p className="text-[var(--muted-foreground)] text-sm">
          Customize your AI learning experience, voice preferences, and account info.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Section */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <User className="w-5 h-5 text-[var(--primary)]" /> Account Profile
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email Address</label>
              <input
                type="email"
                disabled
                value={session?.user?.email || "student@example.com"}
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-sm opacity-60 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* AI Learning Preferences */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--primary)]" /> AI Teaching Preferences
          </h2>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Teaching Pace / Speed</label>
              <select
                value={learningSpeed}
                onChange={(e) => setLearningSpeed(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none"
              >
                <option value="slow">Gentle &amp; Detailed (Slower Pace)</option>
                <option value="average">Standard Interactive (Recommended)</option>
                <option value="fast">Accelerated &amp; Concise (Faster Pace)</option>
              </select>
            </div>

            {/* Voice Toggle */}
            <div className="flex items-center justify-between py-2 border-t border-[var(--border)]">
              <div>
                <div className="text-sm font-medium flex items-center gap-2">
                  <Volume2 className="w-4 h-4" /> Auto Text-to-Speech (TTS)
                </div>
                <div className="text-xs text-[var(--muted-foreground)]">
                  Automatically read aloud AI teacher responses using browser TTS.
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoVoice}
                onChange={(e) => setAutoVoice(e.target.checked)}
                className="w-5 h-5 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--ring)] cursor-pointer"
              />
            </div>

            {/* Notifications Toggle */}
            <div className="flex items-center justify-between py-2 border-t border-[var(--border)]">
              <div>
                <div className="text-sm font-medium flex items-center gap-2">
                  <Bell className="w-4 h-4" /> Weekly Streak Reminders
                </div>
                <div className="text-xs text-[var(--muted-foreground)]">
                  Receive email alerts to keep your learning streak alive.
                </div>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-5 h-5 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--ring)] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Theme Preference */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            {theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />} Theme Customization
          </h2>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`flex-1 p-4 rounded-xl border flex items-center justify-center gap-2 font-medium text-sm transition-all ${
                theme === "light"
                  ? "border-[var(--primary)] bg-[var(--primary)]/10"
                  : "border-[var(--border)] glass"
              }`}
            >
              <Sun className="w-4 h-4" /> Light Mode
            </button>

            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`flex-1 p-4 rounded-xl border flex items-center justify-center gap-2 font-medium text-sm transition-all ${
                theme === "dark"
                  ? "border-[var(--primary)] bg-[var(--primary)]/10"
                  : "border-[var(--border)] glass"
              }`}
            >
              <Moon className="w-4 h-4" /> Dark Mode
            </button>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold text-sm hover:opacity-90 transition-all flex items-center gap-2 glow-primary"
        >
          {saved ? (
            <>
              <Check className="w-4 h-4" /> Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Settings
            </>
          )}
        </button>
      </form>
    </div>
  );
}
