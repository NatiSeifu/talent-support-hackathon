"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Users, UserPlus } from "lucide-react";

interface Props {
  onNavigate: (view: string) => void;
}

const spring = { type: "spring" as const, stiffness: 300, damping: 30 };

const internalCandidates = [
  {
    name: "James Wu",
    role: "Backend Engineer · Platform Team",
    tenure: "2.5 years at Stratify",
    gaps: ["Never operated auth during incident", "No Redis failover experience", "Unfamiliar with SAML flows"],
    strengths: ["Worked adjacent to auth — API gateway", "Reviewed 8 of Sarah's PRs", "On-call experience (non-auth)"],
    rampWeeks: 6,
    prepPlan: [
      "Week 1–2: Shadow auth deployments, pair on token refresh logic",
      "Week 3–4: Lead one auth incident drill (simulated P0)",
      "Week 5–6: Solo on-call rotation for auth with Sarah as backup",
    ],
  },
  {
    name: "Anika Johal",
    role: "Senior Engineer · Payments Team",
    tenure: "4 years at Stratify",
    gaps: ["No auth domain exposure", "Different service architecture patterns", "No Redis token store familiarity"],
    strengths: ["Strong incident responder (payments)", "Managed own bus-factor-1 domain successfully", "Documented everything in payments"],
    rampWeeks: 9,
    prepPlan: [
      "Week 1–3: Auth system deep dive — code walkthrough + architecture",
      "Week 4–5: Pair on Redis token store operations, failover scenarios",
      "Week 6–7: Shadow 2 real incidents (or simulated if none occur)",
      "Week 8–9: Lead auth on-call with escalation path",
    ],
  },
];

const externalSpec = {
  title: "Senior Authentication Engineer",
  why: "Generated from 47 PRs, 4 P0 incidents, 3 undocumented workflows, and exit interview answers",
  mustHave: [
    "Operated OAuth 2.0 token refresh at scale (not just implemented — operated under failure)",
    "Redis as session/token store, including cluster failover and split-brain scenarios",
    "Incident command experience specifically for auth systems",
    "SAML/SSO enterprise integration (Okta, Azure AD, or similar)",
  ],
  niceToHave: [
    "Debugged token expiration race conditions",
    "Managed Redis cluster migrations",
    "Built observability for auth health (not just uptime)",
  ],
  redFlags: [
    "Only implemented auth greenfield — never maintained legacy",
    "No incident response experience",
    "Can't explain token refresh without looking at docs",
  ],
};

const assessmentQuestions = [
  {
    scenario: "Token refreshes are failing silently. Redis had packet loss 2 hours ago but recovered. Users report random logouts — but only on mobile. No documentation exists for this flow. What do you investigate first, and how do you decide when to escalate?",
    tests: "Debugging approach, hypothesis generation, escalation judgment",
    followUp: "What if you discover the mobile SDK caches tokens differently than web?",
  },
  {
    scenario: "You find a service bypassing Redis and writing auth state directly to Postgres. There's no comment, no PR description, no Jira ticket. The person who wrote it left 6 months ago. How do you determine if this is intentional, a bug, or a workaround for something else?",
    tests: "Code archaeology, reasoning under uncertainty, risk assessment",
    followUp: "Would you revert it? What information would change your answer?",
  },
  {
    scenario: "You're on-call, first week. Auth is failing for 5% of users. The last person who understood this system left 2 weeks ago. You have access to logs, metrics, and the codebase — but no runbook. Walk me through your first 30 minutes.",
    tests: "Incident response without tribal knowledge, knowledge acquisition speed",
    followUp: "At minute 15, a VP Slacks you asking for an ETA. What do you say?",
  },
  {
    scenario: "You need to rotate all OAuth signing keys. You find 3 microservices that validate tokens, but git blame shows a 4th service that was deleted last quarter. Clients might still be caching old JWTs. Design a safe rollout.",
    tests: "Systems thinking, blast radius awareness, backward compatibility",
    followUp: "How would you verify no one is still using the deleted service's tokens?",
  },
];

