"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import KnowledgeRadar from "@/components/viz/KnowledgeRadar";

interface Props {
  onNavigate: (view: string) => void;
}

export default function KnowledgeRecovery({ onNavigate }: Props) {
  return (
    <div className="mx-auto max-w-3xl px-8 py-12">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
          Knowledge Recovery
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Audit complete. Interview captured 2 critical insights.
        </p>
      </div>

      {/* Before / After */}
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="mb-10 grid grid-cols-2 divide-x divide-[var(--color-border)] rounded-lg border border-[var(--color-border)]"
      >
        <div className="p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)] mb-4">Before</p>
          <div className="space-y-2.5">
            <Row label="Risk Level" value="HIGH" danger />
            <Row label="Confidence" value="43%" />
            <Row label="Unresolved" value="3 questions" />
            <Row label="Documentation" value="18%" />
          </div>
        </div>
        <div className="p-6 bg-green-50/30">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-success)] mb-4">After</p>
          <div className="space-y-2.5">
            <Row label="Risk Level" value="MEDIUM" warning />
            <Row label="Confidence" value="91%" />
            <Row label="Resolved" value="2 of 3" />
            <Row label="Documentation" value="67%" />
          </div>
        </div>
      </motion.div>

      {/* Radar */}
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="mb-10 flex justify-center"
      >
        <KnowledgeRadar showAfter={true} />
      </motion.div>

      {/* Captured Knowledge */}
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
          Knowledge Captured
        </h2>
        <div className="space-y-3">
          <CapturedCard
            title="Redis Failover Behavior"
            description="Redis packet loss causes stale token state. Bypass writes to Postgres directly. No retry logic. 3 production outages."
            source="Interview Q1 — Sarah Chen"
            status="captured"
          />
          <CapturedCard
            title="Bus Factor Confirmation"
            description="Mike reviews auth PRs but has never operated auth in an incident. Cannot handle Redis bypass independently."
            source="Interview Q2 — Sarah Chen"
            status="captured"
          />
          <CapturedCard
            title="Token Expiration Root Cause"
            description=""
            source="Interview Q3 — Pending"
            status="pending"
          />
        </div>
      </motion.div>

      <div className="mt-10 flex justify-end border-t border-[var(--color-border)] pt-6">
        <button
          onClick={() => onNavigate("hiring")}
          className="flex items-center gap-2 rounded-md bg-[var(--color-primary)] px-4 py-2 text-xs font-medium text-white transition hover:bg-zinc-800"
        >
          Hiring Intelligence <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}

function Row({ label, value, danger, warning }: { label: string; value: string; danger?: boolean; warning?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-[var(--color-text-secondary)]">{label}</span>
      <span className={`text-sm font-medium ${danger ? "text-[var(--color-danger)]" : warning ? "text-[var(--color-warning)]" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function CapturedCard({ title, description, source, status }: { title: string; description: string; source: string; status: "captured" | "pending" }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] px-5 py-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-[var(--color-text-primary)]">{title}</span>
        <span className={`text-[11px] font-medium ${status === "captured" ? "text-[var(--color-success)]" : "text-[var(--color-text-muted)]"}`}>
          {status === "captured" ? "Captured" : "Pending"}
        </span>
      </div>
      {description && <p className="text-sm text-[var(--color-text-secondary)] mb-1">{description}</p>}
      <p className="text-xs text-[var(--color-text-muted)]">{source}</p>
    </div>
  );
}
