"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, Circle, Clock, Video, FileText, List } from "lucide-react";

interface Props {
  onNavigate: (view: string) => void;
}

const spring = { type: "spring" as const, stiffness: 300, damping: 30 };

const questions = [
  {
    question: "Why was Redis bypassed in AUTH-4831?",
    source: "Agent dispute — Skeptic vs Evidence",
    answer: "Redis packet loss was causing stale token state. The bypass writes directly to Postgres as a fallback. It was a hotfix at 3am — never documented.",
    insight: "Redis failover causes silent token expiration. No retry logic exists.",
  },
  {
    question: "Has Mike ever handled an auth incident without you?",
    source: "Unresolved — bus factor verification",
    answer: "No. Mike reviews code but has never been on-call for auth. He wouldn't know about the Redis bypass.",
    insight: "Bus factor confirmed = 1. Mike is surface-level only.",
  },
  {
    question: "What causes silent token expiration during Redis failover?",
    source: "Follow-up — root cause analysis",
    answer: "When Redis drops packets, the token TTL isn't refreshed but the session stays alive in Postgres. After 15 minutes the token silently expires. Users get logged out with no error — just a redirect to login.",
    insight: "Silent expiration is a TTL sync issue between Redis and Postgres. No alerting exists for this failure mode.",
  },
];

type ViewState = "in-progress" | "completed";

const transcript = [
  { speaker: "AI", text: "Sarah, thanks for taking the time. I have three questions from the engineering team about systems only you've operated. Let's start with AUTH-4831 — can you tell me why Redis was bypassed?" },
  { speaker: "Sarah", text: "Yeah, so that was a 3am hotfix. Redis was dropping packets and tokens were going stale — users were getting silently logged out. I wrote a direct Postgres fallback to keep auth alive during the outage." },
  { speaker: "AI", text: "Was that meant to be temporary or permanent?", tag: "follow-up" },
  { speaker: "Sarah", text: "Temporary. But it worked, so it stayed. I never documented it because I planned to add proper retry logic... which never happened." },
  { speaker: "AI", text: "Understood. Second question — has Mike Rodriguez ever handled an auth incident independently?", extracted: "Redis bypass is undocumented temporary fix. No retry logic exists. Postgres fallback is permanent by neglect." },
  { speaker: "Sarah", text: "Mike? No. He reviews my PRs and approves them, but he's never been on-call for auth. He wouldn't even know about the Redis bypass — it's not in any docs or runbooks." },
  { speaker: "AI", text: "So if there was an auth incident tomorrow and you weren't available, who would handle it?", tag: "follow-up" },
  { speaker: "Sarah", text: "Honestly? Nobody. They'd have to escalate to infrastructure and hope the general on-call person can figure it out from the code. Which... good luck.", extracted: "Bus factor = 1 confirmed by departing expert. No escalation path exists. On-call has no auth domain knowledge." },
  { speaker: "AI", text: "Final question. What exactly causes silent token expiration during Redis failover?" },
  { speaker: "Sarah", text: "When Redis drops packets, the token TTL doesn't refresh. But the session object in Postgres stays alive because it has its own TTL — 15 minutes longer. So the user appears logged in but their token is actually dead. When anything tries to validate, it fails silently and redirects to login." },
  { speaker: "AI", text: "Is there any monitoring for this?", tag: "follow-up" },
  { speaker: "Sarah", text: "No. There's no alert for TTL desync. You'd only notice from user reports — and even then it looks like a normal session timeout, not a bug.", extracted: "Token TTL desync between Redis and Postgres is unmonitored. 15-min window where sessions appear valid but tokens are expired. No alerting exists." },
  { speaker: "AI", text: "Thank you Sarah. These answers fill critical gaps the audit couldn't resolve from code and data alone. The team will use this to build proper documentation and runbooks." },
];

