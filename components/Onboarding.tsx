"use client";

import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  GraduationCap,
  MessageCircle,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import type { View } from "@/app/page";
import { getEmployee } from "@/lib/expertise";

const mike = getEmployee("emp_mike")!;

const domains = [
  { name: "Authentication", current: 51, target: 75 },
  { name: "SSO", current: 62, target: 75 },
  { name: "OAuth", current: 28, target: 70 },
  { name: "Mobile Login", current: 15, target: 50 },
  { name: "Incident Response", current: 20, target: 65 },
];

const weeklyPlan = [
  {
    week: "Week 1–2",
    title: "Foundation",
    status: "current" as const,
    tasks: [
      { task: "Access captured knowledge base from Sarah's session", done: true },
      { task: "Read authentication architecture documentation", done: true },
      { task: "Shadow Mike on current SSO work", done: false },
      { task: "Set up auth-service development environment", done: false },
    ],
  },
  {
    week: "Week 3–4",
    title: "Hands-On",
    status: "upcoming" as const,
    tasks: [
      { task: "Own first auth bug fix (with buddy review)", done: false },
      { task: "Deep-dive OAuth token refresh codebase", done: false },
      { task: "Pair with on-call engineer on alerting", done: false },
      { task: "Review last 3 auth incident postmortems", done: false },
    ],
  },
  {
    week: "Week 5–6",
    title: "Ownership",
    status: "upcoming" as const,
    tasks: [
      { task: "Shadow on-call shift for auth systems", done: false },
      { task: "Lead an auth change with Sarah reviewing", done: false },
      { task: "Author one missing architecture document", done: false },
      { task: "Meet enterprise clients team for SSO context", done: false },
    ],
  },
  {
    week: "Week 7–8",
    title: "Independence",
    status: "upcoming" as const,
    tasks: [
      { task: "Lead mock incident response drill", done: false },
      { task: "Submit architecture improvement proposal", done: false },
      { task: "Solo on-call rotation for auth systems", done: false },
      { task: "Present auth system overview to team", done: false },
    ],
  },
];

const knowledgeBaseQueries = [
  {
    question: "Why is there a 30-second grace window on token expiry validation?",
    answer:
      "Enterprise clients behind corporate proxies sometimes have clock drift up to 25 seconds. The grace window prevents false JWT_EXPIRED errors for these clients. It's in auth-service/validate.go:89.",
    source: "Knowledge Capture Session — May 2026",
    confidence: "High",
  },
  {
    question: "What's the race condition in mobile token refresh?",
    answer:
      "When the app backgrounds during a refresh request, the OS can fire a duplicate on resume. The fix is a mutex lock in the client SDK + server-side idempotency using the refresh token hash as a key with 10s TTL in Redis (auth-service/token.go:247).",
    source: "Knowledge Capture Session — May 2026",
    confidence: "High",
  },
];

