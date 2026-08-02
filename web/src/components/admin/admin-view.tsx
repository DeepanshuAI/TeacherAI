"use client";

import { motion } from "framer-motion";
import { Users, DollarSign, Cpu, Activity, ShieldAlert, ArrowUpRight, Search } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

const aiUsageData = [
  { day: "Mon", tokens: 120000, cost: 0.36 },
  { day: "Tue", tokens: 180000, cost: 0.54 },
  { day: "Wed", tokens: 150000, cost: 0.45 },
  { day: "Thu", tokens: 240000, cost: 0.72 },
  { day: "Fri", tokens: 310000, cost: 0.93 },
  { day: "Sat", tokens: 420000, cost: 1.26 },
  { day: "Sun", tokens: 280000, cost: 0.84 },
];

const mockUsers = [
  { id: "u-1", name: "Alex Johnson", email: "alex@example.com", role: "STUDENT", sessions: 18, totalTokens: "145k", lastActive: "10 mins ago" },
  { id: "u-2", name: "Sarah Smith", email: "sarah@example.com", role: "STUDENT", sessions: 24, totalTokens: "210k", lastActive: "1 hour ago" },
  { id: "u-3", name: "David Lee", email: "david@example.com", role: "ADMIN", sessions: 42, totalTokens: "480k", lastActive: "Just now" },
];

export function AdminView() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-3xl font-display font-800 text-gradient mb-1"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Admin &amp; Platform Control
          </h1>
          <p className="text-[var(--muted-foreground)] text-sm">
            Monitor real-time AI usage, API costs, token consumption, and manage student accounts.
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
          Admin Portal Mode
        </span>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--muted-foreground)] font-medium">Total Active Students</span>
            <Users className="w-4 h-4 text-[var(--primary)]" />
          </div>
          <div className="text-2xl font-bold">1,248</div>
          <div className="text-xs text-green-400 mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> +12% this month
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--muted-foreground)] font-medium">Weekly AI Token Volume</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold">1.70M</div>
          <div className="text-xs text-[var(--muted-foreground)] mt-1">GPT-4o + LangGraph</div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--muted-foreground)] font-medium">Estimated LLM API Cost</span>
            <DollarSign className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold">$5.10</div>
          <div className="text-xs text-green-400 mt-1">Under $10/wk budget</div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--muted-foreground)] font-medium">Avg API Latency (SSE)</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold">142ms</div>
          <div className="text-xs text-green-400 mt-1">Optimal stream velocity</div>
        </div>
      </div>

      {/* AI Usage Chart */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-lg">AI Token Usage &amp; Cost Tracking</h2>
            <p className="text-xs text-[var(--muted-foreground)]">Daily token consumption across all active sessions</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={aiUsageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tokenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                  borderRadius: "12px",
                  color: "var(--foreground)",
                  fontSize: "12px",
                }}
              />
              <Area type="monotone" dataKey="tokens" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#tokenGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* User Management Table */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">User Management</h2>
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <input
              type="text"
              placeholder="Search user..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-xs focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs text-[var(--muted-foreground)] uppercase">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Sessions</th>
                <th className="py-3 px-4">Tokens Used</th>
                <th className="py-3 px-4">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {mockUsers.map((u) => (
                <tr key={u.id} className="hover:bg-[var(--muted)]/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-medium">{u.name}</div>
                    <div className="text-xs text-[var(--muted-foreground)]">{u.email}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                      u.role === "ADMIN" ? "bg-purple-500/10 text-purple-400" : "bg-[var(--secondary)] text-[var(--muted-foreground)]"
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">{u.sessions}</td>
                  <td className="py-3.5 px-4 font-mono text-xs">{u.totalTokens}</td>
                  <td className="py-3.5 px-4 text-xs text-[var(--muted-foreground)]">{u.lastActive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
