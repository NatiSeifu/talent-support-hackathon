"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const messages = [
  {
    agent: "Evidence",
    text: "Sarah authored 82% of auth-service commits. Sole reviewer on 14 critical PRs. Code ownership in auth-service/src/token.ts: 94%.",
    confidence: "88%",
  },
  {
    agent: "Expertise",
    text: "Sarah is primary knowledge holder for OAuth token refresh (confidence: 96%). Mike Rodriguez has surface-level exposure — reviewed but never authored.",
    confidence: "91%",
  },
  {
    agent: "Skeptic",
    text: "Mike reviewed 40% of auth PRs. Does that indicate shared knowledge?",
    tag: "CHALLENGE",
  },
  {
    agent: "Evidence",
    text: "Revising. Mike reviewed PRs but never authored code in auth-service/src/. 0 commits. Reviews were \"LGTM\" with no substantive comments. 0 auth incident responses.",
    confidence: "88% → 93%",
  },
  {
    agent: "Risk",
    text: "Bus factor CONFIRMED = 1. Mike is surface-level only. Documentation freshness: 18%. 4 P0 incidents led solely by Sarah.",
    confidence: "94%",
    tag: "CRITICAL",
  },
  {
    agent: "Skeptic",
    text: "Concede code authorship. But UNRESOLVED: What specifically fails during Redis outages? Evidence is correlational, not causal.",
    tag: "UNRESOLVED",
  },
  {
    agent: "Question",
    text: "Interview required. Generating targeted questions from unresolved disputes.",
    tag: "3 QUESTIONS",
  },
];

export default function AgentAudit({
  onNavigate,
}: {
  onNavigate: (view: string) => void;
}) {
  return (
    <div className="mx-auto max-w-3xl px-8 py-12">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
          Agent Audit
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Round 3 of 4 &middot; 6 agents reasoning
        </p>
      </div>

      <div className="space-y-1">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12, duration: 0.3 }}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-card)] px-5 py-4"
          >
            <div className="flex items-baseline gap-3">
              <span className="shrink-0 text-xs font-semibold text-[var(--color-text-muted)] w-20">
                {msg.agent}
              </span>
              <p className="flex-1 text-sm text-[var(--color-text-primary)] leading-relaxed">
                {msg.text}
              </p>
            </div>
            {(msg.confidence || msg.tag) && (
              <div className="mt-2 ml-[92px] flex items-center gap-3">
                {msg.confidence && (
                  <span className="text-xs text-[var(--color-text-muted)]">
                    Confidence: {msg.confidence}
                  </span>
                )}
                {msg.tag && (
                  <span className={`text-xs font-medium ${
                    msg.tag === "CRITICAL" ? "text-[var(--color-danger)]" :
                    msg.tag === "UNRESOLVED" ? "text-[var(--color-warning)]" :
                    msg.tag === "CHALLENGE" ? "text-[var(--color-warning)]" :
                    "text-[var(--color-accent)]"
                  }`}>
                    {msg.tag}
                  </span>
                )}
              </div>
            )}
          </motion.div>
        ))}

        {/* Judge Verdict */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: messages.length * 0.12, duration: 0.3 }}
          className="mt-4 rounded-lg border border-[var(--color-accent)]/30 bg-indigo-50/30 px-5 py-4"
        >
          <div className="flex items-baseline gap-3">
            <span className="shrink-0 text-xs font-semibold text-[var(--color-accent)] w-20">
              Judge
            </span>
            <p className="flex-1 text-sm text-[var(--color-text-primary)] leading-relaxed">
              Knowledge Risk is <strong>HIGH</strong>. Sarah is confirmed sole expert in authentication (94% confidence). Bus factor = 1. 
              3 questions remain unresolved — interview required.
            </p>
          </div>
          <div className="mt-4 ml-[92px]">
            <button
              onClick={() => onNavigate("interview")}
              className="flex items-center gap-2 rounded-md bg-[var(--color-primary)] px-4 py-2 text-xs font-medium text-white transition hover:bg-zinc-800 active:scale-[0.98]"
            >
              Proceed to Interview <ArrowRight size={12} />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
