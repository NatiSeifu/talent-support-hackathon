"use client";

import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  GraduationCap,
  Sparkles,
  Radio,
} from "lucide-react";
import type { View } from "@/app/page";

const navItems: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Hiring Intelligence", icon: LayoutDashboard },
  { id: "hiring", label: "Hiring Spec", icon: FileText },
  { id: "capture", label: "Knowledge Capture", icon: MessageSquare },
  { id: "onboarding", label: "Onboarding Plan", icon: GraduationCap },
];

export default function Sidebar({
  view,
  setView,
}: {
  view: View;
  setView: (v: View) => void;
}) {
  return (
    <aside className="flex w-[260px] shrink-0 flex-col border-r border-[var(--color-border)] bg-white px-5 py-6">
      <div className="flex items-center gap-3 px-2">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--color-primary-600)] text-white">
          <Sparkles size={18} />
        </div>
        <div>
          <div className="text-[15px] font-bold text-[var(--color-text-primary)]">
            SuccessionAI
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-primary-600)]">
            Hiring Intelligence
          </div>
        </div>
      </div>

      <nav className="mt-10 space-y-1">
        <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
          Platform
        </div>
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold transition-all ${
              view === id
                ? "bg-[var(--color-primary-50)] text-[var(--color-primary-700)] shadow-sm"
                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>

      <div className="mt-auto rounded-xl border border-[var(--color-primary-100)] bg-[var(--color-primary-50)] p-4">
        <div className="flex items-center gap-2 text-[11px] font-bold text-[var(--color-primary-700)]">
          <Radio size={12} className="animate-pulse-ring" />
          Live Analysis
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
          Nexus Technologies
          <br />
          Platform Engineering · 8 members
        </p>
      </div>
    </aside>
  );
}
