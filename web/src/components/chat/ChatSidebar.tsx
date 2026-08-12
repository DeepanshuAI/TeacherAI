"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Plus,
  MessageSquare,
  Pin,
  Trash2,
  Edit2,
  Search,
  Sparkles,
  Sun,
  Moon,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Brain,
  Check,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { signOut } from "@/lib/auth-client";

export interface SessionItem {
  id: string;
  threadId: string;
  title: string;
  topic: string;
  isPinned: boolean;
  startedAt: string;
}

interface Props {
  sessions: SessionItem[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onTogglePinSession: (id: string, isPinned: boolean) => void;
  onDeleteSession: (id: string) => void;
  onOpenProfile: () => void;
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}

export function ChatSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onRenameSession,
  onTogglePinSession,
  onDeleteSession,
  onOpenProfile,
  user,
}: Props) {
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const filtered = sessions.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.topic.toLowerCase().includes(search.toLowerCase())
  );

  const pinned = filtered.filter((s) => s.isPinned);
  const recent = filtered.filter((s) => !s.isPinned);

  const handleStartRename = (s: SessionItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(s.id);
    setEditTitle(s.title);
  };

  const handleSaveRename = (id: string, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/sign-in");
  };

  return (
    <aside
      className={`relative flex flex-col bg-[var(--card)]/80 backdrop-blur-xl border-r border-[var(--border)] transition-all duration-300 z-40 ${
        isCollapsed ? "w-16" : "w-72"
      }`}
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-[var(--card)] border border-[var(--border)] p-1 rounded-full text-[var(--muted-foreground)] hover:text-[var(--foreground)] shadow-sm z-50"
      >
        {isCollapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Header / Brand */}
      <div className="p-4 flex items-center justify-between border-b border-[var(--border)]">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5">
            <img
              src="/teacherAI.webp"
              alt="TeacherAI"
              className="w-8 h-8 rounded-xl object-cover shadow-md"
            />
            <div>
              <span className="font-bold text-base bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                TeacherAI
              </span>
              <span className="text-[10px] block text-[var(--muted-foreground)] -mt-1 font-medium">
                AI Teacher Agent
              </span>
            </div>
          </div>
        )}
        {isCollapsed && (
          <img
            src="/teacherAI.webp"
            alt="TeacherAI"
            className="w-8 h-8 rounded-xl mx-auto"
          />
        )}
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98] ${
            isCollapsed ? "px-0" : ""
          }`}
        >
          <Plus className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>New Chat</span>}
        </button>
      </div>

      {/* Search Input */}
      {!isCollapsed && (
        <div className="px-3 mb-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8 pl-8 pr-3 bg-[var(--background)]/60 border border-[var(--border)] rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>
      )}

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-4 py-2">
        {/* Pinned Section */}
        {pinned.length > 0 && (
          <div>
            {!isCollapsed && (
              <div className="px-2 mb-1.5 text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider flex items-center gap-1">
                <Pin className="w-3 h-3 text-indigo-400" /> Pinned
              </div>
            )}
            <div className="space-y-0.5">
              {pinned.map((session) => (
                <SessionRow
                  key={session.id}
                  session={session}
                  isActive={session.id === activeSessionId}
                  isCollapsed={isCollapsed}
                  editingId={editingId}
                  editTitle={editTitle}
                  setEditTitle={setEditTitle}
                  onSelect={() => onSelectSession(session.id)}
                  onStartRename={handleStartRename}
                  onSaveRename={handleSaveRename}
                  onCancelRename={() => setEditingId(null)}
                  onTogglePin={() => onTogglePinSession(session.id, !session.isPinned)}
                  onDelete={() => onDeleteSession(session.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Recent Section */}
        <div>
          {!isCollapsed && (
            <div className="px-2 mb-1.5 text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
              Recent Chats
            </div>
          )}
          <div className="space-y-0.5">
            {recent.map((session) => (
              <SessionRow
                key={session.id}
                session={session}
                isActive={session.id === activeSessionId}
                isCollapsed={isCollapsed}
                editingId={editingId}
                editTitle={editTitle}
                setEditTitle={setEditTitle}
                onSelect={() => onSelectSession(session.id)}
                onStartRename={handleStartRename}
                onSaveRename={handleSaveRename}
                onCancelRename={() => setEditingId(null)}
                onTogglePin={() => onTogglePinSession(session.id, !session.isPinned)}
                onDelete={() => onDeleteSession(session.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer / User Profile & Theme */}
      <div className="p-3 border-t border-[var(--border)] bg-[var(--card)]/40 space-y-2">
        {/* Student Profile Trigger Button */}
        <button
          onClick={onOpenProfile}
          className={`w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-[var(--secondary)] text-xs font-medium text-[var(--foreground)] transition-colors border border-indigo-500/20 bg-indigo-500/5 ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <Brain className="w-4 h-4 text-indigo-400 shrink-0" />
          {!isCollapsed && (
            <div className="text-left flex-1 truncate">
              <div className="font-semibold text-indigo-400">Profile Engine</div>
              <div className="text-[10px] text-[var(--muted-foreground)] truncate">
                View AI estimation
              </div>
            </div>
          )}
        </button>

        {/* Theme & Logout */}
        {!isCollapsed && (
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg hover:bg-[var(--secondary)] text-[var(--muted-foreground)] transition-colors text-xs flex items-center gap-2"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" /> Light Mode
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-400" /> Dark Mode
                </>
              )}
            </button>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors text-xs flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

