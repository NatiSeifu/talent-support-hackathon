"use client";

import {
  LayoutDashboard,
  Brain,
  Video,
  ShieldCheck,
  UserSearch,
} from "lucide-react";
import type { View } from "@/app/page";

const navItems: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "command", label: "Command Center", icon: LayoutDashboard },
  { id: "audit", label: "Agent Audit", icon: Brain },
  { id: "interview", label: "Exit Interview", icon: Video },
  { id: "recovery", label: "Knowledge Recovery", icon: ShieldCheck },
  { id: "hiring", label: "Hiring Intelligence", icon: UserSearch },
];

export default function Sidebar({
  view,
  setView,
}: {
  view: View;
  setView: (v: View) => void;
}) {
  return (
    <aside className="flex w-[220px] shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface-card)] px-4 py-6">
      <div className="px-2 mb-8">
        <div className="text-sm font-semibold text-[var(--color-text-primary)]">
          SuccessionAI
        </div>
      </div>

      <nav className="flex-1 space-y-0.5">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-[13px] transition ${
              view === id
                ? "bg-zinc-100 font-medium text-[var(--color-text-primary)]"
                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <Icon size={15} strokeWidth={view === id ? 2 : 1.5} />
            {label}
          </button>
        ))}
      </nav>

      <div className="mt-auto border-t border-[var(--color-border)] pt-4 px-2">
        <span className="text-[11px] text-[var(--color-text-muted)]">
          Stratify · Platform Eng
        </span>
      </div>
    </aside>
  );
}
