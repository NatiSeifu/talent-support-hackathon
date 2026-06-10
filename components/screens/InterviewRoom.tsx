"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface Props {
  onNavigate: (view: string) => void;
}

const transcript = [
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
    answer: null,
    insight: null,
  },
];

export default function InterviewRoom({ onNavigate }: Props) {
  return (
    <div className="mx-auto max-w-3xl px-8 py-12">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
          Exit Interview
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Sarah Chen &middot; Resolving 3 unresolved questions from audit
        </p>
      </div>

      {/* Video placeholder */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="mb-10 flex aspect-video items-center justify-center rounded-lg bg-zinc-900"
      >
        <span className="text-sm text-zinc-500">Tavus Video Interview</span>
      </motion.div>

      {/* Transcript */}
      <div className="space-y-6">
        {transcript.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1, duration: 0.3 }}
          >
            <div className="mb-2">
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                Q{i + 1}: {item.question}
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">{item.source}</p>
            </div>
            {item.answer ? (
              <div className="ml-4 border-l-2 border-[var(--color-border)] pl-4">
                <p className="text-sm text-[var(--color-text-secondary)]">{item.answer}</p>
                {item.insight && (
                  <p className="mt-2 text-xs font-medium text-[var(--color-success)]">
                    Captured: {item.insight}
                  </p>
                )}
              </div>
            ) : (
              <p className="ml-4 text-xs text-[var(--color-text-muted)]">Pending — not yet asked</p>
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-between border-t border-[var(--color-border)] pt-6">
        <span className="text-sm text-[var(--color-text-secondary)]">2 of 3 questions resolved</span>
        <button
          onClick={() => onNavigate("recovery")}
          className="flex items-center gap-2 rounded-md bg-[var(--color-primary)] px-4 py-2 text-xs font-medium text-white transition hover:bg-zinc-800"
        >
          Continue <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}
