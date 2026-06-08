"use client";

import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  ClipboardList,
  FileText,
  Sparkles,
  Star,
  Target,
} from "lucide-react";
import type { View } from "@/app/page";
import { generateHiringSpec } from "@/lib/expertise";

const spec = generateHiringSpec("Authentication");

export default function HiringSpec({ onNavigate }: { onNavigate: (v: View) => void }) {
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
            AI-Generated Hiring Spec
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Derived from real team data — not a generic job description
          </p>
        </div>
      </div>

      {/* Context Banner */}
      <div className="mt-6 rounded-2xl border border-[var(--color-primary-200)] bg-gradient-to-r from-[var(--color-primary-50)] to-purple-50 p-5">
        <div className="flex items-start gap-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--color-primary-100)] text-[var(--color-primary-700)]">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="text-sm font-bold text-[var(--color-primary-900)]">
              Why this hire is needed
            </div>
            <p className="mt-1 text-[13px] leading-relaxed text-[var(--color-primary-800)]">
              {spec.whyThisHire}
            </p>
          </div>
          <span className="badge badge-critical ml-auto shrink-0">Critical Priority</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-[1fr_360px] gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Role */}
          <div className="card p-6">
            <div className="flex items-center gap-2">
              <Briefcase size={16} className="text-[var(--color-primary-600)]" />
              <h3 className="text-sm font-bold">Role</h3>
            </div>
            <div className="mt-3 text-xl font-bold text-[var(--color-text-primary)]">
              {spec.role}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {spec.idealCandidateProfile}
            </p>
          </div>

          {/* Must-Have Skills */}
          <div className="card p-6">
            <div className="flex items-center gap-2">
              <Target size={16} className="text-[var(--color-primary-600)]" />
              <h3 className="text-sm font-bold">Must-Have Skills</h3>
              <span className="ml-auto text-[10px] font-medium text-[var(--color-text-muted)]">
                Derived from system analysis
              </span>
            </div>
            <div className="mt-4 space-y-2">
              {spec.mustHaveSkills.map((skill) => (
                <div
                  key={skill}
                  className="flex items-start gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
                >
                  <CheckCircle2
                    size={14}
                    className="mt-0.5 shrink-0 text-[var(--color-primary-600)]"
                  />
                  <span className="text-[13px] text-[var(--color-text-primary)]">
                    {skill}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Nice-to-Have */}
          <div className="card p-6">
            <div className="flex items-center gap-2">
              <Star size={16} className="text-amber-500" />
              <h3 className="text-sm font-bold">Nice-to-Have Skills</h3>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {spec.niceToHaveSkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Interview Questions */}
          <div className="card p-6">
            <div className="flex items-center gap-2">
              <ClipboardList size={16} className="text-[var(--color-primary-600)]" />
              <h3 className="text-sm font-bold">
                Interview Questions
              </h3>
              <span className="ml-auto text-[10px] font-medium text-[var(--color-text-muted)]">
                Tailored to YOUR gaps
              </span>
            </div>
            <div className="mt-4 space-y-4">
              {spec.interviewQuestions.map((q, i) => (
                <div key={i} className="rounded-xl border border-[var(--color-border)] p-4">
                  <div className="flex items-start gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-[var(--color-primary-50)] text-[11px] font-bold text-[var(--color-primary-700)]">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-[13px] font-medium leading-relaxed text-[var(--color-text-primary)]">
                        &ldquo;{q.question}&rdquo;
                      </p>
                      <p className="mt-2 text-[11px] leading-relaxed text-[var(--color-text-muted)]">
                        <span className="font-semibold text-[var(--color-primary-600)]">
                          Assesses:
                        </span>{" "}
                        {q.assessmentCriteria}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Onboarding Plan */}
          <div className="card p-6">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-[var(--color-primary-600)]" />
              <h3 className="text-sm font-bold">30-Day Onboarding Plan</h3>
            </div>
            <div className="mt-4 space-y-4">
              {spec.onboardingPlan.map((week) => (
                <div key={week.week}>
                  <div className="text-xs font-bold text-[var(--color-primary-700)]">
                    {week.week}
                  </div>
                  <div className="mt-2 space-y-1.5">
                    {week.goals.map((goal) => (
                      <div
                        key={goal}
                        className="flex items-start gap-2 text-[12px] leading-relaxed text-[var(--color-text-secondary)]"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary-300)]" />
                        {goal}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Salary Context */}
          <div className="card p-6">
            <h3 className="text-sm font-bold">Compensation Context</h3>
            <p className="mt-3 text-[12px] leading-relaxed text-[var(--color-text-secondary)]">
              {spec.salaryContext}
            </p>
          </div>

          {/* Actions */}
          <div className="card p-6">
            <h3 className="text-sm font-bold">Next Steps</h3>
            <div className="mt-4 space-y-2">
              <button
                onClick={() => onNavigate("capture")}
                className="flex w-full items-center justify-between rounded-xl bg-[var(--color-primary-600)] px-4 py-3 text-xs font-bold text-white transition hover:bg-[var(--color-primary-700)]"
              >
                Start Knowledge Capture
                <ArrowRight size={14} />
              </button>
              <button
                onClick={() => onNavigate("onboarding")}
                className="flex w-full items-center justify-between rounded-xl border border-[var(--color-border)] px-4 py-3 text-xs font-bold text-[var(--color-text-primary)] transition hover:bg-[var(--color-surface-hover)]"
              >
                View Successor Plan
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