export default function HiringIntelligence({ onNavigate }: Props) {
  const [tab, setTab] = useState<"internal" | "external">("internal");
  const [expandedQ, setExpandedQ] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-2xl px-8 py-14">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring }}
        className="mb-8"
      >
        <p className="text-xs font-medium uppercase tracking-widest text-[var(--color-text-muted)] mb-2">
          Hiring Intelligence
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">
          Who fills the gap?
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          Generated from confirmed knowledge gaps &middot; Auth, Redis, Incident Response
        </p>
      </motion.div>

      {/* Tab switcher */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="mb-8 flex gap-1 rounded-lg border border-[var(--color-border)] p-1 w-fit"
      >
        <button
          onClick={() => setTab("internal")}
          className={`flex items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-medium transition-all ${
            tab === "internal"
              ? "bg-[var(--color-primary)] text-white"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          <Users size={12} />
          Internal Transfer
        </button>
        <button
          onClick={() => setTab("external")}
          className={`flex items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-medium transition-all ${
            tab === "external"
              ? "bg-[var(--color-primary)] text-white"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          <UserPlus size={12} />
          External Hire
        </button>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ===== INTERNAL TRANSFER ===== */}
        {tab === "internal" && (
          <motion.div
            key="internal"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ ...spring }}
          >
            <p className="text-xs font-medium uppercase tracking-widest text-[var(--color-text-muted)] mb-4">
              Internal Candidates — Ramp-up Assessment
            </p>

            <div className="space-y-4">
              {internalCandidates.map((person, i) => (
                <motion.div
                  key={person.name}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...spring, delay: 0.1 + i * 0.08 }}
                  className="rounded-xl border border-[var(--color-border)] p-5"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-text-primary)]">{person.name}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{person.role}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{person.tenure}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-[var(--color-text-primary)] tabular-nums">{person.rampWeeks}w</p>
                      <p className="text-[10px] text-[var(--color-text-muted)]">estimated ramp</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Gaps</p>
                      <ul className="space-y-1.5">
                        {person.gaps.map((gap) => (
                          <li key={gap} className="flex items-start gap-1.5 text-xs text-[var(--color-text-secondary)]">
                            <span className="text-red-400 mt-0.5 shrink-0">×</span>
                            {gap}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Strengths</p>
                      <ul className="space-y-1.5">
                        {person.strengths.map((s) => (
                          <li key={s} className="flex items-start gap-1.5 text-xs text-[var(--color-text-secondary)]">
                            <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="border-t border-[var(--color-border)] pt-4">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Preparation Plan</p>
                    <ol className="space-y-1.5">
                      {person.prepPlan.map((step, j) => (
                        <li key={j} className="text-xs text-[var(--color-text-secondary)]">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 text-xs text-[var(--color-text-muted)] text-center"
            >
              Ramp estimates based on: domain proximity, PR review history, incident exposure, and knowledge gap count
            </motion.p>
          </motion.div>
        )}

        {/* ===== EXTERNAL HIRE ===== */}
        {tab === "external" && (
          <motion.div
            key="external"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ ...spring }}
          >
            {/* Job Spec */}
            <div className="mb-8">
              <p className="text-xs font-medium uppercase tracking-widest text-[var(--color-text-muted)] mb-4">
                Generated Job Specification
              </p>
              <div className="rounded-xl border border-[var(--color-border)] p-5">
                <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">
                  {externalSpec.title}
                </h2>
                <p className="text-xs text-[var(--color-text-muted)] mb-5">
                  {externalSpec.why}
                </p>

                <div className="mb-5">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Must Have (non-negotiable)</p>
                  <ol className="space-y-2">
                    {externalSpec.mustHave.map((req, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ ...spring, delay: 0.1 + i * 0.05 }}
                        className="text-sm text-[var(--color-text-primary)]"
                      >
                        {req}
                      </motion.li>
                    ))}
                  </ol>
                </div>

                <div className="mb-5">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Nice to Have</p>
                  <ul className="space-y-1.5">
                    {externalSpec.niceToHave.map((item, i) => (
                      <li key={i} className="text-xs text-[var(--color-text-secondary)]">{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-red-400 mb-2">Red Flags</p>
                  <ul className="space-y-1.5">
                    {externalSpec.redFlags.map((flag, i) => (
                      <li key={i} className="text-xs text-[var(--color-text-secondary)]">{flag}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Comparison */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.2 }}
              className="mb-8 grid grid-cols-2 gap-3"
            >
              <div className="rounded-lg border border-[var(--color-border)] p-4">
                <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Generic JD</p>
                <p className="text-xs text-[var(--color-text-secondary)] italic">
                  "5+ years backend experience, knowledge of auth systems preferred"
                </p>
              </div>
              <div className="rounded-lg border border-[var(--color-accent)]/30 bg-indigo-50/30 p-4">
                <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-accent)] mb-2">AI-Generated Spec</p>
                <p className="text-xs text-[var(--color-text-primary)]">
                  "Must have operated Redis token stores under failure, handled auth P0s, understands PKCE flows"
                </p>
              </div>
            </motion.div>

            {/* Assessment Questions */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.3 }}
            >
              <p className="text-xs font-medium uppercase tracking-widest text-[var(--color-text-muted)] mb-2">
                Assessment Puzzles
              </p>
              <p className="text-xs text-[var(--color-text-secondary)] mb-4">
                Domain-specific scenarios that test learning speed, not existing knowledge
              </p>

              <div className="space-y-2">
                {assessmentQuestions.map((q, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ ...spring, delay: 0.35 + i * 0.06 }}
                    onClick={() => setExpandedQ(expandedQ === i ? null : i)}
                    className="cursor-pointer rounded-lg border border-[var(--color-border)] px-5 py-4 transition-colors hover:border-zinc-300"
                  >
                    <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">
                      &ldquo;{q.scenario}&rdquo;
                    </p>
                    <p className="mt-2 text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
                      Tests: {q.tests}
                    </p>
                    <AnimatePresence>
                      {expandedQ === i && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="mt-3 border-t border-[var(--color-border)] pt-3"
                        >
                          <p className="text-xs text-[var(--color-text-muted)]">
                            <span className="font-medium">Follow-up:</span> {q.followUp}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