export default function InterviewRoom({ onNavigate }: Props) {
  const [viewState, setViewState] = useState<ViewState>("completed");
  const [completedTab, setCompletedTab] = useState<"summary" | "transcript">("summary");

  const answeredCount = viewState === "completed" ? 3 : 2;

  return (
    <div className="mx-auto max-w-2xl px-8 py-14">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring }}
        className="mb-6"
      >
        <p className="text-xs font-medium uppercase tracking-widest text-[var(--color-text-muted)] mb-2">
          Exit Interview
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">
          {viewState === "completed" ? "Interview complete." : "Interview in progress."}
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          Sarah Chen &middot; {answeredCount} of 3 questions resolved
        </p>
      </motion.div>

      {/* State switcher (demo) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-6 flex gap-1 rounded-lg border border-[var(--color-border)] p-1 w-fit"
      >
        {([["in-progress", "In Progress"], ["completed", "Completed"]] as [ViewState, string][]).map(([state, label]) => (
          <button
            key={state}
            onClick={() => setViewState(state)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              viewState === state
                ? "bg-[var(--color-primary)] text-white"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            {label}
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ===== IN PROGRESS ===== */}
        {viewState === "in-progress" && (
          <motion.div
            key="in-progress"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ ...spring }}
          >
            {/* Video area */}
            <div className="mb-8 rounded-xl overflow-hidden border border-[var(--color-border)]">
              <div className="flex aspect-[16/9] items-center justify-center bg-zinc-900 relative">
                <Video size={24} className="text-zinc-600" />
                <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-zinc-800/80 px-2.5 py-1 text-[10px] text-zinc-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
                  Live — Tavus AI Interviewer
                </span>
                <span className="absolute top-3 right-3 text-[10px] text-zinc-500">
                  04:32
                </span>
              </div>
            </div>

            {/* Questions progress */}
            <div className="space-y-4">
              {questions.map((q, i) => {
                const isAnswered = i < 2;
                const isCurrent = i === 2;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ ...spring, delay: 0.1 + i * 0.06 }}
                    className={`rounded-lg border px-5 py-4 ${
                      isCurrent ? "border-zinc-300 bg-zinc-50/50" : "border-[var(--color-border)]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {isAnswered ? (
                        <CheckCircle2 size={14} className="mt-0.5 text-emerald-500 shrink-0" />
                      ) : isCurrent ? (
                        <Clock size={14} className="mt-0.5 text-[var(--color-text-muted)] shrink-0 animate-pulse" />
                      ) : (
                        <Circle size={14} className="mt-0.5 text-zinc-200 shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[var(--color-text-primary)]">{q.question}</p>
                        <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{q.source}</p>
                        {isAnswered && (
                          <div className="mt-2 border-l-2 border-zinc-200 pl-3">
                            <p className="text-xs text-[var(--color-text-secondary)]">{q.answer}</p>
                            <p className="mt-1 text-[10px] font-medium text-emerald-600">
                              ✓ {q.insight}
                            </p>
                          </div>
                        )}
                        {isCurrent && (
                          <p className="mt-2 text-[10px] text-[var(--color-text-muted)] italic">
                            Asking now...
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ===== COMPLETED ===== */}
        {viewState === "completed" && (
          <motion.div
            key="completed"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ ...spring }}
          >
            {/* Success indicator */}
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/50 px-5 py-4">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  All 3 questions resolved
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Interview duration: 8 min 42 sec &middot; 3 new knowledge artifacts captured
                </p>
              </div>
            </div>

            {/* Sub-tabs: Summary vs Transcript */}
            <div className="mb-6 flex gap-1 rounded-lg border border-[var(--color-border)] p-1 w-fit">
              <button
                onClick={() => setCompletedTab("summary")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  completedTab === "summary"
                    ? "bg-[var(--color-primary)] text-white"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                <List size={11} />
                Summary
              </button>
              <button
                onClick={() => setCompletedTab("transcript")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  completedTab === "transcript"
                    ? "bg-[var(--color-primary)] text-white"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                <FileText size={11} />
                Full Transcript
              </button>
            </div>

            <AnimatePresence mode="wait">
              {completedTab === "summary" && (
                <motion.div
                  key="summary"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {/* All answers */}
                  <div className="mb-8 rounded-xl border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
                    {questions.map((q, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 + i * 0.06 }}
                        className="px-5 py-4"
                      >
                        <div className="flex items-start gap-3">
                          <CheckCircle2 size={13} className="mt-0.5 text-emerald-500 shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-[var(--color-text-primary)]">{q.question}</p>
                            <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{q.source}</p>
                            <div className="mt-2 border-l-2 border-zinc-200 pl-3">
                              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{q.answer}</p>
                              <p className="mt-1.5 text-[10px] font-medium text-emerald-600">
                                ✓ {q.insight}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* What was captured */}
                  <div className="mb-8">
                    <p className="text-xs font-medium uppercase tracking-widest text-[var(--color-text-muted)] mb-3">
                      Knowledge Captured
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-lg border border-[var(--color-border)] p-3 text-center">
                        <p className="text-lg font-semibold text-[var(--color-text-primary)]">3</p>
                        <p className="text-[10px] text-[var(--color-text-muted)]">Root causes documented</p>
                      </div>
                      <div className="rounded-lg border border-[var(--color-border)] p-3 text-center">
                        <p className="text-lg font-semibold text-[var(--color-text-primary)]">2</p>
                        <p className="text-[10px] text-[var(--color-text-muted)]">Undocumented systems found</p>
                      </div>
                      <div className="rounded-lg border border-[var(--color-border)] p-3 text-center">
                        <p className="text-lg font-semibold text-[var(--color-text-primary)]">1</p>
                        <p className="text-[10px] text-[var(--color-text-muted)]">Critical gap filled</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {completedTab === "transcript" && (
                <motion.div
                  key="transcript"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="mb-4">
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Full conversation &middot; Agent extractions highlighted
                    </p>
                  </div>
                  <div className="rounded-xl border border-[var(--color-border)] max-h-[480px] overflow-y-auto divide-y divide-[var(--color-border)]">
                    {transcript.map((line, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="px-5 py-3"
                      >
                        <div className="flex items-start gap-3">
                          <span className={`text-[10px] font-semibold mt-0.5 w-10 shrink-0 ${
                            line.speaker === "AI" ? "text-indigo-500" : "text-[var(--color-text-muted)]"
                          }`}>
                            {line.speaker === "AI" ? "Tavus" : "Sarah"}
                          </span>
                          <div className="flex-1">
                            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                              {line.text}
                            </p>
                            {line.tag && (
                              <span className="inline-block mt-1 text-[9px] text-[var(--color-text-muted)] italic">
                                {line.tag}
                              </span>
                            )}
                            {line.extracted && (
                              <div className="mt-2 rounded-md bg-indigo-50/60 border border-indigo-100 px-3 py-2">
                                <p className="text-[10px] font-medium text-indigo-600 mb-0.5">
                                  ↳ Extracted for knowledge base
                                </p>
                                <p className="text-[10px] text-indigo-900/70">
                                  {line.extracted}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <p className="mt-3 text-[10px] text-[var(--color-text-muted)] text-center">
                    Extractions are fed back to agents for knowledge recovery + hiring spec generation
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.4 }}
              className="mt-8"
            >
              <button
                onClick={() => onNavigate("recovery")}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 py-3.5 text-sm font-medium text-white transition-all hover:bg-zinc-800 active:scale-[0.98]"
              >
                View Knowledge Recovery
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