function SessionRow({
  session,
  isActive,
  isCollapsed,
  editingId,
  editTitle,
  setEditTitle,
  onSelect,
  onStartRename,
  onSaveRename,
  onCancelRename,
  onTogglePin,
  onDelete,
}: {
  session: SessionItem;
  isActive: boolean;
  isCollapsed: boolean;
  editingId: string | null;
  editTitle: string;
  setEditTitle: (v: string) => void;
  onSelect: () => void;
  onStartRename: (s: SessionItem, e: React.MouseEvent) => void;
  onSaveRename: (id: string, e: React.MouseEvent | React.FormEvent) => void;
  onCancelRename: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
}) {
  const isEditing = editingId === session.id;

  if (isCollapsed) {
    return (
      <button
        onClick={onSelect}
        className={`w-full p-2.5 rounded-lg flex items-center justify-center transition-colors ${
          isActive
            ? "bg-indigo-600/20 text-indigo-400"
            : "hover:bg-[var(--secondary)] text-[var(--muted-foreground)]"
        }`}
      >
        <MessageSquare className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div
      onClick={onSelect}
      className={`group relative flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs font-medium transition-all ${
        isActive
          ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/30"
          : "hover:bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <MessageSquare className="w-3.5 h-3.5 shrink-0 text-indigo-400 opacity-80" />
        {isEditing ? (
          <form
            onSubmit={(e) => onSaveRename(session.id, e)}
            className="flex items-center gap-1 flex-1"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="bg-[var(--background)] border border-indigo-500 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none w-full"
              autoFocus
            />
            <button
              type="submit"
              className="p-1 hover:text-emerald-400 text-xs"
            >
              <Check className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={onCancelRename}
              className="p-1 hover:text-red-400 text-xs"
            >
              <X className="w-3 h-3" />
            </button>
          </form>
        ) : (
          <span className="truncate flex-1">{session.title}</span>
        )}
      </div>

      {!isEditing && (
        <div className="hidden group-hover:flex items-center gap-1 shrink-0 ml-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin();
            }}
            className="p-1 hover:text-indigo-400 transition-colors"
            title={session.isPinned ? "Unpin chat" : "Pin chat"}
          >
            <Pin
              className={`w-3 h-3 ${
                session.isPinned ? "fill-indigo-400 text-indigo-400" : ""
              }`}
            />
          </button>
          <button
            onClick={(e) => onStartRename(session, e)}
            className="p-1 hover:text-indigo-400 transition-colors"
            title="Rename chat"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 hover:text-red-400 transition-colors"
            title="Delete chat"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