export default function Onboarding({ onNavigate }: { onNavigate: (v: View) => void }) {
  return (
    <div className="px-10 py-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate("dashboard")}
          className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]"
        >
          <ArrowLeft size={14} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Successor Onboarding Plan
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Personalized ramp-up for {mike.name} — from 51% to 75% readiness
          </p>
        </div>
      </div>

      {/* Progress Banner */}
      <div className="mt-6 card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--color-primary-50)] text-lg font-bold text-[var(--color-primary-700)]">
              {mike.initials}
            </div>
            <div>
              <div className="text-lg font-bold text-[var(--color-text-primary)]">
                {mike.name}
              </div>
              <div className="text-sm text-[var(--color-text-secondary)]">
                {mike.role} · {mike.tenure} tenure
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-[var(--color-primary-600)]">
              51% <span className="text-sm text-[var(--color-text-muted)]">→ 75%</span>
            </div>
            <div className="text-xs text-[var(--color-text-secondary)]">
              Auth readiness target in 8 weeks
            </div>
          </div>
        </div>
        <div className="mt-4 progress-bar h-3">
          <div
            className="progress-bar-fill bg-gradient-to-r from-[var(--color-primary-400)] to-[var(--color-primary-600)]"
            style={{ width: "51%" }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-[var(--color-text-muted)]">
          <span>Current: 51%</span>
          <span>Week 2 of 8</span>
          <span>Target: 75%</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-[1fr_380px] gap-6">
        {/* Left — Skills & Plan */}
        <div className="space-y-6">
          {/* Domain Progress */}
          <div className="card p-6">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-[var(--color-primary-600)]" />
              <h3 className="text-sm font-bold">Domain Readiness</h3>
            </div>
            <div className="mt-5 space-y-4">
              {domains.map((d) => (
                <div key={d.name}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--color-text-primary)]">
                      {d.name}
                    </span>
                    <span className="text-[var(--color-text-muted)]">
                      {d.current}% → {d.target}%
                    </span>
                  </div>
                  <div className="mt-2 relative progress-bar h-2">
                    <div
                      className="progress-bar-fill bg-[var(--color-primary-400)]"
                      style={{ width: `${d.current}%` }}
                    />
                    <div
                      className="absolute top-0 h-full border-r-2 border-dashed border-[var(--color-primary-700)]"
                      style={{ left: `${d.target}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Plan */}
          <div className="card p-6">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-[var(--color-primary-600)]" />
              <h3 className="text-sm font-bold">8-Week Plan</h3>
              <span className="badge badge-purple ml-auto">
                <Sparkles size={10} /> AI-Generated
              </span>
            </div>
            <div className="mt-5 space-y-5">
              {weeklyPlan.map((week) => (
                <div
                  key={week.week}
                  className={`rounded-xl border p-4 ${
                    week.status === "current"
                      ? "border-[var(--color-primary-200)] bg-[var(--color-primary-50)]"
                      : "border-[var(--color-border)]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[var(--color-primary-700)]">
                        {week.week}
                      </span>
                      <span className="ml-2 text-xs text-[var(--color-text-secondary)]">
                        — {week.title}
                      </span>
                    </div>
                    {week.status === "current" && (
                      <span className="badge badge-success">In Progress</span>
                    )}
                  </div>
                  <div className="mt-3 space-y-2">
                    {week.tasks.map((t) => (
                      <div key={t.task} className="flex items-start gap-2 text-xs">
                        {t.done ? (
                          <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-500" />
                        ) : (
                          <div className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-[var(--color-border)]" />
                        )}
                        <span
                          className={
                            t.done
                              ? "text-[var(--color-text-muted)] line-through"
                              : "text-[var(--color-text-primary)]"
                          }
                        >
                          {t.task}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Knowledge Base */}
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-[var(--color-primary-600)]" />
              <h3 className="text-sm font-bold">Knowledge Base</h3>
            </div>
            <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
              Ask questions about the systems you&apos;re learning — powered by captured expertise.
            </p>

            <div className="mt-5 space-y-4">
              {knowledgeBaseQueries.map((q, idx) => (
                <div key={idx} className="rounded-xl border border-[var(--color-border)] p-4">
                  <div className="flex items-start gap-2">
                    <MessageCircle size={14} className="mt-0.5 shrink-0 text-[var(--color-primary-600)]" />
                    <span className="text-xs font-semibold text-[var(--color-text-primary)]">
                      &ldquo;{q.question}&rdquo;
                    </span>
                  </div>
                  <div className="mt-3 rounded-lg bg-[var(--color-surface)] p-3">
                    <p className="text-[12px] leading-relaxed text-[var(--color-text-secondary)]">
                      {q.answer}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-[10px] text-[var(--color-text-muted)]">
                      <span>Source: {q.source}</span>
                      <span className="font-semibold text-emerald-600">
                        Confidence: {q.confidence}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-xl border border-[var(--color-border)] px-4 py-3">
              <MessageCircle size={14} className="text-[var(--color-text-muted)]" />
              <span className="text-xs text-[var(--color-text-muted)]">
                Ask a question about auth systems...
              </span>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-2">
              <GraduationCap size={16} className="text-[var(--color-primary-600)]" />
              <h3 className="text-sm font-bold">Today&apos;s Learning</h3>
            </div>
            <div className="mt-4 space-y-2">
              <LearningItem
                label="Read: OAuth refresh architecture"
                type="Knowledge Base"
                time="15 min"
                done
              />
              <LearningItem
                label="Explore: token.go — idempotency logic"
                type="Code Review"
                time="30 min"
                done={false}
              />
              <LearningItem
                label="Pair: Sarah on SSO enterprise config"
                type="Pairing Session"
                time="45 min"
                done={false}
              />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-2">
              <Target size={16} className="text-[var(--color-primary-600)]" />
              <h3 className="text-sm font-bold">Milestone</h3>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-[var(--color-text-secondary)]">
              By end of Week 2, Mike should be able to independently debug a
              token refresh failure using the monitoring dashboards and auth-service logs.
            </p>
            <div className="mt-3 progress-bar">
              <div className="progress-bar-fill bg-emerald-500" style={{ width: "40%" }} />
            </div>
            <div className="mt-1 text-[10px] text-[var(--color-text-muted)]">
              40% toward Week 2 milestone
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LearningItem({
  label,
  type,
  time,
  done,
}: {
  label: string;
  type: string;
  time: string;
  done: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] p-3">
      {done ? (
        <CheckCircle2 size={16} className="shrink-0 text-emerald-500" />
      ) : (
        <div className="h-4 w-4 shrink-0 rounded-full border-2 border-[var(--color-border)]" />
      )}
      <div className="flex-1">
        <div className={`text-xs font-medium ${done ? "line-through text-[var(--color-text-muted)]" : "text-[var(--color-text-primary)]"}`}>
          {label}
        </div>
        <div className="text-[10px] text-[var(--color-text-muted)]">{type}</div>
      </div>
      <span className="text-[10px] text-[var(--color-text-muted)]">{time}</span>
    </div>
  );
}
